-- Create listings table
CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price decimal NOT NULL,
  category_id uuid REFERENCES public.categories(id),
  location text,
  image_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  managed_by_ex boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  requests_count integer DEFAULT 0,
  unread_messages_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own listings"
ON public.listings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
ON public.listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.listings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.listings
FOR DELETE
USING (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();