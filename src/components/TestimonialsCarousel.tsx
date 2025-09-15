
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: string;
  user_name: string;
  description: string;
  images: string[];
  created_at: string;
}

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  useEffect(() => {
    if (selectedTestimonial) {
      const timeout = setTimeout(() => {
        setSelectedTestimonial(null);
        setIsAutoPlaying(true);
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [selectedTestimonial]);

  const fetchTestimonials = async () => {
    try {
      // Mock testimonials since the table doesn't exist yet
      const mockTestimonials: Testimonial[] = [
        {
          id: "1",
          user_name: "Sarah Johnson",
          description: "Amazing quality and beautiful designs! I love shopping at Elso Boutique.",
          images: ["https://images.unsplash.com/photo-1494790108755-2616b2e88e37?w=400"],
          created_at: new Date().toISOString(),
        },
        {
          id: "2", 
          user_name: "Mary Atieno",
          description: "Fast delivery and excellent customer service. Highly recommended!",
          images: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"],
          created_at: new Date().toISOString(),
        }
      ];
      setTestimonials(mockTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    }
  };

  const handleTestimonialClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setCurrentImageIndex(0);
    setIsAutoPlaying(false);
  };

  const nextImage = () => {
    if (selectedTestimonial) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedTestimonial.images.length);
    }
  };

  const prevImage = () => {
    if (selectedTestimonial) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedTestimonial.images.length - 1 : prev - 1
      );
    }
  };

  if (testimonials.length === 0) {
    return null;
  }

  if (selectedTestimonial) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              What Our Clients Say
            </h2>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={selectedTestimonial.images[currentImageIndex]}
                    alt={`${selectedTestimonial.user_name} testimonial`}
                    className="w-full h-96 object-cover"
                  />
                  {selectedTestimonial.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                    "{selectedTestimonial.description}"
                  </p>
                  <p className="font-semibold text-pink-600">
                    - {selectedTestimonial.user_name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          What Our Clients Say
        </h2>
        
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-full flex-shrink-0 px-4"
                onClick={() => handleTestimonialClick(testimonial)}
              >
                <Card className="max-w-2xl mx-auto cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.images[0]}
                        alt={testimonial.user_name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{testimonial.user_name}</h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      "{testimonial.description}"
                    </p>
                    {testimonial.images.length > 1 && (
                      <p className="text-sm text-pink-600 mt-3">
                        Click to view {testimonial.images.length} images
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-pink-600' : 'bg-gray-300'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
