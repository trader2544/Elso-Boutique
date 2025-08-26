
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, Package, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  topProducts: any[];
  monthlySales: any[];
  orderStatusData: any[];
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
    topProducts: [],
    monthlySales: [],
    orderStatusData: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch total revenue and orders
      const { data: orders } = await supabase
        .from("orders")
        .select("total_price, status, created_at");

      // Fetch total products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, quantity, price");

      // Fetch total users
      const { data: users } = await supabase
        .from("profiles")
        .select("id");

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      const totalUsers = users?.length || 0;

      // Recent orders (last 10)
      const recentOrders = orders
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10) || [];

      // Monthly sales data
      const monthlySales = getMonthlySalesData(orders || []);

      // Order status distribution
      const orderStatusData = getOrderStatusData(orders || []);

      // Top products by stock quantity
      const topProducts = products
        ?.sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(product => ({
          name: product.name,
          quantity: product.quantity,
          value: product.price * product.quantity
        })) || [];

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        topProducts,
        monthlySales,
        orderStatusData
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

  const getMonthlySalesData = (orders: any[]) => {
    const monthlyData: { [key: string]: number } = {};
    const last6Months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyData[monthKey] = 0;
      last6Months.push(monthKey);
    }

    // Aggregate orders by month
    orders.forEach(order => {
      const month = order.created_at.slice(0, 7);
      if (monthlyData.hasOwnProperty(month)) {
        monthlyData[month] += Number(order.total_price);
      }
    });

    return last6Months.map(month => ({
      month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      sales: monthlyData[month]
    }));
  };

  const getOrderStatusData = (orders: any[]) => {
    const statusCount: { [key: string]: number } = {};
    
    orders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  const exportAnalytics = async () => {
    try {
      const csvContent = [
        ["Metric", "Value"],
        ["Total Revenue", `KSh ${analytics.totalRevenue.toLocaleString()}`],
        ["Total Orders", analytics.totalOrders.toString()],
        ["Total Products", analytics.totalProducts.toString()],
        ["Total Users", analytics.totalUsers.toString()],
        [""],
        ["Top Products by Stock"],
        ["Product Name", "Quantity", "Value"],
        ...analytics.topProducts.map(product => [product.name, product.quantity, `KSh ${product.value.toLocaleString()}`]),
        [""],
        ["Monthly Sales"],
        ["Month", "Sales"],
        ...analytics.monthlySales.map(month => [month.month, `KSh ${month.sales.toLocaleString()}`])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Analytics report exported successfully",
      });
    } catch (error) {
      console.error("Error exporting analytics:", error);
      toast({
        title: "Error",
        description: "Failed to export analytics report",
        variant: "destructive",
      });
    }
  };

  const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">Analytics Dashboard</h2>
        <Button
          onClick={exportAnalytics}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto text-sm h-9"
        >
          <Download className="w-3 h-3 mr-1" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-pink-600">KSh {analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalProducts}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-green-600">{analytics.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`KSh ${Number(value).toLocaleString()}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#ec4899" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products by Stock */}
      <Card className="border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-700">Top Products by Stock Value</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`KSh ${Number(value).toLocaleString()}`, 'Stock Value']} />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
