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
import ColorImageSelector from "@/components/ColorImageSelector";

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
  images?: string[];
  color_labels?: string[];
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      setCurrentImageIndex(0); // Reset to first image when product changes
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

  const handleImageChange = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
  };

  // Get available images (prioritize images array, fallback to image_url)
  const availableImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image_url 
    ? [product.image_url] 
    : [];

  const currentImage = availableImages[currentImageIndex] || product?.image_url;

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
          <h2 className="text-xl font-bold mb-4">Product not found</h2>
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
          className={`mb-4 ${isMobile ? 'text-sm h-8' : ''}`}
        >
          <ArrowLeft className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
          Back
        </Button>

        <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'} mb-6`}>
          <div className="space-y-3">
            <div className={`${isMobile ? 'aspect-square' : 'aspect-square'} bg-white rounded-lg shadow-md overflow-hidden`}>
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  📷
                </div>
              )}
            </div>
            
            {/* Color Image Selector - Outside the image container */}
            {availableImages.length > 1 && (
              <ColorImageSelector
                images={availableImages}
                colorLabels={product.color_labels || []}
                onImageChange={handleImageChange}
                currentImageIndex={currentImageIndex}
              />
            )}
          </div>

          <div className={`space-y-3 ${isMobile ? 'px-2' : 'space-y-4'}`}>
            <div>
              <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold mb-2`}>{product.name}</h1>
              <p className={`text-gray-600 mb-3 ${isMobile ? 'text-sm' : ''}`}>{product.description}</p>
              
              <div className={`flex items-center space-x-3 mb-3 ${isMobile ? 'space-x-2' : ''}`}>
                <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-pink-600`}>
                  KSh {product.price.toLocaleString()}
                </span>
                {product.previous_price && (
                  <span className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-500 line-through`}>
                    KSh {product.previous_price.toLocaleString()}
                  </span>
                )}
              </div>

              {product.rating && (
                <div className={`flex items-center space-x-2 mb-3 ${isMobile ? 'space-x-1' : ''}`}>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${
                          i < Math.floor(product.rating!)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {product.rating} ({product.review_count} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
              <div className={`flex items-center space-x-3 ${isMobile ? 'space-x-2' : ''}`}>
                <label className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Qty:</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={`${isMobile ? 'w-14 h-8 text-sm' : 'w-16'}`}
                />
              </div>

              <div className={`flex space-x-3 ${isMobile ? 'space-x-2' : ''}`}>
                <Button 
                  onClick={addToCart} 
                  className={`flex-1 ${isMobile ? 'text-sm h-9' : ''}`}
                >
                  <ShoppingCart className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  onClick={addToWishlist}
                  className={`${isMobile ? 'h-9 px-3' : ''}`}
                >
                  <Heart className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
          <Card className={`${isMobile ? 'mx-2' : ''}`}>
            <CardHeader className={`${isMobile ? 'pb-2' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-base' : ''}`}>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className={`space-y-3 ${isMobile ? 'space-y-2 pt-0' : ''}`}>
              <div>
                <label className={`block font-medium mb-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <Star
                        className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${
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
                <label className={`block font-medium mb-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>Comment</label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your thoughts..."
                  className={`${isMobile ? 'text-sm min-h-16' : ''}`}
                />
              </div>
              
              <Button 
                onClick={submitReview} 
                className={`w-full ${isMobile ? 'text-sm h-8' : ''}`}
              >
                Submit Review
              </Button>
            </CardContent>
          </Card>

          <Card className={`${isMobile ? 'mx-2' : ''}`}>
            <CardHeader className={`${isMobile ? 'pb-2' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-base' : ''}`}>Reviews</CardTitle>
            </CardHeader>
            <CardContent className={`${isMobile ? 'pt-0' : ''}`}>
              {reviews.length === 0 ? (
                <p className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>No reviews yet.</p>
              ) : (
                <div className={`space-y-3 ${isMobile ? 'space-y-2' : ''}`}>
                  {reviews.map((review) => (
                    <div key={review.id} className={`border-b pb-3 ${isMobile ? 'pb-2' : ''}`}>
                      <div className={`flex items-center space-x-2 mb-1 ${isMobile ? 'space-x-1' : ''}`}>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`${isMobile ? 'w-3 h-3' : 'w-3 h-3'} ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {review.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{review.comment}</p>
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
