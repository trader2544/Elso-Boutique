
-- Create a trigger to update product rating and review count when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE operations
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.products 
    SET 
      rating = (
        SELECT COALESCE(AVG(rating::numeric), 0) 
        FROM public.reviews 
        WHERE product_id = NEW.product_id
      ),
      review_count = GREATEST(
        (SELECT COUNT(*) FROM public.reviews WHERE product_id = NEW.product_id),
        COALESCE((SELECT review_count FROM public.products WHERE id = NEW.product_id), 0)
      )
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE operations
  IF TG_OP = 'DELETE' THEN
    UPDATE public.products 
    SET 
      rating = (
        SELECT COALESCE(AVG(rating::numeric), 0) 
        FROM public.reviews 
        WHERE product_id = OLD.product_id
      ),
      review_count = GREATEST(
        (SELECT COUNT(*) FROM public.reviews WHERE product_id = OLD.product_id),
        COALESCE((SELECT review_count FROM public.products WHERE id = OLD.product_id), 0)
      )
    WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_product_rating ON public.reviews;
CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();
