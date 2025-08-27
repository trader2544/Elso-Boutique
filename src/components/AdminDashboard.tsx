
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-2 md:p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-pink-700 mb-1 md:mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 text-sm md:text-base">Manage your store efficiently</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 md:space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-pink-200 h-auto p-1">
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm"
            >
              <Package className="w-3 h-3 md:w-4 md:h-4" />
              <span>Products</span>
            </TabsTrigger>
            <TabsTrigger 
              value="categories"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm"
            >
              <FolderOpen className="w-3 h-3 md:w-4 md:h-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stock"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm"
            >
              <Archive className="w-3 h-3 md:w-4 md:h-4" />
              <span>Stock</span>
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 px-1 md:px-3 text-xs md:text-sm"
            >
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="p-2 md:p-6">
                <AdminProducts />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="p-2 md:p-6">
                <AdminCategories />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="p-2 md:p-6">
                <StockBatchManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-pink-200 shadow-sm">
              <CardContent className="p-2 md:p-6">
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
