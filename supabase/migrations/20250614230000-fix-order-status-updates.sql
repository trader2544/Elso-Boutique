
-- First, let's check and fix any existing successful M-Pesa transactions that didn't update orders
-- Run this function to sync existing successful transactions
SELECT public.sync_existing_mpesa_transactions();

-- Let's also create a manual function to check order status updates
CREATE OR REPLACE FUNCTION public.debug_order_mpesa_sync()
RETURNS TABLE(
  order_id text,
  order_status text,
  mpesa_status text,
  mpesa_response_code text,
  should_be_paid boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.order_id,
    o.status::text as order_status,
    mt.status as mpesa_status,
    mt.response_code as mpesa_response_code,
    (mt.status = 'completed' OR mt.response_code = '0') as should_be_paid
  FROM public.mpesa_transactions mt
  LEFT JOIN public.orders o ON o.id::text = mt.order_id
  ORDER BY mt.created_at DESC;
END;
$$;

-- Create a function to manually fix order statuses
CREATE OR REPLACE FUNCTION public.manual_fix_order_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update orders that should be paid based on successful M-Pesa transactions
  UPDATE public.orders 
  SET 
    status = 'paid',
    transaction_id = COALESCE(mt.checkout_request_id, mt.merchant_request_id)
  FROM public.mpesa_transactions mt
  WHERE 
    orders.id::text = mt.order_id 
    AND (mt.status = 'completed' OR mt.response_code = '0')
    AND orders.status = 'pending';
    
  -- Log how many orders were updated
  GET DIAGNOSTICS ROW_COUNT = ROW_COUNT;
  RAISE NOTICE 'Updated % orders from pending to paid', ROW_COUNT;
END;
$$;

-- Run the manual fix
SELECT public.manual_fix_order_statuses();
