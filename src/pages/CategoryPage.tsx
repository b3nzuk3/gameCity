import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '@/components/Layout'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import backendService, { type Product } from '@/services/backendService'
import { useCart } from '@/contexts/CartContext'
import { Package, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { formatKESPrice } from '@/lib/currency'
import ProductCard from '@/components/ProductCard'

// Define available categories
const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'monitors', name: 'Monitors' },
  { id: 'graphics-cards', name: 'Graphics Cards' },
  { id: 'memory', name: 'Memory' },
  { id: 'processors', name: 'Processors' },
  { id: 'storage', name: 'Storage' },
  { id: 'motherboards', name: 'Motherboards' },
  { id: 'cases', name: 'Cases' },
  { id: 'power-supply', name: 'Power Supply' },
  { id: 'pre-built', name: 'PRE-BUILT' },
  { id: 'cpu-cooling', name: 'CPU Cooling' },
  { id: 'oem', name: 'OEM' },
  { id: 'accessories', name: 'Accessories' },
]

// Add this mapping from slug to display name
const CATEGORY_SLUG_TO_NAME: Record<string, string> = {
  monitors: 'Monitors',
  'graphics-cards': 'Graphics Cards',
  memory: 'Memory',
  processors: 'Processors',
  storage: 'Storage',
  motherboards: 'Motherboards',
  cases: 'Cases',
  'power-supply': 'Power Supply',
  'pre-built': 'PRE-BUILT',
  'cpu-cooling': 'CPU Cooling',
  oem: 'OEM',
  accessories: 'Accessories',
  all: 'All Products',
}

// Helper function to normalize category names
const normalizeCategory = (category: string): string => {
  if (!category) return ''
  // Map URL slugs and common variants to canonical names
  const categoryMappings: { [key: string]: string } = {
    monitors: 'monitors',
    'graphics-cards': 'graphics cards',
    'graphics card': 'graphics cards',
    'graphics cards': 'graphics cards',
    graphics: 'graphics cards',
    memory: 'memory',
    processors: 'processors',
    storage: 'storage',
    motherboards: 'motherboards',
    cases: 'cases',
    'power-supply': 'power supply',
    'power supply': 'power supply',
    'pre-built': 'pre-built',
    'pre-built-pcs': 'pre-built',
    'pre built': 'pre-built',
    'pre built pcs': 'pre-built',
    accessories: 'accessories',
  }
  // Lowercase, trim, and map
  const key = category.toLowerCase().trim()
  return categoryMappings[key] || key
}

// Helper function to check if a product belongs to a category
const isProductInCategory = (
  product: Product,
  targetCategory: string | undefined
): boolean => {
  if (!targetCategory || !product.category) return false
  if (targetCategory === 'all') return true

  const normalizedProductCategory = normalizeCategory(product.category)
  const normalizedTarget = normalizeCategory(targetCategory)

  // Special case for graphics cards
  if (normalizedTarget === 'graphics cards') {
    return (
      normalizedProductCategory === 'graphics cards' ||
      normalizedProductCategory === 'graphics'
    )
  }

  return normalizedProductCategory === normalizedTarget
}

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([
    null,
    null,
  ])
  const [priceFilterActive, setPriceFilterActive] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const { addToCart } = useCart()
  const [showFilters, setShowFilters] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const productsPerPage = 10

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = products.map((product) => product.brand).filter(Boolean)
    return Array.from(new Set(brands))
  }, [products])

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [category])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Fetch products with pagination using category-specific endpoint
        const categoryParam = category === 'all' ? 'all' : category
        const data = await backendService.products.getAllByCategory(
          categoryParam,
          currentPage,
          productsPerPage
        )
        setProducts(data.products)
        setTotalPages(data.pages || 1)
        setTotalProducts(data.total || 0)

        console.log(
          'Fetched products:',
          data.products.length,
          'Total:',
          data.total,
          'Page:',
          currentPage
        )

        // No need for additional filtering since backend handles category filtering
        setFilteredProducts(data.products)
      } catch (error) {
        console.error('CategoryPage: Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category, currentPage])

  useEffect(() => {
    let filtered = [...products]

    // 1. Category filter (always apply first)
    const selectedCategory = CATEGORY_SLUG_TO_NAME[category ?? 'all']
    if (category && category !== 'all') {
      filtered = filtered.filter(
        (product) =>
          normalizeCategory(product.category || '') ===
          normalizeCategory(selectedCategory)
      )
    }

    // 2. Stock filters
    if (filterBy === 'in-stock') {
      filtered = filtered.filter(
        (product) => (product.countInStock ?? product.count_in_stock ?? 0) > 0
      )
    } else if (filterBy === 'low-stock') {
      filtered = filtered.filter((product) => {
        const stock = product.countInStock ?? product.count_in_stock ?? 0
        return stock <= 5 && stock > 0
      })
    } else if (filterBy === 'out-of-stock') {
      filtered = filtered.filter(
        (product) => (product.countInStock ?? product.count_in_stock ?? 0) === 0
      )
    }

    // 3. Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand || '')
      )
    }

    // 4. Price range filter only if active
    if (
      priceFilterActive &&
      (priceRange[0] !== null || priceRange[1] !== null)
    ) {
      filtered = filtered.filter(
        (product) =>
          (priceRange[0] === null || product.price >= priceRange[0]) &&
          (priceRange[1] === null || product.price <= priceRange[1])
      )
    }

    // 5. Sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }, [
    products,
    sortBy,
    filterBy,
    selectedBrands,
    priceRange,
    priceFilterActive,
    category,
  ])

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

  const getCategoryTitle = () => {
    if (!category || category === 'all') return 'All Products'
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const getUniqueCategories = () => {
    const categories = products
      .map((product) => product.category)
      .filter((cat, index, self) => cat && self.indexOf(cat) === index)
    return categories
  }

  const categoryName =
    CATEGORIES.find((cat) => cat.id === category)?.name || 'All Products'
  const categoryDescription =
    category === 'all'
      ? 'Browse all gaming electronics including PCs, graphics cards, monitors, and accessories in Nairobi, Kenya.'
      : `Shop ${categoryName.toLowerCase()} in Nairobi, Kenya. High-quality gaming ${categoryName.toLowerCase()} with fast delivery across Kenya.`

  return (
    <Layout>
      <SEO
        title={`${categoryName} - Shop Online in Nairobi Kenya | GameCity Electronics`}
        description={categoryDescription}
        keywords={`${categoryName.toLowerCase()}, gaming ${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} Nairobi, ${categoryName.toLowerCase()} Kenya, buy ${categoryName.toLowerCase()} online`}
        url={`/category/${category}`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: categoryName, url: `/category/${category}` },
        ]}
      />
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {CATEGORIES.find((cat) => cat.id === category)?.name ||
              'All Products'}
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${totalProducts} products found`}
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  category === cat.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Filter Toggle Button for Mobile */}
        <div className="mb-4 flex lg:hidden">
          <Button
            variant="outline"
            className="w-full border-gray-700 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            aria-controls="filters-section"
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filters and Sorting */}
        <div
          id="filters-section"
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${
            showFilters ? '' : 'hidden'
          } lg:grid`}
        >
          {/* Stock Filter */}
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by stock..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full bg-gray-900 border-gray-700">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="rating">Rating (High to Low)</SelectItem>
            </SelectContent>
          </Select>

          {/* Brand Filter */}
          <Select
            value={selectedBrands.join(',')}
            onValueChange={(value) =>
              setSelectedBrands(value === 'all' ? [] : value.split(','))
            }
          >
            <SelectTrigger className="w-full bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by brand..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">All Brands</SelectItem>
              {availableBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range Filter */}
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0] ?? ''}
              onChange={(e) => {
                setPriceFilterActive(true)
                setPriceRange([
                  e.target.value ? Number(e.target.value) : null,
                  priceRange[1],
                ])
              }}
              className="w-24 bg-gray-900 border-gray-700"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1] ?? ''}
              onChange={(e) => {
                setPriceFilterActive(true)
                setPriceRange([
                  priceRange[0],
                  e.target.value ? Number(e.target.value) : null,
                ])
              }}
              className="w-24 bg-gray-900 border-gray-700"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-900 rounded-lg p-4 animate-pulse"
              >
                <div className="bg-gray-800 h-48 rounded-md mb-4"></div>
                <div className="bg-gray-800 h-4 rounded mb-2"></div>
                <div className="bg-gray-800 h-4 rounded w-3/4 mb-4"></div>
                <div className="bg-gray-800 h-8 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="relative">
                {product.count_in_stock <= 5 && product.count_in_stock > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 z-10 text-xs"
                  >
                    Low Stock
                  </Badge>
                )}
                {product.count_in_stock === 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 z-10 text-xs bg-gray-600"
                  >
                    Out of Stock
                  </Badge>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search criteria
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSortBy('name')
                setFilterBy('all')
                setSelectedBrands([])
                setPriceRange([null, null])
                setPriceFilterActive(false)
              }}
              className="border-gray-700 text-muted-foreground hover:text-foreground"
            >
              <Filter size={16} className="mr-2" />
              Reset Filters
            </Button>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * productsPerPage + 1} to{' '}
              {Math.min(currentPage * productsPerPage, totalProducts)} of{' '}
              {totalProducts} products
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="border-gray-700 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="border-gray-700 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CategoryPage
