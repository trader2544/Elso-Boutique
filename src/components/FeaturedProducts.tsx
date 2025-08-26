
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface FeaturedProductsProps {
  onAddToCart: (product: Product) => void;
}

const FeaturedProducts = ({ onAddToCart }: FeaturedProductsProps) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || "",
        price: product.price,
        previous_price: product.previous_price || undefined,
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

      setFeaturedProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium fashion pieces
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => onAddToCart(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
