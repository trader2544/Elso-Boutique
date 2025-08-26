
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number;
  image_url: string;
  in_stock: boolean;
  stock_status: string;
  quantity: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  category: string;
  category_id?: string;
  created_at?: string;
}
