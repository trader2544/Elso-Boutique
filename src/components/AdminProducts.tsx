import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  category: string;
  image_url: string | null;
  in_stock: boolean;
  stock_status: string;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  previous_price: string;
  category: string;
  image_url: string;
  stock_status: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    previous_price: "",
    category: "",
    image_url: "",
    stock_status: "stocked",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const { toast } = useToast();

  const stockStatusOptions = [
    { value: "stocked", label: "In Stock", color: "bg-green-100 text-green-800" },
    { value: "few_units_left", label: "Few Units Left", color: "bg-yellow-100 text-yellow-800" },
    { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-800" },
    { value: "flash_sale", label: "Flash Sale", color: "bg-purple-100 text-purple-800" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
        .from("products")
        .select("category")
        .order("category");

      if (error) throw error;
      
      const uniqueCategories = Array.from(new Set(data?.map(p => p.category) || []));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("products")
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          previous_price: newProduct.previous_price ? parseFloat(newProduct.previous_price) : null,
          category: newProduct.category,
          image_url: newProduct.image_url || null,
          stock_status: newProduct.stock_status,
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
        category: "",
        image_url: "",
        stock_status: "stocked",
      });
      setIsAddingProduct(false);

      await fetchProducts();
      await fetchCategories();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
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
          category: editingProduct.category,
          image_url: editingProduct.image_url,
          in_stock: editingProduct.in_stock,
          stock_status: editingProduct.stock_status,
        })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setEditingProduct(null);
      await fetchProducts();
      await fetchCategories();
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

  const getStockStatusBadge = (status: string) => {
    const statusConfig = stockStatusOptions.find(option => option.value === status);
    return (
      <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">Product Management</h2>
        <Button
          onClick={() => setIsAddingProduct(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto text-sm h-9"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Product
        </Button>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      list="categories"
                      required
                      className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <Label htmlFor="previous_price" className="text-pink-700 text-sm">Previous Price (KSh)</Label>
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
                    <Label htmlFor="stock_status" className="text-pink-700 text-sm">Stock Status</Label>
                    <Select
                      value={newProduct.stock_status}
                      onValueChange={(value) => setNewProduct({ ...newProduct, stock_status: value })}
                    >
                      <SelectTrigger className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1">
                        <SelectValue placeholder="Select stock status" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-pink-700 text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      required
                      rows={3}
                      className="border-pink-200 focus:border-pink-400 text-sm mt-1"
                    />
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
                  // Edit Mode
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
                    <Input
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="text-xs h-8"
                      placeholder="Category"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        className="text-xs h-8"
                        placeholder="Price"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editingProduct.previous_price || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, previous_price: e.target.value ? parseFloat(e.target.value) : null })}
                        className="text-xs h-8"
                        placeholder="Previous price"
                      />
                    </div>
                    <Select
                      value={editingProduct.stock_status}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, stock_status: value })}
                    >
                      <SelectTrigger className="text-xs h-8">
                        <SelectValue placeholder="Stock status" />
                      </SelectTrigger>
                      <SelectContent>
                        {stockStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="text-xs"
                      rows={2}
                      placeholder="Description"
                    />
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
                  // View Mode
                  <div>
                    <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-pink-50">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-pink-300 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 text-xs line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-pink-600 mb-1">{product.category}</p>
                    <div className="mb-2">
                      {getStockStatusBadge(product.stock_status)}
                    </div>
                    <p className="text-xs font-medium text-pink-600 mb-2">
                      KSh {product.price.toLocaleString()}
                      {product.previous_price && (
                        <span className="ml-1 text-xs text-gray-400 line-through">
                          KSh {product.previous_price.toLocaleString()}
                        </span>
                      )}
                    </p>
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
