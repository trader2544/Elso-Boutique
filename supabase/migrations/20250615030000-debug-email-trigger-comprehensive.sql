
-- First, let's check if the trigger exists and is properly configured
DO $$
DECLARE
  trigger_exists boolean;
  function_exists boolean;
BEGIN
  -- Check if trigger exists
  SELECT EXISTS(
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'order_status_email_trigger' 
    AND event_object_table = 'orders'
  ) INTO trigger_exists;
  
  -- Check if function exists
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'send_order_status_email'
  ) INTO function_exists;
  
  RAISE NOTICE 'Trigger exists: %, Function exists: %', trigger_exists, function_exists;
END;
$$;

-- Update the trigger function with comprehensive debugging
CREATE OR REPLACE FUNCTION public.send_order_status_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_changed boolean := false;
  extension_exists boolean := false;
  response_data jsonb;
  jwt_secret text;
  function_url text := 'https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/send-order-status-email';
BEGIN
  -- Log every single trigger execution
  RAISE NOTICE '🔥 EMAIL TRIGGER FIRED! Order: %, Operation: %, Thread: %', 
    COALESCE(NEW.id::text, 'NULL'), TG_OP, pg_backend_pid();
  
  -- Log old and new status values
  IF TG_OP = 'UPDATE' THEN
    RAISE NOTICE 'Status comparison - OLD: %, NEW: %, Different: %', 
      COALESCE(OLD.status::text, 'NULL'), 
      COALESCE(NEW.status::text, 'NULL'),
      (OLD.status IS DISTINCT FROM NEW.status);
  END IF;
  
  -- Check if status has actually changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    status_changed := true;
    RAISE NOTICE '✅ Status changed from % to % for order %', OLD.status, NEW.status, NEW.id;
  END IF;
  
  -- Only send email if status changed and it's one of the statuses we care about
  IF status_changed AND NEW.status IN ('shipped', 'delivered', 'cancelled', 'pending') THEN
    RAISE NOTICE '📧 Should send email for order % with status %', NEW.id, NEW.status;
    
    -- Check if pg_net extension is available
    SELECT EXISTS(
      SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
    ) INTO extension_exists;
    
    RAISE NOTICE 'pg_net extension available: %', extension_exists;
    
    IF extension_exists THEN
      -- Try to get JWT secret
      BEGIN
        jwt_secret := current_setting('app.jwt_secret', true);
        IF jwt_secret IS NULL OR jwt_secret = '' THEN
          jwt_secret := current_setting('app.settings.jwt_secret', true);
        END IF;
        RAISE NOTICE 'JWT secret found: %', (jwt_secret IS NOT NULL AND jwt_secret != '');
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to get JWT secret: %', SQLERRM;
        jwt_secret := 'fallback_secret';
      END;
      
      -- Call the edge function to send status update email
      BEGIN
        RAISE NOTICE '🌐 Making HTTP request to: %', function_url;
        
        SELECT
          net.http_post(
            url := function_url,
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || COALESCE(jwt_secret, 'missing_secret')
            ),
            body := jsonb_build_object(
              'orderId', NEW.id,
              'newStatus', NEW.status,
              'oldStatus', OLD.status
            )
          ) INTO response_data;
          
        RAISE NOTICE '📤 HTTP request completed, response: %', response_data;
        
        -- Log response details if available
        IF response_data IS NOT NULL THEN
          RAISE NOTICE 'Response status: %, body: %', 
            response_data->>'status', 
            response_data->>'body';
        END IF;
        
      EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE NOTICE '❌ Failed to send email notification: %, SQLSTATE: %', SQLERRM, SQLSTATE;
      END;
    ELSE
      RAISE NOTICE '❌ pg_net extension not available, skipping email notification';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️ No email needed - status_changed: %, current_status: %', status_changed, NEW.status;
  END IF;
  
  RAISE NOTICE '✅ Email trigger completed for order %', NEW.id;
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS order_status_email_trigger ON public.orders;
CREATE TRIGGER order_status_email_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_status_email();

-- Test trigger creation
DO $$
DECLARE
  trigger_count integer;
BEGIN
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_name = 'order_status_email_trigger' 
  AND event_object_table = 'orders';
  
  RAISE NOTICE 'Trigger creation result: % triggers found', trigger_count;
END;
$$;

-- Test extensions availability
DO $$
DECLARE
  pg_net_exists boolean;
  http_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_net') INTO pg_net_exists;
  SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'http') INTO http_exists;
  
  RAISE NOTICE 'Extensions status - pg_net: %, http: %', pg_net_exists, http_exists;
  
  IF pg_net_exists THEN
    RAISE NOTICE '✅ pg_net extension is available for HTTP requests';
  ELSE
    RAISE NOTICE '❌ pg_net extension is NOT available';
  END IF;
END;
$$;
