import { useEffect } from 'react';
import { Product } from '@/types/product';

interface ProductStructuredDataProps {
  products: Product[];
}

export const ProductStructuredData = ({ products }: ProductStructuredDataProps) => {
  useEffect(() => {
    if (products.length === 0) return;

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "ELSO Boutique Featured Products",
      "description": "Premium women's fashion products from ELSO Boutique in Kisumu, Kenya",
      "numberOfItems": products.length,
      "itemListElement": products.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.image_url || product.images?.[0],
          "url": `https://elso-boutique.com/product/${product.id}`,
          "sku": product.id,
          "brand": {
            "@type": "Brand",
            "name": "ELSO Boutique"
          },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "KES",
            "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "ELSO Boutique"
            },
            "itemCondition": "https://schema.org/NewCondition"
          },
          "aggregateRating": product.review_count > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.review_count,
            "bestRating": 5,
            "worstRating": 1
          } : undefined,
          "category": product.category,
          "color": product.color_labels?.join(", "),
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Category",
              "value": product.category
            },
            {
              "@type": "PropertyValue", 
              "name": "Stock Status",
              "value": product.stock_status
            }
          ]
        }
      }))
    };

    // Remove existing structured data
    const existingScript = document.querySelector('script[data-type="product-structured-data"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-type', 'product-structured-data');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-type="product-structured-data"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [products]);

  return null;
};