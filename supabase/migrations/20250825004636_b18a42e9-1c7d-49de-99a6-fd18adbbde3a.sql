
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category_id to products table (foreign key to categories)
ALTER TABLE public.products 
ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Add featured flag to products table
ALTER TABLE public.products 
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create stock_batches table for inventory management
CREATE TABLE public.stock_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_price NUMERIC,
  supplier TEXT,
  expiry_date DATE,
  received_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_exports table to track downloads
CREATE TABLE public.analytics_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id),
  export_type TEXT NOT NULL,
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for stock_batches
CREATE POLICY "Admins can view stock batches" ON public.stock_batches
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage stock batches" ON public.stock_batches
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for analytics_exports
CREATE POLICY "Admins can view their analytics exports" ON public.analytics_exports
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can create analytics exports" ON public.analytics_exports
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for better performance
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_stock_batches_product_id ON public.stock_batches(product_id);
CREATE INDEX idx_analytics_exports_admin_id ON public.analytics_exports(admin_id);

-- Function to get products by category
CREATE OR REPLACE FUNCTION public.get_products_by_category(category_name TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  previous_price NUMERIC,
  image_url TEXT,
  in_stock BOOLEAN,
  stock_status TEXT,
  quantity INTEGER,
  rating NUMERIC,
  review_count INTEGER,
  is_featured BOOLEAN,
  category TEXT
) 
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    p.id, p.name, p.description, p.price, p.previous_price,
    p.image_url, p.in_stock, p.stock_status, p.quantity,
    p.rating, p.review_count, p.is_featured, p.category
  FROM public.products p
  JOIN public.categories c ON p.category_id = c.id
  WHERE c.name = category_name
  ORDER BY p.created_at DESC;
$$;

-- Function to get featured products
CREATE OR REPLACE FUNCTION public.get_featured_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  previous_price NUMERIC,
  image_url TEXT,
  in_stock BOOLEAN,
  stock_status TEXT,
  quantity INTEGER,
  rating NUMERIC,
  review_count INTEGER,
  category TEXT
) 
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    p.id, p.name, p.description, p.price, p.previous_price,
    p.image_url, p.in_stock, p.stock_status, p.quantity,
    p.rating, p.review_count, p.category
  FROM public.products p
  WHERE p.is_featured = true
  ORDER BY p.created_at DESC;
$$;
