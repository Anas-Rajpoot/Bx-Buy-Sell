-- Create monitoring alerts table
CREATE TABLE public.monitoring_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_type TEXT NOT NULL CHECK (problem_type IN ('word', 'user', 'listing', 'chat')),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  problematic_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unsolved' CHECK (status IN ('unsolved', 'in_review', 'solved')),
  responsible_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can view all alerts
CREATE POLICY "Admins can view all alerts"
ON public.monitoring_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can create alerts
CREATE POLICY "Admins can create alerts"
ON public.monitoring_alerts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update alerts
CREATE POLICY "Admins can update alerts"
ON public.monitoring_alerts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete alerts
CREATE POLICY "Admins can delete alerts"
ON public.monitoring_alerts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add assigned_to field to conversations for chat assignment
ALTER TABLE public.conversations
ADD COLUMN assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Trigger for updating updated_at
CREATE TRIGGER update_monitoring_alerts_updated_at
BEFORE UPDATE ON public.monitoring_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification when alert is assigned
CREATE OR REPLACE FUNCTION public.notify_alert_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.responsible_id IS NOT NULL AND (OLD.responsible_id IS NULL OR OLD.responsible_id != NEW.responsible_id) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.responsible_id,
      'New Alert Assigned',
      'You have been assigned a new monitoring alert for ' || NEW.problem_type || '.',
      'alert',
      '/admin/monitoring-alerts'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_alert_assigned
AFTER INSERT OR UPDATE ON public.monitoring_alerts
FOR EACH ROW
EXECUTE FUNCTION public.notify_alert_assignment();

-- Function to create notification when chat is assigned
CREATE OR REPLACE FUNCTION public.notify_chat_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.assigned_to,
      'Chat Conversation Assigned',
      'You have been assigned a new chat conversation.',
      'chat',
      '/admin/chats'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_chat_assigned
AFTER INSERT OR UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.notify_chat_assignment();