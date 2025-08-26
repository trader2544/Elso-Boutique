
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        productsResult,
        ordersResult,
        usersResult,
        lowStockResult,
        pendingOrdersResult,
        completedOrdersResult,
        revenueResult,
        ratingsResult,
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }),
        supabase.from("orders").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("products").select("*", { count: "exact" }).lt("quantity", 10),
        supabase.from("orders").select("*", { count: "exact" }).eq("status", "pending"),
        supabase.from("orders").select("*", { count: "exact" }).in("status", ["delivered", "paid"]),
        supabase.from("orders").select("total_price").in("status", ["delivered", "paid"]),
        supabase.from("products").select("rating").gt("rating", 0),
      ]);

      // Calculate total revenue
      const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

      // Calculate average rating
      const ratings = ratingsResult.data?.map(p => p.rating).filter(r => r > 0) || [];
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalRevenue,
        lowStockProducts: lowStockResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
        completedOrders: completedOrdersResult.count || 0,
        averageRating,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-24 md:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500",
      textColor: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: `KSh ${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockProducts,
      icon: AlertCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      badge: stats.lowStockProducts > 0 ? "warning" : null,
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      badge: stats.pendingOrders > 0 ? "attention" : null,
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <div className="p-2 md:p-8 space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-3xl font-bold">Dashboard Overview</h2>
        <Badge variant="secondary" className="text-xs md:text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className="relative">
                  <IconComponent className={`w-4 h-4 md:w-5 md:h-5 ${card.textColor}`} />
                  {card.badge && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-lg md:text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              Urgent Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-2">
            {stats.lowStockProducts > 0 && (
              <div className="text-xs md:text-sm text-red-600">
                • {stats.lowStockProducts} products low in stock
              </div>
            )}
            {stats.pendingOrders > 0 && (
              <div className="text-xs md:text-sm text-yellow-600">
                • {stats.pendingOrders} orders pending processing
              </div>
            )}
            {stats.lowStockProducts === 0 && stats.pendingOrders === 0 && (
              <div className="text-xs md:text-sm text-green-600">
                • All systems operating normally
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-2">
            <div className="text-xs md:text-sm">
              • Revenue: KSh {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs md:text-sm">
              • Completion Rate: {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
            </div>
            <div className="text-xs md:text-sm">
              • Avg. Rating: {stats.averageRating.toFixed(1)}/5
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-sm md:text-base flex items-center gap-2">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-2">
            <div className="text-xs md:text-sm">
              • Total Products: {stats.totalProducts}
            </div>
            <div className="text-xs md:text-sm">
              • Low Stock: {stats.lowStockProducts}
            </div>
            <div className="text-xs md:text-sm">
              • Stock Health: {stats.totalProducts > 0 ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
