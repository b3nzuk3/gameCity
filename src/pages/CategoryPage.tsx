import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import Layout from '@/components/Layout'
import SEO from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Product } from '@/services/backendService'
import { Package, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import ProductCard from '@/components/ProductCard'
import MobileCatalogControls, {
  type MobileCatalogFilterValues,
} from '@/components/MobileCatalogControls'
import { ProductSkeleton } from '@/components/ui/product-skeleton'
import {
  CATEGORY_PAGE_SIZE,
  fetchProductsByCategory,
  useCategoryProducts,
  useCategoryProductCount,
} from '@/services/productService'
import { generateProductUrl } from '@/lib/slugUtils'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  catalogPagePath,
  createCatalogSnapshot,
  mergeCatalogPage,
  nextCatalogPage,
  parseCatalogSnapshot,
  snapshotKey,
} from '@/lib/infiniteCatalog'
import { PRODUCT_CATEGORIES as CATEGORIES } from '@/lib/productCategories'

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
  laptops: 'Laptops',
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
    laptops: 'laptops',
  }
  // Lowercase, trim, and map
  const key = category.toLowerCase().trim()
  return categoryMappings[key] || key
}

type ProductBatch = { page: number; products: Product[] }

type FilterPreferences = {
  sortBy: string
  filterBy: string
  conditionFilter: string
  priceRange: [number | null, number | null]
  priceFilterActive: boolean
  selectedBrands: string[]
}

const DEFAULT_FILTERS: FilterPreferences = {
  sortBy: 'name',
  filterBy: 'all',
  conditionFilter: 'all',
  priceRange: [null, null],
  priceFilterActive: false,
  selectedBrands: [],
}

const filterPreferencesKey = (category: string) =>
  `gamecity:catalog-filters:${encodeURIComponent(category)}`

const readFilterPreferences = (category: string): FilterPreferences => {
  if (typeof window === 'undefined') return DEFAULT_FILTERS
  try {
    const parsed = JSON.parse(sessionStorage.getItem(filterPreferencesKey(category)) || '')
    return {
      ...DEFAULT_FILTERS,
      ...parsed,
      priceRange: Array.isArray(parsed.priceRange) ? parsed.priceRange : [null, null],
      selectedBrands: Array.isArray(parsed.selectedBrands) ? parsed.selectedBrands : [],
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

const CategoryPage = () => {
  const { category, page: routePage } = useParams<{ category: string; page?: string }>()
  const [searchParams] = useSearchParams()
  const currentPage = Math.max(1, Number(routePage || searchParams.get('page') || 1))
  const categoryParam = category === 'all' ? 'all' : category || 'all'
  const isMobile = useIsMobile()
  const queryClient = useQueryClient()
  const categoryQuery = useCategoryProducts(categoryParam, currentPage, CATEGORY_PAGE_SIZE)
  const products = useMemo(
    () => categoryQuery.data?.products || [],
    [categoryQuery.data?.products]
  )
  const loading = categoryQuery.isLoading
  const [sortBy, setSortBy] = useState(DEFAULT_FILTERS.sortBy)
  const [filterBy, setFilterBy] = useState(DEFAULT_FILTERS.filterBy)
  const [conditionFilter, setConditionFilter] = useState<string>(
    DEFAULT_FILTERS.conditionFilter
  )
  const [priceRange, setPriceRange] = useState<[number | null, number | null]>([
    ...DEFAULT_FILTERS.priceRange,
  ])
  const [priceFilterActive, setPriceFilterActive] = useState(
    DEFAULT_FILTERS.priceFilterActive
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    DEFAULT_FILTERS.selectedBrands
  )
  const [filterPreferencesHydrated, setFilterPreferencesHydrated] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [mobileCatalogNavTarget, setMobileCatalogNavTarget] =
    useState<HTMLElement | null>(null)

  const [mobileBatches, setMobileBatches] = useState<ProductBatch[]>([])
  const [mobileTotalPages, setMobileTotalPages] = useState(1)
  const [activeMobilePage, setActiveMobilePage] = useState(currentPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null)
  const [mobileInitialized, setMobileInitialized] = useState(false)
  const productGridRef = useRef<HTMLDivElement>(null)
  const loadSentinelRef = useRef<HTMLDivElement>(null)
  const loadingMoreRef = useRef(false)
  const requestedPagesRef = useRef(new Set<number>())
  const requestGenerationRef = useRef(0)

  // Pagination state
  const totalPages = categoryQuery.data?.pages || 1
  const totalProducts = categoryQuery.data?.total || 0
  const productsPerPage = CATEGORY_PAGE_SIZE
  const pageHref = (page: number) => catalogPagePath(categoryParam, page)

  const filterStateKey = useMemo(
    () =>
      JSON.stringify({
        sortBy,
        filterBy,
        conditionFilter,
        priceRange,
        priceFilterActive,
        selectedBrands: [...selectedBrands].sort(),
      }),
    [
      sortBy,
      filterBy,
      conditionFilter,
      priceRange,
      priceFilterActive,
      selectedBrands,
    ]
  )
  const catalogSnapshotKey = useMemo(
    () => snapshotKey(categoryParam, filterStateKey),
    [categoryParam, filterStateKey]
  )
  const previousCatalogContext = useRef(`${categoryParam}|${filterStateKey}`)
  const didHydrateFilterPreferences = useRef(false)

  const rawBatches = useMemo<ProductBatch[]>(
    () =>
      isMobile && (mobileInitialized || mobileBatches.length > 0)
        ? mobileBatches
        : [{ page: currentPage, products }],
    [currentPage, isMobile, mobileBatches, mobileInitialized, products]
  )

  const allLoadedProducts = useMemo(
    () => rawBatches.flatMap((batch) => batch.products),
    [rawBatches]
  )

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = allLoadedProducts.map((product) => product.brand).filter(Boolean)
    return Array.from(new Set(brands))
  }, [allLoadedProducts])
  const availablePriceRange = useMemo<[number, number]>(() => {
    const prices = allLoadedProducts
      .map((product) => product.price)
      .filter((price) => Number.isFinite(price) && price >= 0)
    return [0, Math.max(1, ...prices)]
  }, [allLoadedProducts])

  const appliedMobileFilters = useMemo<MobileCatalogFilterValues>(
    () => ({
      sortBy,
      filterBy,
      conditionFilter,
      priceRange,
      priceFilterActive,
      selectedBrands,
    }),
    [
      conditionFilter,
      filterBy,
      priceFilterActive,
      priceRange,
      selectedBrands,
      sortBy,
    ]
  )
  const filteredCountQuery = useCategoryProductCount(
    categoryParam,
    {
      filterBy,
      conditionFilter,
      priceRange,
      priceFilterActive,
      selectedBrands,
    },
    filterPreferencesHydrated
  )
  const mobileResultCount = filteredCountQuery.data ?? null
  const mobileResultCountLoading =
    filterPreferencesHydrated &&
    filteredCountQuery.data === undefined &&
    filteredCountQuery.isFetching

  const applyMobileFilters = useCallback(
    (nextFilters: MobileCatalogFilterValues) => {
      setSortBy(nextFilters.sortBy)
      setFilterBy(nextFilters.filterBy)
      setConditionFilter(nextFilters.conditionFilter)
      setPriceRange([...nextFilters.priceRange])
      setPriceFilterActive(nextFilters.priceFilterActive)
      setSelectedBrands([...nextFilters.selectedBrands])
    },
    []
  )

  const clearMobileFilters = useCallback(() => {
    setSortBy(DEFAULT_FILTERS.sortBy)
    setFilterBy(DEFAULT_FILTERS.filterBy)
    setConditionFilter(DEFAULT_FILTERS.conditionFilter)
    setPriceRange([...DEFAULT_FILTERS.priceRange])
    setPriceFilterActive(DEFAULT_FILTERS.priceFilterActive)
    setSelectedBrands([])
  }, [])

  useEffect(() => {
    setMobileCatalogNavTarget(document.getElementById('mobile-catalog-nav-slot'))
  }, [])

  useEffect(() => {
    if (categoryQuery.error) console.error('CategoryPage: Error fetching products:', categoryQuery.error)
  }, [categoryQuery.error])

  const previousCategory = useRef(categoryParam)
  useEffect(() => {
    const isFirstHydration = !didHydrateFilterPreferences.current
    if (!isFirstHydration && previousCategory.current === categoryParam) return
    previousCategory.current = categoryParam
    const preferences = readFilterPreferences(categoryParam)
    if (isFirstHydration) {
      previousCatalogContext.current = `${categoryParam}|${JSON.stringify({
        sortBy: preferences.sortBy,
        filterBy: preferences.filterBy,
        conditionFilter: preferences.conditionFilter,
        priceRange: preferences.priceRange,
        priceFilterActive: preferences.priceFilterActive,
        selectedBrands: [...preferences.selectedBrands].sort(),
      })}`
      didHydrateFilterPreferences.current = true
    }
    setSortBy(preferences.sortBy)
    setFilterBy(preferences.filterBy)
    setConditionFilter(preferences.conditionFilter)
    setPriceRange(preferences.priceRange)
    setPriceFilterActive(preferences.priceFilterActive)
    setSelectedBrands(preferences.selectedBrands)
    setFilterPreferencesHydrated(true)
  }, [categoryParam])

  // Derive synchronously so prerendered HTML contains the product cards on the
  // first render. Effects do not run during server-side rendering.
  const filterProducts = useCallback((batchProducts: Product[]) => {
    let filtered = [...batchProducts]

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

    // 3. Condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter((product) => product.condition === conditionFilter)
    }

    // 4. Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.brand || ''))
    }

    // 5. Price range filter only if active
    if (priceFilterActive && (priceRange[0] !== null || priceRange[1] !== null)) {
      filtered = filtered.filter(
        (product) =>
          (priceRange[0] === null || product.price >= priceRange[0]) &&
          (priceRange[1] === null || product.price <= priceRange[1])
      )
    }

    // 6. Sorting
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
    }

    return filtered
  }, [
    sortBy,
    filterBy,
    conditionFilter,
    selectedBrands,
    priceRange,
    priceFilterActive,
    category,
  ])

  const displayBatches = useMemo(
    () =>
      rawBatches.map((batch) => ({
        page: batch.page,
        products: filterProducts(batch.products),
      })),
    [filterProducts, rawBatches]
  )

  const filteredProducts = useMemo(
    () => displayBatches.flatMap((batch) => batch.products),
    [displayBatches]
  )

  const productLinks = useMemo(() => {
    const nameCounts = new Map<string, number>()
    return new Map(
      filteredProducts.map((product) => {
        const key = product.name.trim().toLowerCase()
        const occurrence = nameCounts.get(key) || 0
        nameCounts.set(key, occurrence + 1)
        const baseUrl = generateProductUrl({
          _id: product.id,
          name: product.name,
          category: product.category,
        })
        const href = occurrence === 0
          ? baseUrl
          : baseUrl.replace(/-nairobi$/, `-${product.id}-nairobi`)
        return [product.id, href] as const
      })
    )
  }, [filteredProducts])

  const replaceMobileUrl = useCallback(
    (page: number) => {
      const path = catalogPagePath(categoryParam, page)
      if (window.location.pathname === path) return
      window.history.replaceState(
        { ...window.history.state, gameCityCatalogPage: page },
        '',
        path
      )
    },
    [categoryParam]
  )

  const fetchMobilePage = useCallback(
    (page: number) =>
      queryClient.fetchQuery({
        queryKey: ['category-products', categoryParam, page, CATEGORY_PAGE_SIZE],
        queryFn: () =>
          fetchProductsByCategory(categoryParam, page, CATEGORY_PAGE_SIZE),
        staleTime: 5 * 60 * 1000,
      }),
    [categoryParam, queryClient]
  )

  const loadNextPage = useCallback(async (retry = false) => {
    if (!isMobile || loadingMoreRef.current || (loadMoreError && !retry)) return
    const nextPage = nextCatalogPage(
      mobileBatches,
      mobileTotalPages,
      requestedPagesRef.current
    )
    if (nextPage === null) return

    const generation = requestGenerationRef.current
    requestedPagesRef.current.add(nextPage)
    loadingMoreRef.current = true
    setIsLoadingMore(true)
    setLoadMoreError(false)

    try {
      const response = await fetchMobilePage(nextPage)
      if (generation !== requestGenerationRef.current) return
      setMobileBatches((current) =>
        mergeCatalogPage(current, nextPage, response.products)
      )
      setMobileTotalPages(response.pages)
    } catch {
      if (generation === requestGenerationRef.current) {
        requestedPagesRef.current.delete(nextPage)
        setLoadMoreError(true)
      }
    } finally {
      if (generation === requestGenerationRef.current) {
        loadingMoreRef.current = false
        setIsLoadingMore(false)
      }
    }
  }, [
    fetchMobilePage,
    isMobile,
    loadMoreError,
    mobileBatches,
    mobileTotalPages,
  ])

  const persistSnapshot = useCallback(() => {
    if (!isMobile || mobileBatches.length === 0) return
    try {
      sessionStorage.setItem(
        catalogSnapshotKey,
        createCatalogSnapshot({
          key: catalogSnapshotKey,
          pages: mobileBatches,
          scrollY: window.scrollY,
          activePage: activeMobilePage,
          totalPages: mobileTotalPages,
        })
      )
      window.history.replaceState(
        {
          ...window.history.state,
          gameCityCatalogSnapshotKey: catalogSnapshotKey,
          gameCityCatalogScrollY: window.scrollY,
        },
        '',
        window.location.href
      )
    } catch {
      // Browsing should continue even if storage is disabled or full.
    }
  }, [
    activeMobilePage,
    catalogSnapshotKey,
    isMobile,
    mobileBatches,
    mobileTotalPages,
  ])

  useEffect(() => {
    if (typeof window === 'undefined' || !filterPreferencesHydrated) return
    try {
      sessionStorage.setItem(
        filterPreferencesKey(categoryParam),
        JSON.stringify({
          sortBy,
          filterBy,
          conditionFilter,
          priceRange,
          priceFilterActive,
          selectedBrands,
        })
      )
    } catch {
      // Filters still work when session storage is unavailable.
    }
  }, [
    categoryParam,
    conditionFilter,
    filterBy,
    filterPreferencesHydrated,
    priceFilterActive,
    priceRange,
    selectedBrands,
    sortBy,
  ])

  useEffect(() => {
    if (!isMobile || mobileInitialized || !filterPreferencesHydrated) return
    const shouldRestore =
      window.history.state?.gameCityCatalogSnapshotKey === catalogSnapshotKey
    let restored = null
    if (shouldRestore) {
      try {
        restored = parseCatalogSnapshot(
          sessionStorage.getItem(catalogSnapshotKey),
          catalogSnapshotKey
        )
      } catch {
        restored = null
      }
    }
    if (restored) {
      setMobileInitialized(true)
      requestedPagesRef.current = new Set(
        restored.pages.map((batch: ProductBatch) => batch.page)
      )
      setMobileBatches(restored.pages)
      setMobileTotalPages(restored.totalPages)
      setActiveMobilePage(restored.activePage)
      setRestoreScrollY(restored.scrollY)
      return
    }

    if (categoryQuery.data?.page !== currentPage) return
    setMobileInitialized(true)
    requestedPagesRef.current = new Set([currentPage])
    setMobileBatches([
      { page: currentPage, products: categoryQuery.data.products },
    ])
    setMobileTotalPages(categoryQuery.data.pages)
    setActiveMobilePage(currentPage)
  }, [
    catalogSnapshotKey,
    categoryQuery.data,
    currentPage,
    filterPreferencesHydrated,
    isMobile,
    mobileInitialized,
  ])

  useEffect(() => {
    const nextContext = `${categoryParam}|${filterStateKey}`
    if (previousCatalogContext.current === nextContext) return
    previousCatalogContext.current = nextContext
    requestGenerationRef.current += 1
    requestedPagesRef.current.clear()
    loadingMoreRef.current = false
    setIsLoadingMore(false)
    setLoadMoreError(false)
    setMobileBatches([])
    setActiveMobilePage(1)

    if (!isMobile) {
      setMobileInitialized(false)
      return
    }
    setMobileInitialized(true)
    replaceMobileUrl(1)
    const generation = requestGenerationRef.current
    requestedPagesRef.current.add(1)
    loadingMoreRef.current = true
    setIsLoadingMore(true)
    void fetchMobilePage(1)
      .then((response) => {
        if (generation !== requestGenerationRef.current) return
        setMobileBatches([{ page: 1, products: response.products }])
        setMobileTotalPages(response.pages)
      })
      .catch(() => {
        if (generation !== requestGenerationRef.current) return
        requestedPagesRef.current.delete(1)
        setLoadMoreError(true)
      })
      .finally(() => {
        if (generation !== requestGenerationRef.current) return
        loadingMoreRef.current = false
        setIsLoadingMore(false)
      })
  }, [
    categoryParam,
    fetchMobilePage,
    filterStateKey,
    isMobile,
    replaceMobileUrl,
  ])

  useEffect(() => {
    if (!isMobile || !loadSentinelRef.current || loadMoreError) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage()
      },
      { rootMargin: '500px 0px' }
    )
    observer.observe(loadSentinelRef.current)
    return () => observer.disconnect()
  }, [isMobile, loadMoreError, loadNextPage, mobileBatches])

  useEffect(() => {
    if (!isMobile || !productGridRef.current) return
    const markers = productGridRef.current.querySelectorAll<HTMLElement>(
      '[data-catalog-page]'
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (!visible) return
        const page = Number((visible.target as HTMLElement).dataset.catalogPage)
        if (!Number.isInteger(page)) return
        setActiveMobilePage(page)
        replaceMobileUrl(page)
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    )
    markers.forEach((marker) => observer.observe(marker))
    return () => observer.disconnect()
  }, [displayBatches, isMobile, replaceMobileUrl])

  useEffect(() => {
    if (restoreScrollY === null || mobileBatches.length === 0) return
    const firstFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: restoreScrollY, behavior: 'auto' })
        setRestoreScrollY(null)
      })
    })
    return () => cancelAnimationFrame(firstFrame)
  }, [mobileBatches, restoreScrollY])

  useEffect(() => {
    if (!isMobile) return
    window.addEventListener('pagehide', persistSnapshot)
    return () => window.removeEventListener('pagehide', persistSnapshot)
  }, [isMobile, persistSnapshot])

  const categoryName =
    CATEGORIES.find((cat) => cat.id === category)?.name || 'All Products'
  const categoryDescription =
    category === 'all'
      ? 'Browse all gaming electronics including PCs, graphics cards, monitors, and accessories in Nairobi, Kenya.'
      : `Shop ${categoryName.toLowerCase()} in Nairobi, Kenya. High-quality gaming ${categoryName.toLowerCase()} with fast delivery across Kenya.`
  const lastMobilePage = Math.max(
    ...mobileBatches.map((batch) => batch.page),
    mobileBatches.length === 0 ? currentPage : 0
  )
  const hasMoreMobile = lastMobilePage < mobileTotalPages

  return (
    <Layout>
      <SEO
        title={`${categoryName} - Shop Online in Nairobi Kenya | GameCity Electronics`}
        description={categoryDescription}
        keywords={`${categoryName.toLowerCase()}, gaming ${categoryName.toLowerCase()}, ${categoryName.toLowerCase()} Nairobi, ${categoryName.toLowerCase()} Kenya, buy ${categoryName.toLowerCase()} online`}
        url={
          routePage
            ? catalogPagePath(categoryParam, currentPage)
            : `/category/${categoryParam}`
        }
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: categoryName, url: `/category/${category}` },
        ]}
      />
      {mobileCatalogNavTarget &&
        createPortal(
          <MobileCatalogControls
            categories={CATEGORIES}
            activeCategory={categoryParam}
            filters={appliedMobileFilters}
            availableBrands={availableBrands}
            availablePriceRange={availablePriceRange}
            resultCount={mobileResultCount}
            resultCountLoading={mobileResultCountLoading}
            onApplyFilters={applyMobileFilters}
            onClearFilters={clearMobileFilters}
          />,
          mobileCatalogNavTarget
        )}
      <div className="container mx-auto px-4 pb-8 pt-16 md:py-8 md:mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {CATEGORIES.find((cat) => cat.id === category)?.name ||
              'All Products'}
          </h1>
          <p className="text-muted-foreground" aria-live="polite">
            {loading || (isMobile && mobileResultCountLoading)
              ? 'Loading...'
              : isMobile
                ? mobileResultCount === null
                  ? 'Product count unavailable'
                  : `${mobileResultCount} products found`
                : `${totalProducts} products found`}
          </p>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            {category === 'all'
              ? 'Browse GameCity Electronics products for gaming, PC building, and creative work in Nairobi, Kenya.'
              : `Browse ${categoryName.toLowerCase()} from GameCity Electronics. Compare products, specifications, prices, and stock availability.`}
          </p>
        </div>

        {/* Category Navigation */}
        <div
          data-desktop-category-navigation
          className="mb-8 hidden overflow-x-auto md:block"
        >
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
        <div
          data-tablet-filter-toggle
          className="mb-4 hidden md:flex lg:hidden"
        >
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
          data-desktop-filters
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 ${
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

          {/* Condition Filter */}
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filter by condition..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Pre-Owned">Pre-Owned</SelectItem>
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
        {loading || (isMobile && isLoadingMore && mobileBatches.length === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductSkeleton key={index} variant="listing" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            ref={productGridRef}
            onClickCapture={(event) => {
              if ((event.target as HTMLElement).closest('a[href*="/product/"]')) {
                persistSnapshot()
              }
            }}
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6"
          >
            {displayBatches.map((batch) => (
              <section key={batch.page} className="contents" aria-label={`Page ${batch.page}`}>
                <div
                  data-catalog-page={batch.page}
                  className="col-span-full h-px"
                  aria-hidden="true"
                />
                {batch.products.map((product) => (
                  <div key={product.id} className="relative">
                    {(product.count_in_stock ?? product.countInStock ?? 0) <= 5 &&
                      (product.count_in_stock ?? product.countInStock ?? 0) > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2 z-10 hidden text-xs md:inline-flex"
                        >
                          Low Stock
                        </Badge>
                      )}
                    {(product.count_in_stock ?? product.countInStock ?? 0) === 0 && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 z-10 hidden text-xs bg-gray-600 md:inline-flex"
                      >
                        Out of Stock
                      </Badge>
                    )}
                    <ProductCard
                      variant="listing"
                      product={{ ...product, href: productLinks.get(product.id) }}
                    />
                  </div>
                ))}
              </section>
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
                setConditionFilter('all')
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

        {isMobile && mobileBatches.length > 0 && (
          <div className="md:hidden mt-6 text-center" aria-live="polite">
            {isLoadingMore && (
              <div
                className="grid grid-cols-1 gap-2"
                aria-label="Loading more products"
              >
                {[0, 1, 2, 3].map((index) => (
                  <ProductSkeleton key={index} variant="listing" />
                ))}
              </div>
            )}
            {loadMoreError && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  We couldn’t load more products.
                </p>
                <Button variant="outline" onClick={() => void loadNextPage(true)}>
                  Load more
                </Button>
              </div>
            )}
            {!isLoadingMore && !loadMoreError && hasMoreMobile && (
              <div ref={loadSentinelRef} className="h-1" aria-hidden="true" />
            )}
            {!isLoadingMore && !loadMoreError && !hasMoreMobile && (
              <p className="text-sm text-muted-foreground py-2">
                You’ve reached the end of the products.
              </p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && totalPages > 1 && (
          <div className="hidden md:flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * productsPerPage + 1} to{' '}
              {Math.min(currentPage * productsPerPage, totalProducts)} of{' '}
              {totalProducts} products
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : 0}
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-700 px-3 text-sm text-muted-foreground hover:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Previous
              </Link>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                to={pageHref(currentPage + 1)}
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : 0}
                className="inline-flex h-9 items-center justify-center rounded-md border border-gray-700 px-3 text-sm text-muted-foreground hover:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50"
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CategoryPage
