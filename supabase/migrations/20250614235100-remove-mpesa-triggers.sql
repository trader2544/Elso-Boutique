
-- Remove the existing M-Pesa trigger and function
DROP TRIGGER IF EXISTS trigger_update_order_on_mpesa_success ON public.mpesa_transactions;
DROP FUNCTION IF EXISTS public.update_order_status_on_mpesa_success();

-- Remove the test function as well
DROP FUNCTION IF EXISTS public.test_mpesa_order_sync();
