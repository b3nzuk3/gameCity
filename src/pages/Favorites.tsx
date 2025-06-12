import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingBag } from 'lucide-react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'

const Favorites = () => {
  const { favorites, removeFromFavorites, loading } = useFavorites()
  const { addToCart } = useCart()

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
    })
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">Your Favorites</h1>

        {favorites.length === 0 ? (
          <div className="bg-forest-800 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <Heart size={64} className="text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products to your favorites list while shopping.
            </p>
            <Link to="/category/all">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white hover:text-red-400"
                      onClick={() => removeFromFavorites(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
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

                      {product.rating && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                        size="sm"
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Link
                        to={`/category/${
                          product.category?.toLowerCase() || 'all'
                        }?product=${product.id}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-forest-700 text-muted-foreground hover:text-foreground"
                        >
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Favorites
