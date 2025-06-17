
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, ShoppingCart, Settings } from "lucide-react";
import AdminProducts from "./AdminProducts";
import MpesaUrlRegistration from "./MpesaUrlRegistration";

const AdminDashboard = () => {
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);

  // Placeholder data - replace with actual data fetching
  useEffect(() => {
    // Simulate fetching data
    const timeout = setTimeout(() => {
      setProductsCount(125);
      setOrdersCount(450);
      setCustomersCount(320);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
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
          
        </TabsList>

        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>

        

        <TabsContent value="settings">
          <MpesaUrlRegistration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
