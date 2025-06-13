
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  products: OrderProduct[];
  total_price: number;
  status: OrderStatus;
  customer_phone: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  delivery_location: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string;
    phone: string | null;
  };
}

export function convertJsonToOrderProducts(jsonData: any): OrderProduct[] {
  if (!jsonData) return [];
  if (Array.isArray(jsonData)) {
    return jsonData.map(item => ({
      id: item.id || '',
      name: item.name || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));
  }
  return [];
}
