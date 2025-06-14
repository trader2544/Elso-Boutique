
-- Create a function that updates order status when M-Pesa transaction is successful
CREATE OR REPLACE FUNCTION public.update_order_status_on_mpesa_success()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the transaction is successful (status = 'completed' or response_code = '0')
  IF (NEW.status = 'completed' OR NEW.response_code = '0') AND 
     (OLD.status IS NULL OR OLD.status != 'completed') AND 
     (OLD.response_code IS NULL OR OLD.response_code != '0') THEN
    
    -- Update the corresponding order status to 'paid'
    UPDATE public.orders 
    SET 
      status = 'paid',
      transaction_id = COALESCE(NEW.checkout_request_id, NEW.merchant_request_id)
    WHERE id::text = NEW.order_id AND status != 'paid';
    
    -- Log the update for debugging
    RAISE NOTICE 'Order % status updated to paid based on M-Pesa transaction %', NEW.order_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires after INSERT or UPDATE on mpesa_transactions
DROP TRIGGER IF EXISTS trigger_update_order_on_mpesa_success ON public.mpesa_transactions;

CREATE TRIGGER trigger_update_order_on_mpesa_success
  AFTER INSERT OR UPDATE ON public.mpesa_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_status_on_mpesa_success();

-- Also create a manual function to sync existing successful transactions (optional)
CREATE OR REPLACE FUNCTION public.sync_existing_mpesa_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update orders for existing successful M-Pesa transactions
  UPDATE public.orders 
  SET 
    status = 'paid',
    transaction_id = COALESCE(mt.checkout_request_id, mt.merchant_request_id)
  FROM public.mpesa_transactions mt
  WHERE 
    orders.id::text = mt.order_id 
    AND (mt.status = 'completed' OR mt.response_code = '0')
    AND orders.status != 'paid';
    
  RAISE NOTICE 'Synced existing M-Pesa transactions with orders';
END;
$$;
