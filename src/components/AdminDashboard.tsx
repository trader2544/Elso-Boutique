
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import StockBatchManagement from "./StockBatchManagement";
import AdminAnalytics from "./AdminAnalytics";
import { Package, FolderOpen, BarChart3, Archive } from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-700 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your store efficiently</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white border border-pink-200">
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stock"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="pt-6">
                <AdminProducts />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="pt-6">
                <AdminCategories />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="pt-6">
                <StockBatchManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="pt-6">
                <AdminAnalytics />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
