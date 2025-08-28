
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number | null;
  image_url: string | null;
  in_stock: boolean;
  stock_status: string;
  quantity: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  category: string;
  category_id?: string | null;
  created_at?: string;
}
