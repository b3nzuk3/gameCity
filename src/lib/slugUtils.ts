/**
 * Generate SEO-friendly URL slug from product name
 */
export const generateSlug = (text: string): string => {
  return (
    text
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
      // Add location suffix for better SEO
      .concat('-nairobi')
  )
}

/**
 * Extract product ID from SEO-friendly slug
 * Handles both old ID format and new slug format
 */
export const extractProductId = (slug: string): string => {
  // If it's already an ID (MongoDB ObjectId format), return as is
  if (/^[a-f\d]{24}$/i.test(slug)) {
    return slug
  }

  // For SEO-friendly slugs, we'll need to look up the product by slug
  // This will be handled in the ProductPage component
  return slug
}

/**
 * Generate SEO-friendly product URL
 */
export const generateProductUrl = (product: {
  _id: string
  name: string
  category?: string
}): string => {
  const slug = generateSlug(product.name)
  return `/product/${slug}`
}

/**
 * Generate SEO-friendly category URL
 */
export const generateCategoryUrl = (category: string): string => {
  const slug = category.toLowerCase().replace(/\s+/g, '-')
  return `/category/${slug}`
}
