import React from 'react'
import { useProducts } from '@/services/productService'
import ProductCard from './ProductCard'
import { ProductSkeleton } from './ui/product-skeleton'
import backendService from '@/services/backendService'
import { useState, useEffect } from 'react'

interface SimilarProductsProps {
  category: string
  currentProductId: string
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  category,
  currentProductId,
}) => {
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setIsLoading(true)
        setIsError(false)

        // Use the category-specific API endpoint
        const categoryParam =
          category === 'PRE-BUILT' ? 'pre-built' : category.toLowerCase()
        const data = await backendService.products.getAllByCategory(
          categoryParam,
          1,
          10
        )

        // Filter out the current product and take the first 4
        const similarProducts = data.products
          .filter((p: any) => p._id !== currentProductId)
          .slice(0, 4)

        setProducts(similarProducts)
      } catch (error) {
        console.error('Error fetching similar products:', error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (category) {
      fetchSimilarProducts()
    }
  }, [category, currentProductId])

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

  if (isError || products.length === 0) {
    // Don't render the section if there's an error or no data
    return null
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
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
