
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import ShopByCategory from "@/components/ShopByCategory";
import FeaturedProducts from "@/components/FeaturedProducts";
import ProductCard from "@/components/ProductCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import LiveChatWidget from "@/components/LiveChatWidget";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      fetchProductsByCategory(category);
    }
  }, [category]);

  const fetchProductsByCategory = async (categoryName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", categoryName)
        .order("created_at", { ascending: false });

      if (error) throw error;

        const formattedProducts: Product[] = (data || []).map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || "",
          price: product.price,
          previous_price: product.previous_price || null,
          image_url: product.image_url || "",
          in_stock: product.in_stock,
          stock_status: product.stock_status,
          quantity: product.quantity,
          rating: product.rating || 0,
          review_count: product.review_count || 0,
          is_featured: product.is_featured,
          category: product.category,
          category_id: product.category_id,
          created_at: product.created_at,
        }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product.id);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {!category && (
        <>
          <ShopByCategory />
          <FeaturedProducts onAddToCart={handleAddToCart} />
        </>
      )}

      {category && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {category}
              </h2>
              <p className="text-lg text-gray-600">
                Discover our collection of {category.toLowerCase()}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found in {category} category.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      
      <TestimonialsCarousel />
      <LiveChatWidget />
    </div>
  );
};

export default Index;
