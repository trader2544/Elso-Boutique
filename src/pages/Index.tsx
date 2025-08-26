import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import ShopByCategory from "@/components/ShopByCategory";
import FeaturedProducts from "@/components/FeaturedProducts";
import ProductCard from "@/components/ProductCard";
import MobileProductCard from "@/components/MobileProductCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { SEOHead } from "@/components/SEOHead";
import { Product } from "@/types/product";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const categoryId = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    if (categoryId) {
      fetchProductsByCategory(categoryId);
    } else if (searchQuery) {
      fetchProductsBySearch(searchQuery);
    } else {
      // Clear products when showing home page
      setProducts([]);
      setCategoryName("");
    }
  }, [categoryId, searchQuery]);

  const fetchProductsByCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      // First get the category name
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .single();

      if (categoryError) throw categoryError;
      setCategoryName(categoryData.name);

      // Then get products
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedProducts = data?.map(product => ({
        ...product,
        previous_price: product.previous_price ?? undefined
      })) || [];

      setProducts(processedProducts);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsBySearch = async (query: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processedProducts = data?.map(product => ({
        ...product,
        previous_price: product.previous_price ?? undefined
      })) || [];

      setProducts(processedProducts);
      setCategoryName(`Search results for "${query}"`);
    } catch (error) {
      console.error("Error searching products:", error);
      toast({
        title: "Error",
        description: "Failed to search products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id);
  };

  const handleWishlistToggle = async (productId: string) => {
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  // Show category or search results
  if (categoryId || searchQuery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <SEOHead 
          title={categoryName ? `${categoryName} - Elso Boutique` : "Search Results - Elso Boutique"}
          description={`Browse our collection of ${categoryName || 'products'} at Elso Boutique`}
        />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-8">{categoryName}</h1>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64 md:h-80"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                isMobile ? (
                  <MobileProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onWishlistToggle={() => handleWishlistToggle(product.id)}
                    isInWishlist={isInWishlist(product.id)}
                  />
                ) : (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onWishlistToggle={() => handleWishlistToggle(product.id)}
                    isInWishlist={isInWishlist(product.id)}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show home page
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <SEOHead 
        title="Elso Boutique - Premium Fashion & Lifestyle"
        description="Discover premium fashion and lifestyle products at Elso Boutique. Shop the latest trends in clothing, accessories, and more with fast delivery across Kenya."
      />
      <HeroSection />
      <ShopByCategory />
      <FeaturedProducts />
      <TestimonialsCarousel />
    </div>
  );
};

export default Index;
