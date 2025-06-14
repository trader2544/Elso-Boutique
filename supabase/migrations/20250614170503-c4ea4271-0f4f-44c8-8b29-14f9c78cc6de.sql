
-- Enable realtime for mpesa_transactions table
ALTER TABLE public.mpesa_transactions REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.mpesa_transactions;
