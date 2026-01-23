import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Import category images
import outfitsImg from "@/assets/categories/outfits.png";
import jewelryImg from "@/assets/categories/jewelry.png";
import bagsImg from "@/assets/categories/bags.png";
import accessoriesImg from "@/assets/categories/accessories.png";

interface CategoryItem {
  name: string;
  image: string;
  description: string;
}

const categories: CategoryItem[] = [
  {
    name: "Outfits",
    image: outfitsImg,
    description: "Stunning African-inspired dresses & clothing"
  },
  {
    name: "Jewelry",
    image: jewelryImg,
    description: "Elegant necklaces, earrings & bracelets"
  },
  {
    name: "Bags",
    image: bagsImg,
    description: "Stylish handbags & tote bags"
  },
  {
    name: "Accessories",
    image: accessoriesImg,
    description: "Complete your look with our accessories"
  }
];

const ShopByCategory = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="shop-categories py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">
            Shop by Category
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            FIND YOUR STYLE
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-base md:text-lg">
            Explore our curated collection of premium African-inspired fashion
          </p>
        </motion.div>
        
        {/* Category Grid - Centered */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl w-full">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] md:aspect-[4/5]">
                  {/* Image */}
                  <motion.img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 uppercase tracking-wide">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-white/70 mb-3 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                      <span className="uppercase tracking-wider">Shop Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopByCategory;
