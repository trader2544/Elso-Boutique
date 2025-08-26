
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Package, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import { Product } from "@/types/product";

interface Category {
  id: string;
  name: string;
}

interface StockBatch {
  id: string;
  batch_number: string;
  received_date: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [activeView, setActiveView] = useState<"products" | "add" | "edit">("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    previous_price: "",
    category_id: "",
    quantity: "",
    is_featured: false,
    image_url: "",
    batch_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStockBatches();
  }, []);

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

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStockBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_batches")
        .select("id, batch_number, received_date")
        .order("received_date", { ascending: false });

      if (error) throw error;
      setStockBatches(data || []);
    } catch (error) {
      console.error("Error fetching stock batches:", error);
    }
  };

  const downloadLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lte("quantity", 5)
        .order("quantity", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const csvContent = [
          ["Name", "Category", "Quantity", "Price", "Stock Status"].join(","),
          ...data.map(product => [
            product.name,
            product.category,
            product.quantity,
            product.price,
            product.stock_status
          ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "low-stock-products.csv";
        link.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Low stock products downloaded successfully",
        });
      } else {
        toast({
          title: "No Data",
          description: "No low stock products found",
        });
      }
    } catch (error) {
      console.error("Error downloading low stock products:", error);
      toast({
        title: "Error",
        description: "Failed to download low stock products",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        previous_price: formData.previous_price ? parseFloat(formData.previous_price) : null,
        category_id: formData.category_id,
        category: categories.find(c => c.id === formData.category_id)?.name || "",
        quantity: parseInt(formData.quantity),
        is_featured: formData.is_featured,
        image_url: formData.image_url,
        in_stock: parseInt(formData.quantity) > 0,
        stock_status: parseInt(formData.quantity) === 0 ? 'out_of_stock' : 
                    parseInt(formData.quantity) <= 5 ? 'few_units_left' : 'stocked',
      };

      let error;
      if (editingProduct) {
        ({ error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id));
      } else {
        ({ error } = await supabase
          .from("products")
          .insert(productData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      setActiveView("products");
      await fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      previous_price: "",
      category_id: "",
      quantity: "",
      is_featured: false,
      image_url: "",
      batch_id: "",
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      previous_price: product.previous_price?.toString() || "",
      category_id: product.category_id || "",
      quantity: product.quantity.toString(),
      is_featured: product.is_featured,
      image_url: product.image_url || "",
      batch_id: "",
    });
    setActiveView("edit");
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  if (activeView === "add" || activeView === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-pink-700">
            {activeView === "edit" ? "Edit Product" : "Add New Product"}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              setActiveView("products");
            }}
          >
            Back to Products
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="previous_price">Previous Price (KSh)</Label>
                  <Input
                    id="previous_price"
                    type="number"
                    step="0.01"
                    value={formData.previous_price}
                    onChange={(e) => setFormData({ ...formData, previous_price: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="batch">Stock Batch (Optional)</Label>
                  <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_number} - {new Date(batch.received_date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Product Image</Label>
                <ImageUpload onImageUpload={handleImageUpload} currentImage={formData.image_url} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="featured">Featured Product</Label>
              </div>

              <Button type="submit" className="w-full">
                {activeView === "edit" ? "Update Product" : "Add Product"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-pink-700">Products Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={downloadLowStockProducts}
            variant="outline"
            className="text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Low Stock Report
          </Button>
          <Button
            onClick={() => setActiveView("add")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  <p className="text-lg font-bold text-pink-600">
                    KSh {product.price.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    Stock: {product.quantity} ({product.stock_status.replace('_', ' ')})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No products found. Add your first product to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
