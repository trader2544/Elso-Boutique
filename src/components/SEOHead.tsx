
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export const SEOHead = ({
  title = "ELSO Boutique - Premium Fashion & Style",
  description = "Discover premium fashion at ELSO Boutique. Shop the latest trends in women's clothing, accessories, and more. Free shipping on orders over KSh 5000.",
  keywords = "fashion, boutique, women's clothing, style, Kenya, premium fashion, dresses, accessories",
  ogTitle,
  ogDescription,
  ogImage = "/lovable-uploads/348f1448-0870-4006-b782-dfb9a8d5927f.png",
  canonical
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', property);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('', ogTitle || title, 'og:title');
    updateMetaTag('', ogDescription || description, 'og:description');
    updateMetaTag('', ogImage, 'og:image');
    updateMetaTag('', 'website', 'og:type');
    updateMetaTag('', 'https://elso-boutique.com', 'og:url');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonical]);

  return null;
};
