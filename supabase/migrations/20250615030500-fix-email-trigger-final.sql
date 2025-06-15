
-- Drop and recreate the trigger function with comprehensive debugging
DROP TRIGGER IF EXISTS order_status_email_trigger ON public.orders;
DROP FUNCTION IF EXISTS public.send_order_status_email();

-- Create the trigger function with extensive debugging
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
  request_body jsonb;
BEGIN
  -- Log every single trigger execution with more details
  RAISE NOTICE '🔥🔥🔥 EMAIL TRIGGER EXECUTED! 🔥🔥🔥';
  RAISE NOTICE 'Trigger Details - Order ID: %, Operation: %, Time: %, PID: %', 
    COALESCE(NEW.id::text, 'NULL'), TG_OP, now(), pg_backend_pid();
  
  -- Log detailed status information
  IF TG_OP = 'UPDATE' THEN
    RAISE NOTICE 'UPDATE Operation Details:';
    RAISE NOTICE '  OLD status: % (type: %)', COALESCE(OLD.status::text, 'NULL'), pg_typeof(OLD.status);
    RAISE NOTICE '  NEW status: % (type: %)', COALESCE(NEW.status::text, 'NULL'), pg_typeof(NEW.status);
    RAISE NOTICE '  Status different: %', (OLD.status IS DISTINCT FROM NEW.status);
    RAISE NOTICE '  OLD user_id: %', COALESCE(OLD.user_id::text, 'NULL');
    RAISE NOTICE '  NEW user_id: %', COALESCE(NEW.user_id::text, 'NULL');
  END IF;
  
  -- Check if status has actually changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    status_changed := true;
    RAISE NOTICE '✅ STATUS CHANGED from % to % for order %', OLD.status, NEW.status, NEW.id;
  ELSE
    RAISE NOTICE '❌ NO STATUS CHANGE detected';
  END IF;
  
  -- Check if we should send email
  IF status_changed AND NEW.status IN ('shipped', 'delivered', 'cancelled', 'pending') THEN
    RAISE NOTICE '📧 SHOULD SEND EMAIL for order % with status %', NEW.id, NEW.status;
    
    -- Check if pg_net extension is available
    SELECT EXISTS(
      SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
    ) INTO extension_exists;
    
    RAISE NOTICE 'pg_net extension available: %', extension_exists;
    
    IF extension_exists THEN
      -- Try to get JWT secret with better error handling
      BEGIN
        jwt_secret := current_setting('app.jwt_secret', true);
        IF jwt_secret IS NULL OR jwt_secret = '' THEN
          jwt_secret := current_setting('app.settings.jwt_secret', true);
        END IF;
        IF jwt_secret IS NULL OR jwt_secret = '' THEN
          jwt_secret := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWpvYmtkd3JiZHhudndudWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTA1NzAsImV4cCI6MjA2NDU2NjU3MH0.zllxkMz3iYum7FT9USRb7qxiFERxI5-2mLHiUkVtnZM';
        END IF;
        RAISE NOTICE 'JWT secret configured: %', (jwt_secret IS NOT NULL AND LENGTH(jwt_secret) > 10);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to get JWT secret: %, using default', SQLERRM;
        jwt_secret := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWpvYmtkd3JiZHhudndudWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTA1NzAsImV4cCI6MjA2NDU2NjU3MH0.zllxkMz3iYum7FT9USRb7qxiFERxI5-2mLHiUkVtnZM';
      END;
      
      -- Prepare request body
      request_body := jsonb_build_object(
        'orderId', NEW.id,
        'newStatus', NEW.status,
        'oldStatus', OLD.status
      );
      
      RAISE NOTICE 'Prepared request body: %', request_body;
      
      -- Make HTTP request with detailed logging
      BEGIN
        RAISE NOTICE '🌐 Making HTTP POST request to: %', function_url;
        RAISE NOTICE '📦 Request headers will include Authorization: Bearer %...', LEFT(jwt_secret, 10);
        
        SELECT INTO response_data
          net.http_post(
            url := function_url,
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || jwt_secret
            ),
            body := request_body
          );
          
        RAISE NOTICE '📤 HTTP request completed successfully!';
        RAISE NOTICE 'Response received: %', COALESCE(response_data::text, 'NULL');
        
        -- Log specific response details
        IF response_data IS NOT NULL THEN
          RAISE NOTICE 'Response status: %', COALESCE(response_data->>'status', 'unknown');
          RAISE NOTICE 'Response body: %', COALESCE(response_data->>'body', 'empty');
        END IF;
        
      EXCEPTION WHEN OTHERS THEN
        -- Log the error with full details
        RAISE NOTICE '❌ HTTP REQUEST FAILED!';
        RAISE NOTICE 'Error message: %', SQLERRM;
        RAISE NOTICE 'Error state: %', SQLSTATE;
        RAISE NOTICE 'Error context: %', COALESCE(SQLERRM, 'No additional context');
        -- Don't fail the transaction, just log the error
      END;
    ELSE
      RAISE NOTICE '❌ pg_net extension not available - cannot send HTTP requests';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️ Email not needed - status_changed: %, new_status: %, target_statuses: [shipped,delivered,cancelled,pending]', 
      status_changed, NEW.status;
  END IF;
  
  RAISE NOTICE '✅ Email trigger function completed for order %', NEW.id;
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER order_status_email_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_status_email();

-- Verify trigger creation
DO $$
DECLARE
  trigger_count integer;
  function_exists boolean;
BEGIN
  -- Check trigger
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_name = 'order_status_email_trigger' 
  AND event_object_table = 'orders';
  
  -- Check function
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'send_order_status_email'
  ) INTO function_exists;
  
  RAISE NOTICE '📊 Setup verification:';
  RAISE NOTICE '  Triggers found: %', trigger_count;
  RAISE NOTICE '  Function exists: %', function_exists;
  
  IF trigger_count > 0 AND function_exists THEN
    RAISE NOTICE '✅ Email trigger setup completed successfully!';
  ELSE
    RAISE NOTICE '❌ Email trigger setup may have issues!';
  END IF;
END;
$$;
