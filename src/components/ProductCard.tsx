import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const getStockStatusBadge = () => {
    switch (product.stock_status) {
      case "out_of_stock":
        return <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Sold Out</span>;
      case "few_units_left":
        return <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">Few Left!</span>;
      case "flash_sale":
        return <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Flash Sale</span>;
      default:
        return null;
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : [product.image_url].filter(Boolean);
  const currentImage = images[currentImageIndex] || product.image_url;

  const discountPercentage = product.previous_price 
    ? Math.round(((product.previous_price - product.price) / product.previous_price) * 100)
    : 0;

  return (
    <motion.div 
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-100"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentImage}
            src={currentImage || "/placeholder.svg"} 
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Quick action buttons */}
        <motion.div 
          className="absolute top-4 right-4 flex flex-col gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={handleWishlistToggle}
            className={`w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 ${
              isInWishlist(product.id) 
                ? 'bg-pink-500 text-white hover:bg-pink-600' 
                : 'bg-white/90 text-gray-700 hover:bg-white hover:text-pink-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleQuickView}
            className="w-10 h-10 rounded-full bg-white/90 shadow-lg backdrop-blur-sm text-gray-700 hover:bg-white hover:text-pink-500 transition-all duration-300"
          >
            <Eye className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <motion.span 
              className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              -{discountPercentage}%
            </motion.span>
          )}
          {getStockStatusBadge()}
        </div>

        {/* Add to cart button - slides up on hover */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 100, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
            disabled={!product.in_stock || product.stock_status === "out_of_stock"}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.stock_status === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
          </Button>
        </motion.div>

        {/* Image dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-pink-600">
              KSh {product.price.toLocaleString()}
            </span>
            {product.previous_price && (
              <span className="text-sm text-gray-400 line-through">
                KSh {product.previous_price.toLocaleString()}
              </span>
            )}
          </div>
          {product.rating && product.rating > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Color options */}
        {images.length > 1 && product.color_labels && product.color_labels.some(label => label && label.trim()) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <ColorImageSelector
              images={images}
              colorLabels={product.color_labels || []}
              onImageChange={setCurrentImageIndex}
              currentImageIndex={currentImageIndex}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
