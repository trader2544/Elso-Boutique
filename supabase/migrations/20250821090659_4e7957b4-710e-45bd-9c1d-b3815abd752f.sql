-- Fix critical security vulnerability: Remove public access to sensitive payment data
-- and implement proper RLS policies for mpesa_transactions table

-- Drop the dangerous public access policies
DROP POLICY IF EXISTS "Allow public read access to M-Pesa transactions" ON public.mpesa_transactions;
DROP POLICY IF EXISTS "Allow public update access to M-Pesa transactions" ON public.mpesa_transactions;

-- Create secure RLS policies

-- Allow users to view only transactions for their own orders
CREATE POLICY "Users can view their own transaction details"
ON public.mpesa_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id::text = mpesa_transactions.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Allow admins to view all transactions for management purposes
CREATE POLICY "Admins can view all transactions" 
ON public.mpesa_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Keep insert access for M-Pesa callbacks (service role will bypass RLS anyway)
-- But restrict to service role only for security
DROP POLICY IF EXISTS "Allow public insert access to M-Pesa transactions" ON public.mpesa_transactions;

-- Create policy that only allows service role to insert (for M-Pesa callbacks)
CREATE POLICY "Service role can insert M-Pesa transactions"
ON public.mpesa_transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update for M-Pesa callbacks
CREATE POLICY "Service role can update M-Pesa transactions"
ON public.mpesa_transactions  
FOR UPDATE
TO service_role
USING (true);

-- Allow admins to update transaction status if needed
CREATE POLICY "Admins can update transaction status"
ON public.mpesa_transactions
FOR UPDATE  
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);