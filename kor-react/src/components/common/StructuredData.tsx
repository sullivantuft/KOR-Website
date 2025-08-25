import React from 'react';
import { Helmet } from 'react-helmet';

interface StructuredDataProps {
  type?: 'organization' | 'product' | 'website';
  pageTitle?: string;
  pageDescription?: string;
  url?: string;
}

const StructuredData: React.FC<StructuredDataProps> = ({ 
  type = 'website', 
  pageTitle, 
  pageDescription,
  url 
}) => {
  const baseUrl = process.env.REACT_APP_SITE_URL || 'https://keeponrolling.app';
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KOR (Keep On Rolling)",
    "description": "Intelligent bike maintenance tracking app integrated with Strava",
    "url": baseUrl,
    "logo": `${baseUrl}/images/KOR_app_Logo.png`,
    "sameAs": [
      "https://apps.apple.com/us/app/kor-keep-on-rolling/id1599601993",
      "https://play.google.com/store/apps/details?id=com.robtuft.newKOR"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "Customer Service",
      "email": "support@keeponrolling.app"
    },
    "founder": [
      {
        "@type": "Person",
        "name": "Mason Tuft",
        "jobTitle": "CEO & Developer",
        "email": "masontuft@jmrcycling.com"
      },
      {
        "@type": "Person", 
        "name": "Robert Tuft",
        "jobTitle": "CIO & Senior Developer",
        "email": "roberttuft@jmrcycling.com"
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KOR - Keep On Rolling",
    "description": "Track your bike's component wear automatically with our intelligent maintenance app. Connected to Strava, KOR monitors your rides and alerts you before parts fail.",
    "url": baseUrl,
    "image": `${baseUrl}/images/KOR_app_Logo.png`,
    "applicationCategory": "Sports & Fitness",
    "operatingSystem": ["iOS", "Android"],
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    },
    "downloadUrl": [
      "https://apps.apple.com/us/app/kor-keep-on-rolling/id1599601993",
      "https://play.google.com/store/apps/details?id=com.robtuft.newKOR"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KOR - Keep On Rolling",
    "description": pageDescription || "Never miss bike maintenance again with KOR's intelligent tracking system",
    "url": url || baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "author": {
      "@type": "Organization",
      "name": "KOR Cycling Team"
    }
  };

  let schema;
  switch (type) {
    case 'organization':
      schema = organizationSchema;
      break;
    case 'product':
      schema = productSchema;
      break;
    default:
      schema = websiteSchema;
  }

  return (
    <Helmet>
      {pageTitle && <title>{pageTitle}</title>}
      {pageDescription && <meta name="description" content={pageDescription} />}
      {url && <link rel="canonical" href={url} />}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
