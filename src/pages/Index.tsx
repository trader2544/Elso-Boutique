
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import MobileProductCard from "@/components/MobileProductCard";
import SearchBar from "@/components/SearchBar";
import { SEOHead } from "@/components/SEOHead";
import ShopByCategory from "@/components/ShopByCategory";
import FeaturedProducts from "@/components/FeaturedProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  is_featured: boolean;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (categoryParam) {
      fetchProducts();
    } else {
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
    }
  }, [categoryParam]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(`
          *,
          categories (name)
        `)
        .order("created_at", { ascending: false });

      // If category is specified, filter by category
      if (categoryParam) {
        query = query.eq('categories.name', categoryParam);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedProducts = data?.map(product => ({
        ...product,
        category: product.categories?.name || product.category || 'Uncategorized'
      })) || [];

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (loading && categoryParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={categoryParam ? `${categoryParam} - Elso Boutique` : "Elso Boutique - Premium Fashion & Style"}
        description={categoryParam ? `Shop ${categoryParam} collection at Elso Boutique` : "Discover premium fashion at Elso Boutique. Shop the latest trends in women's clothing, accessories, and more."}
        keywords={categoryParam ? `${categoryParam}, fashion, boutique, women's clothing` : "fashion, boutique, women's clothing, style, Kenya, premium fashion"}
      />
      <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="relative z-10">
          {/* Only show homepage sections when no category is selected */}
          {!categoryParam && (
            <>
              <HeroSection />
              <ShopByCategory />
              <FeaturedProducts onAddToCart={addToCart} />
            </>
          )}
          
          {/* Show category-specific content when category is selected */}
          {categoryParam && (
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-center text-pink-700 mb-4">
                  {categoryParam} Collection
                </h1>
                <p className="text-center text-gray-600 mb-6">
                  Discover our curated selection of {categoryParam.toLowerCase()} items
                </p>
              </div>
              
              <div className="mb-8">
                <SearchBar
                  onSearch={setSearchTerm}
                  placeholder={`Search in ${categoryParam}...`}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                {filteredProducts.map((product) => (
                  <div key={product.id}>
                    <div className="hidden sm:block">
                      <ProductCard product={product} onAddToCart={() => addToCart(product.id)} />
                    </div>
                    <div className="block sm:hidden">
                      <MobileProductCard product={product} onAddToCart={() => addToCart(product.id)} />
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm ? 'No products found' : `No ${categoryParam.toLowerCase()} products available`}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new arrivals!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
