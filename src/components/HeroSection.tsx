
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-pink-25 to-white h-[50vh] md:h-[65vh] flex items-center overflow-hidden">
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

      <div className="container mx-auto px-4 relative z-10 h-full">
        <div className="flex items-center h-full">
          {/* Left-aligned Content */}
          <div className="text-left max-w-xl pb-8 md:pb-8">
            {/* Main Heading */}
            <div className="mb-2 md:mb-4">
              <h1 className="text-xl md:text-4xl lg:text-5xl font-bold mb-1 md:mb-2 leading-tight">
                <span className="text-white drop-shadow-lg">Elevate Your</span>
                <br />
                <span className="text-white drop-shadow-lg">Look</span>
              </h1>
              <h2 className="text-xl md:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                  Discover
                </span>
                <br />
                <span className="text-white drop-shadow-lg">Your Style</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-white/90 text-xs md:text-base lg:text-lg mb-2 md:mb-4 max-w-md drop-shadow-md">
              Curated Collections for the Modern Connoisseur
            </p>

            {/* About Button */}
            <div className="mb-3 md:mb-6">
              <Link to="/about">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-400 to-pink-300 hover:from-pink-500 hover:to-pink-400 text-white px-5 md:px-8 py-2 md:py-3 rounded-full font-semibold text-xs md:text-base shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-pink-200"
                >
                  About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pink Decorative Elements */}
      <div className="absolute top-8 md:top-16 right-8 md:right-16 w-12 h-12 md:w-24 md:h-24 bg-pink-400/20 rounded-full blur-xl md:blur-2xl"></div>
      <div className="absolute bottom-8 md:bottom-16 left-8 md:left-16 w-8 h-8 md:w-16 md:h-16 bg-pink-300/30 rounded-full blur-lg md:blur-xl"></div>
      
      {/* Scroll Indicator with Downward Animation */}
      <div className="absolute bottom-1 md:bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-white/70">
          <p className="text-xs md:text-sm mb-1 font-medium">Shop Below</p>
          <ChevronDown className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
          <div className="w-3 h-5 md:w-5 md:h-7 border-2 border-white/50 rounded-full flex justify-center mt-1">
            <div className="w-0.5 h-1 md:w-1 md:h-2 bg-white/70 rounded-full mt-1"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
