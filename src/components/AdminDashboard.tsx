
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  DollarSign,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  featuredProducts: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockProducts: 0,
    featuredProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_price, status");

      if (ordersError) throw ordersError;

      // Fetch products data
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("quantity, is_featured");

      if (productsError) throw productsError;

      // Fetch users data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id");

      if (profilesError) throw profilesError;

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
      const totalProducts = products?.length || 0;
      const totalUsers = profiles?.length || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
      const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
      const lowStockProducts = products?.filter(product => product.quantity < 10).length || 0;
      const featuredProducts = products?.filter(product => product.is_featured).length || 0;

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
        pendingOrders,
        completedOrders,
        lowStockProducts,
        featuredProducts,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard Overview</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3 md:p-6">
                <div className="h-12 md:h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Revenue",
      value: `KSh ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Low Stock",
      value: stats.lowStockProducts,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Featured",
      value: stats.featuredProducts,
      icon: Eye,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard Overview</h1>
        <Badge variant="secondary" className="text-xs">
          Real-time data
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-1 md:p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`w-3 h-3 md:w-4 md:h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-2 md:pb-4">
                <div className="text-lg md:text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
              <span className="text-xs md:text-sm text-gray-600">Order Completion Rate</span>
              <Badge variant="secondary" className="text-xs">
                {stats.totalOrders > 0 
                  ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`
                  : '0%'
                }
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
              <span className="text-xs md:text-sm text-gray-600">Products Needing Attention</span>
              <Badge variant={stats.lowStockProducts > 0 ? "destructive" : "secondary"} className="text-xs">
                {stats.lowStockProducts}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
