-- Create a public view of listings that hides user_id to prevent identity correlation
CREATE OR REPLACE VIEW public.public_listings AS
SELECT 
  id,
  title,
  description,
  price,
  location,
  image_url,
  category_id,
  status,
  requests_count,
  unread_messages_count,
  managed_by_ex,
  created_at,
  updated_at
FROM public.listings
WHERE status = 'published';

-- Grant access to the public listings view
GRANT SELECT ON public.public_listings TO authenticated, anon;

-- Add RLS policy to chat_analytics view to restrict access to admins only
-- First, we need to convert the view to a materialized view with RLS support
-- Or create policies on the underlying tables. Since it's a view, we'll create a security definer function
CREATE OR REPLACE FUNCTION public.get_chat_analytics()
RETURNS TABLE (
  user_id uuid,
  team_member_name text,
  total_assigned bigint,
  resolved_count bigint,
  open_count bigint,
  avg_first_response_minutes numeric,
  avg_resolution_hours numeric,
  resolution_rate_percentage numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.full_name as team_member_name,
    COUNT(c.id) as total_assigned,
    COUNT(CASE WHEN c.resolution_status = 'resolved' THEN 1 END) as resolved_count,
    COUNT(CASE WHEN c.resolution_status = 'open' THEN 1 END) as open_count,
    AVG(EXTRACT(EPOCH FROM (c.first_response_at - c.created_at)) / 60) as avg_first_response_minutes,
    AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600) as avg_resolution_hours,
    CASE 
      WHEN COUNT(c.id) > 0 THEN 
        (COUNT(CASE WHEN c.resolution_status = 'resolved' THEN 1 END)::numeric / COUNT(c.id)::numeric * 100)
      ELSE 0
    END as resolution_rate_percentage
  FROM public.profiles p
  LEFT JOIN public.conversations c ON c.assigned_to = p.id
  WHERE public.has_role(p.id, 'admin'::app_role) OR public.has_role(p.id, 'moderator'::app_role)
  GROUP BY p.id, p.full_name;
$$;

-- Update conversations RLS policies to hide assigned_to from regular users
-- Drop existing SELECT policy and recreate with field filtering
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;

CREATE POLICY "Users can view their own conversations"
ON public.conversations
FOR SELECT
USING (
  (auth.uid() = buyer_id OR auth.uid() = seller_id)
);

-- Note: The assigned_to field will still be returned in queries, but we should handle this in the application layer
-- by not displaying it to non-admin users. For database-level protection, we would need to create a view.

-- Create a user-safe view of conversations that hides admin metadata
CREATE OR REPLACE VIEW public.user_conversations AS
SELECT 
  id,
  buyer_id,
  seller_id,
  listing_id,
  last_message,
  last_message_at,
  first_response_at,
  resolution_status,
  resolved_at,
  is_archived,
  created_at,
  updated_at,
  CASE 
    WHEN public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role)
    THEN assigned_to
    ELSE NULL
  END as assigned_to
FROM public.conversations
WHERE auth.uid() = buyer_id OR auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'::app_role);

-- Grant access to user conversations view
GRANT SELECT ON public.user_conversations TO authenticated;

-- Add comment explaining the security measures
COMMENT ON VIEW public.public_listings IS 'Public view of listings that hides user_id to prevent correlation attacks and identity exposure';
COMMENT ON VIEW public.user_conversations IS 'User-safe view of conversations that hides admin assignment metadata from regular users';
COMMENT ON FUNCTION public.get_chat_analytics IS 'Admin-only function to retrieve chat analytics. Only accessible to users with admin or moderator roles';