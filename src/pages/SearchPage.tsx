import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Layout from '@/components/Layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import backendService, { type Product } from '@/services/backendService'
import { Package } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductSkeleton } from '@/components/ui/product-skeleton'
import DesktopSearchResultList from '@/components/DesktopSearchResultList'
import ProductFilterSidebar from '@/components/ProductFilterSidebar'
import {
  buildAvailableSpecificationFilters,
  matchesSpecificationFilters,
  type ActiveSpecificationFilters,
} from '@/lib/productSpecificationFilters'
import { findProductCategoryId, PRODUCT_CATEGORIES } from '@/lib/productCategories'

const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

const SearchPage = () => {
  const query = useQuery()
  const searchTerm = query.get('q') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('name')
  const [filterBy, setFilterBy] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSpecificationFilters, setSelectedSpecificationFilters] =
    useState<ActiveSpecificationFilters>({})
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([null, null])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!searchTerm) {
        setProducts([])
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await backendService.products.getAll(1, searchTerm)
        setProducts(data.products)
      } catch (error) {
        console.error(
          `SearchPage: Error fetching products for "${searchTerm}":`,
          error
        )
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchTerm])

  const sortedProducts = React.useMemo(() => {
    const sorted = [...products]
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }
    return sorted
  }, [products, sortBy])

  const availableBrands = React.useMemo(
    () => Array.from(new Set(products.map((product) => product.brand).filter(Boolean) as string[])).sort(),
    [products]
  )

  const brandCounts = React.useMemo(
    () => products.reduce<Record<string, number>>((counts, product) => {
      const brand = product.brand
      if (brand?.trim()) counts[brand] = (counts[brand] || 0) + 1
      return counts
    }, {}),
    [products]
  )

  const availablePriceRange = React.useMemo<[number, number]>(() => {
    const prices = products
      .map((product) => product.price)
      .filter((price) => Number.isFinite(price) && price >= 0)
    return [0, Math.max(1, ...prices)]
  }, [products])

  const availableCategories = React.useMemo(() => {
    const counts = products.reduce<Record<string, number>>((result, product) => {
      const categoryId = findProductCategoryId(product.category)
      if (categoryId) result[categoryId] = (result[categoryId] || 0) + 1
      return result
    }, {})
    return PRODUCT_CATEGORIES
      .filter((category) => counts[category.id])
      .map((category) => ({
        value: category.id,
        label: category.name,
        count: counts[category.id],
      }))
  }, [products])

  const desktopFilterContextProducts = React.useMemo(() => {
    return sortedProducts.filter((product) => {
      const stock = product.countInStock ?? product.count_in_stock ?? 0
      if (filterBy === 'in-stock' && stock <= 0) return false
      if (filterBy === 'low-stock' && (stock <= 0 || stock > 5)) return false
      if (filterBy === 'out-of-stock' && stock !== 0) return false
      if (conditionFilter !== 'all' && product.condition !== conditionFilter) return false
      const categoryId = findProductCategoryId(product.category)
      if (selectedCategories.length > 0 && (!categoryId || !selectedCategories.includes(categoryId))) return false
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand || '')) return false
      if (priceRange[0] !== null && product.price < priceRange[0]) return false
      if (priceRange[1] !== null && product.price > priceRange[1]) return false
      return true
    })
  }, [conditionFilter, filterBy, priceRange, selectedBrands, selectedCategories, sortedProducts])

  const availableSpecificationFilters = React.useMemo(
    () => buildAvailableSpecificationFilters(desktopFilterContextProducts),
    [desktopFilterContextProducts]
  )

  const desktopProducts = React.useMemo(
    () => desktopFilterContextProducts.filter((product) =>
      matchesSpecificationFilters(product, selectedSpecificationFilters)
    ),
    [desktopFilterContextProducts, selectedSpecificationFilters]
  )

  const clearDesktopFilters = () => {
    setFilterBy('all')
    setConditionFilter('all')
    setSelectedBrands([])
    setSelectedCategories([])
    setSelectedSpecificationFilters({})
    setPriceRange([null, null])
  }

  return (
    <Layout>
      <div className="mx-auto mt-16 w-full px-4 py-8 lg:mt-0 lg:px-[clamp(0.75rem,1.25vw,1.5rem)] lg:py-6">
        <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="min-w-0 break-words text-2xl font-bold lg:text-3xl">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Search'}
          </h1>
          <div className="flex w-full items-center gap-4 lg:w-auto">
            <Select onValueChange={setSortBy} defaultValue="name">
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 gap-2 lg:hidden">
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} variant="listing" />)}
            </div>
            <div className="hidden space-y-px overflow-hidden rounded-lg border border-gray-800 lg:block">
              {[...Array(6)].map((_, i) => <div key={i} className="h-[220px] animate-pulse bg-gray-900" />)}
            </div>
          </>
        ) : sortedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-2 lg:hidden">
              {sortedProducts.map((product) => <ProductCard key={product.id} product={product} variant="listing" />)}
            </div>
            <div className="hidden items-start gap-5 lg:mx-[clamp(1.25rem,1.9vw,2.25rem)] lg:flex">
              <ProductFilterSidebar
                filterBy={filterBy}
                conditionFilter={conditionFilter}
                selectedBrands={selectedBrands}
                availableBrands={availableBrands}
                brandCounts={brandCounts}
                availablePriceRange={availablePriceRange}
                availableCategories={availableCategories}
                selectedCategories={selectedCategories}
                availableSpecificationFilters={availableSpecificationFilters}
                selectedSpecificationFilters={selectedSpecificationFilters}
                priceRange={priceRange}
                onFilterByChange={setFilterBy}
                onConditionChange={setConditionFilter}
                onBrandsChange={setSelectedBrands}
                onCategoriesChange={setSelectedCategories}
                onSpecificationFiltersChange={setSelectedSpecificationFilters}
                onPriceRangeChange={setPriceRange}
                onClear={clearDesktopFilters}
              />
              <main className="min-w-0 flex-1">
                <p className="mb-3 text-sm text-gray-400">{desktopProducts.length} results</p>
                {desktopProducts.length > 0 ? (
                  <DesktopSearchResultList products={desktopProducts} />
                ) : (
                  <div className="rounded-lg border border-gray-800 py-16 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h2 className="mb-2 text-xl font-semibold">No products match these filters</h2>
                    <button type="button" onClick={clearDesktopFilters} className="text-sm font-medium text-yellow-400">Clear filters</button>
                  </div>
                )}
              </main>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-muted-foreground">
              Your search for "{searchTerm}" did not match any products.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SearchPage
