
-- Create a trigger function that sends status update emails
CREATE OR REPLACE FUNCTION public.send_order_status_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_changed boolean := false;
BEGIN
  -- Check if status has actually changed
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    status_changed := true;
  END IF;
  
  -- Only send email if status changed and it's one of the statuses we care about
  IF status_changed AND NEW.status IN ('shipped', 'delivered', 'cancelled', 'pending') THEN
    -- Call the edge function to send status update email
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS order_status_email_trigger ON public.orders;
CREATE TRIGGER order_status_email_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.send_order_status_email();
