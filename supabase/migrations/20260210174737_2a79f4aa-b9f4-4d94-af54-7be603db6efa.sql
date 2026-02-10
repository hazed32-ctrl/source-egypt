
-- Fix: Remove hardcoded anon key fallback from email_on_lead_created
CREATE OR REPLACE FUNCTION public.email_on_lead_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _payload jsonb;
  _url text;
  _anon_key text;
BEGIN
  _url := 'https://savzdjxsjecgntvjzhvv.supabase.co/functions/v1/send-notification-email';
  _anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  IF _anon_key IS NULL OR _anon_key = '' THEN
    RAISE WARNING 'Supabase anon key not configured in app.settings.supabase_anon_key';
    RETURN NEW;
  END IF;

  _payload := jsonb_build_object(
    'type', 'lead_created',
    'record', row_to_json(NEW)::jsonb
  );

  PERFORM extensions.http_post(
    _url,
    _payload::text,
    'application/json',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || _anon_key),
      extensions.http_header('Content-Type', 'application/json')
    ],
    5000
  );

  RETURN NEW;
END;
$function$;

-- Fix: Remove hardcoded anon key fallback from email_on_property_progress_changed
CREATE OR REPLACE FUNCTION public.email_on_property_progress_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _payload jsonb;
  _url text;
  _anon_key text;
BEGIN
  IF NEW.assigned_user_id IS NULL OR 
     OLD.progress_status IS NOT DISTINCT FROM NEW.progress_status THEN
    RETURN NEW;
  END IF;

  _url := 'https://savzdjxsjecgntvjzhvv.supabase.co/functions/v1/send-notification-email';
  _anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  IF _anon_key IS NULL OR _anon_key = '' THEN
    RAISE WARNING 'Supabase anon key not configured in app.settings.supabase_anon_key';
    RETURN NEW;
  END IF;

  _payload := jsonb_build_object(
    'type', 'property_progress_updated',
    'record', row_to_json(NEW)::jsonb,
    'old_record', row_to_json(OLD)::jsonb
  );

  PERFORM extensions.http_post(
    _url,
    _payload::text,
    'application/json',
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || _anon_key),
      extensions.http_header('Content-Type', 'application/json')
    ],
    5000
  );

  RETURN NEW;
END;
$function$;
