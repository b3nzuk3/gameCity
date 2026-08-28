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
import { getProductImageUrl } from '@/utils/imageUtils'
import { cn } from '@/lib/utils'

interface ProductProps {
  variant?: 'default' | 'listing'
  product: {
    id: string | number
    name: string
    image: string
    image_r2?: string
    image_r2_variants?: {
      thumbnail?: string
      medium?: string
      large?: string
    }
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
    href?: string
  }
}

const ProductCard = ({ product, variant = 'default' }: ProductProps) => {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const isListing = variant === 'listing'
  const stockCount =
    product.countInStock ?? product.count_in_stock ?? product.stock ?? 0

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

  const isProductFavorite = isFavorite(product.id)

  return (
    <Link
      to={product.href || generateProductUrl({
        _id: product.id.toString(),
        name: product.name,
        category: product.category,
      })}
      tabIndex={0}
      className="block focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-lg"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card
        className={cn(
          'bg-[#232334] border-gray-700 overflow-hidden hover:border-yellow-500/50 transition-all duration-200 group cursor-pointer hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98] h-full',
          isListing
            ? 'grid min-h-[178px] grid-cols-[minmax(112px,38%)_minmax(0,1fr)] lg:flex lg:min-h-[400px] lg:flex-col'
            : 'flex min-h-[350px] flex-col sm:min-h-[400px]'
        )}
      >
        {/* Product Image - Optimized for mobile */}
        <div
          className={cn(
            'relative overflow-hidden',
            isListing
              ? 'min-h-[178px] bg-[#1b1b27] lg:min-h-0 lg:aspect-square lg:bg-white'
              : 'aspect-square bg-white'
          )}
        >
          <OptimizedImage
            src={getProductImageUrl(product, "thumbnail")}
            alt={`${product.name} - Gaming ${
              product.category || 'electronics'
            } in Nairobi Kenya`}
            className={cn(
              'w-full h-full transition-transform duration-300 group-hover:scale-105',
              isListing && 'bg-[#1b1b27] lg:bg-gray-100'
            )}
            imageClassName={cn(
              isListing ? 'object-contain p-1.5 lg:object-cover lg:p-0' : 'object-cover'
            )}
            placeholderClassName={cn(
              isListing && 'bg-[#1b1b27] lg:bg-gray-200'
            )}
            errorClassName={cn(
              isListing && 'bg-[#1b1b27] lg:bg-gray-100'
            )}
            sizes={
              isListing
                ? '(max-width: 767px) 38vw, (max-width: 1200px) 33vw, 25vw'
                : '(max-width: 374px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
            }
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
          <div className={cn('absolute top-2 right-2 z-10', isListing && 'hidden lg:block')}>
            <div
              className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                stockCount > 0
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {stockCount > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white transition-all duration-200',
              isListing ? 'h-10 w-10 lg:h-8 lg:w-8' : 'h-8 w-8',
              isProductFavorite ? 'text-red-400' : 'hover:text-red-400'
            )}
            onClick={handleToggleFavorite}
            aria-label={
              isProductFavorite
                ? `Remove ${product.name} from favorites`
                : `Add ${product.name} to favorites`
            }
          >
            <Heart
              className={`h-4 w-4 ${isProductFavorite ? 'fill-current' : ''}`}
            />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Product Content - Compact for mobile */}
          <CardContent
            className={cn(
              'flex min-h-0 flex-grow flex-col',
              isListing ? 'p-2.5 pb-1 lg:p-4' : 'p-2 sm:p-4'
            )}
          >
          {/* Product Title - Allow wrapping for long names */}
          <h3
            className={cn(
              'font-semibold text-white leading-tight break-words hyphens-auto line-clamp-3',
              isListing ? 'mb-1.5 text-sm lg:mb-2 lg:text-base' : 'mb-2 text-sm sm:text-base'
            )}
          >
            {product.name}
          </h3>

          {/* Category */}
          {product.category && (
            <div className={cn('text-xs text-[#b8b8c8] capitalize', isListing ? 'mb-1 lg:mb-2' : 'mb-2')}>
              {product.category}
            </div>
          )}

          {/* Rating - Compact */}
          <div className={cn('flex items-center', isListing ? 'mb-1 lg:mb-2' : 'mb-2')}>
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
          <div className={cn(isListing ? 'mb-1 lg:mb-2' : 'mb-2')}>
            {isOfferActive(product.offer) ? (
              <div className="flex flex-col">
                <span className="text-xs line-through text-[#b8b8c8]">
                  {formatKESPrice(product.price)}
                </span>
                <span
                  className={cn(
                    'font-bold text-[#FDB813] tabular-nums leading-tight',
                    isListing ? 'text-base lg:text-xl' : 'text-lg sm:text-xl'
                  )}
                >
                  {formatKESPrice(getOfferPrice(product.price, product.offer))}
                  <span className="text-xs text-[#b8b8c8] ml-1">ex VAT</span>
                </span>
              </div>
            ) : (
              <span
                className={cn(
                  'font-bold text-[#FDB813] tabular-nums leading-tight',
                  isListing ? 'text-base lg:text-xl' : 'text-lg sm:text-xl'
                )}
              >
                {formatKESPrice(product.price)}
                <span className="text-xs text-[#b8b8c8] ml-1">ex VAT</span>
              </span>
            )}
          </div>

          {isListing && (
            <div
              className={cn(
                'mb-1 text-xs font-medium lg:hidden',
                stockCount > 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {stockCount > 0 ? 'In Stock' : 'Out of Stock'}
            </div>
          )}

          {/* Spacer to push buttons to bottom */}
          <div className="flex-grow"></div>
          </CardContent>

          {/* Action Buttons - Mobile Optimized */}
          <CardFooter
            className={cn(
              'mt-auto pt-0',
              isListing
                ? 'p-2.5 pt-0 lg:p-3 lg:pt-0'
                : 'p-2 pt-0 sm:p-3 sm:pt-0'
            )}
          >
            <div className="flex gap-1.5 w-full">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'min-w-0 flex-1 border-gray-600 px-2 py-1.5 text-xs text-white hover:bg-gray-700 hover:text-white',
                isListing ? 'hidden lg:inline-flex lg:h-9' : 'h-8 sm:h-9'
              )}
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
              className={cn(
                'min-w-0 flex-1 bg-gradient-to-r from-[#FDB813] to-[#ff9500] hover:from-[#ff9500] hover:to-[#FDB813] text-black font-semibold text-xs py-1.5 px-2 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95',
                isListing ? 'h-10 lg:h-9' : 'h-8 sm:h-9'
              )}
              onClick={handleAddToCart}
              disabled={stockCount === 0}
            >
              <ShoppingCart size={12} className="mr-1" />
              {stockCount === 0 ? 'Out' : 'Add'}
            </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  )
}

export default ProductCard
