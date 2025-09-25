
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const scrollToCategories = () => {
    const categoriesSection = document.querySelector('.shop-categories');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-[35vh] md:h-[40vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/lovable-uploads/2628dc36-6cb0-4db9-8729-b73f1e8362e4.png"
          alt="Hero Background"
          className="w-full h-full object-cover object-top"
        />
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content - Positioned at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-12 md:pb-20">
        <div className="container mx-auto px-4">
          {/* Text positioned bottom-left on desktop, bottom-center on mobile */}
          <div className="text-center md:text-left md:max-w-2xl">
            {/* Brand Name - with gradient color */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light mb-4 tracking-wide bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              ELSO BOUTIQUE
            </h1>
            
            {/* Tagline - with golden color */}
            <p className="text-sm md:text-base font-light tracking-widest uppercase mb-8 opacity-90 text-yellow-300">
              The Latest Luxury Women's Fashion
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 text-sm md:text-base font-medium tracking-wide min-w-[160px]"
                onClick={scrollToCategories}
              >
                SHOP NOW
              </Button>
              
              <Link to="/auth">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 px-8 py-3 text-sm md:text-base font-medium tracking-wide min-w-[160px]"
                >
                  SIGN IN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
