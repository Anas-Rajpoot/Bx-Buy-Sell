-- Add policy to allow everyone to view published listings
CREATE POLICY "Anyone can view published listings"
ON public.listings
FOR SELECT
USING (status = 'published');

-- The existing "Users can view their own listings" policy remains for drafts/unpublished