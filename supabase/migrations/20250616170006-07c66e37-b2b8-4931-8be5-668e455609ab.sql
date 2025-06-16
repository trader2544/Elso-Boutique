
-- Add stock_status column to products table
ALTER TABLE public.products 
ADD COLUMN stock_status text DEFAULT 'stocked' CHECK (stock_status IN ('out_of_stock', 'few_units_left', 'stocked', 'flash_sale'));

-- Update existing products to have default stock status
UPDATE public.products 
SET stock_status = 'stocked' 
WHERE stock_status IS NULL;
