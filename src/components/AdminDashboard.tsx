
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, ShoppingCart, Settings, TrendingUp, DollarSign, Calendar, BarChart3, PieChart, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminProducts from "./AdminProducts";
import MpesaUrlRegistration from "./MpesaUrlRegistration";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  recentOrders: any[];
  topProducts: any[];
  ordersByStatus: any[];
  monthlyRevenue: any[];
}

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0,
    recentOrders: [],
    topProducts: [],
    ordersByStatus: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch total revenue and orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price, status, created_at, id');

      // Fetch customers count
      const { data: customers } = await supabase
        .from('profiles')
        .select('id, created_at');

      // Fetch products count
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price');

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalCustomers = customers?.length || 0;
      const totalProducts = products?.length || 0;

      // Calculate growth rates (comparing last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentOrders = orders?.filter(order => new Date(order.created_at) > thirtyDaysAgo) || [];
      const previousOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate <= thirtyDaysAgo && orderDate > sixtyDaysAgo;
      }) || [];

      const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);

      const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const orderGrowth = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

      // Orders by status
      const ordersByStatus = [
        { status: 'pending', count: orders?.filter(o => o.status === 'pending').length || 0 },
        { status: 'paid', count: orders?.filter(o => o.status === 'paid').length || 0 },
        { status: 'shipped', count: orders?.filter(o => o.status === 'shipped').length || 0 },
        { status: 'delivered', count: orders?.filter(o => o.status === 'delivered').length || 0 },
        { status: 'cancelled', count: orders?.filter(o => o.status === 'cancelled').length || 0 }
      ];

      // Monthly revenue for the last 6 months
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= monthStart && orderDate <= monthEnd;
        }) || [];
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);
        
        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          orders: monthOrders.length
        });
      }

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        orderGrowth,
        customerGrowth: 0, // Would need more data to calculate properly
        recentOrders: recentOrders.slice(0, 5),
        topProducts: products?.slice(0, 5) || [],
        ordersByStatus,
        monthlyRevenue
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "paid": return "text-blue-600 bg-blue-100";
      case "shipped": return "text-purple-600 bg-purple-100";
      case "delivered": return "text-green-600 bg-green-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.revenueGrowth > 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{analytics.totalOrders}</div>
            <p className="text-xs text-blue-600 flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              {analytics.orderGrowth > 0 ? '+' : ''}{analytics.orderGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{analytics.totalCustomers}</div>
            <p className="text-xs text-purple-600">Registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Products</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{analytics.totalProducts}</div>
            <p className="text-xs text-orange-600">In catalog</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-pink-700">
              <BarChart3 className="h-5 w-5 mr-2" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.monthlyRevenue.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{month.month}</span>
                      <span className="text-pink-600 font-semibold">{formatCurrency(month.revenue)}</span>
                    </div>
                    <div className="mt-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${analytics.monthlyRevenue.length > 0 ? (month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{month.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-pink-700">
              <PieChart className="h-5 w-5 mr-2" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.ordersByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                    </div>
                    <span className="text-sm font-medium">{status.count}</span>
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${analytics.totalOrders > 0 ? (status.count / analytics.totalOrders) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {analytics.totalOrders > 0 ? ((status.count / analytics.totalOrders) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-pink-700">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Orders (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentOrders.length > 0 ? analytics.recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                  <div>
                    <p className="font-medium text-sm">Order #{order.id.slice(-8)}</p>
                    <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-pink-600">{formatCurrency(order.total_price)}</p>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-pink-700">
              <Settings className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
              >
                <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Refresh Data</p>
              </button>
              
              <button 
                onClick={() => supabase.rpc('manual_fix_order_statuses')}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
              >
                <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-700">Sync Orders</p>
              </button>
              
              <button 
                onClick={() => window.open('https://wa.me/254773482210', '_blank')}
                className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-violet-100 transition-all duration-200"
              >
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-700">Customer Support</p>
              </button>
              
              <button 
                onClick={() => {/* Add export functionality */}}
                className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg hover:from-orange-100 hover:to-amber-100 transition-all duration-200"
              >
                <Package className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-700">Export Data</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
