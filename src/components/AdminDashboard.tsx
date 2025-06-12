
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, DollarSign, Package } from "lucide-react";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: []
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
        .select("total_price, created_at, status, id")
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

      setStats({
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
        recentOrders
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              KSh {stats.totalSales.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-700">Total Users</CardTitle>
            <Users className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="shadow-lg border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle className="text-pink-700">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-100">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-pink-600">
                      KSh {Number(order.total_price).toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
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
    </div>
  );
};

export default AdminDashboard;
