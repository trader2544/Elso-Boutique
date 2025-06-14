import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, ShoppingBag, MapPin, Phone, CreditCard, Truck, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/hooks/useCart";

const Checkout = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [promptTimer, setPromptTimer] = useState(30);
  const [showBackToShop, setShowBackToShop] = useState(false);
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPaymentPrompt && promptTimer > 0) {
      interval = setInterval(() => {
        setPromptTimer(prev => prev - 1);
      }, 1000);
    } else if (promptTimer === 0) {
      setShowPaymentPrompt(false);
      setPaymentStatus(null);
      setPromptTimer(30);
      if (!paymentStatus || paymentStatus === 'pending') {
        setShowBackToShop(true);
      }
    }
    return () => clearInterval(interval);
  }, [showPaymentPrompt, promptTimer, paymentStatus]);

  useEffect(() => {
    if (!currentOrderId) return;

    console.log("Setting up real-time M-Pesa transaction listener for order:", currentOrderId);
    
    const channel = supabase
      .channel('mpesa-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mpesa_transactions',
          filter: `order_id=eq.${currentOrderId}`,
        },
        async (payload) => {
          console.log('Real-time M-Pesa transaction received:', payload);
          const transaction = payload.new;
          
          if (transaction.status === 'completed' || transaction.response_code === '0') {
            setPaymentStatus('success');
            setPaymentInProgress(false);
            setProcessing(false);
            
            const { error: orderError } = await supabase
              .from("orders")
              .update({ status: 'paid', transaction_id: transaction.id })
              .eq("id", currentOrderId);

            if (orderError) {
              console.error("Error updating order:", orderError);
            }

            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been confirmed and is being processed.",
            });
            
            setTimeout(() => {
              navigate("/profile");
            }, 3000);
          } else {
            setPaymentStatus('failed');
            setPaymentInProgress(false);
            setProcessing(false);
            setCurrentOrderId(null);
            
            toast({
              title: "Payment Failed",
              description: "Your payment was not successful. Please try again.",
              variant: "destructive",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'mpesa_transactions',
          filter: `order_id=eq.${currentOrderId}`,
        },
        async (payload) => {
          console.log('Real-time M-Pesa transaction updated:', payload);
          const transaction = payload.new;
          
          if (transaction.status === 'completed' || transaction.response_code === '0') {
            setPaymentStatus('success');
            setPaymentInProgress(false);
            setProcessing(false);
            
            const { error: orderError } = await supabase
              .from("orders")
              .update({ status: 'paid', transaction_id: transaction.id })
              .eq("id", currentOrderId);

            if (orderError) {
              console.error("Error updating order:", orderError);
            }

            toast({
              title: "Payment Successful! 🎉",
              description: "Your order has been confirmed and is being processed.",
            });
            
            setTimeout(() => {
              navigate("/profile");
            }, 3000);
          } else if (transaction.status === 'failed') {
            setPaymentStatus('failed');
            setPaymentInProgress(false);
            setProcessing(false);
            setCurrentOrderId(null);
            
            toast({
              title: "Payment Failed",
              description: "Your payment was not successful. Please try again.",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time M-Pesa transaction listener");
      supabase.removeChannel(channel);
    };
  }, [currentOrderId, navigate, toast]);

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
      setDeliveryFee(0);
    } else if (city.includes('kisumu')) {
      setDeliveryFee(100);
    } else {
      setDeliveryFee(300);
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
    setShowBackToShop(false);

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

      console.log("Order created:", orderData);
      setCurrentOrderId(orderData.id);
      setPaymentInProgress(true);
      setShowPaymentPrompt(true);
      setPromptTimer(30);

      const { data: stkResponse, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          amount: getFinalTotal(),
          phoneNumber: customerInfo.phone,
          orderId: orderData.id,
        },
      });

      if (stkError) throw stkError;

      if (stkResponse.success) {
        toast({
          title: "Payment Request Sent! 📱",
          description: "Please check your phone for M-Pesa payment prompt and complete the payment.",
        });

        const { error: clearCartError } = await supabase
          .from("cart_items")
          .delete()
          .eq("user_id", user!.id);

        if (clearCartError) {
          console.error("Error clearing cart:", clearCartError);
        } else {
          await refreshCart();
        }
      } else {
        throw new Error("Failed to initiate payment");
      }
    } catch (error: any) {
      console.error("Error processing order:", error);
      setProcessing(false);
      setPaymentInProgress(false);
      setCurrentOrderId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to process order",
        variant: "destructive",
      });
    }
  };

  const handleRetryPayment = async () => {
    if (!currentOrderId) return;

    setProcessing(true);
    setPaymentInProgress(true);
    setShowPaymentPrompt(true);
    setPromptTimer(30);
    setShowBackToShop(false);

    try {
      const { data: stkResponse, error: stkError } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          amount: getFinalTotal(),
          phoneNumber: customerInfo.phone,
          orderId: currentOrderId,
        },
      });

      if (stkError) throw stkError;

      if (stkResponse.success) {
        toast({
          title: "Payment Request Sent Again! 📱",
          description: "Please check your phone for M-Pesa payment prompt and complete the payment.",
        });
      } else {
        throw new Error("Failed to retry payment");
      }
    } catch (error: any) {
      console.error("Error retrying payment:", error);
      setProcessing(false);
      setPaymentInProgress(false);
      setShowPaymentPrompt(false);
      toast({
        title: "Error",
        description: error.message || "Failed to retry payment",
        variant: "destructive",
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) {
      setCustomerInfo({ ...customerInfo, phone: "+254" });
    } else if (digits.startsWith('254')) {
      setCustomerInfo({ ...customerInfo, phone: `+${digits}` });
    } else if (digits.startsWith('0') && digits.length > 1) {
      setCustomerInfo({ ...customerInfo, phone: `+254${digits.substring(1)}` });
    } else if (!digits.startsWith('254')) {
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
          <p className="text-pink-600 font-medium text-base sm:text-lg">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !paymentInProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white text-center py-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Cart is Empty</h2>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <p className="text-gray-700 mb-6 text-base sm:text-lg">Add some items to your cart first.</p>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 relative">
      {/* Payment Status Prompt */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden animate-scale-in">
            <div className="p-6 sm:p-8 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPaymentPrompt(false);
                  setPaymentStatus(null);
                  setPromptTimer(30);
                  setShowBackToShop(true);
                }}
                className="absolute top-4 left-4 rounded-full p-2 hover:bg-gray-100/30"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              {paymentStatus === 'success' ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
                    <p className="text-gray-700 text-base sm:text-lg">Your order has been confirmed and will be processed shortly.</p>
                  </div>
                  <div className="bg-green-50/30 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-green-600 font-medium text-sm sm:text-base">Redirecting to your profile...</p>
                  </div>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">Payment Failed</h3>
                    <p className="text-gray-700 text-base sm:text-lg">Your payment was not successful. Please try again.</p>
                  </div>
                  <Button
                    onClick={handleRetryPayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg"
                  >
                    {processing ? "Retrying..." : "Retry Payment"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-pink-200 border-t-pink-600"></div>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-pink-700 mb-2">Processing Payment</h3>
                    <p className="text-gray-700 text-base sm:text-lg">Please complete the M-Pesa payment on your phone.</p>
                  </div>
                  <div className="bg-pink-50/30 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                      <span className="text-pink-700 font-semibold text-sm sm:text-base">Auto-close in {promptTimer}s</span>
                    </div>
                  </div>
                  <div className="bg-blue-50/30 backdrop-blur-sm p-4 rounded-xl">
                    <p className="text-blue-700 text-xs sm:text-sm font-medium">✨ Live payment tracking enabled - you'll be notified instantly when payment is confirmed!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back to Shop Button */}
      {showBackToShop && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden animate-scale-in">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-pink-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-pink-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-pink-700 mb-3">Continue Shopping?</h3>
              <p className="text-gray-700 mb-8 text-base sm:text-lg">Your order is being processed. Would you like to continue shopping?</p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Back to Shop
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBackToShop(false)}
                  className="w-full border-pink-200 text-pink-700 hover:bg-pink-50/30 py-3 rounded-full text-base sm:text-lg font-semibold"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              disabled={paymentInProgress}
              className="flex items-center space-x-2 hover:bg-pink-50/50 rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              <span className="hidden sm:inline text-pink-600 font-medium text-sm sm:text-base">Back to Cart</span>
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Delivery Information */}
          <div className="xl:col-span-7">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white p-6">
                <h2 className="text-lg sm:text-xl font-bold flex items-center">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                  Delivery Information
                </h2>
              </div>
              <div className="p-6 lg:p-8">
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <Label htmlFor="phone" className="text-pink-700 font-semibold text-base sm:text-lg flex items-center mb-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        M-Pesa Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerInfo.phone}
                        onChange={handlePhoneChange}
                        placeholder="+254700000000"
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl py-3 text-base sm:text-lg bg-white/50 backdrop-blur-sm"
                      />
                      <p className="text-xs sm:text-sm text-pink-600 mt-2 flex items-center">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Enter your phone number for M-Pesa payment
                      </p>
                    </div>
                    
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="text-pink-700 font-semibold text-base sm:text-lg flex items-center mb-3">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Delivery Address *
                      </Label>
                      <Input
                        id="address"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        placeholder="Street address, building, apartment number"
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl py-3 text-base sm:text-lg bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city" className="text-pink-700 font-semibold text-base sm:text-lg mb-3 block">
                        City/Town *
                      </Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        placeholder="Kisumu, Nairobi, Mombasa, etc."
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl py-3 text-base sm:text-lg bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exactLocation" className="text-pink-700 font-semibold text-base sm:text-lg mb-3 block">
                        Exact Location *
                      </Label>
                      <Input
                        id="exactLocation"
                        value={customerInfo.exactLocation}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, exactLocation: e.target.value })}
                        placeholder="CBD, town center, specific area"
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl py-3 text-base sm:text-lg bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {customerInfo.city && customerInfo.exactLocation && (
                    <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 backdrop-blur-sm p-4 rounded-xl border border-blue-200/30">
                      <div className="flex items-center mb-2">
                        <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                        <p className="text-blue-700 font-semibold text-sm sm:text-base">Delivery Zone: {getDeliveryZoneInfo()}</p>
                      </div>
                    </div>
                  )}

                  {!paymentInProgress && (
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white shadow-2xl py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 hover:shadow-pink-300/50 hover:scale-105"
                      disabled={processing}
                    >
                      {processing ? (
                        <div className="flex items-center justify-center">
                          <div className="inline-block animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent mr-3"></div>
                          Processing Payment...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                          Pay with M-Pesa - KSh {getFinalTotal().toLocaleString()}
                        </div>
                      )}
                    </Button>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white p-6">
                  <h2 className="text-lg sm:text-xl font-bold flex items-center">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                    Order Summary
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100/30 backdrop-blur-sm rounded-lg overflow-hidden flex-shrink-0">
                          {item.products.image_url ? (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-pink-300 text-sm">
                              📷
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs sm:text-sm truncate">{item.products.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600 text-sm sm:text-base">
                            KSh {(item.products.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-pink-100 pt-6 space-y-4">
                    <div className="flex justify-between text-base sm:text-lg">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold">KSh {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg">
                      <span className="text-gray-700">Delivery Fee:</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-gray-700"}`}>
                        {getDeliveryFeeText()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xl sm:text-2xl font-bold border-t border-pink-100 pt-4">
                      <span>Total:</span>
                      <span className="text-pink-600">
                        KSh {getFinalTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Payment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-green-50/30 to-emerald-50/30 backdrop-blur-sm border border-green-200/30 rounded-2xl p-4 text-center">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-bold text-green-700 mb-1 text-sm sm:text-base">Secure Payment</h4>
                  <p className="text-xs sm:text-sm text-green-600">M-Pesa with live tracking</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 backdrop-blur-sm border border-blue-200/30 rounded-2xl p-4 text-center">
                  <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-bold text-blue-700 mb-1 text-sm sm:text-base">Fast Delivery</h4>
                  <p className="text-xs sm:text-sm text-blue-600">Free in Kisumu CBD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Support */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/254773482210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Chat with us on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform"
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
