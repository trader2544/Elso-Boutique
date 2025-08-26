
import { ArrowLeft, Truck, MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ShippingInfo = () => {
  const navigate = useNavigate();

  const handleContactAdmin = () => {
    window.open('https://wa.me/254745242174', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
          <p className="text-lg text-gray-600">
            Fast and reliable delivery across Kenya
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Shipping Method */}
          <Card className="shadow-lg border-pink-100">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-pink-700">
                <Truck className="w-6 h-6 mr-3" />
                Our Primary Shipping Partner
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Coach</h3>
                  <p className="text-gray-600 mb-4">
                    We primarily use Easy Coach for reliable and efficient delivery services across Kenya. 
                    Easy Coach has an extensive network that covers most major towns and cities.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Coverage:</strong> Easy Coach reaches major towns and cities across Kenya, 
                      making it our preferred shipping method for most destinations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Methods */}
          <Card className="shadow-lg border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center text-2xl text-purple-700">
                <MessageCircle className="w-6 h-6 mr-3" />
                Alternative Shipping Options
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Areas Not Covered by Easy Coach
                  </h3>
                  <p className="text-gray-600 mb-3">
                    If Easy Coach doesn't reach your location, don't worry! We'll find the best alternative for you.
                  </p>
                  <Button
                    onClick={handleContactAdmin}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Admin for Alternatives
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Prefer a Different Method?
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Even if Easy Coach serves your area, you can choose alternative shipping methods 
                    that work better for you. Just reach out to discuss your preferences.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Fees */}
          <Card className="shadow-lg border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-green-700">
                <MapPin className="w-6 h-6 mr-3" />
                Shipping Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <MapPin className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Kisumu CBD</h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">FREE</p>
                  <p className="text-sm text-green-700">No delivery charges within Kisumu CBD</p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg text-center">
                  <Truck className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Around Kisumu Town</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-2">KSh 100</p>
                  <p className="text-sm text-blue-700">Delivery within Kisumu Town area</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg text-center">
                  <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Other Locations</h3>
                  <p className="text-3xl font-bold text-purple-600 mb-2">KSh 300</p>
                  <p className="text-sm text-purple-700">Flat rate regardless of distance</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Shipping fees are automatically calculated during checkout 
                  based on your delivery location. The flat rate of KSh 300 applies to all locations 
                  outside Kisumu Town, regardless of the distance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Timeline */}
          <Card className="shadow-lg border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardTitle className="flex items-center text-2xl text-orange-700">
                <Clock className="w-6 h-6 mr-3" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Standard Delivery</h3>
                    <p className="text-gray-600">1 to 3 business days depending on your location</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Delivery Time Factors:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Location distance from Kisumu</li>
                    <li>• Shipping method availability</li>
                    <li>• Weather and road conditions</li>
                    <li>• Holiday seasons may cause slight delays</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-indigo-700">
                <Phone className="w-6 h-6 mr-3" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">M-Pesa</h3>
                  <p className="text-gray-600">
                    We accept M-Pesa payments for all orders. Secure, fast, and convenient mobile money transactions.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>How it works:</strong> After placing your order, you'll receive M-Pesa payment 
                  instructions. Once payment is confirmed, we'll process and ship your order immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact for Questions */}
          <Card className="shadow-lg border-pink-100">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-2xl text-pink-700">Have Questions?</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">
                Need clarification about shipping to your area or have special delivery requirements? 
                We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleContactAdmin}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
                <Button
                  onClick={() => navigate("/contact")}
                  variant="outline"
                  className="border-pink-300 text-pink-600 hover:bg-pink-50"
                >
                  Contact Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
