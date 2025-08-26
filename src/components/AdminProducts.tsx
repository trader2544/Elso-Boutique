
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ImageUpload";
import { Product } from "@/types/product";

interface StockBatch {
  id: string;
  batch_number: string;
  quantity: number;
  product_id: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockBatches, setStockBatches] = useState<StockBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    previous_price: "",
    image_url: "",
    category: "",
    category_id: "",
    quantity: "",
    batch_id: "",
    is_featured: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStockBatches();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
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
        .select("*")
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
        .select("name, quantity, category, price, stock_status")
        .lt("quantity", 10)
        .order("quantity", { ascending: true });

      if (error) throw error;

      const csvContent = [
        "Product Name,Quantity,Category,Price,Stock Status",
        ...data.map(product => 
          `"${product.name}",${product.quantity},"${product.category}",${product.price},"${product.stock_status}"`
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `low-stock-products-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Low stock products data downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading low stock data:", error);
      toast({
        title: "Error",
        description: "Failed to download low stock data",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const selectedCategory = categories.find(cat => cat.id === newProduct.category_id);
      
      const { error } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          previous_price: newProduct.previous_price ? parseFloat(newProduct.previous_price) : null,
          image_url: newProduct.image_url,
          category: selectedCategory?.name || "",
          category_id: newProduct.category_id,
          quantity: parseInt(newProduct.quantity),
          is_featured: newProduct.is_featured,
          in_stock: parseInt(newProduct.quantity) > 0,
          stock_status: parseInt(newProduct.quantity) === 0 ? "out_of_stock" : 
                      parseInt(newProduct.quantity) <= 5 ? "few_units_left" : "stocked"
        });

      if (error) throw error;

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
        category: "",
        category_id: "",
        quantity: "",
        batch_id: "",
        is_featured: false
      });
      setIsAddDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setLoading(true);
    try {
      const selectedCategory = categories.find(cat => cat.id === editingProduct.category_id);
      
      const { error } = await supabase
        .from("products")
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          previous_price: editingProduct.previous_price,
          image_url: editingProduct.image_url,
          category: selectedCategory?.name || "",
          category_id: editingProduct.category_id,
          quantity: editingProduct.quantity,
          is_featured: editingProduct.is_featured,
          in_stock: editingProduct.quantity > 0,
          stock_status: editingProduct.quantity === 0 ? "out_of_stock" : 
                      editingProduct.quantity <= 5 ? "few_units_left" : "stocked"
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setEditingProduct(null);
      setIsEditDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setLoading(true);
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

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "out_of_stock": return "destructive";
      case "few_units_left": return "secondary";
      default: return "default";
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8">Loading...</div>;
  }

  return (
    <div className="p-2 md:p-8 space-y-4 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-3xl font-bold">Product Management</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={downloadLowStockProducts} variant="outline" size="sm" className="text-xs md:text-sm">
            <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Download Low Stock
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs md:text-sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg md:text-xl">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 md:gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs md:text-sm">Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="text-xs md:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs md:text-sm">Category</Label>
                    <Select
                      value={newProduct.category_id}
                      onValueChange={(value) => {
                        const category = categories.find(cat => cat.id === value);
                        setNewProduct({ 
                          ...newProduct, 
                          category_id: value,
                          category: category?.name || ""
                        });
                      }}
                    >
                      <SelectTrigger className="text-xs md:text-sm">
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="text-xs md:text-sm"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs md:text-sm">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="text-xs md:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_price" className="text-xs md:text-sm">Previous Price</Label>
                    <Input
                      id="previous_price"
                      type="number"
                      value={newProduct.previous_price}
                      onChange={(e) => setNewProduct({ ...newProduct, previous_price: e.target.value })}
                      className="text-xs md:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-xs md:text-sm">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                      className="text-xs md:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch" className="text-xs md:text-sm">Stock Batch (Optional)</Label>
                  <Select
                    value={newProduct.batch_id}
                    onValueChange={(value) => setNewProduct({ ...newProduct, batch_id: value })}
                  >
                    <SelectTrigger className="text-xs md:text-sm">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_number} (Qty: {batch.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs md:text-sm">Product Image</Label>
                  <ImageUpload
                    onImageUploaded={(url) => setNewProduct({ ...newProduct, image_url: url })}
                    currentImage={newProduct.image_url}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={newProduct.is_featured}
                    onChange={(e) => setNewProduct({ ...newProduct, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_featured" className="text-xs md:text-sm">Featured Product</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} size="sm" className="text-xs md:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} disabled={loading} size="sm" className="text-xs md:text-sm">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 md:p-6">
              <div className="aspect-square overflow-hidden rounded-lg mb-2 md:mb-4">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="text-sm md:text-lg line-clamp-2">{product.name}</CardTitle>
              <div className="flex flex-wrap gap-1 md:gap-2">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
                <Badge variant={getStockStatusColor(product.stock_status)} className="text-xs">
                  {product.stock_status.replace('_', ' ')}
                </Badge>
                {product.is_featured && (
                  <Badge variant="default" className="text-xs">
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <p className="font-semibold">KSh {product.price}</p>
                {product.previous_price && (
                  <p className="text-gray-500 line-through">KSh {product.previous_price}</p>
                )}
                <p>Quantity: {product.quantity}</p>
                <p className="text-gray-600 line-clamp-2">{product.description}</p>
              </div>
              <div className="flex gap-2 mt-3 md:mt-4">
                <Dialog open={isEditDialogOpen && editingProduct?.id === product.id} onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (!open) setEditingProduct(null);
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs sm:max-w-md lg:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-lg md:text-xl">Edit Product</DialogTitle>
                    </DialogHeader>
                    {editingProduct && (
                      <div className="grid gap-3 md:gap-4 py-4">
                        {/* Same form structure as add product but using editingProduct */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Name</Label>
                            <Input
                              value={editingProduct.name}
                              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                              className="text-xs md:text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Category</Label>
                            <Select
                              value={editingProduct.category_id}
                              onValueChange={(value) => {
                                const category = categories.find(cat => cat.id === value);
                                setEditingProduct({ 
                                  ...editingProduct, 
                                  category_id: value,
                                  category: category?.name || ""
                                });
                              }}
                            >
                              <SelectTrigger className="text-xs md:text-sm">
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
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm">Description</Label>
                          <Textarea
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="text-xs md:text-sm"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Price</Label>
                            <Input
                              type="number"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                              className="text-xs md:text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Previous Price</Label>
                            <Input
                              type="number"
                              value={editingProduct.previous_price || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, previous_price: e.target.value ? parseFloat(e.target.value) : undefined })}
                              className="text-xs md:text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Quantity</Label>
                            <Input
                              type="number"
                              value={editingProduct.quantity}
                              onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) })}
                              className="text-xs md:text-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs md:text-sm">Product Image</Label>
                          <ImageUpload
                            onImageUploaded={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                            currentImage={editingProduct.image_url}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingProduct.is_featured}
                            onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                            className="rounded"
                          />
                          <Label className="text-xs md:text-sm">Featured Product</Label>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} size="sm" className="text-xs md:text-sm">
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateProduct} disabled={loading} size="sm" className="text-xs md:text-sm">
                        Update Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
