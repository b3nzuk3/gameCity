import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { formatKESPrice } from '@/lib/currency'
import { getOfferPrice, getDiscountPercent, isOfferActive } from '@/lib/utils'
import { generateProductUrl } from '@/lib/slugUtils'
import OptimizedImage from './OptimizedImage'

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
    condition?: 'New' | 'Pre-Owned'
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
      to={generateProductUrl({
        _id: product.id.toString(),
        name: product.name,
        category: product.category,
      })}
      tabIndex={0}
      role="button"
      className="block focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card className="bg-[#232334] border-gray-700 overflow-hidden hover:border-yellow-500/50 transition-all duration-200 group cursor-pointer hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98] flex flex-col h-full min-h-[350px] sm:min-h-[400px]">
        {/* Product Image - Optimized for mobile */}
        <div className="relative aspect-square overflow-hidden">
          <OptimizedImage
            src={product.image}
            alt={`${product.name} - Gaming ${
              product.category || 'electronics'
            } in Nairobi Kenya`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            quality={75}
            sizes="(max-width: 374px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Condition Badge */}
          {product.condition && (
            <div className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg z-20">
              {product.condition}
            </div>
          )}

          {/* Offer Badge */}
          {isOfferActive(product.offer) && (
            <div className={`absolute ${product.condition ? 'top-10' : 'top-2'} left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg z-10`}>
              -{getDiscountPercent(product.price, product.offer)}%
            </div>
          )}

          {/* Stock Badge */}
          <div className="absolute top-2 right-2 z-10">
            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                (product.countInStock ??
                  product.count_in_stock ??
                  product.stock ??
                  0) > 0
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {(product.countInStock ??
                product.count_in_stock ??
                product.stock ??
                0) > 0
                ? 'In Stock'
                : 'Out of Stock'}
            </div>
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute bottom-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white transition-all duration-200 ${
              isProductFavorite ? 'text-red-400' : 'hover:text-red-400'
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isProductFavorite ? 'fill-current' : ''}`}
            />
          </Button>
        </div>

        {/* Product Content - Compact for mobile */}
        <CardContent className="p-2 sm:p-4 flex flex-col flex-grow min-h-0">
          {/* Product Title - Allow wrapping for long names */}
          <h3 className="font-semibold text-white text-sm sm:text-base mb-2 leading-tight break-words hyphens-auto line-clamp-3">
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <div className="text-xs text-[#b8b8c8] mb-2 capitalize">
              {product.category}
            </div>
          )}

          {/* Rating - Compact */}
          <div className="flex items-center mb-2">
            {product.rating > 0 ? (
              <>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < product.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#b8b8c8] ml-1">
                  ({product.numReviews || 0})
                </span>
              </>
            ) : (
              <div className="h-3 text-xs text-[#b8b8c8]">No reviews yet</div>
            )}
          </div>

          {/* Price - Prominent */}
          <div className="mb-2">
            {isOfferActive(product.offer) ? (
              <div className="flex flex-col">
                <span className="text-xs line-through text-[#b8b8c8]">
                  {formatKESPrice(product.price)}
                </span>
                <span className="text-lg sm:text-xl font-bold text-[#FDB813]">
                  {formatKESPrice(getOfferPrice(product.price, product.offer))}
                  <span className="text-xs text-[#b8b8c8] ml-1">ex VAT</span>
                </span>
              </div>
            ) : (
              <span className="text-lg sm:text-xl font-bold text-[#FDB813]">
                {formatKESPrice(product.price)}
                <span className="text-xs text-[#b8b8c8] ml-1">ex VAT</span>
              </span>
            )}
          </div>

          {/* Spacer to push buttons to bottom */}
          <div className="flex-grow"></div>
        </CardContent>

        {/* Action Buttons - Mobile Optimized */}
        <CardFooter className="p-2 sm:p-3 pt-0 mt-auto">
          <div className="flex gap-1.5 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-white hover:bg-gray-700 hover:text-white text-xs py-1.5 px-2 h-8 sm:h-9"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = generateProductUrl({
                  _id: product.id.toString(),
                  name: product.name,
                  category: product.category,
                })
              }}
            >
              View
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-[#FDB813] to-[#ff9500] hover:from-[#ff9500] hover:to-[#FDB813] text-black font-semibold text-xs py-1.5 px-2 h-8 sm:h-9 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
              onClick={handleAddToCart}
              disabled={
                (product.countInStock ??
                  product.count_in_stock ??
                  product.stock ??
                  0) === 0
              }
            >
              <ShoppingCart size={12} className="mr-1" />
              {(product.countInStock ??
                product.count_in_stock ??
                product.stock ??
                0) === 0
                ? 'Out'
                : 'Add'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default ProductCard
