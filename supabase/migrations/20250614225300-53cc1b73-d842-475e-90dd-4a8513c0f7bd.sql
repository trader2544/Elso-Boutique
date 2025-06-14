
-- Create M-Pesa transactions table
CREATE TABLE public.mpesa_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  checkout_request_id TEXT UNIQUE NOT NULL,
  merchant_request_id TEXT,
  response_code TEXT,
  response_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for M-Pesa transactions
CREATE POLICY "Allow public read access to M-Pesa transactions" 
  ON public.mpesa_transactions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to M-Pesa transactions" 
  ON public.mpesa_transactions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access to M-Pesa transactions" 
  ON public.mpesa_transactions 
  FOR UPDATE 
  USING (true);

-- Enable real-time updates
ALTER TABLE public.mpesa_transactions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.mpesa_transactions;

-- Create trigger to update order status when M-Pesa payment is successful
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

-- Create trigger that fires on both INSERT and UPDATE
CREATE TRIGGER trigger_update_order_on_mpesa_success
  AFTER INSERT OR UPDATE ON public.mpesa_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_status_on_mpesa_success();

-- Create indexes for better performance
CREATE INDEX idx_mpesa_transactions_checkout_request_id ON public.mpesa_transactions(checkout_request_id);
CREATE INDEX idx_mpesa_transactions_order_id ON public.mpesa_transactions(order_id);
CREATE INDEX idx_mpesa_transactions_status ON public.mpesa_transactions(status);
