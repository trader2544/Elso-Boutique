import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ColorImageSelectorProps {
  images: string[];
  colorLabels: string[];
  onImageChange: (imageIndex: number) => void;
  currentImageIndex: number;
}

const ColorImageSelector = ({ images, colorLabels, onImageChange, currentImageIndex }: ColorImageSelectorProps) => {
  if (!images || images.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {images.map((image, index) => (
        <Button
          key={index}
          variant={currentImageIndex === index ? "default" : "outline"}
          size="sm"
          onClick={() => onImageChange(index)}
          className="flex items-center space-x-1 h-8"
        >
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          {colorLabels[index] && (
            <span className="text-xs">{colorLabels[index]}</span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default ColorImageSelector;