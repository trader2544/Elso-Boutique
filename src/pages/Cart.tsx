
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Heart, Star, Shield, Phone, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

const Cart = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { cartItems, updateQuantity, removeFromCart, isLoading } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.products.price * item.quantity);
    }, 0);
  };

  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-white/10 to-pink-100/30 backdrop-blur-3xl flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-pink-300/30 border-t-pink-500"></div>
          <p className="text-pink-600 font-medium text-xs">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-white/10 to-pink-100/30 backdrop-blur-3xl flex items-center justify-center p-2">
        <div className="w-full max-w-xs mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500/80 to-pink-400/80 backdrop-blur-xl text-white text-center py-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-pink-50">Sign In Required</h2>
          </div>
          <div className="p-4 text-center">
            <p className="text-pink-600 mb-4 text-xs">Please sign in to view your cart and start shopping.</p>
            <Button 
              onClick={() => navigate("/auth")} 
              className="w-full bg-gradient-to-r from-pink-500/80 to-pink-400/80 hover:from-pink-600/80 hover:to-pink-500/80 text-white py-2 rounded-lg text-xs font-semibold backdrop-blur-xl border border-pink-300/20"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/20 via-white/10 to-pink-100/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <div className="container mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-1 hover:bg-pink-50/20 rounded-lg px-2 py-1 backdrop-blur-xl"
            >
              <ArrowLeft className="w-3 h-3 text-pink-600" />
              <span className="hidden sm:inline text-pink-600 font-medium text-xs">Continue Shopping</span>
            </Button>
            <h1 className="text-sm font-bold text-pink-600">
              Cart ({cartItems.length})
            </h1>
            <div className="w-12"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 py-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-pink-300/30 border-t-pink-500 mb-2"></div>
            <p className="text-pink-600 font-medium text-xs">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="max-w-xs mx-auto">
            <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl rounded-xl overflow-hidden">
              <CardContent className="text-center py-8 px-4">
                <div className="w-12 h-12 bg-pink-100/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-pink-400" />
                </div>
                <h2 className="text-sm font-bold text-pink-600 mb-2">Your cart is empty</h2>
                <p className="text-pink-500 mb-4 text-xs">Discover amazing products and start shopping!</p>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-pink-500/80 to-pink-400/80 hover:from-pink-600/80 hover:to-pink-500/80 text-white px-4 py-2 rounded-lg text-xs font-semibold backdrop-blur-xl border border-pink-300/20"
                >
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Cart Items Card */}
            <div className="lg:col-span-8">
              <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-500/20 to-pink-400/20 backdrop-blur-xl border-b border-white/10 py-2">
                  <CardTitle className="text-sm font-bold flex items-center text-pink-600">
                    <ShoppingBag className="w-3 h-3 mr-1" />
                    Cart Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                      {/* Product Image */}
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-100/10 to-pink-50/10 backdrop-blur-sm rounded-md overflow-hidden flex-shrink-0">
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

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-pink-600 truncate">{item.products.name}</p>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <span className="text-xs font-bold text-pink-500">
                            KSh {item.products.price.toLocaleString()}
                          </span>
                          {!item.products.in_stock && (
                            <span className="bg-red-100/20 text-red-400 px-1 py-0.5 rounded-full text-xs font-medium backdrop-blur-xl">
                              Out of stock
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-pink-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-0.5 bg-white/5 backdrop-blur-xl rounded-md p-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="h-5 w-5 rounded-sm hover:bg-pink-100/20"
                          >
                            <Minus className="w-2 h-2" />
                          </Button>
                          <span className="w-5 text-center font-semibold text-xs text-pink-600">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="h-5 w-5 rounded-sm hover:bg-pink-100/20"
                          >
                            <Plus className="w-2 h-2" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs font-bold text-pink-600">
                            KSh {(item.products.price * item.quantity).toLocaleString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isLoading}
                            className="text-red-400 hover:text-red-300 hover:bg-red-50/10 rounded-sm text-xs p-0.5 mt-0.5"
                          >
                            <Trash2 className="w-2 h-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-16 space-y-3">
                <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-pink-500/20 to-pink-400/20 backdrop-blur-xl border-b border-white/10 py-2">
                    <CardTitle className="text-sm font-bold flex items-center text-pink-600">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-pink-500">Subtotal ({cartItems.length} items):</span>
                        <span className="font-semibold text-pink-600">KSh {getTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="border-t border-pink-100/20 pt-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-pink-600">Total:</span>
                          <span className="text-pink-600">
                            KSh {getTotalPrice().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={proceedToCheckout}
                      className="w-full bg-gradient-to-r from-pink-500/80 to-pink-400/80 hover:from-pink-600/80 hover:to-pink-500/80 text-white py-2 rounded-lg text-xs font-bold backdrop-blur-xl border border-pink-300/20"
                      disabled={cartItems.some(item => !item.products.in_stock) || isLoading}
                    >
                      Proceed to Checkout
                    </Button>
                    
                    {cartItems.some(item => !item.products.in_stock) && (
                      <div className="bg-red-50/10 backdrop-blur-xl border border-red-200/20 rounded-lg p-2">
                        <p className="text-red-400 text-xs font-medium text-center">
                          ⚠️ Remove out of stock items to proceed
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Store Features Card */}
                <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-400/20 backdrop-blur-xl border-b border-white/10 py-1">
                    <CardTitle className="text-xs font-bold flex items-center text-pink-600">
                      <Heart className="w-3 h-3 mr-1" />
                      Why Choose Us?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    <div className="flex items-start space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xs text-pink-600">Premium Quality</h4>
                        <p className="text-xs text-pink-500">Top-quality products carefully selected</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-1">
                      <Shield className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xs text-pink-600">Premium Packaging</h4>
                        <p className="text-xs text-pink-500">Secure & elegant packaging</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-1">
                      <div className="w-3 h-3 bg-green-500/80 rounded text-white text-xs flex items-center justify-center mt-0.5 font-bold flex-shrink-0">
                        M
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-pink-600">M-Pesa Payment</h4>
                        <p className="text-xs text-pink-500">Easy & secure mobile payments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-1">
                      <Phone className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xs text-pink-600">24/7 Customer Care</h4>
                        <p className="text-xs text-pink-500">Full-time support via call or WhatsApp</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-1">
                      <TrendingUp className="w-3 h-3 text-pink-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-xs text-pink-600">Trusted Store</h4>
                        <p className="text-xs text-pink-500">Popular choice among thousands</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
