
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

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

interface MobileProductCardProps {
  product: Product;
}

const MobileProductCard = ({ product }: MobileProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddingToCart(true);
    try {
      await addToCart(product.id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full"
      onClick={handleCardClick}
    >
      <div className="aspect-square bg-gray-200 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
            📷
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className={`absolute top-1 right-1 p-1 h-6 w-6 ${
            isInWishlist(product.id) 
              ? "text-red-500 bg-white/80" 
              : "text-gray-500 bg-white/80"
          } hover:bg-white`}
        >
          <Heart className="w-3 h-3" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
        </Button>
      </div>
      
      <CardContent className="p-2">
        <h3 className="font-medium text-xs mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-pink-600">
              KSh {product.price.toLocaleString()}
            </span>
            {product.previous_price && (
              <span className="text-xs text-gray-500 line-through">
                KSh {product.previous_price.toLocaleString()}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center text-xs text-gray-600">
              <span>⭐ {product.rating}</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full h-6 text-xs"
          size="sm"
          disabled={!product.in_stock || isAddingToCart}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {isAddingToCart ? "Adding..." : product.in_stock ? "Add" : "Out of Stock"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileProductCard;
