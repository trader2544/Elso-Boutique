
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";
import ColorImageSelector from "./ColorImageSelector";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean;
  stock_status: string;
  images?: string[];
  color_labels?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      await addToCart(product.id);
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

  const getStockStatusBadge = () => {
    switch (product.stock_status) {
      case "out_of_stock":
        return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Out of Stock</span>;
      case "few_units_left":
        return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">Few Left</span>;
      case "flash_sale":
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">Flash Sale</span>;
      default:
        return null;
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url].filter(Boolean);
  const currentImage = images[currentImageIndex] || product.image_url;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 800);
      
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setCurrentImageIndex(0);
      }, images.length * 800);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentImageIndex(0);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative overflow-hidden">
        {currentImage ? (
          <img 
            src={currentImage} 
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-gray-300 text-3xl md:text-4xl">📷</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm ${
            isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
        </Button>
        {getStockStatusBadge() && (
          <div className="absolute top-2 left-2">
            {getStockStatusBadge()}
          </div>
        )}
        {images.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 md:p-4">
        <h3 className="font-medium text-sm md:text-base mb-1.5 md:mb-2 line-clamp-1 text-gray-800">{product.name}</h3>
        <p className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
        
        <div className="flex items-center justify-between mb-2.5 md:mb-3">
          <div className="flex items-center space-x-1.5 md:space-x-2">
            <span className="text-sm md:text-lg font-bold text-pink-600">
              KSh {product.price.toLocaleString()}
            </span>
            {product.previous_price && (
              <span className="text-xs md:text-sm text-gray-400 line-through">
                KSh {product.previous_price.toLocaleString()}
              </span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center text-xs md:text-sm text-yellow-500">
              <span>⭐</span>
              <span className="text-gray-500 ml-1">{product.rating.toFixed(1)}</span>
              {product.review_count && (
                <span className="text-gray-400 ml-1">({product.review_count})</span>
              )}
            </div>
          )}
        </div>
        
        {/* Available Colors Display */}
        {images.length > 1 && product.color_labels && product.color_labels.some(label => label && label.trim()) && (
          <div className="mb-2">
            <span className="text-xs font-medium text-gray-600">Available Colors: </span>
            <span className="text-xs text-gray-500">
              {product.color_labels.filter(label => label && label.trim()).join(', ')}
            </span>
          </div>
        )}
        
        <ColorImageSelector
          images={images}
          colorLabels={product.color_labels || []}
          onImageChange={setCurrentImageIndex}
          currentImageIndex={currentImageIndex}
        />
        
        <Button 
          onClick={handleAddToCart}
          className="w-full rounded-lg bg-pink-500 hover:bg-pink-600 text-xs md:text-sm py-1.5 md:py-2 mt-2" 
          size="sm"
          disabled={!product.in_stock || product.stock_status === "out_of_stock"}
        >
          <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
          {product.stock_status === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
