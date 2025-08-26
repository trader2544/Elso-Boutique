import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Save, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import AdminCategories from "./AdminCategories";
import StockBatchManagement from "./StockBatchManagement";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number;
  image_url: string;
  in_stock: boolean;
  stock_status: string;
  quantity: number;
  rating: number;
  review_count: number;
  category: string;
  category_id: string;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface StockBatch {
  id: string;
  batch_number: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
  };
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  previous_price: string;
  image_url: string;
  category_id: string;
  quantity: string;
  is_featured: boolean;
  batch_id: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    previous_price: "",
    image_url: "",
    category_id: "",
    quantity: "",
    is_featured: false,
    batch_id: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "batches">("products");
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
        .select(`
          *,
          categories (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const transformedProducts = data?.map(product => ({
        ...product,
        category: product.categories?.name || 'Uncategorized'
      })) || [];
      
      setProducts(transformedProducts);
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
        .select(`
          id,
          batch_number,
          product_id,
          quantity,
          products (name)
        `)
        .order("created_at", { ascending: false });

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
        .select(`
          name,
          quantity,
          stock_status,
          price,
          categories (name)
        `)
        .lte("quantity", 10)
        .order("quantity", { ascending: true });

      if (error) throw error;

      const csvContent = [
        ["Product Name", "Quantity", "Status", "Price", "Category"],
        ...data.map(product => [
          product.name,
          product.quantity,
          product.stock_status,
          product.price,
          product.categories?.name || 'Uncategorized'
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `low-stock-products-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Low stock products exported successfully",
      });
    } catch (error) {
      console.error("Error downloading low stock products:", error);
      toast({
        title: "Error",
        description: "Failed to export low stock products",
        variant: "destructive",
      });
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, create the product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          previous_price: newProduct.previous_price ? parseFloat(newProduct.previous_price) : null,
          image_url: newProduct.image_url,
          category_id: newProduct.category_id,
          quantity: parseInt(newProduct.quantity),
          is_featured: newProduct.is_featured,
          category: categories.find(c => c.id === newProduct.category_id)?.name || '',
          in_stock: parseInt(newProduct.quantity) > 0,
          stock_status: parseInt(newProduct.quantity) === 0 ? 'out_of_stock' : 
                      parseInt(newProduct.quantity) <= 5 ? 'few_units_left' : 'stocked'
        })
        .select()
        .single();

      if (productError) throw productError;

      // If a batch is selected, update the batch quantity
      if (newProduct.batch_id && productData) {
        const selectedBatch = stockBatches.find(b => b.id === newProduct.batch_id);
        if (selectedBatch) {
          const newBatchQuantity = selectedBatch.quantity - parseInt(newProduct.quantity);
          
          if (newBatchQuantity < 0) {
            throw new Error("Insufficient quantity in selected batch");
          }

          const { error: batchError } = await supabase
            .from("stock_batches")
            .update({ quantity: newBatchQuantity })
            .eq("id", newProduct.batch_id);

          if (batchError) throw batchError;
        }
      }

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      setNewProduct({
        name: "",
        description: "",
        price: "",
        previous_price: "",
        image_url: "",
        category_id: "",
        quantity: "",
        is_featured: false,
        batch_id: "",
      });
      setIsAddingProduct(false);
      await fetchProducts();
      await fetchStockBatches();
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          previous_price: editingProduct.previous_price,
          image_url: editingProduct.image_url,
          category_id: editingProduct.category_id,
          is_featured: editingProduct.is_featured,
          category: categories.find(c => c.id === editingProduct.category_id)?.name || editingProduct.category,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setEditingProduct(null);
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId: string) => {
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

  const availableBatches = stockBatches.filter(batch => 
    !newProduct.category_id || 
    categories.find(c => c.id === newProduct.category_id)?.name === batch.products?.name ||
    batch.quantity > 0
  );

  if (activeTab === "categories") {
    return <AdminCategories />;
  }

  if (activeTab === "batches") {
    return <StockBatchManagement />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-pink-200 pb-4">
        <Button
          variant={activeTab === "products" ? "default" : "outline"}
          onClick={() => setActiveTab("products")}
          className="text-sm h-9"
        >
          Products
        </Button>
        <Button
          variant={activeTab === "categories" ? "default" : "outline"}
          onClick={() => setActiveTab("categories")}
          className="text-sm h-9"
        >
          Categories
        </Button>
        <Button
          variant={activeTab === "batches" ? "default" : "outline"}
          onClick={() => setActiveTab("batches")}
          className="text-sm h-9"
        >
          Stock Batches
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">Product Management</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={downloadLowStockProducts}
            variant="outline"
            className="w-full sm:w-auto text-sm h-9"
          >
            <Download className="w-3 h-3 mr-1" />
            Low Stock Report
          </Button>
          <Button
            onClick={() => setIsAddingProduct(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto text-sm h-9"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Add Product Form */}
      {isAddingProduct && (
        <Card className="shadow-sm border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-pink-700 text-base">Add New Product</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingProduct(false)}
                className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <form onSubmit={addProduct} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-pink-700 text-sm">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                      className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-pink-700 text-sm">Category</Label>
                    <Select value={newProduct.category_id} onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}>
                      <SelectTrigger className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1">
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
                    <Label htmlFor="batch" className="text-pink-700 text-sm">Stock Batch (Optional)</Label>
                    <Select value={newProduct.batch_id} onValueChange={(value) => setNewProduct({ ...newProduct, batch_id: value })}>
                      <SelectTrigger className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1">
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBatches.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.batch_number} (Qty: {batch.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="price" className="text-pink-700 text-sm">Price (KSh)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                        className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="previous_price" className="text-pink-700 text-sm">Previous Price</Label>
                      <Input
                        id="previous_price"
                        type="number"
                        step="0.01"
                        value={newProduct.previous_price}
                        onChange={(e) => setNewProduct({ ...newProduct, previous_price: e.target.value })}
                        className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-pink-700 text-sm">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      required
                      className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="description" className="text-pink-700 text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={4}
                      className="border-pink-200 focus:border-pink-400 text-sm mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={newProduct.is_featured}
                      onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                      className="rounded border-pink-200 text-pink-600 focus:ring-pink-500"
                    />
                    <Label htmlFor="is_featured" className="text-pink-700 text-sm">Featured Product</Label>
                  </div>
                </div>
                
                <div>
                  <Label className="text-pink-700 text-sm">Product Image</Label>
                  <ImageUpload
                    onImageUploaded={(url) => setNewProduct({ ...newProduct, image_url: url })}
                    currentImage={newProduct.image_url}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex-1 sm:flex-none text-sm h-9"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingProduct(false)}
                  className="flex-1 sm:flex-none text-sm h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <Card className="shadow-sm border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
          <CardTitle className="text-pink-700 text-base">Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((product) => (
              <div key={product.id} className="border border-pink-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                {editingProduct?.id === product.id ? (
                  
                  <div className="space-y-2">
                    <ImageUpload
                      onImageUploaded={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                      currentImage={editingProduct.image_url}
                      className="mb-2"
                    />
                    <Input
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="text-xs h-8"
                      placeholder="Product name"
                    />
                    <Textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="text-xs"
                      rows={2}
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                        className="text-xs h-8"
                        placeholder="Price"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.previous_price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, previous_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="text-xs h-8"
                        placeholder="Previous price"
                      />
                    </div>
                    <Select 
                      value={editingProduct.category_id} 
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, category_id: value })}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.is_featured}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                        className="rounded"
                      />
                      <label className="text-xs">Featured</label>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={updateProduct}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex-1 text-xs h-8"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingProduct(null)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  
                  <div>
                    <div className="w-full h-32 mb-2 rounded-lg overflow-hidden bg-pink-50">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-pink-300 text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 text-xs line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-pink-600 font-bold text-sm">KSh {product.price.toLocaleString()}</span>
                        {product.previous_price && (
                          <span className="text-gray-400 line-through text-xs ml-1">
                            KSh {product.previous_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Featured</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      <p>Category: {product.category}</p>
                      <p>Stock: {product.quantity} ({product.stock_status})</p>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 text-xs h-7 py-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="px-2 h-7"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No products found. Add your first product to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
