-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_featured_products();
DROP FUNCTION IF EXISTS public.get_products_by_category(text);

-- Recreate get_featured_products function with images and color_labels
CREATE OR REPLACE FUNCTION public.get_featured_products()
 RETURNS TABLE(id uuid, name text, description text, price numeric, previous_price numeric, image_url text, in_stock boolean, stock_status text, quantity integer, rating numeric, review_count integer, category text, images text[], color_labels text[])
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    p.id, p.name, p.description, p.price, p.previous_price,
    p.image_url, p.in_stock, p.stock_status, p.quantity,
    p.rating, p.review_count, p.category, p.images, p.color_labels
  FROM public.products p
  WHERE p.is_featured = true
  ORDER BY p.created_at DESC;
$function$;

-- Recreate get_products_by_category function with images and color_labels  
CREATE OR REPLACE FUNCTION public.get_products_by_category(category_name text)
 RETURNS TABLE(id uuid, name text, description text, price numeric, previous_price numeric, image_url text, in_stock boolean, stock_status text, quantity integer, rating numeric, review_count integer, is_featured boolean, category text, images text[], color_labels text[])
 LANGUAGE sql
 STABLE
AS $function$
  SELECT 
    p.id, p.name, p.description, p.price, p.previous_price,
    p.image_url, p.in_stock, p.stock_status, p.quantity,
    p.rating, p.review_count, p.is_featured, p.category,
    p.images, p.color_labels
  FROM public.products p
  JOIN public.categories c ON p.category_id = c.id
  WHERE c.name = category_name
  ORDER BY p.created_at DESC;
$function$;