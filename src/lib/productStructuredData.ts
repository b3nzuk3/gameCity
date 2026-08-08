export interface ProductAggregateRatingInput {
  rating?: number
  reviewCount?: number
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
