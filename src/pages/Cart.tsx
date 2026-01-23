import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Heart, Star, Shield, Phone, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

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
        <motion.div 
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          <p className="text-pink-600 font-medium">Loading your cart...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-2xl shadow-pink-200/40 bg-white/90 backdrop-blur-xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-600 to-pink-500 text-white text-center py-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Sign In Required</h2>
            </div>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-6">Please sign in to view your cart and start shopping.</p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6 font-bold uppercase tracking-wider"
              >
                Sign In Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-pink-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:bg-pink-50 text-pink-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Continue Shopping</span>
            </Button>
            <h1 className="text-lg font-bold text-gray-900">
              Shopping Bag ({cartItems.length})
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl text-center py-12">
              <CardContent>
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-pink-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your bag is empty</h2>
                <p className="text-gray-500 mb-8">Discover amazing products and start shopping!</p>
                <Button 
                  onClick={() => navigate("/")}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 font-bold uppercase tracking-wider"
                >
                  Start Shopping
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-xl overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex gap-4">
                          {/* Product Image */}
                          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.products.image_url ? (
                              <img
                                src={item.products.image_url}
                                alt={item.products.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                              {item.products.name}
                            </h3>
                            <p className="text-pink-600 font-bold text-lg mb-3">
                              KSh {item.products.price.toLocaleString()}
                            </p>
                            
                            {!item.products.in_stock && (
                              <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded mb-2">
                                Out of stock
                              </span>
                            )}

                            <div className="flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isLoading}
                                  className="h-8 w-8 p-0 hover:bg-white"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={isLoading}
                                  className="h-8 w-8 p-0 hover:bg-white"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                disabled={isLoading}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right hidden sm:block">
                            <p className="text-lg font-bold text-gray-900">
                              KSh {(item.products.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-xl">
                  <CardHeader className="pb-4 border-b border-gray-100">
                    <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium">KSh {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      <span className="font-medium text-green-600">Calculated at checkout</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-pink-600">KSh {getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      onClick={proceedToCheckout}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6 font-bold uppercase tracking-wider group"
                      disabled={cartItems.some(item => !item.products.in_stock) || isLoading}
                    >
                      Checkout
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    
                    {cartItems.some(item => !item.products.in_stock) && (
                      <p className="text-red-500 text-sm text-center">
                        Remove out of stock items to proceed
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-xl">
                  <CardContent className="py-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Secure Checkout</p>
                          <p className="text-xs text-gray-500">Your data is protected</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                          M
                        </div>
                        <div>
                          <p className="font-medium text-sm">M-Pesa Payment</p>
                          <p className="text-xs text-gray-500">Easy & fast mobile payments</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Premium Quality</p>
                          <p className="text-xs text-gray-500">Carefully selected products</p>
                        </div>
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
