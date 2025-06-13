
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products-images', 'products-images', true);

-- Create RLS policies for the products-images bucket to allow public access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products-images');

CREATE POLICY "Allow authenticated users to upload product images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update product images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'products-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete product images" ON storage.objects FOR DELETE 
USING (bucket_id = 'products-images' AND auth.role() = 'authenticated');

-- Add delivery_location column to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_location TEXT;

-- Enable realtime for orders table to get live updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
