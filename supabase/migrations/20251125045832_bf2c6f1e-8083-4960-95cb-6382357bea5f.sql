-- Create prohibited words table
CREATE TABLE public.prohibited_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prohibited_words ENABLE ROW LEVEL SECURITY;

-- Admins can manage prohibited words
CREATE POLICY "Admins can view prohibited words"
ON public.prohibited_words
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create prohibited words"
ON public.prohibited_words
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prohibited words"
ON public.prohibited_words
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prohibited words"
ON public.prohibited_words
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updating updated_at
CREATE TRIGGER update_prohibited_words_updated_at
BEFORE UPDATE ON public.prohibited_words
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check for prohibited words in text
CREATE OR REPLACE FUNCTION public.check_prohibited_words(content TEXT)
RETURNS TABLE(found_word TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT pw.word
  FROM public.prohibited_words pw
  WHERE pw.is_active = true
    AND LOWER(content) LIKE '%' || LOWER(pw.word) || '%';
END;
$$;

-- Function to create alert when prohibited word is detected in message
CREATE OR REPLACE FUNCTION public.detect_prohibited_words_in_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_words TEXT[];
  word_record RECORD;
  conversation_record RECORD;
BEGIN
  -- Get all prohibited words found in the message
  FOR word_record IN 
    SELECT word FROM public.check_prohibited_words(NEW.content)
  LOOP
    found_words := array_append(found_words, word_record.word);
  END LOOP;

  -- If prohibited words found, create monitoring alert
  IF array_length(found_words, 1) > 0 THEN
    -- Get conversation details
    SELECT * INTO conversation_record
    FROM public.conversations
    WHERE id = NEW.conversation_id;

    -- Create alert
    INSERT INTO public.monitoring_alerts (
      problem_type,
      reporter_id,
      problematic_user_id,
      status,
      notes,
      reference_id
    ) VALUES (
      'word',
      NULL, -- Automatic detection
      NEW.sender_id,
      'unsolved',
      'Prohibited words detected: ' || array_to_string(found_words, ', ') || ' in message: "' || LEFT(NEW.content, 100) || '"',
      NEW.conversation_id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to detect prohibited words in new messages
CREATE TRIGGER detect_words_in_messages
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.detect_prohibited_words_in_message();

-- Function to detect prohibited words in listings
CREATE OR REPLACE FUNCTION public.detect_prohibited_words_in_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_words TEXT[];
  word_record RECORD;
  check_text TEXT;
BEGIN
  -- Combine title and description for checking
  check_text := COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '');

  -- Get all prohibited words found
  FOR word_record IN 
    SELECT word FROM public.check_prohibited_words(check_text)
  LOOP
    found_words := array_append(found_words, word_record.word);
  END LOOP;

  -- If prohibited words found, create monitoring alert
  IF array_length(found_words, 1) > 0 THEN
    INSERT INTO public.monitoring_alerts (
      problem_type,
      reporter_id,
      problematic_user_id,
      status,
      notes,
      reference_id
    ) VALUES (
      'word',
      NULL,
      NEW.user_id,
      'unsolved',
      'Prohibited words detected: ' || array_to_string(found_words, ', ') || ' in listing: "' || NEW.title || '"',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to detect prohibited words in listings
CREATE TRIGGER detect_words_in_listings
AFTER INSERT OR UPDATE OF title, description ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.detect_prohibited_words_in_listing();

-- Insert default prohibited words
INSERT INTO public.prohibited_words (word) VALUES
  ('WhatsApp'),
  ('Number'),
  ('Email'),
  ('Call'),
  ('Link'),
  ('Meet'),
  ('Outside'),
  ('Message'),
  ('Discount'),
  ('Offer'),
  ('Cash'),
  ('Payment'),
  ('Card'),
  ('Crypto'),
  ('Telegram'),
  ('Instagram'),
  ('Group'),
  ('Account'),
  ('Profile'),
  ('Login'),
  ('Support'),
  ('Broadcast'),
  ('Unlimited')
ON CONFLICT (word) DO NOTHING;