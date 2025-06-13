
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/hooks/useCart";

const Checkout = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    phone: "+254",
    address: "",
    city: "",
    exactLocation: "",
  });
  const [deliveryFee, setDeliveryFee] = useState(0);
  const { cartItems, refreshCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProfile();
      } else {
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    calculateDeliveryFee();
  }, [customerInfo.city, customerInfo.exactLocation]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data.phone) {
        setCustomerInfo(prev => ({ ...prev, phone: data.phone }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const calculateDeliveryFee = () => {
    const city = customerInfo.city.toLowerCase();
    const exactLocation = customerInfo.exactLocation.toLowerCase();
    
    if (city.includes('kisumu') && (exactLocation.includes('cbd') || exactLocation.includes('town center'))) {
      setDeliveryFee(0); // Free delivery within Kisumu CBD
    } else if (city.includes('kisumu')) {
      setDeliveryFee(100); // KES 100 for other locations in Kisumu town
    } else {
      setDeliveryFee(300); // KES 300 for all other regions in Kenya
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const getFinalTotal = () => {
    return getTotalPrice() + deliveryFee;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (!customerInfo.phone || !customerInfo.address || !customerInfo.city || !customerInfo.exactLocation) {
        throw new Error("Please fill in all required fields including exact location");
      }

      const orderProducts = cartItems.map(item => ({
        id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
      }));

      const deliveryLocation = `${customerInfo.address}, ${customerInfo.exactLocation}, ${customerInfo.city}`;

      // Create order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          products: orderProducts,
          total_price: getFinalTotal(),
          customer_phone: customerInfo.phone,
          delivery_location: deliveryLocation,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Trigger STK Push
      const { data: stkResponse, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          amount: getFinalTotal(),
          phoneNumber: customerInfo.phone,
          orderId: orderData.id,
        },
      });

      if (stkError) throw stkError;

      if (stkResponse.success) {
        // Clear cart after successful STK push
        const { error: clearCartError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user!.id);

        if (clearCartError) throw clearCartError;

        await refreshCart();

        toast({
          title: "Payment Request Sent!",
          description: "Please check your phone for M-Pesa payment prompt and complete the payment.",
        });

        // Redirect to profile after a short delay
        setTimeout(() => {
          navigate("/profile");
        }, 3000);
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Error processing order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Always start with +254
    if (digits.length === 0) {
      setCustomerInfo({ ...customerInfo, phone: "+254" });
    } else if (digits.startsWith('254')) {
      setCustomerInfo({ ...customerInfo, phone: `+${digits}` });
    } else if (digits.startsWith('0') && digits.length > 1) {
      // Convert 07... to +2547...
      setCustomerInfo({ ...customerInfo, phone: `+254${digits.substring(1)}` });
    } else if (!digits.startsWith('254')) {
      // Add 254 prefix if not present
      setCustomerInfo({ ...customerInfo, phone: `+254${digits}` });
    } else {
      setCustomerInfo({ ...customerInfo, phone: `+${digits}` });
    }
  };

  const getDeliveryFeeText = () => {
    if (deliveryFee === 0) return "Free";
    return `KSh ${deliveryFee.toLocaleString()}`;
  };

  const getDeliveryZoneInfo = () => {
    if (deliveryFee === 0) return "Kisumu CBD - Free Delivery";
    if (deliveryFee === 100) return "Kisumu Town - KSh 100";
    return "Other Regions - KSh 300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-700">Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Add some items to your cart first.</p>
            <Button onClick={() => navigate("/")} className="w-full bg-gradient-to-r from-pink-500 to-purple-500">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mb-6 hover:bg-pink-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Checkout
        </h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-pink-700">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-pink-700 font-medium">M-Pesa Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={handlePhoneChange}
                    placeholder="+254700000000"
                    required
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <p className="text-sm text-pink-600 mt-1">
                    📱 Enter your phone number for M-Pesa payment
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="address" className="text-pink-700 font-medium">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Street address, building, apartment number"
                    required
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include detailed address for accurate delivery
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="city" className="text-pink-700 font-medium">City/Town *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    placeholder="Kisumu, Nairobi, Mombasa, etc."
                    required
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <Label htmlFor="exactLocation" className="text-pink-700 font-medium">Exact Location *</Label>
                  <Input
                    id="exactLocation"
                    value={customerInfo.exactLocation}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, exactLocation: e.target.value })}
                    placeholder="CBD, town center, specific area/landmark"
                    required
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific (e.g., "CBD", "town center", or exact area) for accurate delivery fee calculation
                  </p>
                </div>

                {customerInfo.city && customerInfo.exactLocation && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">📍 Delivery Zone: {getDeliveryZoneInfo()}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md py-3"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    "💳 Pay with M-Pesa"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="text-pink-700">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-pink-100">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.products.name}</span>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <span className="font-medium">
                      KSh {(item.products.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>KSh {getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span className={deliveryFee === 0 ? "text-green-600" : "text-gray-700"}>
                    {getDeliveryFeeText()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-pink-600">
                    KSh {getFinalTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="font-medium mb-2 text-pink-700">💳 Payment Method</h4>
                <p className="text-sm text-pink-600">
                  M-Pesa STK Push. You will receive a payment prompt on your phone to complete the transaction.
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-medium mb-2 text-purple-700">🚚 Delivery Info</h4>
                <div className="text-sm text-purple-600 space-y-1">
                  <p>• Free delivery within Kisumu CBD</p>
                  <p>• KES 100 for other locations in Kisumu town</p>
                  <p>• KES 300 to all other regions in Kenya</p>
                  <p className="mt-2">You will receive a confirmation call after successful payment.</p>
                </div>
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

export default Checkout;
