
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/2628dc36-6cb0-4db9-8729-b73f1e8362e4.png"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-3xl mx-auto">
          {/* Tagline */}
          <p className="text-sm md:text-base font-light tracking-widest uppercase mb-4 opacity-90">
            The Latest Luxury Women's Fashion
          </p>
          
          {/* Main Brand Name */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-8 tracking-wide">
            ELSO BOUTIQUE
          </h1>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 text-sm md:text-base font-medium tracking-wide min-w-[200px]"
              onClick={() => document.querySelector('.shop-categories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              SHOP OUR NEW ARRIVALS
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 text-sm md:text-base font-medium tracking-wide min-w-[200px]"
            >
              50% OFF SUMMER SALE
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <ArrowRight className="w-6 h-6 text-white rotate-90" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
