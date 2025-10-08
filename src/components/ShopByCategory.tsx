
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const ShopByCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Set up image rotation for categories with multiple images
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const newIndex = { ...prev };
        categories.forEach(category => {
          if (category.image_url && category.image_url.includes(',')) {
            const images = category.image_url.split(',');
            newIndex[category.id] = ((prev[category.id] || 0) + 1) % images.length;
          }
        });
        return newIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [categories]);

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

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  const getCurrentImage = (category: Category) => {
    if (!category.image_url) return null;
    
    const images = category.image_url.split(',').map(img => img.trim());
    if (images.length === 1) return images[0];
    
    const index = currentImageIndex[category.id] || 0;
    return images[index] || images[0];
  };

  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-pink-700 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collection of beauty and cosmetic products
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {categories.map((category) => {
            const currentImage = getCurrentImage(category);
            
            return (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-pink-200 hover:border-pink-300 relative overflow-hidden"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className="p-0 relative">
                  <div className="w-full h-48 md:h-32 relative overflow-hidden">
                    {currentImage ? (
                      <>
                        <img
                          src={currentImage}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <Button
                            variant="secondary"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white text-pink-700 font-semibold"
                          >
                            Shop Now
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                        <span className="text-pink-400 text-4xl">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
