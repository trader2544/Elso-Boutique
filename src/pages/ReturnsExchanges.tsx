
import { ArrowLeft, RotateCcw, MessageCircle, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ReturnsExchanges = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Exchanges</h1>
          <p className="text-lg text-gray-600">
            Your satisfaction is our priority. Learn about our return and exchange policy.
          </p>
        </div>

        <div className="space-y-8">
          {/* Important Notice */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Important:</strong> Returns and exchanges are only accepted upon delivery. 
              Please inspect your items immediately when they arrive.
            </AlertDescription>
          </Alert>

          {/* Return Process */}
          <Card className="shadow-lg border-pink-100">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-pink-700">
                <RotateCcw className="w-6 h-6 mr-3" />
                Return & Exchange Process
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    <span className="block w-6 h-6 text-blue-600 font-bold text-center">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Inspect Upon Delivery
                    </h3>
                    <p className="text-gray-600">
                      Carefully examine your items immediately when they arrive. Check for any damages, 
                      defects, or if the item doesn't match what you ordered.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <span className="block w-6 h-6 text-green-600 font-bold text-center">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Contact Admin with Proof
                    </h3>
                    <p className="text-gray-600 mb-3">
                      If you need to return or exchange an item, contact our admin immediately with:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Clear photos of the item</li>
                      <li>• Photos of any defects or damages</li>
                      <li>• Your order number</li>
                      <li>• Reason for return/exchange</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                    <span className="block w-6 h-6 text-purple-600 font-bold text-center">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Await Admin Approval
                    </h3>
                    <p className="text-gray-600">
                      Our admin will review your request and the provided proof. The return/exchange 
                      process only begins after admin approval.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                    <span className="block w-6 h-6 text-orange-600 font-bold text-center">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Process Completion
                    </h3>
                    <p className="text-gray-600">
                      Once approved, we'll guide you through the return process and arrange for 
                      replacement or refund as appropriate.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligible Items */}
          <Card className="shadow-lg border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="flex items-center text-2xl text-green-700">
                <CheckCircle className="w-6 h-6 mr-3" />
                Eligible for Returns & Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-3">We Accept Returns For:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Damaged items during shipping</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Manufacturing defects</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Wrong item sent</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Significantly different from description</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Exchange Options:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-blue-500" />
                      <span>Different size of same item</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-blue-500" />
                      <span>Different color of same item</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-blue-500" />
                      <span>Store credit for different item</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <RotateCcw className="w-4 h-4 text-blue-500" />
                      <span>Refund (case by case basis)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Limits */}
          <Card className="shadow-lg border-orange-100">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
              <CardTitle className="flex items-center text-2xl text-orange-700">
                <Clock className="w-6 h-6 mr-3" />
                Important Time Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">Critical Timeline:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-700">
                      <strong>Upon Delivery:</strong> Inspect items immediately
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-700">
                      <strong>Same Day:</strong> Contact admin if issues found
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-orange-700">
                      <strong>Maximum 24 Hours:</strong> Final deadline for return requests
                    </span>
                  </div>
                </div>
              </div>
              
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Note:</strong> Returns are NOT accepted after 24 hours from delivery. 
                  Please ensure you inspect and report any issues immediately.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl text-indigo-700">
                <MessageCircle className="w-6 h-6 mr-3" />
                Need to Return or Exchange?
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Found an issue with your order? Contact our admin immediately with proof photos 
                  and your concerns. We're here to make it right!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleContactAdmin}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Admin on WhatsApp
                  </Button>
                  
                  <Button
                    onClick={() => navigate("/contact")}
                    variant="outline"
                    className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    size="lg"
                  >
                    Other Contact Methods
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500">
                  Phone: +254 745 242174 | Email: elsokisumu@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="shadow-lg border-pink-100">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-2xl text-pink-700">Your Satisfaction Matters</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-center">
                At Elso Boutique, we stand behind the quality of our products. While we have specific 
                policies to ensure fairness, we're committed to resolving any genuine issues with your 
                purchase. Your satisfaction and trust in our brand is our top priority.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReturnsExchanges;
