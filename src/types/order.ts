
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
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  products: OrderProduct[];
  customer_phone?: string | null;
  user_id?: string | null;
  payment_method?: string | null;
  transaction_id?: string | null;
  profiles?: {
    full_name: string;
    email: string;
    phone: string;
  } | null;
}

// Helper function to convert Json to OrderProduct
export const convertJsonToOrderProducts = (products: Json | Json[]): OrderProduct[] => {
  if (!products) return [];
  
  const productsArray = Array.isArray(products) ? products : [products];
  
  return productsArray.map((product: any) => ({
    id: product?.id || '',
    name: product?.name || '',
    price: Number(product?.price) || 0,
    quantity: Number(product?.quantity) || 1,
  }));
};
