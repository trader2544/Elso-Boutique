
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, ShoppingCart, Settings, AlertTriangle, TrendingUp } from "lucide-react";
import AdminProducts from "./AdminProducts";
import MpesaUrlRegistration from "./MpesaUrlRegistration";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [
        productsResult,
        ordersResult,
        customersResult,
        lowStockResult,
        revenueResult,
        pendingOrdersResult
      ] = await Promise.all([
        // Total products
        supabase
          .from("products")
          .select("*", { count: "exact", head: true }),
        
        // Total orders
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true }),
        
        // Total customers
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true }),
        
        // Low stock products (quantity <= 5)
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .lte("quantity", 5)
          .gt("quantity", 0),
        
        // Total revenue from paid orders
        supabase
          .from("orders")
          .select("total_price")
          .eq("status", "paid"),
        
        // Pending orders
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending")
      ]);

      // Calculate total revenue
      const revenue = revenueResult.data?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalCustomers: customersResult.count || 0,
        lowStockProducts: lowStockResult.count || 0,
        totalRevenue: revenue,
        pendingOrders: pendingOrdersResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <Package className="w-5 h-5" />
              <span>Total Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.totalProducts}</div>
            <p className="text-blue-600 text-sm">Active products in catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <ShoppingCart className="w-5 h-5" />
              <span>Total Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats.totalOrders}</div>
            <p className="text-green-600 text-sm">All time orders placed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Users className="w-5 h-5" />
              <span>Total Customers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats.totalCustomers}</div>
            <p className="text-purple-600 text-sm">Registered customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.lowStockProducts}</div>
            <p className="text-orange-600 text-sm">Products with ≤5 units</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-pink-700">
              <TrendingUp className="w-5 h-5" />
              <span>Total Revenue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-pink-900">
              KSh {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-pink-600 text-sm">From completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-yellow-700">
              <ShoppingCart className="w-5 h-5" />
              <span>Pending Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{stats.pendingOrders}</div>
            <p className="text-yellow-600 text-sm">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Order management functionality is available in the Orders tab of the main admin panel.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Customer management features coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <MpesaUrlRegistration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
