import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '@/components/Layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import backendService, { type Product } from '@/services/backendService'
import { Package } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductSkeleton } from '@/components/ui/product-skeleton'

const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

const SearchPage = () => {
  const query = useQuery()
  const searchTerm = query.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm) {
        setProducts([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await backendService.products.getAll({
          search: searchTerm,
        })
        setProducts(data.products)
      } catch (error) {
        console.error(
          `SearchPage: Error fetching products for "${searchTerm}":`,
          error
        )
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchTerm])

  const sortedProducts = React.useMemo(() => {
    let sorted = [...products]
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }
    return sorted
  }, [products, sortBy])

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Search'}
          </h1>
          <div className="flex items-center gap-4">
            <Select onValueChange={setSortBy} defaultValue="name">
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">
              Your search for "{searchTerm}" did not match any products.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SearchPage
