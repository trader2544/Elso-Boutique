
-- Add quantity column to products table
ALTER TABLE public.products 
ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0;

-- Add a function to update product quantities
CREATE OR REPLACE FUNCTION public.update_product_quantity(
  product_id UUID,
  quantity_change INTEGER,
  operation TEXT -- 'add' or 'subtract'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_quantity INTEGER;
  new_quantity INTEGER;
  product_name TEXT;
BEGIN
  -- Get current quantity and product name
  SELECT quantity, name INTO current_quantity, product_name
  FROM public.products 
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Product not found');
  END IF;
  
  -- Calculate new quantity based on operation
  IF operation = 'add' THEN
    new_quantity := current_quantity + quantity_change;
  ELSIF operation = 'subtract' THEN
    new_quantity := current_quantity - quantity_change;
    IF new_quantity < 0 THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient stock');
    END IF;
  ELSE
    RETURN json_build_object('success', false, 'error', 'Invalid operation');
  END IF;
  
  -- Update the quantity
  UPDATE public.products 
  SET quantity = new_quantity,
      in_stock = (new_quantity > 0),
      stock_status = CASE 
        WHEN new_quantity = 0 THEN 'out_of_stock'
        WHEN new_quantity <= 5 THEN 'few_units_left'
        ELSE 'stocked'
      END
  WHERE id = product_id;
  
  RETURN json_build_object(
    'success', true, 
    'product_name', product_name,
    'old_quantity', current_quantity,
    'new_quantity', new_quantity
  );
END;
$$;

-- Create a table to track quantity changes
CREATE TABLE public.quantity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id),
  change_amount INTEGER NOT NULL,
  operation TEXT NOT NULL, -- 'add', 'subtract', 'sale'
  reason TEXT,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quantity_logs
ALTER TABLE public.quantity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view quantity logs
CREATE POLICY "Admins can view quantity logs" 
ON public.quantity_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Policy for admins to insert quantity logs
CREATE POLICY "Admins can insert quantity logs" 
ON public.quantity_logs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));
