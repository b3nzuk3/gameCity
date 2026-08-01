import { type Product } from '@/services/backendService'

/**
 * Resolve the best image URL for a given size context.
 * @param product - Product object
 * @param size - 'thumbnail' | 'medium' | 'large' | 'original'
 * @returns The best image URL for the context
 */
export function getProductImageUrl(
  product: Product,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'original'
): string {
  if (!product) return ''

  // Use R2 variants if available
  if (product.image_r2_variants) {
    if (size !== 'original' && product.image_r2_variants[size]) {
      return product.image_r2_variants[size]
    }
    return product.image_r2 || product.image
  }

  // Fallback to main image
  return product.image || ''
}
