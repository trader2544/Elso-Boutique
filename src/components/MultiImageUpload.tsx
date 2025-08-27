
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MultiImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
}

const MultiImageUpload = ({ onImagesUploaded, currentImages = [], maxImages = 5 }: MultiImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const { toast } = useToast();

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || images.length >= maxImages) return;

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).slice(0, maxImages - images.length).map(uploadImage);
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        const newImages = [...images, ...validUrls];
        setImages(newImages);
        onImagesUploaded(newImages);
        
        toast({
          title: "Success",
          description: `${validUrls.length} image(s) uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <div className="relative">
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                className="cursor-pointer"
                asChild
              >
                <span>
                  {uploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Images
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 rounded-full p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400">Upload up to {maxImages} images</p>
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;
