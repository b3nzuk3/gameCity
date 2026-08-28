import { Link } from 'react-router-dom'
import { ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import OptimizedImage from '@/components/OptimizedImage'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'
import { getCompactProductSpecifications } from '@/lib/productSpecificationFilters'
import { generateProductUrl } from '@/lib/slugUtils'
import { getOfferPrice, isOfferActive } from '@/lib/utils'
import type { Product } from '@/services/backendService'
import { getProductImageUrl } from '@/utils/imageUtils'

const DesktopSearchResultItem = ({ product }: { product: Product }) => {
  const { addToCart } = useCart()
  const stockCount = product.countInStock ?? product.count_in_stock ?? 0
  const href = generateProductUrl({
    _id: product.id,
    name: product.name,
    category: product.category,
  })
  const compactSpecifications = getCompactProductSpecifications(product)
  const hasPrice = Number.isFinite(product.price)

  return (
    <article className="grid grid-cols-[clamp(170px,18vw,260px)_minmax(0,1fr)] items-start gap-4 py-4">
      <Link
        to={href}
        aria-label={`View ${product.name}`}
        className="block aspect-square overflow-hidden bg-[#20202d] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
      >
        <OptimizedImage
          src={getProductImageUrl(product, 'medium')}
          alt={`${product.name} - ${product.category || 'electronics'}`}
          className="h-full w-full bg-[#20202d]"
          imageClassName="object-contain object-center"
          placeholderClassName="bg-[#20202d]"
          errorClassName="bg-[#20202d]"
          sizes="(min-width: 1440px) 260px, (min-width: 1024px) 18vw, 38vw"
        />
      </Link>

      <div className="min-w-0 pt-0.5">
        <Link to={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500">
          <h2 className="line-clamp-2 text-lg font-semibold leading-6 text-white hover:text-yellow-400">
            {product.name}
          </h2>
        </Link>

        {(product.brand || product.condition) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            {product.brand && <span className="capitalize">{product.brand.trim()}</span>}
            {product.brand && product.condition && <span aria-hidden="true">•</span>}
            {product.condition && <span>{product.condition}</span>}
          </div>
        )}

        {Boolean(product.rating && product.rating > 0) && (
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-400">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <span>{product.rating}</span>
            {Boolean(product.numReviews ?? product.num_reviews) && (
              <span>({product.numReviews ?? product.num_reviews} reviews)</span>
            )}
          </div>
        )}

        {compactSpecifications.length > 0 && (
          <p className="mt-2 line-clamp-1 text-sm text-gray-300">
            {compactSpecifications.join(' • ')}
          </p>
        )}

        <div className="mt-4 flex w-full max-w-[210px] flex-col">
          {hasPrice && isOfferActive(product.offer) && (
            <span className="text-xs text-gray-500 line-through">{formatKESPrice(product.price)}</span>
          )}
          {hasPrice && (
            <span className="text-xl font-bold text-[#FDB813]">
              {formatKESPrice(isOfferActive(product.offer) ? getOfferPrice(product.price, product.offer) : product.price)}
            </span>
          )}
          {hasPrice && <span className="mt-0.5 text-xs text-gray-500">ex VAT</span>}
          <span className={`mt-3 text-sm font-medium ${stockCount > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stockCount > 0 ? 'In stock' : 'Out of stock'}
          </span>
          <Button
            type="button"
            disabled={stockCount === 0 || !hasPrice}
            onClick={() => addToCart(product, 1)}
            className="mt-4 w-full bg-[#FDB813] text-black hover:bg-[#ff9500]"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {stockCount > 0 && hasPrice ? 'Add to cart' : 'Out of stock'}
          </Button>
        </div>
      </div>
    </article>
  )
}

export default DesktopSearchResultItem
