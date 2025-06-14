
-- Ensure no triggers are automatically updating order status
-- Remove any remaining triggers that might update order status
DROP TRIGGER IF EXISTS trigger_update_order_on_mpesa_success ON public.mpesa_transactions;
DROP FUNCTION IF EXISTS public.update_order_status_on_mpesa_success();

-- Double check: remove any other potential triggers on orders table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' AND c.relname = 'orders'
        AND tgname NOT LIKE 'RI_%' -- Keep foreign key triggers
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON public.orders';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Ensure order status can only be updated manually (no automatic triggers)
-- This ensures only explicit code updates can change order status
