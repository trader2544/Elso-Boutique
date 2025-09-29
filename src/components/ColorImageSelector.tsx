import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ColorImageSelectorProps {
  images: string[];
  colorLabels: string[];
  onImageChange: (imageIndex: number) => void;
  currentImageIndex: number;
}

const ColorImageSelector = ({ images, colorLabels, onImageChange, currentImageIndex }: ColorImageSelectorProps) => {
  const [startX, setStartX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const isMobile = useIsMobile();

  if (!images || images.length <= 1) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    if (Math.abs(diffX) > 50) { // Minimum swipe distance
      if (diffX > 0 && currentImageIndex < images.length - 1) {
        onImageChange(currentImageIndex + 1);
      } else if (diffX < 0 && currentImageIndex > 0) {
        onImageChange(currentImageIndex - 1);
      }
    }
    
    setIsSwiping(false);
  };

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      onImageChange(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      onImageChange(currentImageIndex - 1);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {isMobile ? (
        // Mobile: Show only "Colors:" text
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-600">Colors:</span>
        </div>
      ) : (
        <>
          {/* Desktop: Full Color Options */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Colors:</span>
            <div className="flex items-center space-x-1">
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-gray-500">
                    {currentImageIndex + 1}/{images.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextImage}
                    disabled={currentImageIndex === images.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Color Swatches */}
          <div 
            className="flex space-x-2 overflow-x-auto pb-1"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onImageChange(index)}
                className={`flex-shrink-0 flex flex-col items-center space-y-1 p-1 rounded-md transition-all ${
                  currentImageIndex === index 
                    ? 'bg-pink-50 ring-2 ring-pink-300' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div 
                  className={`w-6 h-6 rounded-full border-2 shadow-sm ${
                    currentImageIndex === index ? 'border-pink-300' : 'border-gray-200'
                  }`}
                  style={{ 
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                {colorLabels[index] && (
                  <span className={`text-xs leading-none ${
                    currentImageIndex === index ? 'text-pink-600 font-medium' : 'text-gray-500'
                  }`}>
                    {colorLabels[index]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ColorImageSelector;