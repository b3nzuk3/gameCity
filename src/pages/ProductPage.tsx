import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct, useProductBySlug } from '@/services/productService'
import { extractProductId, generateProductUrl } from '@/lib/slugUtils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'
import { getOfferPrice, getDiscountPercent, isOfferActive } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import ProductReviews from '@/components/ProductReviews'
import SimilarProducts from '@/components/SimilarProducts'
import Layout from '@/components/Layout'
import SEO from '@/components/SEO'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const ProductPage = () => {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  if (!id) {
    return <div>Product ID is missing.</div>
  }

  // Check if the ID is a MongoDB ObjectId or a slug
  const isObjectId = /^[a-f\d]{24}$/i.test(id)

  // Use appropriate hook based on ID format
  const {
    data: product,
    isLoading,
    isError,
  } = isObjectId ? useProduct(id) : useProductBySlug(id)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on('select', handleSelect)

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return <div>Error loading product or product not found.</div>
  }

  const images = [product.image, ...(product.images || [])].filter(Boolean)

  const handleAddToCart = () => {
    addToCart(
      {
        id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
      },
      quantity
    )
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.countInStock) {
      setQuantity(newQuantity)
    }
  }

  return (
    <Layout>
      <SEO
        title={`${product.name} - Buy in Kenya | Best Price | GameCity Electronics`}
        description={`${product.description.substring(0, 150)}... Buy ${
          product.name
        } in Nairobi, Kenya. Fast delivery, best prices. ${
          isOfferActive(product.offer)
            ? `Now ${getDiscountPercent(product.price, product.offer)}% off!`
            : ''
        }`}
        keywords={`${product.name}, ${
          product.category
        }, gaming, Nairobi, Kenya, buy online, ${
          product.brand || 'gaming electronics'
        }`}
        image={product.image}
        url={
          product
            ? generateProductUrl({
                _id: product._id,
                name: product.name,
                category: product.category,
              })
            : `/product/${id}`
        }
        type="product"
        product={
          product
            ? {
                name: product.name,
                price: isOfferActive(product.offer)
                  ? getOfferPrice(product.price, product.offer)
                  : product.price,
                currency: 'KES',
                availability: 'InStock',
                brand: product.brand || 'GameCity',
                image: product.image,
                description: product.description,
              }
            : undefined
        }
        breadcrumbs={[
          { name: 'Home', url: '/' },
          {
            name: product?.category || 'Products',
            url: `/category/${product?.category
              ?.toLowerCase()
              .replace(/\s+/g, '-')}`,
          },
          {
            name: product?.name || 'Product',
            url: product
              ? generateProductUrl({
                  _id: product._id,
                  name: product.name,
                  category: product.category,
                })
              : `/product/${id}`,
          },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((img, index) => (
                  <CarouselItem key={index}>
                    <Card>
                      <CardContent className="relative flex aspect-square items-center justify-center p-0">
                        {isOfferActive(product.offer) && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                            -{getDiscountPercent(product.price, product.offer)}%
                          </div>
                        )}
                        <img
                          src={img}
                          alt={`${product.name} image ${index + 1}`}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      'overflow-hidden rounded-lg aspect-square border-2',
                      current === index
                        ? 'border-yellow-400'
                        : 'border-transparent'
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="mb-4">
              {isOfferActive(product.offer) ? (
                <div className="flex flex-col">
                  <span className="text-sm line-through text-muted-foreground">
                    {formatKESPrice(product.price)}
                  </span>
                  <p className="text-2xl font-semibold text-yellow-400">
                    {formatKESPrice(
                      getOfferPrice(product.price, product.offer)
                    )}
                    <span className="text-base text-muted-foreground ml-2 align-middle">
                      ex VAT
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-semibold text-yellow-400">
                  {formatKESPrice(product.price)}
                  <span className="text-base text-muted-foreground ml-2 align-middle">
                    ex VAT
                  </span>
                </p>
              )}
            </div>

            {/* Specifications Section */}
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-2">Specifications</h3>
                  <table className="w-full text-sm mb-4">
                    <tbody>
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <tr key={key}>
                            <td className="font-medium pr-4 py-1">{key}</td>
                            <td className="py-1">{value}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            {/* Description Section */}
            {product.description && (
              <div className="mt-8">
                <h4 className="font-semibold text-lg mb-2">
                  Product Description
                </h4>
                <div className="prose prose-sm md:prose-base prose-invert max-w-none whitespace-pre-line">
                  {product.description}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-4 mt-4">
              Availability:{' '}
              {product.countInStock > 0
                ? `${product.countInStock} in stock`
                : 'Out of Stock'}
            </p>

            <div className="mt-auto pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">Quantity:</p>
                <div className="flex items-center border border-gray-700 rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    className="w-16 h-10 text-center bg-transparent border-x-0 border-y-0 focus-visible:ring-0"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    max={product.countInStock}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.countInStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black"
              >
                <ShoppingCart size={20} className="mr-2" />
                {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
        <ProductReviews productId={product._id} />
        {product.category && (
          <SimilarProducts
            category={product.category}
            currentProductId={product._id}
          />
        )}
      </div>
    </Layout>
  )
}

export default ProductPage
