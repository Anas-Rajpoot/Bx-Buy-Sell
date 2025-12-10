-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  bg_color TEXT NOT NULL,
  icon_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.categories (name, icon, bg_color, icon_color) VALUES
  ('E-Commerce', 'shopping-bag', 'bg-blue-100', 'text-blue-600'),
  ('Software', 'code', 'bg-green-100', 'text-green-600'),
  ('Service Business', 'handshake', 'bg-orange-100', 'text-orange-600'),
  ('Other', 'layout-grid', 'bg-purple-100', 'text-purple-600');

-- Insert default tools
INSERT INTO public.tools (name, logo, highlighted) VALUES
  ('Amazon Seller Central', 'https://via.placeholder.com/80?text=Amazon', false),
  ('Shopify', 'https://via.placeholder.com/80?text=Shopify', false),
  ('WooCommerce', 'https://via.placeholder.com/80?text=WooCommerce', true),
  ('Ebay', 'https://via.placeholder.com/80?text=Ebay', false),
  ('Etsy', 'https://via.placeholder.com/80?text=Etsy', true),
  ('BigCommerce', 'https://via.placeholder.com/80?text=BigCommerce', true),
  ('Magento', 'https://via.placeholder.com/80?text=Magento', false),
  ('PrestaShop', 'https://via.placeholder.com/80?text=PrestaShop', false),
  ('Wix', 'https://via.placeholder.com/80?text=Wix', false),
  ('Squarespace', 'https://via.placeholder.com/80?text=Squarespace', false),
  ('Stripe', 'https://via.placeholder.com/80?text=Stripe', false),
  ('PayPal', 'https://via.placeholder.com/80?text=PayPal', false),
  ('Xero', 'https://via.placeholder.com/80?text=Xero', false),
  ('Freshbooks', 'https://via.placeholder.com/80?text=Freshbooks', false),
  ('Helium10', 'https://via.placeholder.com/80?text=Helium10', false),
  ('Other', 'https://via.placeholder.com/80?text=Other', false);

-- Insert default integrations
INSERT INTO public.integrations (name, logo) VALUES
  ('Amazon', 'https://via.placeholder.com/80?text=Amazon'),
  ('Shopify', 'https://via.placeholder.com/80?text=Shopify'),
  ('Google Analytics', 'https://via.placeholder.com/80?text=GA');

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Tools are viewable by everyone" 
ON public.tools FOR SELECT USING (true);

CREATE POLICY "Integrations are viewable by everyone" 
ON public.integrations FOR SELECT USING (true);