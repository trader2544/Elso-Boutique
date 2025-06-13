
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-pink-100"
        >
          ← Back to Home
        </Button>

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            About ELSO Atelier
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Luxury fashion crafted with passion, designed for the modern woman
          </p>
        </div>

        <div className="space-y-8">
          {/* About Section */}
          <Card className="shadow-lg border-pink-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 text-center">
              <CardTitle className="text-pink-700 text-xl md:text-2xl">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    ELSO Atelier is a luxury fashion house based in Kisumu, Kenya, dedicated to crafting timeless, elegant designs for the modern woman. We specialize in bespoke bridal gowns, evening wear, red-carpet looks, and ready-to-wear outfits.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Every piece is custom-made with precision, creativity, and quality craftsmanship to ensure you not only look stunning but feel confident and empowered.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✨</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries Section */}
          <Card className="shadow-lg border-pink-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 text-center">
              <CardTitle className="text-pink-700 text-xl md:text-2xl flex items-center justify-center">
                <span className="mr-2">🚚</span> Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <p className="text-gray-700 mb-6 text-center">We offer reliable and affordable delivery options across Kenya:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold">FREE</span>
                  </div>
                  <h3 className="font-semibold text-green-700 mb-2">Kisumu CBD</h3>
                  <p className="text-sm text-gray-600">Free delivery within Kisumu Central Business District</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">100</span>
                  </div>
                  <h3 className="font-semibold text-blue-700 mb-2">Kisumu Town</h3>
                  <p className="text-sm text-gray-600">KES 100 for other locations in Kisumu</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">300</span>
                  </div>
                  <h3 className="font-semibold text-purple-700 mb-2">Kenya Wide</h3>
                  <p className="text-sm text-gray-600">KES 300 to all other regions in Kenya</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200 text-center">
                <p className="text-pink-700 font-medium mb-2">📦 Shipping Partners</p>
                <p className="text-gray-700 text-sm">
                  We ship via EasyCoach parcel stations and can also work with your preferred delivery carrier for convenience.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="shadow-lg border-pink-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 text-center">
              <CardTitle className="text-pink-700 text-xl md:text-2xl flex items-center justify-center">
                <span className="mr-2">📞</span> Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <MapPin className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Location</p>
                      <p className="text-gray-700">Kisumu, Kenya</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Phone className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Phone</p>
                      <p className="text-gray-700">+254 745 242 174</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Mail className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Email</p>
                      <p className="text-gray-700">elsokisumu@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Clock className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Opening Hours</p>
                      <p className="text-gray-700 text-sm">Monday to Saturday: 9:00 AM – 6:00 PM</p>
                      <p className="text-gray-700 text-sm">Sunday: 10:00 AM – 4:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Instagram</p>
                      <a 
                        href="https://instagram.com/elsoatelier" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 font-medium"
                      >
                        @elsoatelier
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200 text-center">
                <p className="text-pink-700 font-semibold mb-3 text-lg">💬 Customer Support</p>
                <p className="text-gray-700">
                  Need help with sizing, custom orders, or tracking your delivery? Our full-time customer support is here to assist you every step of the way.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WhatsApp Hover Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/254773482210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
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
        </a>
      </div>
    </div>
  );
};

export default AboutUs;
