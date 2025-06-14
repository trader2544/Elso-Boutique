
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Heart } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
          <p className="text-pink-600 font-medium text-base sm:text-lg">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white text-center py-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Sign In Required</h2>
          </div>
          <div className="p-6 sm:p-8 text-center">
            <p className="text-gray-700 mb-6 text-base sm:text-lg">Please sign in to view your cart and start shopping.</p>
            <Button 
              onClick={() => navigate("/auth")} 
              className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 hover:bg-pink-50/50 rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              <span className="hidden sm:inline text-pink-600 font-medium text-sm sm:text-base">Continue Shopping</span>
            </Button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
              Shopping Cart ({cartItems.length})
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600 mb-4"></div>
            <p className="text-pink-600 font-medium text-base sm:text-lg">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
              <div className="text-center py-12 sm:py-16 px-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-pink-100/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-pink-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8 text-base sm:text-lg">Discover amazing products and start shopping!</p>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  Start Shopping
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-20 h-20 sm:h-20 bg-gradient-to-br from-pink-100/30 to-pink-50/30 backdrop-blur-sm rounded-xl overflow-hidden flex-shrink-0 relative group">
                        {item.products.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-pink-300 text-xl sm:text-2xl">
                            📷
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 mb-2 line-clamp-2">{item.products.name}</h3>
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600">
                            KSh {item.products.price.toLocaleString()}
                          </span>
                          {!item.products.in_stock && (
                            <span className="bg-red-100 text-red-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                              Out of stock
                            </span>
                          )}
                        </div>

                        {/* Mobile Layout */}
                        <div className="sm:hidden space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isLoading}
                                className="h-8 w-8 rounded-lg hover:bg-pink-100/30"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isLoading}
                                className="h-8 w-8 rounded-lg hover:bg-pink-100/30"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              disabled={isLoading}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50/30 rounded-lg p-2"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                              KSh {(item.products.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center space-x-6">
                        <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-xl p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="h-10 w-10 rounded-lg hover:bg-pink-100/30"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-0 bg-transparent font-semibold text-sm sm:text-base"
                            min="1"
                            disabled={isLoading}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="h-10 w-10 rounded-lg hover:bg-pink-100/30"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[120px]">
                          <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                            KSh {(item.products.price * item.quantity).toLocaleString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50/30 rounded-lg text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white p-6">
                    <h2 className="text-lg sm:text-xl font-bold flex items-center">
                      <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      Order Summary
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-gray-700">Subtotal ({cartItems.length} items):</span>
                        <span className="font-semibold">KSh {getTotalPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-gray-700">Shipping:</span>
                        <span className="font-semibold text-green-600">Free</span>
                      </div>
                      <div className="border-t border-pink-100 pt-4">
                        <div className="flex justify-between text-xl sm:text-2xl font-bold">
                          <span>Total:</span>
                          <span className="text-pink-600">
                            KSh {getTotalPrice().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={proceedToCheckout}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                        disabled={cartItems.some(item => !item.products.in_stock) || isLoading}
                      >
                        Proceed to Checkout
                      </Button>
                      
                      {cartItems.some(item => !item.products.in_stock) && (
                        <div className="bg-red-50/30 backdrop-blur-sm border border-red-200/30 rounded-xl p-4">
                          <p className="text-red-600 text-sm font-medium text-center">
                            ⚠️ Remove out of stock items to proceed
                          </p>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-pink-50/30 to-purple-50/30 backdrop-blur-sm rounded-xl p-4">
                        <div className="text-center">
                          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-pink-600">
                            Free shipping on all orders
                          </p>
                          <p className="text-xs text-pink-500 mt-1">
                            30-day return policy
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
