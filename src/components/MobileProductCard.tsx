
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";

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
  stock_status: string;
}

interface MobileProductCardProps {
  product: Product;
}

const MobileProductCard = ({ product }: MobileProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

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

  const getStockStatusBadge = () => {
    switch (product.stock_status) {
      case "out_of_stock":
        return <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">Out</span>;
      case "few_units_left":
        return <span className="bg-orange-100 text-orange-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">Few</span>;
      case "flash_sale":
        return <span className="bg-purple-100 text-purple-600 text-[9px] px-1.5 py-0.5 rounded-full font-medium">Sale</span>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer h-full bg-white border border-gray-100"
      onClick={handleCardClick}
    >
      <div className="aspect-square bg-gray-50 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
            📷
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className={`absolute top-1.5 right-1.5 p-1 h-6 w-6 rounded-full ${
            isInWishlist(product.id) 
              ? "text-red-500 bg-white/90" 
              : "text-gray-400 bg-white/90"
          } hover:bg-white shadow-sm`}
        >
          <Heart className="w-3 h-3" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
        </Button>
        {getStockStatusBadge() && (
          <div className="absolute top-1.5 left-1.5">
            {getStockStatusBadge()}
          </div>
        )}
      </div>
      
      <CardContent className="p-2.5">
        <h3 className="font-medium text-xs mb-1.5 line-clamp-2 leading-tight text-gray-800 min-h-[2.25rem]">
          {product.name}
        </h3>
        
        <div className="flex items-start justify-between mb-2">
          <div className="flex flex-col flex-1">
            <span className="text-xs font-bold text-pink-600">
              KSh {product.price.toLocaleString()}
            </span>
            {product.previous_price && (
              <span className="text-[10px] text-gray-400 line-through leading-tight">
                KSh {product.previous_price.toLocaleString()}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center text-[10px] text-yellow-500 ml-1">
              <span>⭐</span>
              <span className="text-gray-500 ml-0.5">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full h-6 text-[10px] font-medium bg-pink-500 hover:bg-pink-600 rounded-md"
          size="sm"
          disabled={!product.in_stock || product.stock_status === "out_of_stock" || isAddingToCart}
        >
          <ShoppingCart className="w-2.5 h-2.5 mr-1" />
          {isAddingToCart ? "Adding..." : product.stock_status === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileProductCard;
