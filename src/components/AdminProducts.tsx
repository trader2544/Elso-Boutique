
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface NewProduct {
  name: string;
  description: string;
  price: string;
  previous_price: string;
  category: string;
  image_url: string;
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
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    
    try {
      // For now, we'll use a placeholder URL or you can implement actual file upload
      // This would typically involve uploading to Supabase Storage
      const imageUrl = URL.createObjectURL(file);
      setNewProduct({ ...newProduct, image_url: imageUrl });
      
      toast({
        title: "Image uploaded",
        description: "Image preview ready. Complete the form to save the product.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
      });
      setImagePreview(null);

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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle className="text-pink-700">Add New Product</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={addProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-pink-700">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-pink-700">Category</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  list="categories"
                  required
                  className="border-pink-200 focus:border-pink-400"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="price" className="text-pink-700">Price (KSh)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  required
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
              <div>
                <Label htmlFor="previous_price" className="text-pink-700">Previous Price (KSh)</Label>
                <Input
                  id="previous_price"
                  type="number"
                  step="0.01"
                  value={newProduct.previous_price}
                  onChange={(e) => setNewProduct({ ...newProduct, previous_price: e.target.value })}
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-pink-700">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                required
                className="border-pink-200 focus:border-pink-400"
              />
            </div>
            
            <div>
              <Label htmlFor="image" className="text-pink-700">Product Image</Label>
              <div className="flex items-center space-x-4 mt-2">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image')?.click()}
                  disabled={uploading}
                  className="border-pink-200 hover:bg-pink-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload Image"}
                </Button>
                {imagePreview && (
                  <div className="w-20 h-20 border border-pink-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle className="text-pink-700">Existing Products</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-pink-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {product.image_url ? (
                      <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-pink-50">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 mb-3 rounded-lg bg-pink-50 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-pink-300" />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-pink-600 mb-1">{product.category}</p>
                    <p className="text-sm font-medium text-pink-600">
                      KSh {product.price.toLocaleString()}
                      {product.previous_price && (
                        <span className="ml-2 text-xs text-gray-400 line-through">
                          KSh {product.previous_price.toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    className="ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
