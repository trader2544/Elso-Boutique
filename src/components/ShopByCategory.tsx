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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="shop-categories py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold mb-4 uppercase tracking-wider">
            Collections
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore our curated collection of premium African-inspired fashion
          </p>
        </motion.div>
        
        {/* Category Grid */}
        <motion.div 
          className="flex justify-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                variants={itemVariants}
                className="group cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-white shadow-lg hover:shadow-2xl transition-shadow duration-500">
                  {/* Image Container */}
                  <div className="relative h-72 md:h-80 overflow-hidden">
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-pink-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Corner badge */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopByCategory;
