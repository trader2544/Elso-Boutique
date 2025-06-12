
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
    phone: "",
    address: "",
    city: "",
  });
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

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      if (!customerInfo.phone || !customerInfo.address || !customerInfo.city) {
        throw new Error("Please fill in all required fields");
      }

      const orderProducts = cartItems.map(item => ({
        id: item.products.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
      }));

      // Create order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          products: orderProducts,
          total_price: getTotalPrice(),
          customer_phone: customerInfo.phone,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Trigger STK Push
      const { data: stkResponse, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          amount: getTotalPrice(),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Add some items to your cart first.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/cart")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <Label htmlFor="phone">M-Pesa Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="254700000000"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter phone number for M-Pesa payment (format: 254700000000)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    placeholder="Enter your delivery address"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? "Processing Payment..." : "Pay with M-Pesa"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.products.name} x {item.quantity}
                    </span>
                    <span>
                      KSh {(item.products.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>KSh {getTotalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-pink-600">
                    KSh {getTotalPrice().toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <p className="text-sm text-gray-600">
                  M-Pesa STK Push. You will receive a payment prompt on your phone to complete the transaction.
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Important Notice</h4>
                <p className="text-sm text-gray-600">
                  Orders must be placed through the website. No cash payments accepted. 
                  You will receive a confirmation call after successful payment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
