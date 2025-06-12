
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Trash2, Package, DollarSign, Users, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Order } from "@/types/order";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  category: string;
  image_url: string | null;
  in_stock: boolean;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    previous_price: 0,
    category: "",
    image_url: "",
  });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    checkAdminAccess();
    fetchProducts();
    fetchOrders();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq("status", "paid")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedOrders = (data || []).map(order => ({
        ...order,
        products: Array.isArray(order.products) ? order.products : []
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from("products").select("*", { count: "exact" }),
        supabase.from("orders").select("total_price", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + order.total_price, 0) || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        totalUsers: usersRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setProductForm(prev => ({ ...prev, image_url: data.publicUrl }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update({
            ...productForm,
            previous_price: productForm.previous_price || null,
          })
          .eq("id", editingProduct);

        if (error) throw error;
        setEditingProduct(null);
      } else {
        const { error } = await supabase
          .from("products")
          .insert([{
            ...productForm,
            previous_price: productForm.previous_price || null,
          }]);

        if (error) throw error;
      }

      setProductForm({
        name: "",
        description: "",
        price: 0,
        previous_price: 0,
        category: "",
        image_url: "",
      });
      
      fetchProducts();
      fetchStats();
      toast({
        title: "Success",
        description: editingProduct ? "Product updated" : "Product created",
      });
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      previous_price: product.previous_price || 0,
      category: product.category,
      image_url: product.image_url || "",
    });
    setEditingProduct(product.id);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      
      fetchProducts();
      fetchStats();
      toast({
        title: "Success",
        description: "Product deleted",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      fetchOrders();
      toast({
        title: "Success",
        description: "Order status updated",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 md:mb-0 self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="text-xs md:text-sm">Products</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center space-x-2">
                    <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Products</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.totalProducts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Orders</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-pink-600" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Revenue</p>
                      <p className="text-sm md:text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-600">Users</p>
                      <p className="text-lg md:text-2xl font-bold">{stats.totalUsers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (KSh)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="previous_price">Previous Price (KSh)</Label>
                        <Input
                          id="previous_price"
                          type="number"
                          value={productForm.previous_price}
                          onChange={(e) => setProductForm({ ...productForm, previous_price: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image">Product Image</Label>
                      <div className="space-y-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                        {uploading && <p className="text-sm text-gray-600">Uploading...</p>}
                        {productForm.image_url && (
                          <div className="w-20 h-20 border rounded overflow-hidden">
                            <img 
                              src={productForm.image_url} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={uploading}>
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: "",
                              description: "",
                              price: 0,
                              previous_price: 0,
                              category: "",
                              image_url: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Products List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 md:max-h-[600px] overflow-y-auto">
                    {products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between space-y-2 md:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            <p className="text-pink-600 font-bold">KSh {product.price.toLocaleString()}</p>
                            <Badge variant="outline" className="text-xs">{product.category}</Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Paid Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                            <p className="font-semibold">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <Badge className="self-start md:self-center">
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm">
                              <strong>Customer:</strong> {order.profiles?.full_name || 'N/A'}
                            </p>
                            <p className="text-sm">
                              <strong>Email:</strong> {order.profiles?.email || 'N/A'}
                            </p>
                            <p className="text-sm">
                              <strong>Phone:</strong> {order.customer_phone || order.profiles?.phone || 'N/A'}
                            </p>
                            
                            <div className="text-sm">
                              <strong>Products:</strong>
                              <ul className="ml-4 mt-1">
                                {order.products.map((product: any, index: number) => (
                                  <li key={index}>
                                    {product.name} x {product.quantity} - KSh {(product.price * product.quantity).toLocaleString()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-lg text-pink-600">
                            KSh {order.total_price.toLocaleString()}
                          </p>
                          <div className="mt-2 space-y-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "shipped")}
                              disabled={order.status === "shipped" || order.status === "delivered"}
                              className="w-full text-xs"
                            >
                              Mark Shipped
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, "delivered")}
                              disabled={order.status === "delivered"}
                              className="w-full text-xs"
                            >
                              Mark Delivered
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No paid orders found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
