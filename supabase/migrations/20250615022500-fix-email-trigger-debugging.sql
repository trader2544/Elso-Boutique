
-- Update the trigger function with better error handling and debugging
CREATE OR REPLACE FUNCTION public.send_order_status_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_changed boolean := false;
  extension_exists boolean := false;
  response_data jsonb;
BEGIN
  -- Add debugging log
  RAISE NOTICE 'Email trigger fired for order: %, operation: %', NEW.id, TG_OP;
  
  -- Check if status has actually changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    status_changed := true;
    RAISE NOTICE 'Status changed from % to % for order %', OLD.status, NEW.status, NEW.id;
  END IF;
  
  -- Only send email if status changed and it's one of the statuses we care about
  IF status_changed AND NEW.status IN ('shipped', 'delivered', 'cancelled', 'pending') THEN
    RAISE NOTICE 'Attempting to send email for order % with status %', NEW.id, NEW.status;
    
    -- Check if pg_net extension is available
    SELECT EXISTS(
      SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
    ) INTO extension_exists;
    
    IF extension_exists THEN
      RAISE NOTICE 'pg_net extension found, calling edge function';
      
      -- Call the edge function to send status update email
      BEGIN
        SELECT
          net.http_post(
            url := 'https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/send-order-status-email',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || coalesce(current_setting('app.jwt_secret', true), current_setting('app.settings.jwt_secret', true))
            ),
            body := jsonb_build_object(
              'orderId', NEW.id,
              'newStatus', NEW.status,
              'oldStatus', OLD.status
            )
          ) INTO response_data;
          
        RAISE NOTICE 'HTTP request sent, response: %', response_data;
      EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE NOTICE 'Failed to send email notification: %, SQLSTATE: %', SQLERRM, SQLSTATE;
      END;
    ELSE
      RAISE NOTICE 'pg_net extension not available, skipping email notification';
    END IF;
  ELSE
    RAISE NOTICE 'No email needed - status_changed: %, status: %', status_changed, NEW.status;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS order_status_email_trigger ON public.orders;
CREATE TRIGGER order_status_email_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_status_email();

-- Test if pg_net extension is available
DO $$
DECLARE
  ext_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_net') INTO ext_exists;
  IF ext_exists THEN
    RAISE NOTICE 'pg_net extension is available';
  ELSE
    RAISE NOTICE 'pg_net extension is NOT available - this may be why emails are not sending';
  END IF;
END;
$$;
