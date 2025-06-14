import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, Search } from "lucide-react";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: any[];
  salesByStatus: {
    paid: number;
    pending: number;
    cancelled: number;
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    salesByStatus: { paid: 0, pending: 0, cancelled: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          total_price, 
          created_at, 
          status, 
          id, 
          customer_phone,
          delivery_location,
          products,
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      const { data: usersData } = await supabase
        .from("profiles")
        .select("id");

      const { data: productsData } = await supabase
        .from("products")
        .select("id");

      const totalSales = ordersData?.filter(order => order.status === 'paid')
        .reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      
      const totalOrders = ordersData?.length || 0;
      const totalUsers = usersData?.length || 0;
      const totalProducts = productsData?.length || 0;
      const recentOrders = ordersData?.slice(0, 5) || [];

      const salesByStatus = {
        paid: ordersData?.filter(o => o.status === 'paid').length || 0,
        pending: ordersData?.filter(o => o.status === 'pending').length || 0,
        cancelled: ordersData?.filter(o => o.status === 'cancelled').length || 0,
      };

      setStats({
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
        recentOrders,
        salesByStatus
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchOrderById = async () => {
    if (!searchOrderId.trim()) return;
    
    setSearching(true);
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq("id", searchOrderId.trim())
        .single();

      if (error) {
        console.error("Order not found:", error);
        setSearchedOrder(null);
        return;
      }

      setSearchedOrder(orderData);
    } catch (error) {
      console.error("Error searching for order:", error);
      setSearchedOrder(null);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchOrderId("");
    setSearchedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const conversionRate = stats.totalOrders > 0 ? (stats.salesByStatus.paid / stats.totalOrders * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-pink-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-pink-700">Total Sales</CardTitle>
            <DollarSign className="h-3 w-3 text-pink-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold text-pink-600">
              KSh {stats.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.salesByStatus.paid} paid orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-purple-700">Total Orders</CardTitle>
            <ShoppingBag className="h-3 w-3 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.salesByStatus.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-pink-700">Customers</CardTitle>
            <Users className="h-3 w-3 text-pink-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold text-pink-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-green-700">Conversion Rate</CardTitle>
            <TrendingUp className="h-3 w-3 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-xl font-bold text-green-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Orders to payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Search */}
      <Card className="shadow-sm border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-white pb-3">
          <CardTitle className="text-pink-700 text-base">Search Order by ID</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Enter order ID..."
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              className="flex-1 h-9 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && searchOrderById()}
            />
            <button
              onClick={searchOrderById}
              disabled={searching || !searchOrderId.trim()}
              className="px-3 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-300 flex items-center gap-1 text-sm h-9"
            >
              {searching ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <Search className="h-3 w-3" />
              )}
              Search
            </button>
            {searchedOrder && (
              <button
                onClick={clearSearch}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm h-9"
              >
                Clear
              </button>
            )}
          </div>

          {searchedOrder && (
            <div className="bg-white rounded-lg border border-pink-200 p-3 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Order #{searchedOrder.id.slice(-8)}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(searchedOrder.created_at).toLocaleDateString()}</span>
                    <span>• KSh {Number(searchedOrder.total_price).toLocaleString()}</span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      searchedOrder.status === 'paid' ? 'bg-green-100 text-green-800' :
                      searchedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      searchedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      searchedOrder.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {searchedOrder.status.charAt(0).toUpperCase() + searchedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              {searchedOrder.profiles && (
                <div className="bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-medium text-blue-700 mb-2">👤 Customer Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600 font-medium">Name: </span>
                      <span className="text-gray-900">{searchedOrder.profiles.full_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Email: </span>
                      <span className="text-gray-900">{searchedOrder.profiles.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Phone: </span>
                      <span className="text-gray-900">{searchedOrder.customer_phone || searchedOrder.profiles.phone || 'N/A'}</span>
                    </div>
                    {searchedOrder.delivery_location && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-600 font-medium">Delivery Address: </span>
                        <span className="text-gray-900">{searchedOrder.delivery_location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Products List */}
              {searchedOrder.products && Array.isArray(searchedOrder.products) && (
                <div className="bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-100">
                  <h5 className="text-xs font-medium text-purple-700 mb-2">📦 Products ({searchedOrder.products.length})</h5>
                  <div className="space-y-1">
                    {searchedOrder.products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                        <span className="text-gray-700 flex-1 truncate mr-2">
                          {product.name} 
                          <span className="text-purple-600 ml-1">×{product.quantity}</span>
                        </span>
                        <span className="text-purple-600 font-medium shrink-0">
                          KSh {(product.price * product.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {searchOrderId && !searchedOrder && !searching && (
            <div className="text-center py-3">
              <p className="text-gray-500 text-sm">No order found with that ID</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 shadow-sm border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-white pb-3">
            <CardTitle className="text-pink-700 text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-3 text-sm">No orders yet</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg border border-pink-100 p-3 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-xs">Order #{order.id.slice(-8)}</p>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          <span>• KSh {Number(order.total_price).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    {/* Customer Details */}
                    {order.profiles && (
                      <div className="bg-gradient-to-r from-blue-50 to-white p-2 rounded-lg border border-blue-100">
                        <h5 className="text-xs font-medium text-blue-700 mb-1">👤 Customer Details</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                          <div>
                            <span className="text-gray-600">Name: </span>
                            <span className="text-gray-900">{order.profiles.full_name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Email: </span>
                            <span className="text-gray-900 truncate">{order.profiles.email}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-gray-600">Phone: </span>
                            <span className="text-gray-900">{order.customer_phone || order.profiles.phone || 'N/A'}</span>
                          </div>
                          {order.delivery_location && (
                            <div className="sm:col-span-2">
                              <span className="text-gray-600">Address: </span>
                              <span className="text-gray-900">{order.delivery_location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Products List */}
                    {order.products && Array.isArray(order.products) && (
                      <div className="bg-gradient-to-r from-purple-50 to-white p-2 rounded-lg border border-purple-100">
                        <h5 className="text-xs font-medium text-purple-700 mb-1">📦 Products ({order.products.length})</h5>
                        <div className="space-y-1">
                          {order.products.slice(0, 3).map((product: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 flex-1 truncate mr-2">
                                {product.name} 
                                <span className="text-purple-600 ml-1">×{product.quantity}</span>
                              </span>
                              <span className="text-purple-600 font-medium shrink-0">
                                KSh {(product.price * product.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          {order.products.length > 3 && (
                            <p className="text-xs text-gray-500 italic">+{order.products.length - 3} more items...</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="shadow-sm border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-white pb-3">
            <CardTitle className="text-pink-700 text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Paid</span>
                </div>
                <span className="font-medium text-sm">{stats.salesByStatus.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium text-sm">{stats.salesByStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
                <span className="font-medium text-sm">{stats.salesByStatus.cancelled}</span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Products</span>
                  <span className="font-bold text-pink-600 text-sm">{stats.totalProducts}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
