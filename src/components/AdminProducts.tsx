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
import { Trash2, Edit, Plus, Upload, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  category: string;
  category_id: string;
  image_url: string | null;
  images: string[];
  in_stock: boolean;
  stock_status: string;
  quantity: number;
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    previous_price: "",
    category_id: "",
    in_stock: true,
    stock_status: "stocked",
    quantity: "0",
    is_featured: false,
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedProducts = data?.map(product => ({
        ...product,
        category: product.categories?.name || product.category,
        category_id: product.categories?.id || product.category_id,
        images: product.image_url ? [product.image_url] : [],
        previous_price: product.previous_price ?? null
      })) || [];

      setProducts(processedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        previous_price: formData.previous_price ? parseFloat(formData.previous_price) : null,
        category_id: formData.category_id,
        image_url: imageUrls[0] || null,
        images: imageUrls,
        in_stock: formData.in_stock,
        stock_status: formData.stock_status,
        quantity: parseInt(formData.quantity),
        is_featured: formData.is_featured,
        category: categories.find(cat => cat.id === formData.category_id)?.name || "",
      };

      if (isEditing && editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Product created successfully!",
        });
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      previous_price: product.previous_price?.toString() || "",
      category_id: product.category_id,
      in_stock: product.in_stock,
      stock_status: product.stock_status,
      quantity: product.quantity.toString(),
      is_featured: product.is_featured,
    });
    setImageUrls(product.images || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });

      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      previous_price: "",
      category_id: "",
      in_stock: true,
      stock_status: "stocked",
      quantity: "0",
      is_featured: false,
    });
    setImageUrls([]);
  };

  const handleImageUpload = (url: string) => {
    setImageUrls(prev => [...prev, url]);
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold">Products Management</h2>
        <Button onClick={resetForm} size="sm" className="w-full sm:w-auto">
          <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product Form */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">
            {isEditing ? "Edit Product" : "Add New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="name" className="text-xs md:text-sm">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="category" className="text-xs md:text-sm">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-xs md:text-sm">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-xs md:text-sm min-h-[60px] md:min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="price" className="text-xs md:text-sm">Price (KSh)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="previous_price" className="text-xs md:text-sm">Previous Price</Label>
                <Input
                  id="previous_price"
                  type="number"
                  value={formData.previous_price}
                  onChange={(e) => setFormData({ ...formData, previous_price: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="quantity" className="text-xs md:text-sm">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="text-xs md:text-sm h-8 md:h-10"
                />
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="stock_status" className="text-xs md:text-sm">Stock Status</Label>
                <Select value={formData.stock_status} onValueChange={(value) => setFormData({ ...formData, stock_status: value })}>
                  <SelectTrigger className="text-xs md:text-sm h-8 md:h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stocked" className="text-xs md:text-sm">Stocked</SelectItem>
                    <SelectItem value="few_units_left" className="text-xs md:text-sm">Few Units Left</SelectItem>
                    <SelectItem value="out_of_stock" className="text-xs md:text-sm">Out of Stock</SelectItem>
                    <SelectItem value="flash_sale" className="text-xs md:text-sm">Flash Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <Label className="text-xs md:text-sm">Product Images</Label>
              <div className="space-y-2">
                <ImageUpload onImageUpload={handleImageUpload} />
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Product ${index + 1}`} className="w-full h-16 md:h-20 object-cover rounded border" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 rounded-full p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-2 h-2 md:w-3 md:h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs md:text-sm">In Stock</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs md:text-sm">Featured Product</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button type="submit" disabled={loading} className="text-xs md:text-sm h-8 md:h-10">
                {loading ? "Saving..." : isEditing ? "Update Product" : "Add Product"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm} className="text-xs md:text-sm h-8 md:h-10">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-gray-50 relative">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl md:text-4xl">
                  📷
                </div>
              )}
              {product.images && product.images.length > 1 && (
                <Badge className="absolute top-1 md:top-2 left-1 md:left-2 text-[10px] md:text-xs">
                  {product.images.length} images
                </Badge>
              )}
            </div>
            
            <CardContent className="p-2 md:p-4">
              <div className="space-y-1 md:space-y-2">
                <h3 className="font-medium text-xs md:text-sm line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-[10px] md:text-xs line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-pink-600 text-xs md:text-sm">
                      KSh {product.price.toLocaleString()}
                    </span>
                    {product.previous_price && (
                      <span className="text-gray-400 line-through text-[10px] md:text-xs">
                        KSh {product.previous_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="h-6 w-6 md:h-8 md:w-8 p-0"
                    >
                      <Edit className="w-2 h-2 md:w-3 md:h-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      className="h-6 w-6 md:h-8 md:w-8 p-0"
                    >
                      <Trash2 className="w-2 h-2 md:w-3 md:h-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant={product.in_stock ? "default" : "destructive"} className="text-[8px] md:text-[10px]">
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.is_featured && (
                    <Badge variant="secondary" className="text-[8px] md:text-[10px]">Featured</Badge>
                  )}
                  <Badge variant="outline" className="text-[8px] md:text-[10px]">
                    Qty: {product.quantity}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
