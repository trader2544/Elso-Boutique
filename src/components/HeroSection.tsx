
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-pink-300 to-pink-400 text-white py-16 md:py-24">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">
              Discover Your Perfect Style
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90">
              Elevate your fashion game with our curated collection of trendy jewelry, accessories, and beauty essentials
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-pink-600 hover:bg-pink-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-full font-semibold"
            >
              Shop Now
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl backdrop-blur-sm border-4 border-white/30">
              <img
                src="/lovable-uploads/92c3d4c5-4569-4d72-8532-d44c1811935a.png"
                alt="ELSO Boutique Fashion"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
