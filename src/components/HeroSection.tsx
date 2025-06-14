
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-white to-pink-50 min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/6dbb14c3-2b40-46f1-9d1f-eeb627e9ea0b.png"
          alt="ELSO Boutique Fashion Model"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
          {/* Left Content - Text Over Image */}
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 relative">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight">
                <span className="text-white drop-shadow-lg">Elevate Your</span>
                <br />
                <span className="text-white drop-shadow-lg">Look</span>
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-400 to-pink-200 bg-clip-text text-transparent drop-shadow-sm">
                  Discover
                </span>
                <br />
                <span className="text-white drop-shadow-lg">Your Style</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-md mx-auto lg:mx-0 drop-shadow-md">
              Curated Collections for the Modern Connoisseur
            </p>

            {/* Shop Now Button */}
            <Link to="/#products">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Shop Now
              </Button>
            </Link>
          </div>

          {/* Right Content - Social Icons and Happy Customers */}
          <div className="lg:w-1/2 relative flex flex-col items-center lg:items-end space-y-8">
            {/* Happy Customers Card - Positioned in open space */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 max-w-sm">
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-200 to-pink-300 border-3 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-300 to-pink-400 border-3 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 border-3 border-white shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 border-3 border-white flex items-center justify-center text-white text-sm font-bold shadow-md">+</div>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-lg">2,500+</p>
                  <p className="text-gray-600 text-sm">Happy Customers</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 text-yellow-400 fill-current">
                    ⭐
                  </div>
                ))}
                <span className="text-gray-600 text-sm ml-2">4.9/5 Rating</span>
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex lg:flex-col flex-row space-x-4 lg:space-x-0 lg:space-y-4">
              <a 
                href="https://facebook.com/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
              >
                <Facebook className="w-6 h-6 text-pink-500" />
              </a>
              <a 
                href="https://instagram.com/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
              >
                <Instagram className="w-6 h-6 text-pink-500" />
              </a>
              <a 
                href="https://linkedin.com/company/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
              >
                <Linkedin className="w-6 h-6 text-pink-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-300/20 rounded-full blur-2xl"></div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
