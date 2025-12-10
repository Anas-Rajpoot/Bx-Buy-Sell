-- Add availability status to track team member availability
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS availability_status text DEFAULT 'available'
CHECK (availability_status IN ('available', 'busy', 'offline'));

-- Add analytics tracking columns to conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS first_response_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resolution_status text DEFAULT 'open'
CHECK (resolution_status IN ('open', 'pending', 'resolved', 'closed'));

-- Create chat routing rules table
CREATE TABLE IF NOT EXISTS public.chat_routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  category_id uuid REFERENCES public.categories(id),
  language text,
  assign_to_role text,
  assign_to_user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on chat_routing_rules
ALTER TABLE public.chat_routing_rules ENABLE ROW LEVEL SECURITY;

-- Admins can manage routing rules
CREATE POLICY "Admins can manage routing rules"
ON public.chat_routing_rules
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to get available team member
CREATE OR REPLACE FUNCTION public.get_available_team_member(_role text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  available_member_id uuid;
BEGIN
  -- Find least loaded available team member with the specified role
  SELECT ur.user_id INTO available_member_id
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  LEFT JOIN (
    SELECT assigned_to, COUNT(*) as conversation_count
    FROM public.conversations
    WHERE assigned_to IS NOT NULL 
      AND resolution_status IN ('open', 'pending')
    GROUP BY assigned_to
  ) c ON c.assigned_to = ur.user_id
  WHERE ur.role IN ('admin', 'moderator')
    AND p.availability_status = 'available'
    AND (_role IS NULL OR ur.role::text = _role)
  ORDER BY COALESCE(c.conversation_count, 0) ASC, ur.created_at ASC
  LIMIT 1;
  
  RETURN available_member_id;
END;
$$;

-- Create function to auto-assign conversation based on routing rules
CREATE OR REPLACE FUNCTION public.auto_assign_conversation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matching_rule RECORD;
  assigned_member uuid;
  listing_category uuid;
BEGIN
  -- Only process if not already assigned
  IF NEW.assigned_to IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get listing category if available
  IF NEW.listing_id IS NOT NULL THEN
    SELECT category_id INTO listing_category
    FROM public.listings
    WHERE id = NEW.listing_id;
  END IF;

  -- Find matching routing rule with highest priority
  SELECT * INTO matching_rule
  FROM public.chat_routing_rules
  WHERE is_active = true
    AND (category_id IS NULL OR category_id = listing_category)
  ORDER BY priority DESC, created_at ASC
  LIMIT 1;

  -- Assign based on rule or default logic
  IF matching_rule IS NOT NULL THEN
    IF matching_rule.assign_to_user_id IS NOT NULL THEN
      assigned_member := matching_rule.assign_to_user_id;
    ELSIF matching_rule.assign_to_role IS NOT NULL THEN
      assigned_member := get_available_team_member(matching_rule.assign_to_role);
    ELSE
      assigned_member := get_available_team_member();
    END IF;
  ELSE
    -- Default: assign to least loaded available team member
    assigned_member := get_available_team_member();
  END IF;

  -- Update assignment
  IF assigned_member IS NOT NULL THEN
    NEW.assigned_to := assigned_member;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS auto_assign_new_conversation ON public.conversations;
CREATE TRIGGER auto_assign_new_conversation
  BEFORE INSERT ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_conversation();

-- Create function to track first response time
CREATE OR REPLACE FUNCTION public.track_first_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update first_response_at if this is the first message from assigned team member
  UPDATE public.conversations
  SET first_response_at = NEW.created_at
  WHERE id = NEW.conversation_id
    AND first_response_at IS NULL
    AND assigned_to = NEW.sender_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for first response tracking
DROP TRIGGER IF EXISTS track_first_response_trigger ON public.messages;
CREATE TRIGGER track_first_response_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.track_first_response();

-- Create view for chat analytics
CREATE OR REPLACE VIEW public.chat_analytics AS
SELECT 
  ur.user_id,
  p.full_name as team_member_name,
  COUNT(DISTINCT c.id) as total_assigned,
  COUNT(DISTINCT CASE WHEN c.resolution_status = 'resolved' THEN c.id END) as resolved_count,
  COUNT(DISTINCT CASE WHEN c.resolution_status = 'open' THEN c.id END) as open_count,
  ROUND(
    AVG(
      CASE 
        WHEN c.first_response_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (c.first_response_at - c.created_at)) / 60 
      END
    )::numeric, 
    2
  ) as avg_first_response_minutes,
  ROUND(
    AVG(
      CASE 
        WHEN c.resolved_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600 
      END
    )::numeric, 
    2
  ) as avg_resolution_hours,
  ROUND(
    (COUNT(DISTINCT CASE WHEN c.resolution_status = 'resolved' THEN c.id END)::float / 
     NULLIF(COUNT(DISTINCT c.id), 0) * 100)::numeric,
    2
  ) as resolution_rate_percentage
FROM public.user_roles ur
JOIN public.profiles p ON p.id = ur.user_id
LEFT JOIN public.conversations c ON c.assigned_to = ur.user_id
WHERE ur.role IN ('admin', 'moderator')
GROUP BY ur.user_id, p.full_name;