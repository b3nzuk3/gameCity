import React from 'react'
import { Helmet } from 'react-helmet-async'

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
  }
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
}

const SEO: React.FC<SEOProps> = ({
  title = 'Gaming PCs, PS5, Xbox & Graphics Cards in Nairobi | GameCity Electronics',
  description = 'Shop gaming PCs, PlayStation 5, Xbox Series X, graphics cards & gaming accessories in Nairobi. Fast delivery across Kenya. Best prices guaranteed!',
  keywords = 'gaming PCs Nairobi, PlayStation 5 Kenya, Xbox Series X, graphics cards, gaming accessories, RTX 4070, RTX 4080, gaming monitors, Nairobi electronics',
  image = 'https://gamecityelectronics.com/og-image.png',
  url = 'https://gamecityelectronics.com',
  type = 'website',
  product,
  breadcrumbs = [],
}) => {
  const fullTitle = title.includes('GameCity Electronics')
    ? title
    : `${title} | GameCity Electronics`
  const fullUrl = url.startsWith('http')
    ? url
    : `https://gamecityelectronics.com${url}`
  const fullImage = image.startsWith('http')
    ? image
    : `https://gamecityelectronics.com${image}`

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GameCity Electronics',
    url: 'https://gamecityelectronics.com',
    logo: 'https://gamecityelectronics.com/logo.png',
    description:
      'Leading gaming electronics retailer in Nairobi, Kenya. Specializing in gaming PCs, PlayStation, Xbox, graphics cards, and gaming accessories.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Westlands',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-XXX-XXXXXX',
      contactType: 'customer service',
      areaServed: 'KE',
      availableLanguage: 'English',
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
    image: 'https://gamecityelectronics.com/store-image.jpg',
    description: 'Gaming electronics store in Nairobi, Kenya',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Westlands',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.2921,
      longitude: 36.8219,
    },
    url: 'https://gamecityelectronics.com',
    telephone: '+254-XXX-XXXXXX',
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
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '150',
        },
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
              : `https://gamecityelectronics.com${crumb.url}`,
          })),
        }
      : null

  // WebSite Schema with search
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GameCity Electronics',
    url: 'https://gamecityelectronics.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://gamecityelectronics.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="GameCity Electronics" />
      <meta property="og:locale" content="en_KE" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />

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
