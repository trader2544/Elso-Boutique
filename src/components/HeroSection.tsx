
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-pink-50 via-white to-pink-50 text-gray-800 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[500px]">
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 relative">
            {/* Main Heading */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2">
                <span className="text-gray-800">Elevate Your</span>
                <br />
                <span className="text-gray-800">Look</span>
              </h1>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
                  Discover
                </span>
                <br />
                <span className="text-gray-800">Your Style</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-gray-600 text-base md:text-lg mb-4 max-w-md mx-auto lg:mx-0">
              Curated Collections for the Modern Connoisseur
            </p>

            {/* Shop Now Button */}
            <Link to="/#products">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Shop now
              </Button>
            </Link>
          </div>

          {/* Right Content - Image and Social Icons */}
          <div className="lg:w-1/2 relative flex justify-center lg:justify-end">
            {/* Main Image */}
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/lovable-uploads/6dbb14c3-2b40-46f1-9d1f-eeb627e9ea0b.png"
                  alt="ELSO Boutique Fashion Model"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              {/* Happy Customers Circle - Desktop only */}
              <div className="hidden lg:block absolute -bottom-4 -left-8">
                <div className="bg-white rounded-full p-4 shadow-lg">
                  <div className="flex -space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-pink-200 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-pink-300 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-pink-400 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Our Happy Customers</p>
                </div>
              </div>
            </div>

            {/* Social Media Icons - Desktop */}
            <div className="hidden lg:flex flex-col space-y-4 absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16">
              <a 
                href="https://facebook.com/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <Facebook className="w-5 h-5 text-pink-500" />
              </a>
              <a 
                href="https://instagram.com/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
              </a>
              <a 
                href="https://linkedin.com/company/elsoboutique" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <Linkedin className="w-5 h-5 text-pink-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Social Media Icons */}
        <div className="lg:hidden flex justify-center space-x-6 mt-8">
          <a 
            href="https://facebook.com/elsoboutique" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Facebook className="w-4 h-4 text-pink-500" />
          </a>
          <a 
            href="https://instagram.com/elsoboutique" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Instagram className="w-4 h-4 text-pink-500" />
          </a>
          <a 
            href="https://linkedin.com/company/elsoboutique" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Linkedin className="w-4 h-4 text-pink-500" />
          </a>
        </div>

        {/* Happy Customers - Mobile */}
        <div className="lg:hidden flex justify-center mt-6">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-pink-200 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-pink-300 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-white"></div>
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
              </div>
              <p className="text-xs text-gray-600 font-medium">Our Happy Customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pink-100 rounded-full opacity-50"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-pink-200 rounded-full opacity-30"></div>
      <div className="absolute top-1/2 left-5 w-8 h-8 bg-pink-300 rounded-full opacity-40"></div>
    </section>
  );
};

export default HeroSection;
