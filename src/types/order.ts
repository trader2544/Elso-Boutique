
import { Json } from "@/integrations/supabase/types";

export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  products: OrderProduct[];
  customer_phone?: string;
  user_id?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
}
