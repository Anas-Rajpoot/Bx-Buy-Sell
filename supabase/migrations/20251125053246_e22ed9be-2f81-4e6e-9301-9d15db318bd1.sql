-- Fix security definer view by enabling security invoker
-- This makes the view execute with the permissions of the calling user
ALTER VIEW public.chat_analytics SET (security_invoker = on);