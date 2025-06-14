
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Instagram, Heart, Sparkles, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-rose-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-50 animate-bounce"></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-rose-200 rounded-full opacity-40"></div>
      <div className="absolute bottom-40 right-10 w-12 h-12 bg-pink-300 rounded-full opacity-70 animate-pulse"></div>
      
      <div className="container mx-auto px-4 py-6 md:py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-pink-100 text-pink-600 font-medium"
        >
          ← Back to Home
        </Button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <Sparkles className="w-8 h-8 text-pink-500 mr-2" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
              ELSO Atelier
            </h1>
            <Sparkles className="w-8 h-8 text-pink-500 ml-2" />
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Where dreams meet fashion ✨ Your luxury fashion destination in the heart of Kenya
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* About Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-pink-50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 relative">
              <CardTitle className="text-2xl font-bold text-pink-700 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-pink-500" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    ELSO Atelier is a luxury fashion house based in Kisumu, Kenya, dedicated to crafting timeless, elegant designs for the modern woman. We specialize in bespoke bridal gowns, evening wear, red-carpet looks, and ready-to-wear outfits.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Every piece is custom-made with precision, creativity, and quality craftsmanship to ensure you not only look stunning but feel confident and empowered.
                  </p>
                  <div className="flex items-center space-x-4 pt-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-2 text-sm text-gray-600">Premium Quality</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-64 h-64 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center shadow-2xl">
                    <div className="w-56 h-56 rounded-full bg-white flex items-center justify-center">
                      <span className="text-6xl">👗</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-purple-50 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
            <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <CardTitle className="text-2xl font-bold text-purple-700 flex items-center">
                <span className="text-2xl mr-2">🚚</span>
                Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 mb-6 text-lg">We offer reliable and affordable delivery options across Kenya:</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🆓</span>
                    </div>
                    <h3 className="font-bold text-green-700 mb-2">Kisumu CBD</h3>
                    <p className="text-green-600 text-lg font-semibold">FREE</p>
                    <p className="text-sm text-green-600">Delivery within CBD</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🏙️</span>
                    </div>
                    <h3 className="font-bold text-blue-700 mb-2">Kisumu Town</h3>
                    <p className="text-blue-600 text-lg font-semibold">KES 100</p>
                    <p className="text-sm text-blue-600">Other locations</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">🇰🇪</span>
                    </div>
                    <h3 className="font-bold text-purple-700 mb-2">All Kenya</h3>
                    <p className="text-purple-600 text-lg font-semibold">KES 300</p>
                    <p className="text-sm text-purple-600">Nationwide delivery</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
                <p className="text-gray-700 text-center">
                  💫 We ship via EasyCoach parcel stations and can also work with your preferred delivery carrier for convenience. Our team ensures timely dispatch and real-time communication for every delivery.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-rose-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full -translate-y-20 -translate-x-20 opacity-50"></div>
            <CardHeader className="bg-gradient-to-r from-rose-100 to-pink-100 relative">
              <CardTitle className="text-2xl font-bold text-rose-700 flex items-center">
                <span className="text-2xl mr-2">📞</span>
                Get In Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Location</p>
                      <p className="text-gray-700">Kisumu, Kenya 🇰🇪</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Phone</p>
                      <p className="text-gray-700">+254 745 242 174</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl">
                    <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Email</p>
                      <p className="text-gray-700">elsokisumu@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Instagram</p>
                      <a 
                        href="https://instagram.com/elsoatelier" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 font-semibold"
                      >
                        @elsoatelier
                      </a>
                    </div>
                  </div>
                </div>

                {/* Opening Hours & Support */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-purple-600 mr-2" />
                      <h3 className="font-bold text-purple-700">Opening Hours</h3>
                    </div>
                    <div className="space-y-2 text-gray-700">
                      <p>📅 Monday to Saturday</p>
                      <p className="text-lg font-semibold text-purple-600">9:00 AM – 6:00 PM</p>
                      <p>📅 Sunday</p>
                      <p className="text-lg font-semibold text-purple-600">10:00 AM – 4:00 PM</p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-2">💬</span>
                      <h3 className="font-bold text-pink-700">Customer Support</h3>
                    </div>
                    <p className="text-gray-700">
                      Need help with sizing, custom orders, or tracking your delivery? Our full-time customer support is here to assist you every step of the way! ✨
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/254773482210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Chat with us on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="ml-2 hidden group-hover:block text-sm font-medium">Chat with us!</span>
        </a>
      </div>
    </div>
  );
};

export default AboutUs;
