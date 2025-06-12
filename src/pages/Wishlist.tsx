
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface WishlistProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  rating: number | null;
  review_count: number | null;
}

const Wishlist = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeWishlist = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Wishlist - User from auth:", user);
        
        if (!user) {
          console.log("No user found, redirecting to auth");
          setLoading(false);
          return;
        }
        
        setUser(user);
        await fetchWishlistItems(user.id);
      } catch (error) {
        console.error("Error initializing wishlist:", error);
        toast({
          title: "Error",
          description: "Failed to load wishlist",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeWishlist();
  }, [toast]);

  const fetchWishlistItems = async (userId: string) => {
    try {
      console.log("Fetching wishlist for user:", userId);
      
      // First get the user's profile with wishlist
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wishlist")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email: "",
              full_name: "",
              phone: "",
              role: "user",
              wishlist: []
            });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
          }
          setWishlistItems([]);
          return;
        }
        throw profileError;
      }

      console.log("Profile wishlist:", profile?.wishlist);

      if (profile?.wishlist && profile.wishlist.length > 0) {
        // Get products that are in the wishlist
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .in("id", profile.wishlist);

        if (productsError) {
          console.error("Products error:", productsError);
          throw productsError;
        }
        
        console.log("Wishlist products:", products);
        setWishlistItems(products || []);
      } else {
        console.log("No items in wishlist");
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
      setWishlistItems([]);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("wishlist")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedWishlist = (profile.wishlist || []).filter(
        (id: string) => id !== productId
      );

      const { error } = await supabase
        .from("profiles")
        .update({ wishlist: updatedWishlist })
        .eq("id", user.id);

      if (error) throw error;

      setWishlistItems(items => items.filter(item => item.id !== productId));
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive",
      });
    }
  };

  const addToCart = async (productId: string) => {
    if (!user) return;

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please sign in to view your wishlist.</p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Save items you love for later!</p>
              <Button onClick={() => navigate("/")}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                      📷
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <CardContent className="p-4">
                  <h3
                    className="font-semibold text-lg mb-2 cursor-pointer hover:text-pink-600"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-pink-600">
                        KSh {product.price.toLocaleString()}
                      </span>
                      {product.previous_price && (
                        <span className="text-sm text-gray-500 line-through">
                          KSh {product.previous_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span>⭐ {product.rating}</span>
                        <span className="ml-1">({product.review_count})</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => addToCart(product.id)}
                      className="flex-1"
                      size="sm"
                      disabled={!product.in_stock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {product.in_stock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
