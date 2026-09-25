import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import Layout from '@/components/Layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import backendService, {
  type Product,
  type ProductQueryFilters,
} from '@/services/backendService'
import { Package } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { ProductSkeleton } from '@/components/ui/product-skeleton'
import DesktopSearchResultList from '@/components/DesktopSearchResultList'
import DesktopPagination from '@/components/DesktopPagination'
import { buildPaginationHref } from '@/lib/catalogPagination'
import ProductFilterSidebar from '@/components/ProductFilterSidebar'
import {
  buildAvailableSpecificationFilters,
  type ActiveSpecificationFilters,
  type AvailableSpecificationFilter,
} from '@/lib/productSpecificationFilters'
import { findProductCategoryId, PRODUCT_CATEGORIES } from '@/lib/productCategories'
import {
  DESKTOP_PRODUCT_PAGE_SIZE,
  MOBILE_SEARCH_PAGE_SIZE,
} from '@/config/catalog'

type SearchSort = 'name' | 'price' | '-price' | '-rating'
type SearchFilterBy = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
type SearchCondition = 'all' | 'New' | 'Pre-Owned'

type SearchUrlState = {
  sortBy: SearchSort
  filterBy: SearchFilterBy
  conditionFilter: SearchCondition
  selectedBrands: string[]
  selectedCategories: string[]
  selectedSpecificationFilters: ActiveSpecificationFilters
  priceRange: [number | null, number | null]
}

const SEARCH_SORTS = new Set<SearchSort>(['name', 'price', '-price', '-rating'])
const SEARCH_FILTERS = new Set<SearchFilterBy>([
  'all',
  'in-stock',
  'low-stock',
  'out-of-stock',
])
const SEARCH_CONDITIONS = new Set<SearchCondition>(['all', 'New', 'Pre-Owned'])

const uniqueValues = (values: string[]) => Array.from(new Set(values))

const parseOptionalPrice = (value: string | null) => {
  if (!value?.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

const parseSearchUrlState = (params: URLSearchParams): SearchUrlState => {
  const rawSort = params.get('sort') || params.get('sortBy') || 'name'
  const sortAliases: Record<string, SearchSort> = {
    'price-low': 'price',
    'price-high': '-price',
    rating: '-rating',
  }
  const sortBy = SEARCH_SORTS.has(rawSort as SearchSort)
    ? rawSort as SearchSort
    : sortAliases[rawSort] || 'name'

  const rawFilter = params.get('filterBy') || 'all'
  const filterBy = SEARCH_FILTERS.has(rawFilter as SearchFilterBy)
    ? rawFilter as SearchFilterBy
    : 'all'

  const rawCondition = params.get('condition') || 'all'
  const conditionFilter = SEARCH_CONDITIONS.has(rawCondition as SearchCondition)
    ? rawCondition as SearchCondition
    : 'all'

  const selectedSpecificationFilters: ActiveSpecificationFilters = {}
  for (const [key, value] of params.entries()) {
    if (!key.startsWith('spec.') || key.length <= 5 || !value) continue
    const specificationId = key.slice(5)
    selectedSpecificationFilters[specificationId] = [
      ...(selectedSpecificationFilters[specificationId] || []),
      value,
    ]
  }

  return {
    sortBy,
    filterBy,
    conditionFilter,
    selectedBrands: uniqueValues(params.getAll('brands').filter(Boolean)),
    selectedCategories: uniqueValues(params.getAll('categories').filter(Boolean)),
    selectedSpecificationFilters,
    priceRange: [
      parseOptionalPrice(params.get('minPrice')),
      parseOptionalPrice(params.get('maxPrice')),
    ],
  }
}

const mergeProducts = (current: Product[], incoming: Product[]) => {
  const productsById = new Map(current.map((product) => [product.id, product]))
  incoming.forEach((product) => productsById.set(product.id, product))
  return Array.from(productsById.values())
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const searchTerm = searchParams.get('q') || ''
  const parsedPage = Number(searchParams.get('page') || 1)
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const urlState = useMemo(
    () => parseSearchUrlState(searchParams),
    [searchParams]
  )
  const {
    sortBy,
    filterBy,
    conditionFilter,
    selectedBrands,
    selectedCategories,
    selectedSpecificationFilters,
    priceRange,
  } = urlState
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [mobileLoadedPage, setMobileLoadedPage] = useState(0)
  const [mobileLoading, setMobileLoading] = useState(false)
  const [mobileLoadError, setMobileLoadError] = useState(false)
  const requestGenerationRef = useRef(0)
  const mobileLoadingRef = useRef(false)

  const apiFilters = useMemo<ProductQueryFilters>(() => ({
    sort: sortBy,
    filterBy: filterBy === 'all' ? undefined : filterBy,
    condition: conditionFilter === 'all' ? undefined : conditionFilter,
    brands: selectedBrands,
    categories: selectedCategories,
    minPrice: priceRange[0] ?? undefined,
    maxPrice: priceRange[1] ?? undefined,
    specifications: selectedSpecificationFilters,
  }), [
    conditionFilter,
    filterBy,
    priceRange,
    selectedBrands,
    selectedCategories,
    selectedSpecificationFilters,
    sortBy,
  ])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const updateMode = () => setIsMobile(mediaQuery.matches)
    updateMode()
    mediaQuery.addEventListener('change', updateMode)
    return () => mediaQuery.removeEventListener('change', updateMode)
  }, [])

  // Mobile always starts from API page one. The URL page is a desktop page
  // number, so using it with the mobile 50-item limit would skip results.
  const requestPage = isMobile ? 1 : currentPage
  const requestPageSize = isMobile ? MOBILE_SEARCH_PAGE_SIZE : DESKTOP_PRODUCT_PAGE_SIZE

  useEffect(() => {
    if (isMobile === null) return
    const generation = ++requestGenerationRef.current
    let active = true
    mobileLoadingRef.current = false
    setMobileLoading(false)
    setMobileLoadError(false)
    setProducts([])
    setTotalProducts(0)
    setTotalPages(1)
    setMobileLoadedPage(0)

    if (!searchTerm.trim()) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await backendService.products.getAll(
          requestPage,
          searchTerm,
          requestPageSize,
          apiFilters
        )
        if (!active || generation !== requestGenerationRef.current) return
        const pages = Math.max(1, Number(data.pages) || 1)
        setProducts(data.products)
        setTotalProducts(data.total ?? data.products.length)
        setTotalPages(pages)
        if (isMobile) setMobileLoadedPage(Math.min(pages, Math.max(1, data.page || 1)))
      } catch (error) {
        if (!active || generation !== requestGenerationRef.current) return
        console.error(
          `SearchPage: Error fetching products for "${searchTerm}":`,
          error
        )
        setProducts([])
        setTotalProducts(0)
        setTotalPages(1)
        setMobileLoadedPage(0)
      } finally {
        if (active && generation === requestGenerationRef.current) setLoading(false)
      }
    }

    void fetchProducts()
    return () => {
      active = false
    }
  }, [apiFilters, isMobile, requestPage, requestPageSize, searchTerm])

  const loadMoreSearchResults = useCallback(async () => {
    if (
      !isMobile ||
      loading ||
      mobileLoadingRef.current ||
      mobileLoadedPage < 1 ||
      mobileLoadedPage >= totalPages ||
      !searchTerm.trim()
    ) return

    const nextPage = mobileLoadedPage + 1
    const generation = requestGenerationRef.current
    mobileLoadingRef.current = true
    setMobileLoading(true)
    setMobileLoadError(false)

    try {
      const data = await backendService.products.getAll(
        nextPage,
        searchTerm,
        MOBILE_SEARCH_PAGE_SIZE,
        apiFilters
      )
      if (generation !== requestGenerationRef.current) return
      const pages = Math.max(1, Number(data.pages) || 1)
      setProducts((current) => mergeProducts(current, data.products))
      setTotalProducts(data.total ?? totalProducts)
      setTotalPages(pages)
      setMobileLoadedPage(Math.min(pages, Math.max(nextPage, data.page || nextPage)))
    } catch (error) {
      if (generation !== requestGenerationRef.current) return
      console.error(`SearchPage: Error loading page ${nextPage}:`, error)
      setMobileLoadError(true)
    } finally {
      mobileLoadingRef.current = false
      if (generation === requestGenerationRef.current) setMobileLoading(false)
    }
  }, [apiFilters, isMobile, loading, mobileLoadedPage, searchTerm, totalPages, totalProducts])

  const pageHref = (page: number) => {
    const currentUrl = typeof window === 'undefined' ? location : window.location
    return buildPaginationHref(currentUrl.pathname, currentUrl.search, page, {
      queryKey: 'page',
      hash: currentUrl.hash,
    })
  }

  const updateSearchParams = useCallback((update: (next: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams)
    update(nextParams)
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }, [searchParams, setSearchParams])

  const replaceRepeatedParams = (
    params: URLSearchParams,
    key: string,
    values: string[]
  ) => {
    params.delete(key)
    values.forEach((value) => {
      if (value) params.append(key, value)
    })
  }

  const updateSpecificationParams = (params: URLSearchParams, filters: ActiveSpecificationFilters) => {
    for (const key of Array.from(params.keys())) {
      if (key.startsWith('spec.')) params.delete(key)
    }
    Object.entries(filters).forEach(([specificationId, values]) => {
      values.filter(Boolean).forEach((value) => {
        params.append(`spec.${specificationId}`, value)
      })
    })
  }

  const clearDesktopFilters = () => {
    const nextParams = new URLSearchParams(searchParams)
    ;['filterBy', 'condition', 'brands', 'categories', 'minPrice', 'maxPrice', 'sort'].forEach((key) => {
      nextParams.delete(key)
    })
    updateSpecificationParams(nextParams, {})
    nextParams.set('page', '1')
    setSearchParams(nextParams)
  }

  const availableBrands = useMemo(() => {
    const brands = products.map((product) => product.brand).filter(Boolean) as string[]
    return Array.from(new Set([...brands, ...selectedBrands])).sort()
  }, [products, selectedBrands])

  const brandCounts = useMemo(
    () => products.reduce<Record<string, number>>((counts, product) => {
      const brand = product.brand
      if (brand?.trim()) counts[brand] = (counts[brand] || 0) + 1
      return counts
    }, {}),
    [products]
  )

  const availablePriceRange = useMemo<[number, number]>(() => {
    const prices = products
      .map((product) => product.price)
      .filter((price) => Number.isFinite(price) && price >= 0)
    return [0, Math.max(1, priceRange[1] ?? 0, ...prices)]
  }, [priceRange, products])

  const availableCategories = useMemo(() => {
    const counts = products.reduce<Record<string, number>>((result, product) => {
      const categoryId = findProductCategoryId(product.category)
      if (categoryId) result[categoryId] = (result[categoryId] || 0) + 1
      return result
    }, {})
    const categoryIds = new Set([
      ...Object.keys(counts),
      ...selectedCategories,
    ])
    const knownCategories = PRODUCT_CATEGORIES
      .filter((category) => categoryIds.has(category.id))
      .map((category) => ({
        value: category.id,
        label: category.name,
        count: counts[category.id] || 0,
      }))
    const knownIds = new Set<string>(knownCategories.map((category) => category.value))
    const retainedUnknownCategories = selectedCategories
      .filter((category) => !knownIds.has(category))
      .map((category) => ({ value: category, label: category, count: 0 }))
    return [...knownCategories, ...retainedUnknownCategories]
  }, [products, selectedCategories])

  const availableSpecificationFilters = useMemo<AvailableSpecificationFilter[]>(() => {
    const filters = buildAvailableSpecificationFilters(products)
    const filtersById = new Map(filters.map((filter) => [filter.id, filter]))

    Object.entries(selectedSpecificationFilters).forEach(([id, selectedValues]) => {
      if (selectedValues.length === 0) return
      const existing = filtersById.get(id)
      if (existing) {
        const optionValues = new Set(existing.options.map((option) => option.value.toLowerCase()))
        selectedValues.forEach((value) => {
          if (!optionValues.has(value.toLowerCase())) {
            existing.options.push({ value, label: value, count: 0 })
          }
        })
        return
      }
      filtersById.set(id, {
        id,
        label: id,
        options: selectedValues.map((value) => ({ value, label: value, count: 0 })),
      })
    })

    return Array.from(filtersById.values())
  }, [products, selectedSpecificationFilters])

  // Filtering and sorting are owned by the API. The list is intentionally not
  // filtered or sorted again on the client, so totals and page boundaries stay accurate.
  const desktopProducts = products

  return (
    <Layout>
      <div className="mx-auto mt-16 w-full px-4 py-8 lg:mt-0 lg:px-[clamp(0.75rem,1.25vw,1.5rem)] lg:py-6">
        <div className="mb-6 flex flex-col gap-4 lg:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="min-w-0 break-words text-2xl font-bold lg:text-3xl">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'Search'}
          </h1>
          <div className="flex w-full items-center gap-4 lg:w-auto">
            <Select
              value={sortBy}
              onValueChange={(value) => updateSearchParams((next) => next.set('sort', value))}
            >
              <SelectTrigger className="w-full border-gray-700 bg-gray-800 lg:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-rating">Highest rated</SelectItem>
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
        ) : products.length > 0 || Boolean(searchTerm.trim()) ? (
          <>
            <div className="grid grid-cols-1 gap-2 lg:hidden">
              {products.length === 0 && (
                <p className="py-12 text-center text-muted-foreground">No products match this search and its filters.</p>
              )}
              {products.map((product) => <ProductCard key={product.id} product={product} variant="listing" />)}
              {isMobile && mobileLoadedPage < totalPages && (
                <div className="col-span-full mt-4 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void loadMoreSearchResults()}
                    disabled={mobileLoading}
                    className="rounded-md border border-gray-700 px-5 py-2 text-sm text-gray-200 hover:border-[#FDB813]/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mobileLoading ? 'Loading more…' : 'Load more results'}
                  </button>
                  {mobileLoadError && (
                    <p className="text-sm text-red-400">Could not load more results. Try again.</p>
                  )}
                </div>
              )}
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
                onFilterByChange={(value) => updateSearchParams((next) => next.set('filterBy', value))}
                onConditionChange={(value) => updateSearchParams((next) => next.set('condition', value))}
                onBrandsChange={(brands) => updateSearchParams((next) => replaceRepeatedParams(next, 'brands', brands))}
                onCategoriesChange={(categories) => updateSearchParams((next) => replaceRepeatedParams(next, 'categories', categories))}
                onSpecificationFiltersChange={(filters) => updateSearchParams((next) => updateSpecificationParams(next, filters))}
                onPriceRangeChange={(range) => updateSearchParams((next) => {
                  if (range[0] === null) next.delete('minPrice')
                  else next.set('minPrice', String(range[0]))
                  if (range[1] === null) next.delete('maxPrice')
                  else next.set('maxPrice', String(range[1]))
                })}
                onClear={clearDesktopFilters}
              />
              <main className="min-w-0 flex-1">
                <p className="mb-3 text-base leading-6 text-gray-400">
                  Showing {desktopProducts.length} of {totalProducts} results
                </p>
                {desktopProducts.length > 0 ? (
                  <DesktopSearchResultList products={desktopProducts} />
                ) : (
                  <div className="rounded-lg border border-gray-800 py-16 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h2 className="mb-2 text-xl font-semibold">No products match these filters</h2>
                    <button type="button" onClick={clearDesktopFilters} className="text-sm font-medium text-yellow-400">Clear filters</button>
                  </div>
                )}
                {!loading && !isMobile && totalPages > 1 && (
                  <DesktopPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hrefForPage={pageHref}
                    className="mt-6"
                  />
                )}
              </main>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No products found</h2>
            <p className="text-base leading-6 text-muted-foreground">
              Your search for "{searchTerm}" did not match any products.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SearchPage
