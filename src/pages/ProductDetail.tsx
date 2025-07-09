
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useIsMobile } from "@/hooks/use-mobile";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  category: string;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles (full_name)
        `)
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("cart_items")
        .upsert({
          user_id: user.id,
          product_id: id,
          quantity: quantity,
        });

      if (error) throw error;

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

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to wishlist",
      });
      return;
    }

    try {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("wishlist")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const currentWishlist = profile.wishlist || [];
      const isInWishlist = currentWishlist.includes(id);

      const updatedWishlist = isInWishlist
        ? currentWishlist.filter((item: string) => item !== id)
        : [...currentWishlist, id];

      const { error } = await supabase
        .from("profiles")
        .update({ wishlist: updatedWishlist })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
      });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to update wishlist",
        variant: "destructive",
      });
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          product_id: id,
          rating: newReview.rating,
          comment: newReview.comment,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Review submitted successfully",
      });

      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
      fetchProduct();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review",
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className={`container mx-auto px-4 py-4 ${isMobile ? 'max-w-sm' : ''}`}>
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className={`mb-4 ${isMobile ? 'text-sm' : ''}`}
        >
          <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
          Back to Products
        </Button>

        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'} mb-8`}>
          <div className={`${isMobile ? 'aspect-square' : 'aspect-square'} bg-white rounded-lg shadow-md overflow-hidden`}>
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
          </div>

          <div className={`space-y-4 ${isMobile ? 'px-2' : 'space-y-6'}`}>
            <div>
              <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-2`}>{product.name}</h1>
              <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>{product.description}</p>
              
              <div className={`flex items-center space-x-4 mb-4 ${isMobile ? 'space-x-2' : ''}`}>
                <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-pink-600`}>
                  KSh {product.price.toLocaleString()}
                </span>
                {product.previous_price && (
                  <span className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-500 line-through`}>
                    KSh {product.previous_price.toLocaleString()}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className={`flex items-center space-x-2 mb-4 ${isMobile ? 'space-x-1' : ''}`}>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${
                          i < Math.floor(product.rating!)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>
                    {product.rating} ({product.review_count} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
              <div className={`flex items-center space-x-4 ${isMobile ? 'space-x-2' : ''}`}>
                <label className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Quantity:</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={`${isMobile ? 'w-16 h-8 text-sm' : 'w-20'}`}
                />
              </div>

              <div className={`flex space-x-4 ${isMobile ? 'space-x-2' : ''}`}>
                <Button 
                  onClick={addToCart} 
                  className={`flex-1 ${isMobile ? 'text-sm h-10' : ''}`}
                >
                  <ShoppingCart className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  onClick={addToWishlist}
                  className={`${isMobile ? 'h-10 px-3' : ''}`}
                >
                  <Heart className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}`}>
          <Card className={`${isMobile ? 'mx-2' : ''}`}>
            <CardHeader className={`${isMobile ? 'pb-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className={`space-y-4 ${isMobile ? 'space-y-3 pt-0' : ''}`}>
              <div>
                <label className={`block font-medium mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star
                        className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} ${
                          star <= newReview.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className={`block font-medium mb-2 ${isMobile ? 'text-sm' : 'text-sm'}`}>Comment</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your thoughts about this product..."
                  className={`${isMobile ? 'text-sm min-h-20' : ''}`}
                />
              </div>
              
              <Button 
                onClick={submitReview} 
                className={`w-full ${isMobile ? 'text-sm h-10' : ''}`}
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>

          <Card className={`${isMobile ? 'mx-2' : ''}`}>
            <CardHeader className={`${isMobile ? 'pb-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-lg' : ''}`}>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent className={`${isMobile ? 'pt-0' : ''}`}>
              {reviews.length === 0 ? (
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>No reviews yet. Be the first to review!</p>
              ) : (
                <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
                  {reviews.map((review) => (
                    <div key={review.id} className={`border-b pb-4 ${isMobile ? 'pb-3' : ''}`}>
                      <div className={`flex items-center space-x-2 mb-2 ${isMobile ? 'space-x-1 mb-1' : ''}`}>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                          {review.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
