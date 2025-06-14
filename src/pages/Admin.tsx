
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
      <div className="min-h-screen bg-gradient-to-br from-pink-25 via-white to-pink-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-25 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-pink-400 to-pink-300">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-25 via-white to-pink-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-pink-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-pink-50 to-white shadow-md border border-pink-200 h-auto">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-white data-[state=active]:text-pink-700 py-3 text-xs sm:text-sm"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-white data-[state=active]:text-pink-700 py-3 text-xs sm:text-sm"
            >
              Products
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-100 data-[state=active]:to-white data-[state=active]:text-pink-700 py-3 text-xs sm:text-sm"
            >
              Orders ({orders.length})
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
              <CardHeader className="bg-gradient-to-r from-pink-50 to-white">
                <CardTitle className="text-pink-700">Order Management ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-pink-200 rounded-xl p-4 bg-gradient-to-r from-white to-pink-50 shadow-sm">
                      <div className="flex flex-col space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="text-sm border border-pink-200 rounded-lg px-2 py-1 focus:border-pink-400 w-full sm:w-auto bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        {/* Customer Info */}
                        {order.profiles && (
                          <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-200">
                            <h4 className="font-medium text-blue-700 mb-3">👤 Customer Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-600 font-medium">Full Name: </span>
                                  <span className="text-gray-900">{order.profiles.full_name || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Email: </span>
                                  <span className="text-gray-900">{order.profiles.email}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-600 font-medium">Phone: </span>
                                  <span className="text-gray-900">{order.customer_phone || order.profiles.phone || 'N/A'}</span>
                                </div>
                                {order.delivery_location && (
                                  <div>
                                    <span className="text-gray-600 font-medium">Delivery Address: </span>
                                    <span className="text-gray-900">{order.delivery_location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Order Items */}
                        <div className="bg-gradient-to-r from-purple-50 to-white p-4 rounded-xl border border-purple-200">
                          <h4 className="font-medium text-purple-700 mb-3">📦 Order Items ({order.products.length})</h4>
                          <div className="space-y-3">
                            {order.products.map((product, index) => (
                              <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-purple-100">
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-800">{product.name}</span>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <span>Quantity: {product.quantity}</span>
                                    <span>•</span>
                                    <span>Unit Price: KSh {product.price.toLocaleString()}</span>
                                  </div>
                                </div>
                                <span className="text-purple-600 font-semibold">
                                  KSh {(product.price * product.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Total */}
                        <div className="border-t border-pink-200 pt-4">
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span className="text-gray-700">Total Amount:</span>
                            <span className="text-pink-600 text-xl">
                              KSh {order.total_price.toLocaleString()}
                            </span>
                          </div>
                          {order.transaction_id && (
                            <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                              Transaction ID: {order.transaction_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No orders found yet.</p>
                    </div>
                  )}
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
