import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, ShoppingCart, Settings } from "lucide-react";
import AdminProducts from "./AdminProducts";
import MpesaUrlRegistration from "./MpesaUrlRegistration";
// Import your Supabase client (adjust the import path as needed)
import { supabase } from "@/lib/supabaseClient";

const AdminDashboard = () => {
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);

  useEffect(() => {
    // Fetch counts from Supabase
    const fetchCounts = async () => {
      // Products count
      const { count: products, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (!productsError && typeof products === "number") {
        setProductsCount(products);
      }

      // Orders count
      const { count: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      if (!ordersError && typeof orders === "number") {
        setOrdersCount(orders);
      }

      // Customers count
      const { count: customers, error: customersError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });
      if (!customersError && typeof customers === "number") {
        setCustomersCount(customers);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span>Products</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{productsCount}</div>
            <p className="text-gray-500">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <span>Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{ordersCount}</div>
            <p className="text-gray-500">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Customers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{customersCount}</div>
            <p className="text-gray-500">Total Customers</p>
          </CardContent>
        </Card>
      </div>

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
        {/* Add Orders and Customers tab content as needed */}
        <TabsContent value="settings">
          <MpesaUrlRegistration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
