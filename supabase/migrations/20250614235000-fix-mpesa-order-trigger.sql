
-- First, let's check if the trigger exists and recreate it properly
DROP TRIGGER IF EXISTS trigger_update_order_on_mpesa_success ON public.mpesa_transactions;

-- Recreate the function with better logging and error handling
CREATE OR REPLACE FUNCTION public.update_order_status_on_mpesa_success()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  order_exists boolean := false;
  current_order_status text;
  updated_rows integer := 0;
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'M-Pesa trigger fired for transaction ID: %, Order ID: %, Status: %, Response Code: %', 
    NEW.id, NEW.order_id, NEW.status, NEW.response_code;
  
  -- Check if this is a successful transaction
  IF (NEW.status = 'completed' OR NEW.response_code = '0') THEN
    RAISE NOTICE 'Transaction is successful, checking if order needs update';
    
    -- Check if order exists and get current status
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE id::text = NEW.order_id), 
           (SELECT status FROM public.orders WHERE id::text = NEW.order_id LIMIT 1)
    INTO order_exists, current_order_status;
    
    RAISE NOTICE 'Order exists: %, Current status: %', order_exists, current_order_status;
    
    IF order_exists AND current_order_status != 'paid' THEN
      -- Update the order status
      UPDATE public.orders 
      SET 
        status = 'paid',
        transaction_id = COALESCE(NEW.checkout_request_id, NEW.merchant_request_id)
      WHERE id::text = NEW.order_id;
      
      GET DIAGNOSTICS updated_rows = ROW_COUNT;
      RAISE NOTICE 'Updated % order(s) to paid status for order ID: %', updated_rows, NEW.order_id;
    ELSE
      RAISE NOTICE 'Order either does not exist or is already paid. Order exists: %, Status: %', order_exists, current_order_status;
    END IF;
  ELSE
    RAISE NOTICE 'Transaction not successful. Status: %, Response Code: %', NEW.status, NEW.response_code;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger that fires on both INSERT and UPDATE
CREATE TRIGGER trigger_update_order_on_mpesa_success
  AFTER INSERT OR UPDATE ON public.mpesa_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_status_on_mpesa_success();

-- Also create a manual function to test and verify the sync
CREATE OR REPLACE FUNCTION public.test_mpesa_order_sync()
RETURNS TABLE(
  order_id text,
  order_status text,
  mpesa_status text,
  mpesa_response_code text,
  should_be_paid boolean,
  order_exists boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.order_id,
    COALESCE(o.status::text, 'ORDER_NOT_FOUND') as order_status,
    mt.status as mpesa_status,
    mt.response_code as mpesa_response_code,
    (mt.status = 'completed' OR mt.response_code = '0') as should_be_paid,
    (o.id IS NOT NULL) as order_exists
  FROM public.mpesa_transactions mt
  LEFT JOIN public.orders o ON o.id::text = mt.order_id
  ORDER BY mt.created_at DESC
  LIMIT 10;
END;
$$;
