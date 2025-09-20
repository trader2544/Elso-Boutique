-- Add images and color_labels columns to products table
ALTER TABLE public.products 
ADD COLUMN images TEXT[],
ADD COLUMN color_labels TEXT[];