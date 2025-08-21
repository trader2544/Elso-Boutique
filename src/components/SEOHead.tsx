
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  noindex?: boolean;
}

export const SEOHead = ({
  title = "ELSO Boutique - Premium Women's Fashion & Beauty in Kisumu, Kenya",
  description = "ELSO Boutique offers premium women's fashion, jewelry, accessories, and beauty products in Kisumu, Kenya. Shop trendy items with quality guarantee.",
  canonical,
  ogImage = "https://elso-boutique.com/lovable-uploads/3942f446-3594-43a8-b602-0e80b80bdd8c.png",
  ogType = "website",
  keywords = "women fashion Kenya, jewelry Kisumu, beauty products Kenya, accessories Kenya, boutique Kisumu",
  noindex = false
}: SEOHeadProps) => {
  const fullCanonical = canonical ? `https://elso-boutique.com${canonical}` : undefined;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEOHead;
