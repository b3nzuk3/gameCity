import { useParams } from 'react-router-dom'
import { useProduct } from '@/services/productService'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { formatKESPrice } from '@/lib/currency'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'
import ProductReviews from '@/components/ProductReviews'

const ProductPage = () => {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()

  if (!id) {
    return <div>Product ID is missing.</div>
  }

  const { data: product, isLoading, isError } = useProduct(id)

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
      1
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-0">
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
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl font-semibold text-yellow-400 mb-4">
            {formatKESPrice(product.price)}
          </p>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Specifications</h3>
            <div
              className="prose prose-sm md:prose-base prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          <p className="text-sm text-muted-foreground mb-4 mt-4">
            Availability:{' '}
            {product.countInStock > 0
              ? `${product.countInStock} in stock`
              : 'Out of Stock'}
          </p>

          <div className="mt-auto pt-4">
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
      <ProductReviews productId={product._id} reviews={product.reviews} />
    </div>
  )
}

export default ProductPage
