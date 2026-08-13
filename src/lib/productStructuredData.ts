import { BUSINESS_IDENTITY, SITE_URL } from './seoMetadata'

export interface ProductAggregateRatingInput {
  rating?: number
  reviewCount?: number
}

export interface ProductStructuredDataInput {
  name: string
  description: string
  image?: string | string[]
  brand?: string
  category?: string
  price?: number
  currency?: string
  availability?: string
  url: string
  condition?: string
  sku?: string
  rating?: number
  reviewCount?: number
}

export interface BreadcrumbInput {
  name: string
  url: string
}

export function buildStructuredDataGraph({
  product,
  breadcrumbs = [],
  includeSearch = true,
}: {
  product?: ProductStructuredDataInput
  breadcrumbs?: BreadcrumbInput[]
  includeSearch?: boolean
}) {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      ...BUSINESS_IDENTITY,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: BUSINESS_IDENTITY.name,
      url: SITE_URL,
      ...(includeSearch
        ? {
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }
        : {}),
    },
  ]

  if (product) {
    graph.push({
      '@type': 'Product',
      '@id': `${product.url}#product`,
      name: product.name,
      description: product.description,
      ...(product.image ? { image: product.image } : {}),
      ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
      ...(product.category ? { category: product.category } : {}),
      ...(product.condition
        ? {
            itemCondition: `https://schema.org/${product.condition === 'New' ? 'NewCondition' : 'UsedCondition'}`,
          }
        : {}),
      ...(product.sku ? { sku: product.sku } : {}),
      offers: {
        '@type': 'Offer',
        ...(product.price !== undefined ? { price: product.price } : {}),
        ...(product.currency ? { priceCurrency: product.currency } : {}),
        ...(product.availability ? { availability: `https://schema.org/${product.availability}` } : {}),
        url: product.url,
        seller: { '@id': `${SITE_URL}/#organization` },
      },
      ...withValidAggregateRating(product),
    })
  }

  if (breadcrumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${SITE_URL}${crumb.url}`,
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export interface AggregateRatingSchema {
  '@type': 'AggregateRating'
  ratingValue: number
  reviewCount: number
}

/**
 * Return AggregateRating schema only when both values represent real reviews.
 * Products without valid reviews must omit aggregateRating entirely.
 */
export function getValidAggregateRating({
  rating,
  reviewCount,
}: ProductAggregateRatingInput): AggregateRatingSchema | undefined {
  if (
    !Number.isFinite(rating) ||
    !Number.isFinite(reviewCount) ||
    reviewCount <= 0 ||
    !Number.isInteger(reviewCount) ||
    rating <= 0 ||
    rating > 5
  ) {
    return undefined
  }

  return {
    '@type': 'AggregateRating',
    ratingValue: rating,
    reviewCount,
  }
}

export function withValidAggregateRating<T extends ProductAggregateRatingInput>(
  schema: T
): { aggregateRating?: AggregateRatingSchema } {
  const aggregateRating = getValidAggregateRating(schema)
  return aggregateRating ? { aggregateRating } : {}
}

export default getValidAggregateRating
