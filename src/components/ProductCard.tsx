import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { formatKESPrice } from '@/lib/currency'
import { getOfferPrice, getDiscountPercent, isOfferActive } from '@/lib/utils'

interface ProductProps {
  product: {
    id: string | number
    name: string
    image: string
    price: number
    rating?: number
    numReviews?: number
    category?: string
    brand?: string
    count_in_stock?: number
    countInStock?: number
    stock?: number
    offer?: {
      enabled?: boolean
      type?: 'percentage' | 'fixed'
      amount?: number
      startDate?: string
      endDate?: string
    }
  }
}

const ProductCard = ({ product }: ProductProps) => {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id)
    } else {
      addToFavorites(product)
    }
  }

  const getCategoryUrl = (category: string | undefined) => {
    if (!category) return 'all'

    // Convert category name to URL-friendly format
    // e.g. "Graphics Cards" -> "graphics-cards"
    return category.toLowerCase().replace(/\s+/g, '-')
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

  const isProductFavorite = isFavorite(product.id)

  return (
    <Link
      to={`/product/${product.id}`}
      tabIndex={0}
      role="button"
      className="block focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card className="bg-gray-900 border-gray-700 overflow-hidden hover:border-yellow-500/50 transition-colors group cursor-pointer">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/placeholder.svg'
            }}
          />
          {isOfferActive(product.offer) && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
              -{getDiscountPercent(product.price, product.offer)}%
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white ${
              isProductFavorite ? 'text-red-400' : 'hover:text-red-400'
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isProductFavorite ? 'fill-current' : ''}`}
            />
          </Button>
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>

          <div className="flex items-center mb-2">
            {product.rating > 0 ? (
              <>
                {renderStars(product.rating)}
                <span className="text-xs text-muted-foreground ml-2">
                  ({product.numReviews || 0} reviews)
                </span>
              </>
            ) : (
              <div className="h-4 text-xs text-muted-foreground">
                No reviews yet
              </div>
            )}
          </div>

          <div className="flex flex-col gap-0.5 justify-between items-start mb-1">
            {isOfferActive(product.offer) ? (
              <>
                <span className="text-xs line-through text-muted-foreground">
                  {formatKESPrice(product.price)}
                </span>
                <span className="text-lg font-bold text-yellow-400">
                  {formatKESPrice(getOfferPrice(product.price, product.offer))}
                  <span className="text-xs text-muted-foreground ml-2 align-middle">
                    ex VAT
                  </span>
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-yellow-400">
                {formatKESPrice(product.price)}
                <span className="text-xs text-muted-foreground ml-2 align-middle">
                  ex VAT
                </span>
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Stock: {product.countInStock ?? 0}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-gray-700 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.location.href = `/product/${product.id}`
            }}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black"
            onClick={handleAddToCart}
            disabled={(product.countInStock ?? 0) === 0}
          >
            <ShoppingCart size={14} className="mr-1" />
            {(product.countInStock ?? 0) === 0 ? 'Out of Stock' : 'Add'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default ProductCard
