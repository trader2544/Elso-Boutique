
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 h-[70vh] md:h-[80vh] flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/6dbb14c3-2b40-46f1-9d1f-eeb627e9ea0b.png"
          alt="ELSO Boutique Fashion Model"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
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
                <span className="bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent drop-shadow-sm">
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

            {/* Shop Now Button */}
            <Link to="/#products">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 md:px-10 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 md:top-20 right-10 md:right-20 w-16 h-16 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl md:blur-3xl"></div>
      <div className="absolute bottom-10 md:bottom-20 left-10 md:left-20 w-12 h-12 md:w-24 md:h-24 bg-gray-300/20 rounded-full blur-xl md:blur-2xl"></div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 md:h-3 bg-white/70 rounded-full mt-1 md:mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
