
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-pink-100"
        >
          ← Back to Home
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-center">
          About ELSO Atelier
        </h1>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* About Section */}
          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-pink-700">Our Story</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                ELSO Atelier is a luxury fashion house based in Kisumu, Kenya, dedicated to crafting timeless, elegant designs for the modern woman. We specialize in bespoke bridal gowns, evening wear, red-carpet looks, and ready-to-wear outfits. Every piece is custom-made with precision, creativity, and quality craftsmanship to ensure you not only look stunning but feel confident and empowered.
              </p>
              <br />
              <p className="text-gray-700 leading-relaxed">
                We pride ourselves on excellent customer service, premium fabrics, and attention to detail that ensures every order meets our high standards. Whether you're shopping for your big day or your next standout event, ELSO Atelier is your trusted fashion partner.
              </p>
            </CardContent>
          </Card>

          {/* Deliveries Section */}
          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-pink-700">🚚 Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">We offer reliable and affordable delivery options across Kenya:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <strong>Free delivery</strong> within Kisumu CBD
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <strong>KES 100</strong> for other locations in Kisumu town
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  <strong>KES 300</strong> to all other regions in Kenya
                </li>
              </ul>
              <p className="text-gray-700 mt-4">
                We ship via EasyCoach parcel stations and can also work with your preferred delivery carrier for convenience. Our team ensures timely dispatch and real-time communication for every delivery.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-pink-700">📞 Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium text-gray-900">Location</p>
                      <p className="text-gray-700">Kisumu, Kenya</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <p className="text-gray-700">+254 745 242 174</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-700">elsokisumu@gmail.com</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-pink-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Opening Hours</p>
                      <p className="text-gray-700">Monday to Saturday: 9:00 AM – 6:00 PM</p>
                      <p className="text-gray-700">Sunday: 10:00 AM – 4:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium text-gray-900">Instagram</p>
                      <a 
                        href="https://instagram.com/elsoatelier" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        @elsoatelier
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-pink-700 font-medium mb-2">💬 Customer Support</p>
                <p className="text-gray-700">
                  Need help with sizing, custom orders, or tracking your delivery? Our full-time customer support is here to assist you every step of the way.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Integration Updates Section */}
          <Card className="shadow-lg border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-purple-700">💳 M-Pesa STK Push Integration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  When an STK push is initiated, Supabase Realtime listener monitors transaction status.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                  If payment is successful, user is redirected to Profile > Order History.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></span>
                  If payment fails, user stays on the same page and is prompted to retry.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Only successful paid orders are recorded.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Admin Panel Updates Section */}
          <Card className="shadow-lg border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-pink-50">
              <CardTitle className="text-green-700">⚙️ Admin Panel Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                  Orders now record full customer info: name, email, phone number, and delivery address.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Orders also list all ordered products to ensure smooth delivery.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  Only successful payments are stored, failed ones are ignored.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mr-3 mt-2"></span>
                  Admin dashboard is optimized for mobile and desktop.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
