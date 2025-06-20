import React from 'react'
import { useProducts } from '@/services/productService'
import ProductCard from './ProductCard'
import { ProductSkeleton } from './ui/product-skeleton'

interface SimilarProductsProps {
  category: string
  currentProductId: string
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  category,
  currentProductId,
}) => {
  const {
    data: productsData,
    isLoading,
    isError,
  } = useProducts('', 1, category)

  if (isLoading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !productsData) {
    // Don't render the section if there's an error or no data
    return null
  }

  // Filter out the current product and take the first 4
  const similarProducts = productsData.products
    .filter((p) => p._id !== currentProductId)
    .slice(0, 4)

  if (similarProducts.length === 0) {
    // Don't render if there are no other similar products
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {similarProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={{ ...product, id: product._id }}
          />
        ))}
      </div>
    </div>
  )
}

export default SimilarProducts
