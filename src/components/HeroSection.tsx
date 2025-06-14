
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-white min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/6dbb14c3-2b40-46f1-9d1f-eeb627e9ea0b.png"
          alt="ELSO Boutique Fashion Model"
          className="w-full h-full object-cover"
        />
        {/* Lighter Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[80vh]">
          {/* Left Content - Text Over Image */}
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 relative">
            {/* Main Heading */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-tight">
                <span className="text-gray-900">Elevate Your</span>
                <br />
                <span className="text-gray-900">Look</span>
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
                  Discover
                </span>
                <br />
                <span className="text-gray-900">Your Style</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-md mx-auto lg:mx-0">
              Curated Collections for the Modern Connoisseur
            </p>

            {/* Shop Now Button */}
            <Link to="/#products">
              <Button 
                size="lg" 
                className="bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 rounded-none font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Shop Now
              </Button>
            </Link>
          </div>

          {/* Right Content - Social Icons and Happy Customers */}
          <div className="lg:w-1/2 relative flex flex-col items-center lg:items-end space-y-8">
            {/* Happy Customers Card - Clean White Design */}
            <div className="bg-white/95 backdrop-blur-sm rounded-none p-6 shadow-lg border border-gray-200 max-w-sm">
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white shadow-sm"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white shadow-sm"></div>
                  <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold shadow-sm">+</div>
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">2,500+</p>
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

            {/* Social Media Icons - Clean Design */}
            <div className="flex lg:flex-col flex-row space-x-4 lg:space-x-0 lg:space-y-4">
              <a 
                href="https://facebook.com/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white border border-gray-200 rounded-none flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-5 h-5 text-gray-700" />
              </a>
              <a 
                href="https://instagram.com/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white border border-gray-200 rounded-none flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5 text-gray-700" />
              </a>
              <a 
                href="https://linkedin.com/company/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white border border-gray-200 rounded-none flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5 text-gray-700" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Decorative Elements */}
      <div className="absolute top-20 right-20 w-16 h-16 bg-gray-100/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-gray-200/20 rounded-full blur-lg"></div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-600 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
