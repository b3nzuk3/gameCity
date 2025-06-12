import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  atlasProductService,
  type Product,
} from '@/services/atlasProductService'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log('FeaturedProducts: Fetching products...')
        const data = await atlasProductService.getProducts()
        // Normalize to ensure every product has an id
        const normalized = data.map((p) => ({
          ...p,
          id: p.id || (p as any)._id?.toString() || '',
        }))
        // Take first 4 products as featured
        const featured = normalized.slice(0, 4)
        console.log('FeaturedProducts: Loaded featured products:', featured)
        setProducts(featured)
      } catch (error) {
        console.error('FeaturedProducts: Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-forest-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-forest-800 rounded-lg p-4 animate-pulse"
              >
                <div className="bg-forest-700 h-48 rounded-md mb-4"></div>
                <div className="bg-forest-700 h-4 rounded mb-2"></div>
                <div className="bg-forest-700 h-4 rounded w-3/4 mb-4"></div>
                <div className="bg-forest-700 h-8 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-forest-900/50">
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

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || undefined,
      rating: product.rating || undefined,
    })
  }

  return (
    <section className="py-16 bg-forest-900/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-forest-800 border-forest-700 hover:bg-forest-700/50 transition-colors group"
            >
              <CardContent className="p-4">
                <div className="aspect-square relative mb-4 overflow-hidden rounded-md bg-forest-700">
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

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm line-clamp-2 text-white group-hover:text-emerald-400 transition-colors">
                    {product.name}
                  </h3>

                  {product.category && (
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-emerald-400">
                      {formatKESPrice(product.price)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.count_in_stock === 0}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                      size="sm"
                    >
                      {product.count_in_stock === 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="border-forest-600 text-muted-foreground hover:text-white text-xs"
                      size="sm"
                    >
                      <Link
                        to={`/category/${
                          product.category?.toLowerCase() || 'all'
                        }?product=${product.id}`}
                      >
                        View
                      </Link>
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Link to="/category/all">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
