import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import OptimizedImage from '@/components/OptimizedImage'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { formatKESPrice } from '@/lib/currency'
import { generateProductUrl } from '@/lib/slugUtils'
import { getDiscountPercent, getOfferPrice, isOfferActive } from '@/lib/utils'
import type { Product } from '@/services/backendService'
import { getProductImageUrl } from '@/utils/imageUtils'

type DesktopProductCardProps = {
  product: Product & { href?: string }
}

const DesktopProductCard = ({ product }: DesktopProductCardProps) => {
  const { addToCart } = useCart()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const stockCount = product.countInStock ?? product.count_in_stock ?? 0
  const href =
    product.href ||
    generateProductUrl({
      _id: product.id,
      name: product.name,
      category: product.category,
    })
  const favorite = isFavorite(product.id)

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-gray-800 bg-transparent transition hover:border-yellow-500/50 hover:shadow-lg hover:shadow-black/20">
      <div className="relative aspect-[1.08/1] overflow-hidden bg-[#20202d]">
        <Link to={href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
          <OptimizedImage
            src={getProductImageUrl(product, 'thumbnail')}
            alt={`${product.name} - ${product.category || 'electronics'}`}
            className="h-full w-full bg-[#20202d]"
            imageClassName="object-contain object-center transition-transform duration-200 group-hover:scale-[1.03]"
            placeholderClassName="bg-[#20202d]"
            errorClassName="bg-[#20202d]"
            sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 20vw, 38vw"
          />
        </Link>
        {product.condition && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {product.condition}
          </span>
        )}
        {isOfferActive(product.offer) && (
          <span className="absolute bottom-2 left-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            -{getDiscountPercent(product.price, product.offer)}%
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={favorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          onClick={() => favorite ? removeFromFavorites(product.id) : addToFavorites(product)}
          className={`absolute right-2 top-2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 ${favorite ? 'text-red-400' : ''}`}
        >
          <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="flex flex-1 flex-col bg-[#232334] p-3">
        <Link to={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
          <h3 className="line-clamp-2 min-h-[2.8rem] text-[15px] font-semibold leading-[1.4rem] text-white hover:text-yellow-400">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 truncate text-xs leading-4 capitalize text-gray-400">{product.brand || product.category}</p>
        <div className="mt-3">
          {isOfferActive(product.offer) && (
            <div className="text-[11px] leading-4 text-gray-500 line-through">{formatKESPrice(product.price)}</div>
          )}
          <div className="text-lg font-bold leading-6 text-[#FDB813]">
            {formatKESPrice(isOfferActive(product.offer) ? getOfferPrice(product.price, product.offer) : product.price)}
            <span className="ml-1 text-xs font-normal text-gray-400">ex VAT</span>
          </div>
          <div className={`mt-2 text-xs font-medium leading-4 ${stockCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stockCount > 0 ? 'In stock' : 'Out of stock'}
          </div>
        </div>
        <div className="mt-auto pt-4">
          <Button
            type="button"
            size="sm"
            disabled={stockCount === 0}
            onClick={() => addToCart(product, 1)}
            className="h-8 w-full bg-[#FDB813] px-2 text-xs font-semibold text-black hover:bg-[#ff9500]"
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {stockCount > 0 ? 'Add to cart' : 'Out of stock'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default DesktopProductCard
