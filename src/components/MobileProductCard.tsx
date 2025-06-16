
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  previous_price?: number;
  image_url?: string;
  category: string;
  description?: string;
  rating?: number;
  review_count?: number;
  stock_status?: string;
  in_stock?: boolean;
}

interface MobileProductCardProps {
  product: Product;
}

const MobileProductCard = ({ product }: MobileProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_status === 'out_of_stock') return;
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const getStockBadge = () => {
    switch (product.stock_status) {
      case 'out_of_stock':
        return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
      case 'few_units_left':
        return <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">Few Units Left</Badge>;
      case 'flash_sale':
        return <Badge className="text-xs bg-red-500 text-white animate-pulse">Flash Sale!</Badge>;
      case 'stocked':
      default:
        return <Badge variant="outline" className="text-xs text-green-700 border-green-300">In Stock</Badge>;
    }
  };

  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-300 hover:shadow-md border-pink-200 ${isOutOfStock ? 'opacity-75' : ''}`}
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="flex space-x-3">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-pink-300 text-xs">No image</span>
                </div>
              )}
            </div>
            
            {/* Stock Status Badge - positioned at bottom of image */}
            <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
              {getStockBadge()}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-pink-600 transition-colors flex-1 mr-2">
                {product.name}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-6 w-6 flex-shrink-0"
                onClick={handleWishlistToggle}
              >
                <Heart
                  className={`w-3 h-3 ${
                    isWishlisted ? "fill-pink-500 text-pink-500" : "text-gray-600"
                  }`}
                />
              </Button>
            </div>
            
            <p className="text-xs text-pink-600 mb-1">{product.category}</p>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-bold text-pink-600">
                KSh {product.price.toLocaleString()}
              </span>
              {product.previous_price && (
                <span className="text-xs text-gray-400 line-through">
                  KSh {product.previous_price.toLocaleString()}
                </span>
              )}
            </div>

            {product.rating && (
              <div className="flex items-center space-x-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < Math.floor(product.rating!)
                          ? "text-yellow-400"
                          : "text-gray-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  ({product.review_count || 0})
                </span>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              size="sm"
              className={`w-full h-7 text-xs transition-all duration-300 ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
              }`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileProductCard;
