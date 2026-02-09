
-- Newsletter subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email)
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Admins can view/manage all subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to notify admins on new subscription
CREATE OR REPLACE FUNCTION public.notify_on_newsletter_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_admin RECORD;
BEGIN
  FOR v_admin IN
    SELECT ur.user_id
    FROM user_roles ur
    WHERE ur.role = 'admin'
  LOOP
    INSERT INTO notifications (
      recipient_user_id,
      title,
      body,
      type,
      severity,
      metadata
    ) VALUES (
      v_admin.user_id,
      'New Newsletter Subscriber',
      format('New subscriber: %s', NEW.email),
      'lead_created'::notification_type,
      'info'::notification_severity,
      jsonb_build_object('email', NEW.email, 'source', 'newsletter')
    );
  END LOOP;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER on_newsletter_subscription
AFTER INSERT ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_newsletter_subscription();
