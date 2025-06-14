
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-pink-25 to-white h-[70vh] md:h-[80vh] flex items-center overflow-hidden">
      {/* Background Image without Pink Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/6dbb14c3-2b40-46f1-9d1f-eeb627e9ea0b.png"
          alt="ELSO Boutique Fashion Model"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-center h-full">
          {/* Centered Content */}
          <div className="text-center max-w-2xl">
            {/* Main Heading */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 leading-tight">
                <span className="text-white drop-shadow-lg">Elevate Your</span>
                <br />
                <span className="text-white drop-shadow-lg">Look</span>
              </h1>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                  Discover
                </span>
                <br />
                <span className="text-white drop-shadow-lg">Your Style</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-white/90 text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-lg mx-auto drop-shadow-md">
              Curated Collections for the Modern Connoisseur
            </p>

            {/* About Button */}
            <Link to="/about">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-400 to-pink-300 hover:from-pink-500 hover:to-pink-400 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-pink-200"
              >
                About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pink Decorative Elements */}
      <div className="absolute top-10 md:top-20 right-10 md:right-20 w-16 h-16 md:w-32 md:h-32 bg-pink-400/20 rounded-full blur-2xl md:blur-3xl"></div>
      <div className="absolute bottom-10 md:bottom-20 left-10 md:left-20 w-12 h-12 md:w-24 md:h-24 bg-pink-300/30 rounded-full blur-xl md:blur-2xl"></div>
      
      {/* Scroll Indicator with Downward Animation */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-white/70">
          <p className="text-xs md:text-sm mb-2 font-medium">Shop Below</p>
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 animate-pulse" />
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center mt-2">
            <div className="w-1 h-2 md:h-3 bg-white/70 rounded-full mt-1 md:mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
