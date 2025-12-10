-- Create social_accounts table for storing social media account information
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  followers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for social_accounts
CREATE POLICY "Admins can view all social accounts"
  ON public.social_accounts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create social accounts"
  ON public.social_accounts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update social accounts"
  ON public.social_accounts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete social accounts"
  ON public.social_accounts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();