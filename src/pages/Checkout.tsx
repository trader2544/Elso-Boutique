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
      <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-white/10 to-pink-100/30 backdrop-blur-3xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-pink-300/30 border-t-pink-500"></div>
          <p className="text-pink-600 font-medium text-xs">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !paymentInProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-white/10 to-pink-100/30 backdrop-blur-3xl flex items-center justify-center p-2">
        <div className="w-full max-w-xs mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500/80 to-pink-400/80 backdrop-blur-xl text-white text-center py-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-pink-50">Cart is Empty</h2>
          </div>
          <div className="p-4 text-center">
            <p className="text-pink-600 mb-4 text-xs">Add some items to your cart first.</p>
            <Button 
              onClick={() => navigate("/")} 
              className="w-full bg-gradient-to-r from-pink-500/80 to-pink-400/80 hover:from-pink-600/80 hover:to-pink-500/80 text-white py-2 rounded-lg text-xs font-semibold backdrop-blur-xl border border-pink-300/20"
            >
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-white/10 to-pink-100/30 backdrop-blur-3xl relative">
      {/* Payment Status Prompt */}
      {showPaymentPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="w-full max-w-xs bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden animate-scale-in">
            <div className="p-4 text-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPaymentPrompt(false);
                  setPaymentStatus(null);
                  setPromptTimer(30);
                  setShowBackToShop(true);
                }}
                className="absolute top-2 left-2 rounded-full p-1 hover:bg-gray-100/30 w-6 h-6"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
              
              {paymentStatus === 'success' ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-green-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-green-700 mb-1">Payment Successful!</h3>
                    <p className="text-gray-700 text-xs">Your order has been confirmed and will be processed shortly.</p>
                  </div>
                  <div className="bg-green-50/30 backdrop-blur-sm rounded-lg p-2">
                    <p className="text-green-600 font-medium text-xs">Redirecting to your profile...</p>
                  </div>
                </div>
              ) : paymentStatus === 'failed' ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-red-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-700 mb-1">Payment Failed</h3>
                    <p className="text-gray-700 text-xs">Your payment was not successful. Please try again.</p>
                  </div>
                  <Button
                    onClick={handleRetryPayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-pink-500/80 to-pink-400/80 hover:from-pink-600/80 hover:to-pink-500/80 text-white py-2 rounded-lg text-xs font-semibold backdrop-blur-xl border border-pink-300/20"
                  >
                    {processing ? "Retrying..." : "Retry Payment"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-pink-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-pink-300/30 border-t-pink-500"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-pink-700 mb-1">Processing Payment</h3>
                    <p className="text-gray-700 text-xs">Please complete the M-Pesa payment on your phone.</p>
                  </div>
                  <div className="bg-pink-50/30 backdrop-blur-sm p-2 rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Clock className="w-3 h-3 text-pink-600" />
                      <span className="text-pink-700 font-semibold text-xs">Auto-close in {promptTimer}s</span>
                    </div>
                  </div>
                  <div className="bg-blue-50/30 backdrop-blur-sm p-2 rounded-lg">
                    <p className="text-blue-700 text-xs font-medium">✨ Live payment tracking enabled - you'll be notified instantly when payment is confirmed!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back to Shop Button */}
      {showBackToShop && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="w-full max-w-xs bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden animate-scale-in">
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-pink-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-sm font-bold text-pink-700 mb-2">Continue Shopping?</h3>
              <p className="text-gray-700 mb-4 text-xs">Your order is being processed. Would you like to continue shopping?</p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-pink-500/80 to-pink-400/80 hover:from-pink-600/80 hover:to-pink-500/80 text-white py-2 rounded-lg text-xs font-semibold backdrop-blur-xl border border-pink-300/20"
                >
                  <ShoppingBag className="w-3 h-3 mr-1" />
                  Back to Shop
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBackToShop(false)}
                  className="w-full border-pink-200/50 text-pink-700 hover:bg-pink-50/30 py-2 rounded-lg text-xs font-semibold backdrop-blur-xl"
                >
                  Stay Here
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="container mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              disabled={paymentInProgress}
              className="flex items-center space-x-1 hover:bg-pink-50/20 rounded-lg px-2 py-1 backdrop-blur-xl"
            >
              <ArrowLeft className="w-3 h-3 text-pink-600" />
              <span className="hidden sm:inline text-pink-600 font-medium text-xs">Back to Cart</span>
            </Button>
            <h1 className="text-sm font-bold text-pink-600">
              Secure Checkout
            </h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Delivery Information */}
          <div className="lg:col-span-7">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500/20 to-pink-400/20 backdrop-blur-xl text-pink-600 p-3 border-b border-white/10">
                <h2 className="text-sm font-bold flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  Delivery Information
                </h2>
              </div>
              <div className="p-3">
                <form onSubmit={handleCheckout} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="text-pink-700 font-semibold text-xs flex items-center mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        Delivery Address *
                      </Label>
                      <Input
                        id="address"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                        placeholder="Street address, building, apartment number"
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-lg py-2 text-xs bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="city" className="text-pink-700 font-semibold text-xs mb-1 block">
                        City/Town *
                      </Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                        placeholder="Kisumu, Nairobi, Mombasa, etc."
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-lg py-2 text-xs bg-white/50 backdrop-blur-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exactLocation" className="text-pink-700 font-semibold text-xs mb-1 block">
                        Exact Location *
                      </Label>
                      <Input
                        id="exactLocation"
                        value={customerInfo.exactLocation}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, exactLocation: e.target.value })}
                        placeholder="CBD, town center, specific area"
                        required
                        disabled={paymentInProgress}
                        className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-lg py-2 text-xs bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {customerInfo.city && customerInfo.exactLocation && (
                    <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 backdrop-blur-sm p-2 rounded-lg border border-blue-200/30">
                      <div className="flex items-center mb-1">
                        <Truck className="w-3 h-3 text-blue-600 mr-1" />
                        <p className="text-blue-700 font-semibold text-xs">Delivery Zone: {getDeliveryZoneInfo()}</p>
                      </div>
                    </div>
                  )}

                  {/* Phone Number Field - Moved to just before payment button */}
                  <div className="space-y-3 pt-3 border-t border-pink-100/20">
                    <div>
                      <Label htmlFor="phone" className="text-pink-700 font-semibold text-xs flex items-center mb-1">
                        <Phone className="w-3 h-3 mr-1" />
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
                        className="border-green-200 focus:border-green-400 focus:ring-green-400 rounded-lg py-2 text-xs bg-white/50 backdrop-blur-sm"
                      />
                      <p className="text-xs text-green-600 mt-1 flex items-center">
                        <CreditCard className="w-2 h-2 mr-1" />
                        This number will receive an STK push for payment
                      </p>
                    </div>

                    {!paymentInProgress && (
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-2xl py-2 rounded-lg text-xs font-bold"
                        disabled={processing}
                      >
                        {processing ? (
                          <div className="flex items-center justify-center">
                            <div className="inline-block animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2"></div>
                            Processing Payment...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <CreditCard className="w-3 h-3 mr-2" />
                            Pay with M-Pesa - KSh {getFinalTotal().toLocaleString()}
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-16 space-y-3">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500/20 to-pink-400/20 backdrop-blur-xl text-pink-600 p-3 border-b border-white/10">
                  <h2 className="text-sm font-bold flex items-center">
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Order Summary
                  </h2>
                </div>
                <div className="p-3 space-y-3">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <div className="w-8 h-8 bg-pink-100/30 backdrop-blur-sm rounded-md overflow-hidden flex-shrink-0">
                          {item.products.image_url ? (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-pink-300 text-xs">
                              📷
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate text-pink-600">{item.products.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600 text-xs">
                            KSh {(item.products.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-pink-100/20 pt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold text-pink-600">KSh {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-700">Delivery Fee:</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-gray-700"}`}>
                        {getDeliveryFeeText()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-pink-100/20 pt-2">
                      <span className="text-pink-600">Total:</span>
                      <span className="text-pink-600">
                        KSh {getFinalTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Payment Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-r from-green-50/30 to-emerald-50/30 backdrop-blur-sm border border-green-200/30 rounded-lg p-2 text-center">
                  <Shield className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <h4 className="font-bold text-green-700 mb-0.5 text-xs">Secure Payment</h4>
                  <p className="text-xs text-green-600">M-Pesa with live tracking</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 backdrop-blur-sm border border-blue-200/30 rounded-lg p-2 text-center">
                  <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <h4 className="font-bold text-blue-700 mb-0.5 text-xs">Fast Delivery</h4>
                  <p className="text-xs text-blue-600">Free in Kisumu CBD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Support */}
      <div className="fixed bottom-4 right-4 z-40">
        <a
          href="https://wa.me/254773482210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Chat with us on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 group-hover:scale-110 transition-transform"
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
