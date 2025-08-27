import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import MultiImageUpload from "./MultiImageUpload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  category: string;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  in_stock: boolean;
  stock_status: string;
  quantity: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    previous_price: null as number | null,
    category_id: "",
    images: [] as string[],
    quantity: 0,
    is_featured: false,
    stock_status: "stocked",
  });

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
        .select("*");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      previous_price: null,
      category_id: "",
      images: [],
      quantity: 0,
      is_featured: false,
      stock_status: "stocked",
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedCategory = categories.find(cat => cat.id === productForm.category_id);
      
      const productData = {
        ...productForm,
        category: selectedCategory?.name || "",
        image_url: productForm.images[0] || null,
        images: productForm.images,
        in_stock: productForm.quantity > 0,
        stock_status: productForm.quantity === 0 ? "out_of_stock" : 
                     productForm.quantity <= 5 ? "few_units_left" : "stocked",
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      fetchProducts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      previous_price: product.previous_price,
      category_id: product.category_id || "",
      images: product.images || (product.image_url ? [product.image_url] : []),
      quantity: product.quantity,
      is_featured: product.is_featured,
      stock_status: product.stock_status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleImagesUploaded = (urls: string[]) => {
    setProductForm(prev => ({ ...prev, images: urls }));
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Manage Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-pink-600 hover:bg-pink-700 text-sm md:text-base">
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={productForm.category_id} onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}>
                    <SelectTrigger className="text-sm md:text-base">
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

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="previous_price">Previous Price (KSh)</Label>
                  <Input
                    id="previous_price"
                    type="number"
                    value={productForm.previous_price || ""}
                    onChange={(e) => setProductForm({ ...productForm, previous_price: parseFloat(e.target.value) || null })}
                    className="text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: parseInt(e.target.value) || 0 })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={productForm.is_featured}
                  onCheckedChange={(checked) => setProductForm({ ...productForm, is_featured: checked as boolean })}
                />
                <Label htmlFor="is_featured" className="text-sm md:text-base">Featured Product</Label>
              </div>

              <MultiImageUpload
                onImagesUploaded={handleImagesUploaded}
                currentImages={productForm.images}
              />

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-sm md:text-base">
                  Cancel
                </Button>
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700 text-sm md:text-base">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-sm">Image</TableHead>
                  <TableHead className="text-xs md:text-sm">Name</TableHead>
                  <TableHead className="text-xs md:text-sm">Category</TableHead>
                  <TableHead className="text-xs md:text-sm">Price</TableHead>
                  <TableHead className="text-xs md:text-sm hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-xs md:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="p-2">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-100 rounded overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📷</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="text-xs md:text-sm font-medium truncate max-w-32">{product.name}</div>
                      {product.is_featured && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded mt-1">
                          Featured
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-xs md:text-sm">{product.category}</TableCell>
                    <TableCell className="p-2 text-xs md:text-sm font-medium">KSh {product.price.toLocaleString()}</TableCell>
                    <TableCell className="p-2 hidden md:table-cell">
                      <div className="text-xs">
                        <div>Qty: {product.quantity}</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          product.stock_status === "out_of_stock" ? "bg-red-100 text-red-700" :
                          product.stock_status === "few_units_left" ? "bg-orange-100 text-orange-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {product.stock_status.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-6 w-6 md:h-8 md:w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="h-6 w-6 md:h-8 md:w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
