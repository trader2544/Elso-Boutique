
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
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
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
          <div className="text-gray-400 text-4xl md:text-6xl">📷</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white ${
            isInWishlist(product.id) ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
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
        
        <Button 
          onClick={handleAddToCart}
          className="w-full rounded-full bg-pink-600 hover:bg-pink-700" 
          size="sm"
          disabled={!product.in_stock}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.in_stock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
