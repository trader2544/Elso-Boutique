
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 h-full"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-400 text-2xl">📷</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className={`absolute top-1 right-1 p-1.5 h-7 w-7 rounded-full bg-white/80 hover:bg-white ${
            isInWishlist(product.id) ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Heart className={`w-3 h-3 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <div className="p-2">
        <h3 className="font-medium text-xs mb-1 line-clamp-2 leading-tight">{product.name}</h3>
        
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
          className="w-full rounded-lg bg-pink-600 hover:bg-pink-700 h-7 text-xs" 
          size="sm"
          disabled={!product.in_stock}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {product.in_stock ? "Add" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
