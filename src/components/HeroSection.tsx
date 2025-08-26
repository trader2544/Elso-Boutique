
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 animate-bounce">
          <Sparkles className="text-pink-400 w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div className="absolute bottom-32 right-16 animate-pulse">
          <Heart className="text-purple-400 w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce delay-300">
          <Star className="text-pink-300 w-4 h-4 md:w-6 md:h-6" />
        </div>
        <div className="absolute bottom-20 left-20 animate-pulse delay-500">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-400 rounded-full"></div>
        </div>
      </div>

      {/* Decorative Background Shapes */}
      <div className="absolute -top-40 -right-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-fade-in">
            Elso Boutique
          </h1>
          
          {/* Subtitle */}
          <div className="mb-8 animate-fade-in animation-delay-200">
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Where Fashion Meets Elegance
            </p>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Curated Premium Collections in Kisumu
            </p>
          </div>
          
          {/* Description */}
          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-400">
            Discover our handpicked selection of premium women's fashion, jewelry, and accessories. 
            From everyday essentials to statement pieces that make every moment special. 
            Experience fashion that speaks to your unique style and personality.
          </p>
          
          {/* CTA Button */}
          <div className="animate-fade-in animation-delay-600">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => document.querySelector('.shop-categories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Collection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm md:text-base animate-fade-in animation-delay-800">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Heart className="w-5 h-5 text-purple-500" />
              <span>Curated Selection</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Star className="w-5 h-5 text-pink-500" />
              <span>Customer Favorites</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
