
-- Update existing products with generic positive ratings and review counts
-- This will only update products that currently have rating = 0 or NULL and review_count = 0 or NULL
-- to preserve any existing rating data

UPDATE public.products 
SET 
  rating = CASE 
    WHEN rating IS NULL OR rating = 0 THEN 
      -- Generate random rating between 4.0 and 5.0 (positive ratings only)
      ROUND((4.0 + (RANDOM() * 1.0))::numeric, 1)
    ELSE rating 
  END,
  review_count = CASE 
    WHEN review_count IS NULL OR review_count = 0 THEN 
      -- Generate random review count between 15 and 150
      FLOOR(15 + (RANDOM() * 135))::integer
    ELSE review_count 
  END
WHERE 
  -- Only update products that don't already have positive ratings/reviews
  (rating IS NULL OR rating = 0) AND 
  (review_count IS NULL OR review_count = 0);
