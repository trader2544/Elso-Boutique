
-- Create the manual fix function for order statuses
CREATE OR REPLACE FUNCTION public.manual_fix_order_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rows_updated integer;
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
    
  -- Get the number of rows updated
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RAISE NOTICE 'Updated % orders from pending to paid', rows_updated;
END;
$$;

-- Create the debug function to check order status updates
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

-- Now run the manual fix
SELECT public.manual_fix_order_statuses();

-- And check the current state
SELECT * FROM public.debug_order_mpesa_sync();
