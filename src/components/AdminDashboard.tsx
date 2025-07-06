
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Package, ShoppingCart, Users, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueByMonth: { month: string; revenue: number }[];
  ordersByStatus: { status: string; count: number; color: string }[];
  topCategories: { category: string; count: number }[];
  recentOrdersTrend: { date: string; orders: number }[];
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueByMonth: [],
    ordersByStatus: [],
    topCategories: [],
    recentOrdersTrend: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#ec4899"
    },
    orders: {
      label: "Orders",
      color: "#8b5cf6"
    },
    products: {
      label: "Products",
      color: "#06b6d4"
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch total revenue and orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("total_price, status, created_at");

      if (ordersError) throw ordersError;

      // Fetch total products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("category");

      if (productsError) throw productsError;

      // Fetch total customers
      const { data: customers, error: customersError } = await supabase
        .from("profiles")
        .select("id");

      if (customersError) throw customersError;

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      const totalCustomers = customers?.length || 0;

      // Revenue by month (last 6 months)
      const revenueByMonth = getRevenueByMonth(orders || []);

      // Orders by status
      const ordersByStatus = getOrdersByStatus(orders || []);

      // Top categories
      const topCategories = getTopCategories(products || []);

      // Recent orders trend (last 7 days)
      const recentOrdersTrend = getRecentOrdersTrend(orders || []);

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        revenueByMonth,
        ordersByStatus,
        topCategories,
        recentOrdersTrend
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRevenueByMonth = (orders: any[]) => {
    const monthlyRevenue: { [key: string]: number } = {};
    const months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      months.push({ key: monthKey, name: monthName });
      monthlyRevenue[monthKey] = 0;
    }

    orders.forEach(order => {
      if (order.created_at) {
        const monthKey = order.created_at.slice(0, 7);
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += Number(order.total_price);
        }
      }
    });

    return months.map(month => ({
      month: month.name,
      revenue: monthlyRevenue[month.key]
    }));
  };

  const getOrdersByStatus = (orders: any[]) => {
    const statusColors: { [key: string]: string } = {
      pending: "#f59e0b",
      paid: "#10b981",
      shipped: "#3b82f6",
      delivered: "#06b6d4",
      cancelled: "#ef4444"
    };

    const statusCounts: { [key: string]: number } = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: statusColors[status] || "#6b7280"
    }));
  };

  const getTopCategories = (products: any[]) => {
    const categoryCounts: { [key: string]: number } = {};
    products.forEach(product => {
      categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getRecentOrdersTrend = (orders: any[]) => {
    const dailyOrders: { [key: string]: number } = {};
    const days = [];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().slice(0, 10);
      const dayName = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      days.push({ key: dayKey, name: dayName });
      dailyOrders[dayKey] = 0;
    }

    orders.forEach(order => {
      if (order.created_at) {
        const dayKey = order.created_at.slice(0, 10);
        if (dailyOrders.hasOwnProperty(dayKey)) {
          dailyOrders[dayKey] += 1;
        }
      }
    });

    return days.map(day => ({
      date: day.name,
      orders: dailyOrders[day.key]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {analytics.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueByMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`KSh ${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({status, count}) => `${status}: ${count}`}
                  >
                    {analytics.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Product Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topCategories} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={80} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [value, "Products"]}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Orders Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Orders (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.recentOrdersTrend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [value, "Orders"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
