import React from 'react'
import { Helmet } from 'react-helmet-async'
import { withValidAggregateRating } from '@/lib/productStructuredData'
import { buildSeoMetadata, SITE_URL } from '@/lib/seoMetadata'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  product?: {
    name: string
    price: number
    currency: string
    availability: string
    brand: string
    image: string
    description: string
    rating?: number
    reviewCount?: number
  }
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type,
  product,
  breadcrumbs = [],
}) => {
  const metadata = buildSeoMetadata({ title, description, keywords, image, url, type })
  const {
    title: fullTitle,
    description: pageDescription,
    canonical: fullUrl,
    image: fullImage,
    type: pageType,
    keywords: pageKeywords,
  } = metadata

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GameCity Electronics',
    url: 'https://www.gamecityelectronics.co.ke',
    logo: `${SITE_URL}/logo.png`,
    description:
      'Leading gaming electronics retailer in Nairobi, Kenya. Specializing in gaming PCs, PlayStation, Xbox, graphics cards, and gaming accessories.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kai Plaza 3rd floor shop 6, Tom Mboya St',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },

    sameAs: [
      'https://www.facebook.com/gamecityelectronics',
      'https://www.instagram.com/gamecityelectronics',
      'https://twitter.com/gamecityelectronics',
    ],
  }

  // LocalBusiness Schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ElectronicsStore',
    name: 'GameCity Electronics',
    image: 'https://www.gamecityelectronics.co.ke/store-image.jpg',
    description: 'Gaming electronics store in Nairobi, Kenya',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kai Plaza 3rd floor shop 6, Tom Mboya St',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2921,
      longitude: 36.8219,
    },
    url: 'https://www.gamecityelectronics.co.ke',

    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '09:00',
      closes: '18:00',
    },
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, M-Pesa',
    currenciesAccepted: 'KES',
  }

  // Product Schema
  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.image,
        description: product.description,
        brand: {
          '@type': 'Brand',
          name: product.brand,
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: `https://schema.org/${product.availability}`,
          seller: {
            '@type': 'Organization',
            name: 'GameCity Electronics',
          },
          url: fullUrl,
        },
        ...withValidAggregateRating({
          rating: product.rating,
          reviewCount: product.reviewCount,
        }),
      }
    : null

  // BreadcrumbList Schema
  const breadcrumbSchema =
    breadcrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url.startsWith('http')
              ? crumb.url
              : `${SITE_URL}${crumb.url}`,
          })),
        }
      : null

  // WebSite Schema with search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GameCity Electronics',
    url: 'https://www.gamecityelectronics.co.ke',
    potentialAction: {
      '@type': 'SearchAction',
      target:
        `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={pageType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="GameCity Electronics" />
      <meta property="og:locale" content="en_KE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Product-specific meta tags */}
      {product && (
        <>
          <meta
            property="product:price:amount"
            content={product.price.toString()}
          />
          <meta property="product:price:currency" content={product.currency} />
          <meta
            property="product:availability"
            content={product.availability}
          />
          <meta property="product:brand" content={product.brand} />
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  )
}

export default SEO
