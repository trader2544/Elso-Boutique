
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  expiringSoonBatches: number;
  categoryDistribution: { name: string; value: number }[];
  salesTrend: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  stockStatus: { status: string; count: number }[];
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportType, setExportType] = useState("csv");
  const { toast } = useToast();

  const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDateCalc = endDate || new Date().toISOString().split('T')[0];
      const startDateCalc = startDate || new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch products data
      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          categories (name)
        `);

      // Fetch users data
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .gte("created_at", startDateCalc)
        .lte("created_at", endDateCalc + 'T23:59:59');

      // Fetch orders data
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startDateCalc)
        .lte("created_at", endDateCalc + 'T23:59:59');

      // Fetch stock batches
      const { data: stockBatches } = await supabase
        .from("stock_batches")
        .select("*");

      // Process analytics
      const totalProducts = products?.length || 0;
      const totalUsers = users?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      const lowStockProducts = products?.filter(p => p.quantity <= 5).length || 0;
      
      const expiringSoonBatches = stockBatches?.filter(batch => {
        if (!batch.expiry_date) return false;
        const expiry = new Date(batch.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      }).length || 0;

      // Category distribution
      const categoryCount: { [key: string]: number } = {};
      products?.forEach(product => {
        const category = product.categories?.name || product.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      
      const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
        name,
        value
      }));

      // Stock status distribution
      const statusCount: { [key: string]: number } = {};
      products?.forEach(product => {
        statusCount[product.stock_status] = (statusCount[product.stock_status] || 0) + 1;
      });
      
      const stockStatus = Object.entries(statusCount).map(([status, count]) => ({
        status: status.replace('_', ' ').toUpperCase(),
        count
      }));

      // Sales trend (mock data for demonstration)
      const salesTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dayOrders = orders?.filter(order => 
          new Date(order.created_at).toDateString() === date.toDateString()
        ) || [];
        
        salesTrend.push({
          date: date.toISOString().split('T')[0],
          revenue: dayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
          orders: dayOrders.length
        });
      }

      // Top products (mock data)
      const topProducts = products?.slice(0, 5).map(product => ({
        name: product.name.substring(0, 20) + (product.name.length > 20 ? '...' : ''),
        sold: Math.floor(Math.random() * 100) + 1,
        revenue: Math.floor(Math.random() * 10000) + 1000
      })) || [];

      setAnalytics({
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        expiringSoonBatches,
        categoryDistribution,
        salesTrend,
        topProducts,
        stockStatus
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      if (!analytics) return;

      const exportData = {
        summary: {
          totalProducts: analytics.totalProducts,
          totalUsers: analytics.totalUsers,
          totalOrders: analytics.totalOrders,
          totalRevenue: analytics.totalRevenue,
          lowStockProducts: analytics.lowStockProducts,
          expiringSoonBatches: analytics.expiringSoonBatches
        },
        categoryDistribution: analytics.categoryDistribution,
        salesTrend: analytics.salesTrend,
        topProducts: analytics.topProducts,
        stockStatus: analytics.stockStatus,
        exportDate: new Date().toISOString(),
        dateRange: `${startDate || new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} to ${endDate || new Date().toISOString().split('T')[0]}`
      };

      if (exportType === "json") {
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${Date.now()}.json`;
        link.click();
      } else {
        // CSV export
        const csvData = [
          ['Metric', 'Value'],
          ['Total Products', analytics.totalProducts.toString()],
          ['Total Users', analytics.totalUsers.toString()],
          ['Total Orders', analytics.totalOrders.toString()],
          ['Total Revenue (KSh)', analytics.totalRevenue.toString()],
          ['Low Stock Products', analytics.lowStockProducts.toString()],
          ['Expiring Soon Batches', analytics.expiringSoonBatches.toString()],
          ['', ''],
          ['Category Distribution', ''],
          ...analytics.categoryDistribution.map(item => [item.name, item.value.toString()]),
          ['', ''],
          ['Sales Trend', ''],
          ['Date', 'Revenue', 'Orders'],
          ...analytics.salesTrend.map(item => [item.date, item.revenue.toString(), item.orders.toString()])
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${Date.now()}.csv`;
        link.click();
      }

      // Log export to database
      await supabase
        .from("analytics_exports")
        .insert({
          export_type: exportType,
          date_range_start: startDate || new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
          date_range_end: endDate || new Date().toISOString(),
        });

      toast({
        title: "Success",
        description: `Analytics exported as ${exportType.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error exporting analytics:", error);
      toast({
        title: "Error",
        description: "Failed to export analytics",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-pink-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-pink-700 text-lg">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-pink-700 text-sm">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-pink-700 text-sm">Custom Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-pink-700 text-sm">Custom End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-pink-700 text-sm">Export Format</Label>
              <div className="flex gap-2 mt-1">
                <Select value={exportType} onValueChange={setExportType}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-400 h-9 text-sm flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={exportAnalytics}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-9 px-3"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-pink-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-pink-700">{analytics.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-700">{analytics.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-700">{analytics.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">
                  KSh {analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Products</p>
                <p className="text-2xl font-bold text-orange-700">{analytics.lowStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon Batches</p>
                <p className="text-2xl font-bold text-red-700">{analytics.expiringSoonBatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700 text-lg">Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).getDate().toString()}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `KSh ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={2} />
                <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700 text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700 text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' ? `KSh ${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Units Sold'
                  ]}
                />
                <Bar dataKey="sold" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700 text-lg">Stock Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.stockStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
