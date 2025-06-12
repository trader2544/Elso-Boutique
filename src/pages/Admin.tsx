
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Order, convertJsonToOrderProducts, OrderStatus } from "@/types/order";
import AdminDashboard from "@/components/AdminDashboard";
import AdminProducts from "@/components/AdminProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Admin = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        checkUserRole(user.id);
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      if (data.role !== "admin") {
        navigate("/");
        return;
      }
      
      setUserRole(data.role);
      await fetchOrders();
    } catch (error) {
      console.error("Error checking user role:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedOrders = (data || []).map(order => ({
        ...order,
        products: convertJsonToOrderProducts(order.products)
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-pink-500 to-purple-500">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-pink-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md border border-pink-200">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-lg border-pink-200">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="text-pink-700">Order Management</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-pink-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          {order.profiles && (
                            <div className="text-sm text-gray-600 mt-1 space-y-1">
                              <p className="text-pink-700">👤 Customer: {order.profiles.full_name}</p>
                              <p className="text-purple-700">📧 Email: {order.profiles.email}</p>
                              <p className="text-pink-700">📱 Phone: {order.customer_phone || order.profiles.phone}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-4 md:mt-0">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="text-sm border border-pink-200 rounded px-2 py-1 focus:border-pink-400"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 bg-pink-50 p-3 rounded-lg">
                        <h4 className="font-medium text-pink-700">📦 Order Items:</h4>
                        {order.products.map((product, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{product.name} x {product.quantity}</span>
                            <span className="text-pink-600 font-medium">KSh {(product.price * product.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-pink-200 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-700">Total:</span>
                          <span className="text-pink-600 text-lg">
                            KSh {order.total_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
