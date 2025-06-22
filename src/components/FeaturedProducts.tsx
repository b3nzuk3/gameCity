import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ProductCard from './ProductCard'
import { ProductSkeleton } from './ui/product-skeleton'
import backendService, { type Product } from '@/services/backendService'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'
import { Star } from 'lucide-react'

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // We only want a few featured products, so we can use the default limit
        const data = await backendService.products.getAll()
        // Here we can add logic to select specific featured products if needed
        // For now, we'll take the first 8 as "featured"
        setProducts(data.products.slice(0, 8))
      } catch (error) {
        console.error('Error fetching featured products:', error)
        // Optionally, set an error state to show in the UI
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                <div className="bg-gray-700 h-48 rounded-md mb-4"></div>
                <div className="bg-gray-700 h-4 rounded mb-2"></div>
                <div className="bg-gray-700 h-4 rounded w-3/4 mb-4"></div>
                <div className="bg-gray-700 h-8 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No featured products available at the moment.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    e.preventDefault()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || undefined,
      rating: product.rating || undefined,
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-gray-800 border-gray-700 h-full flex flex-col group-hover:border-yellow-500/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  navigate(`/product/${product.id}`)
              }}
            >
              <CardContent className="p-4 flex flex-col flex-grow">
                <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-gray-700">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                    }}
                  />
                  {product.count_in_stock <= 5 &&
                    product.count_in_stock > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute top-2 right-2 text-xs"
                      >
                        Low Stock
                      </Badge>
                    )}
                  {product.count_in_stock === 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs bg-gray-600"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 flex flex-col flex-grow">
                  <h3 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-yellow-400 transition-colors">
                    {product.name}
                  </h3>

                  {product.category && (
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  )}

                  <div className="flex-grow" />

                  <div className="flex items-center mb-2">
                    {product.rating > 0 ? (
                      <>
                        {renderStars(product.rating)}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({product.numReviews ?? product.num_reviews ?? 0})
                        </span>
                      </>
                    ) : (
                      <div className="h-4" /> // Placeholder for alignment
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-yellow-400">
                      {formatKESPrice(product.price)}
                      <span className="text-xs text-muted-foreground ml-2 align-middle">
                        ex VAT
                      </span>
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.count_in_stock === 0}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs"
                      size="sm"
                    >
                      {product.count_in_stock === 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-muted-foreground hover:text-white text-xs"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/product/${product.id}`)
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            className="bg-yellow-500 hover:bg-yellow-400 text-black"
          >
            <Link to="/category/all">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
