import React from 'react'
import { Helmet } from 'react-helmet-async'
import { buildStructuredDataGraph } from '@/lib/productStructuredData'
import { buildSeoMetadata } from '@/lib/seoMetadata'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  product?: {
    name: string
    price: number
    currency: string
    availability: string
    brand?: string
    image: string
    description: string
    category?: string
    condition?: 'New' | 'Pre-Owned'
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
  noindex = false,
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

  const structuredData = buildStructuredDataGraph({
    product: product
      ? {
          name: product.name,
          description: product.description,
          image: product.image,
          brand: product.brand,
          price: product.price,
          currency: product.currency,
          availability: product.availability,
          url: fullUrl,
          category: product.category,
          condition: product.condition,
          rating: product.rating,
          reviewCount: product.reviewCount,
        }
      : undefined,
    breadcrumbs,
  })

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={pageDescription} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
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
          {product.brand && <meta property="product:brand" content={product.brand} />}
        </>
      )}

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}

export default SEO
