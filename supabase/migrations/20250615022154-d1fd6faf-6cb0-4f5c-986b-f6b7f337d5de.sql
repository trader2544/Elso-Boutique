
-- Enable the required extensions for HTTP requests
CREATE EXTENSION IF NOT EXISTS "http";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Update the trigger function to handle cases where extensions might not be available
CREATE OR REPLACE FUNCTION public.send_order_status_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_changed boolean := false;
  extension_exists boolean := false;
BEGIN
  -- Check if status has actually changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    status_changed := true;
  END IF;
  
  -- Only send email if status changed and it's one of the statuses we care about
  IF status_changed AND NEW.status IN ('shipped', 'delivered', 'cancelled', 'pending') THEN
    -- Check if pg_net extension is available
    SELECT EXISTS(
      SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
    ) INTO extension_exists;
    
    IF extension_exists THEN
      -- Call the edge function to send status update email
      BEGIN
        PERFORM
          net.http_post(
            url := 'https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/send-order-status-email',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || current_setting('app.jwt_secret', true)
            ),
            body := jsonb_build_object(
              'orderId', NEW.id,
              'newStatus', NEW.status,
              'oldStatus', OLD.status
            )
          );
      EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the transaction
        RAISE NOTICE 'Failed to send email notification: %', SQLERRM;
      END;
    ELSE
      RAISE NOTICE 'pg_net extension not available, skipping email notification';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;
