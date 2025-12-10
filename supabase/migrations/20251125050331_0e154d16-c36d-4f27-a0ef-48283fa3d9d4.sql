-- Add category to prohibited_words table
ALTER TABLE public.prohibited_words
ADD COLUMN category TEXT DEFAULT 'other' CHECK (category IN ('contact_info', 'payment_methods', 'external_platforms', 'other'));

-- Update existing words with appropriate categories
UPDATE public.prohibited_words
SET category = 'contact_info'
WHERE word IN ('WhatsApp', 'Number', 'Email', 'Call', 'Message', 'Telegram');

UPDATE public.prohibited_words
SET category = 'payment_methods'
WHERE word IN ('Discount', 'Offer', 'Cash', 'Payment', 'Card', 'Crypto');

UPDATE public.prohibited_words
SET category = 'external_platforms'
WHERE word IN ('Link', 'Meet', 'Outside', 'Instagram', 'Group', 'Account', 'Profile', 'Login', 'Support', 'Broadcast', 'Unlimited');