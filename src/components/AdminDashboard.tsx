
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, DollarSign, Package, TrendingUp } from "lucide-react";

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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total sales and orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("total_price, created_at, status, id, customer_phone")
        .order("created_at", { ascending: false });

      // Fetch total users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id");

      // Fetch total products
      const { data: productsData } = await supabase
        .from("products")
        .select("id");

      const totalSales = ordersData?.filter(order => order.status === 'paid')
        .reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      
      const totalOrders = ordersData?.length || 0;
      const totalUsers = usersData?.length || 0;
      const totalProducts = productsData?.length || 0;
      const recentOrders = ordersData?.slice(0, 5) || [];

      // Calculate sales by status
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const conversionRate = stats.totalOrders > 0 ? (stats.salesByStatus.paid / stats.totalOrders * 100).toFixed(1) : "0";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-pink-600">
              KSh {stats.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.salesByStatus.paid} paid orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.salesByStatus.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Customers</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-pink-600">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Orders to payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 shadow-lg border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="text-pink-700">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-pink-100 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Order #{order.id.slice(-8)}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        {order.customer_phone && (
                          <span>• {order.customer_phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right space-x-2 sm:space-x-0">
                      <p className="font-medium text-pink-600 text-sm">
                        KSh {Number(order.total_price).toLocaleString()}
                      </p>
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="shadow-lg border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="text-pink-700">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Paid</span>
                </div>
                <span className="font-medium">{stats.salesByStatus.paid}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm">Pending</span>
                </div>
                <span className="font-medium">{stats.salesByStatus.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
                <span className="font-medium">{stats.salesByStatus.cancelled}</span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Products</span>
                  <span className="font-bold text-pink-600">{stats.totalProducts}</span>
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
