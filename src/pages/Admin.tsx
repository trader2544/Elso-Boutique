
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Order, convertJsonToOrderProducts, OrderStatus } from "@/types/order";
import AdminDashboard from "@/components/AdminDashboard";
import AdminProducts from "@/components/AdminProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Admin = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
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

  // Enhanced real-time subscription for all order updates
  useEffect(() => {
    if (userRole !== "admin") return;

    console.log("Setting up enhanced admin real-time subscription for all orders");
    const channel = supabase
      .channel('admin-order-updates-enhanced')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Admin real-time order update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newOrder = {
              ...payload.new,
              products: convertJsonToOrderProducts(payload.new.products)
            } as Order;
            
            setOrders(prevOrders => [newOrder, ...prevOrders]);
            
            toast({
              title: "New Order Received",
              description: `Order #${newOrder.id.slice(-8)} has been placed`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = {
              ...payload.new,
              products: convertJsonToOrderProducts(payload.new.products)
            } as Order;
            
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );

            // Show toast for automatic status updates (likely from M-Pesa)
            if (payload.old.status !== payload.new.status) {
              const statusChange = `${payload.old.status} → ${payload.new.status}`;
              toast({
                title: "Order Status Updated",
                description: `Order #${updatedOrder.id.slice(-8)}: ${statusChange}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up enhanced admin real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [userRole, toast]);

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

  // New function to manually sync M-Pesa transactions with orders
  const syncMpesaTransactions = async () => {
    setSyncing(true);
    try {
      const { error } = await supabase.rpc('manual_fix_order_statuses');
      
      if (error) throw error;
      
      // Refresh orders after sync
      await fetchOrders();
      
      toast({
        title: "Sync Complete",
        description: "M-Pesa transactions have been synced with orders",
      });
    } catch (error) {
      console.error("Error syncing M-Pesa transactions:", error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync M-Pesa transactions",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const currentOrder = orders.find(order => order.id === orderId);
    if (!currentOrder) return;

    const oldStatus = currentOrder.status;
    
    // Don't update if status is the same
    if (oldStatus === newStatus) return;

    setUpdatingStatus(orderId);
    
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Send status update email when admin manually changes status
      try {
        console.log("📧 Sending status update email for manual status change...");
        const { error: emailError } = await supabase.functions.invoke('send-order-status-email', {
          body: { 
            orderId,
            newStatus,
            oldStatus 
          },
        });
        
        if (emailError) {
          console.error("❌ Error sending status update email:", emailError);
          // Don't throw error - status update should still proceed even if email fails
        } else {
          console.log("✅ Status update email sent successfully");
        }
      } catch (emailError) {
        console.error("❌ Failed to send status update email:", emailError);
        // Don't throw error - status update should still proceed even if email fails
      }

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}. Customer has been notified via email.`,
      });

      await fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
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

  const toggleOrder = (orderId: string) => {
    const newOpenOrders = new Set(openOrders);
    if (newOpenOrders.has(orderId)) {
      newOpenOrders.delete(orderId);
    } else {
      newOpenOrders.add(orderId);
    }
    setOpenOrders(newOpenOrders);
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-pink-700">Order Management ({orders.length})</CardTitle>
                  
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-pink-200 rounded-xl bg-gradient-to-r from-white to-pink-50 shadow-sm">
                      {/* Mobile Collapsible View */}
                      <div className="block md:hidden">
                        <Collapsible open={openOrders.has(order.id)} onOpenChange={() => toggleOrder(order.id)}>
                          <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-pink-50 rounded-t-xl">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</p>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(order.status)}>
                                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                    {openOrders.has(order.id) ? (
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm font-medium text-pink-600">
                                    KSh {order.total_price.toLocaleString()}
                                  </p>
                                </div>
                                {/* Show basic customer info when collapsed */}
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600">
                                    Customer: {order.profiles?.full_name || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Items: {order.products.length}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-4">
                              {/* Customer Info */}
                              <div className="bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-700 mb-2 text-sm">👤 Customer Details</h4>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <span className="text-gray-600 font-medium">Name: </span>
                                    <span className="text-gray-900">{order.profiles?.full_name || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium">Email: </span>
                                    <span className="text-gray-900">{order.profiles?.email || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600 font-medium">Phone: </span>
                                    <span className="text-gray-900">{order.customer_phone || order.profiles?.phone || 'N/A'}</span>
                                  </div>
                                  {order.delivery_location && (
                                    <div>
                                      <span className="text-gray-600 font-medium">Address: </span>
                                      <span className="text-gray-900">{order.delivery_location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Products */}
                              <div className="bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-200">
                                <h4 className="font-medium text-purple-700 mb-2 text-sm">📦 Products ({order.products.length})</h4>
                                <div className="space-y-2">
                                  {order.products.map((product, index) => (
                                    <div key={index} className="flex justify-between items-center py-1 px-2 bg-white rounded border border-purple-100">
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-800">{product.name}</span>
                                        <div className="text-xs text-gray-500">
                                          Qty: {product.quantity} × KSh {product.price.toLocaleString()}
                                        </div>
                                      </div>
                                      <span className="text-purple-600 font-semibold text-sm">
                                        KSh {(product.price * product.quantity).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Status Update */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Update Status (sends email to customer):</label>
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  disabled={updatingStatus === order.id}
                                  className="w-full text-sm border border-pink-200 rounded-lg px-3 py-2 focus:border-pink-400 bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                {updatingStatus === order.id && (
                                  <div className="text-xs text-gray-500 flex items-center">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-pink-600 mr-2"></div>
                                    Updating status and sending email...
                                  </div>
                                )}
                              </div>

                              {order.transaction_id && (
                                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  Transaction ID: {order.transaction_id}
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block p-4">
                        <div className="flex flex-col space-y-4">
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg">Order #{order.id.slice(-8)}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Customer: {order.profiles?.full_name || 'N/A'} | Items: {order.products.length}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                disabled={updatingStatus === order.id}
                                className="text-sm border border-pink-200 rounded-lg px-2 py-1 focus:border-pink-400 w-full sm:w-auto bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              {updatingStatus === order.id && (
                                <div className="text-xs text-gray-500 flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-pink-600 mr-2"></div>
                                  Updating...
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl border border-blue-200">
                            <h4 className="font-medium text-blue-700 mb-3">👤 Customer Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-600 font-medium">Full Name: </span>
                                  <span className="text-gray-900">{order.profiles?.full_name || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600 font-medium">Email: </span>
                                  <span className="text-gray-900">{order.profiles?.email || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-gray-600 font-medium">Phone: </span>
                                  <span className="text-gray-900">{order.customer_phone || order.profiles?.phone || 'N/A'}</span>
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
