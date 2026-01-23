import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, CreditCard, ShieldCheck } from "lucide-react";
const HeroSection = () => {
  const scrollToCategories = () => {
    const categoriesSection = document.querySelector('.shop-categories');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative min-h-[70vh] md:min-h-[85vh] lg:min-h-screen overflow-hidden">
      {/* Background Image - Full coverage */}
      <div className="absolute inset-0 z-0">
        <img src="/lovable-uploads/2628dc36-6cb0-4db9-8729-b73f1e8362e4.png" alt="ELSO Boutique - Luxury Women's Fashion" className="w-full h-full object-cover object-center" />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      {/* Floating decorative elements */}
      <motion.div className="absolute top-20 right-10 w-32 h-32 border-2 border-pink-400/30 rounded-full hidden lg:block" animate={{
      rotate: 360
    }} transition={{
      duration: 30,
      repeat: Infinity,
      ease: "linear"
    }} />
      <motion.div className="absolute bottom-40 right-20 w-20 h-20 bg-pink-500/20 rounded-full blur-xl hidden lg:block" animate={{
      scale: [1, 1.3, 1],
      opacity: [0.5, 0.8, 0.5]
    }} transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }} />

      {/* Content */}
      <div className="relative z-10 h-full min-h-[70vh] md:min-h-[85vh] lg:min-h-screen flex items-center">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="max-w-3xl">
            {/* Hot Badge */}
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="mb-6">
              
            </motion.div>

            {/* Main Heading - Pink Boutique Style */}
            <motion.div initial={{
            opacity: 0,
            y: 40
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.3
          }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 leading-[0.9] tracking-tight">
                <span className="text-white block">YOUR STYLE.</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 block">
                  YOUR STORY.
                </span>
              </h1>
            </motion.div>
            
            {/* Subheading */}
            <motion.p className="text-base sm:text-lg md:text-xl text-white/80 mb-8 max-w-xl font-light leading-relaxed" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.5
          }}>
              Discover authentic African fashion. Premium outfits, handcrafted jewelry, 
              stunning bags & unique accessories for the modern woman.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-4 mb-10" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.7
          }}>
              <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-lg font-bold rounded-none shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 hover:-translate-y-1 uppercase tracking-wider" onClick={scrollToCategories}>
                Shop Now
              </Button>
              
              <Link to="/?category=Outfits">
                <Button variant="outline" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-pink-600 px-8 sm:px-12 py-6 sm:py-7 text-base sm:text-lg font-bold rounded-none transition-all duration-300 uppercase tracking-wider w-full sm:w-auto">
                  View Outfits
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div className="flex flex-wrap items-center gap-4 sm:gap-8 text-white/70 text-xs sm:text-sm" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.6,
            delay: 0.9
          }}>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-pink-400" />
                <span>Free Delivery in Kisumu CBD</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-pink-400" />
                <span>M-Pesa Accepted</span>
              </div>
              <div className="flex items-center gap-2 hidden sm:flex">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Secure Shopping</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10" animate={{
      y: [0, 10, 0]
    }} transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}>
        <button onClick={scrollToCategories} className="flex flex-col items-center text-white/60 hover:text-pink-400 transition-colors" aria-label="Scroll to categories">
          
          
        </button>
      </motion.div>

      {/* Bottom decorative bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-pink-400 to-pink-600" />
    </section>;
};
export default HeroSection;