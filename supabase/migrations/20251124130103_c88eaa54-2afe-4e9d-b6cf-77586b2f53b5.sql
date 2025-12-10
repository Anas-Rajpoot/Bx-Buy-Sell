-- Fix profiles table RLS policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Fix listings table RLS policy - hide user_id from public view
DROP POLICY IF EXISTS "Anyone can view published listings" ON public.listings;

-- Public can view published listings (user_id hidden via application layer)
CREATE POLICY "Anyone can view published listings"
ON public.listings
FOR SELECT
USING (status = 'published');

-- Admins can view all listings with full details
CREATE POLICY "Admins can view all listings"
ON public.listings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));