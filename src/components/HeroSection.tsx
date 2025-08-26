
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <Sparkles className="text-pink-400 w-8 h-8" />
      </div>
      <div className="absolute bottom-32 right-16 animate-pulse">
        <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
      </div>
      <div className="absolute top-40 right-20 animate-bounce delay-300">
        <div className="w-6 h-6 bg-pink-300 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-500 bg-clip-text text-transparent animate-fade-in">
            Elso Boutique
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 animate-fade-in animation-delay-200">
            Discover Premium Fashion & Style
          </p>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in animation-delay-400">
            Curated collection of elegant fashion pieces that make every moment special. 
            From everyday essentials to statement pieces.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-600">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={() => document.querySelector('.shop-categories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Collection
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Background Shapes */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-300/30 to-pink-300/30 rounded-full blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
