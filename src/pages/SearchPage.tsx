import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  atlasProductService,
  type Product,
} from '@/services/atlasProductService'
import { useCart } from '@/contexts/CartContext'
import { Search, Package } from 'lucide-react'
import { formatKESPrice } from '@/lib/currency'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { addToCart } = useCart()

  const query = searchParams.get('q') || ''

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        console.log('SearchPage: Fetching all products...')
        const data = await atlasProductService.getProducts()
        setAllProducts(data)
        console.log('SearchPage: Loaded products:', data.length)
      } catch (error) {
        console.error('SearchPage: Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    } else {
      setProducts([])
    }
  }, [query, allProducts])

  const performSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setProducts([])
      return
    }

    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description &&
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (product.category &&
          product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.brand &&
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    console.log(
      `SearchPage: Found ${filteredProducts.length} products for "${searchTerm}"`
    )
    setProducts(filteredProducts)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() })
    }
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
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for games, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-16 bg-forest-800 border-forest-600"
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500"
                size="sm"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <Package className="animate-spin h-5 w-5 mr-2" />
              <span>Loading products...</span>
            </div>
          </div>
        ) : query ? (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Search results for "{query}"
              </h2>
              <p className="text-muted-foreground">
                {products.length}{' '}
                {products.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                            ;(e.target as HTMLImageElement).src =
                              '/placeholder.svg'
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

                          {product.rating && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span className="text-yellow-400 mr-1">★</span>
                              <span>{product.rating.toFixed(1)}</span>
                              {product.num_reviews && (
                                <span className="ml-1">
                                  ({product.num_reviews})
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.count_in_stock === 0}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                          size="sm"
                        >
                          {product.count_in_stock === 0
                            ? 'Out of Stock'
                            : 'Add to Cart'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  No products match your search for "{query}". Try different
                  keywords.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchParams({})
                  }}
                  variant="outline"
                  className="border-forest-600"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search for products</h3>
            <p className="text-muted-foreground">
              Enter a search term to find gaming products, accessories, and
              more.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SearchPage
