
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import MobileProductCard from "@/components/MobileProductCard";
import SearchBar from "@/components/SearchBar";
import ShopByCategory from "@/components/ShopByCategory";
import FeaturedProducts from "@/components/FeaturedProducts";
import SEOHead from "@/components/SEOHead";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  image_url: string | null;
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // Get category from URL params
  const categoryFromUrl = searchParams.get('category');

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      fetchProductsByCategory(categoryFromUrl);
    } else {
      fetchProducts();
    }
  }, [categoryFromUrl]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (name)
        `)
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const productsWithCategory = data?.map(product => ({
        ...product,
        category: product.categories?.name || product.category || 'Uncategorized'
      })) || [];
      
      setProducts(productsWithCategory);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_products_by_category', {
        category_name: categoryName
      });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClearCategory = () => {
    setSelectedCategory("");
    window.history.pushState({}, '', '/');
    fetchProducts();
  };

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <HeroSection />
        
        {/* Shop by Category Section - Only show if not filtering by category */}
        {!selectedCategory && <ShopByCategory />}
        
        {/* Featured Products Section - Only show if not filtering by category */}
        {!selectedCategory && <FeaturedProducts />}
        
        {/* Products Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Category Header and Search */}
            <div className="flex flex-col gap-4 mb-6">
              {selectedCategory && (
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-pink-700">
                      {selectedCategory} Products
                    </h2>
                    <p className="text-gray-600">
                      Showing {filteredProducts.length} products
                    </p>
                  </div>
                  <button
                    onClick={handleClearCategory}
                    className="text-pink-600 hover:text-pink-800 underline text-sm"
                  >
                    View All Products
                  </button>
                </div>
              )}
              
              <SearchBar 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm}
                placeholder={selectedCategory ? `Search in ${selectedCategory}...` : "Search products..."}
              />
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      isMobile ? (
                        <MobileProductCard key={product.id} product={product} />
                      ) : (
                        <ProductCard key={product.id} product={product} />
                      )
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {searchTerm ? "No products found matching your search" : 
                       selectedCategory ? `No products found in ${selectedCategory}` : 
                       "No products available"}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm ? "Try adjusting your search terms" : 
                       selectedCategory ? "Check back later for new arrivals" : 
                       "Check back later for new products"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
