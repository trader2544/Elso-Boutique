import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
const HeroSection = () => {
  const scrollToCategories = () => {
    const categoriesSection = document.querySelector('.shop-categories');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative min-h-[60vh] md:min-h-[80vh] lg:min-h-[90vh] overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-pink-500/20 rounded-full blur-3xl" animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0]
      }} transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }} />
        <motion.div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-300/20 to-pink-400/20 rounded-full blur-3xl" animate={{
        scale: [1.2, 1, 1.2],
        rotate: [0, -90, 0]
      }} transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-200/10 to-purple-200/10 rounded-full blur-3xl" animate={{
        scale: [1, 1.1, 1]
      }} transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
      </div>

      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <img src="/lovable-uploads/2628dc36-6cb0-4db9-8729-b73f1e8362e4.png" alt="ELSO Boutique - Luxury Women's Fashion" className="w-full h-full object-cover object-[center_15%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full min-h-[60vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="mb-6">
              
            </motion.div>

            {/* Main Heading */}
            <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight" initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.3
          }}>
              <span className="text-white drop-shadow-2xl">ELSO</span>
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                BOUTIQUE
              </span>
            </motion.h1>
            
            {/* Tagline */}
            <motion.p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg font-light tracking-wide" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.5
          }}>
              Discover the latest in luxury African fashion. 
              Premium outfits, jewelry, bags & accessories.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-4" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.7
          }}>
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-10 py-6 text-lg font-semibold rounded-full shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105" onClick={scrollToCategories}>
                SHOP NOW
              </Button>
              
              <Link to="/auth">
                <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-10 py-6 text-lg font-semibold rounded-full transition-all duration-300">
                  JOIN US
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div className="flex items-center gap-6 mt-10 text-white/70 text-sm" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.6,
            delay: 0.9
          }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Free Delivery in Kisumu CBD</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                <span>M-Pesa Accepted</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" animate={{
      y: [0, 10, 0]
    }} transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}>
        <button onClick={scrollToCategories} className="flex flex-col items-center text-white/60 hover:text-white transition-colors">
          <span className="text-xs mb-2 tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </motion.div>
    </section>;
};
export default HeroSection;