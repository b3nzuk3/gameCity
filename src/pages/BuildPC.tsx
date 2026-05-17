import React, { useState, useEffect, useCallback, useRef } from 'react'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Check,
  Plus,
  Package,
  PcCase,
  Cpu,
  Smartphone,
  Monitor,
  HardDrive,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/contexts/CartContext'
import backendService, { Product } from '@/services/backendService'
import { formatKESPrice } from '@/lib/currency'

const MAX_STORAGE = 3
const ITEMS_PER_PAGE = 8

// Remove the hardcoded partCategories and instead define the categories to fetch
const PART_CATEGORIES = [
  {
    id: 'cpu',
    name: 'CPU',
    icon: <Cpu className="w-5 h-5" />,
    dbCategory: 'Processors',
  },
  {
    id: 'motherboard',
    name: 'Motherboard',
    icon: <PcCase className="w-5 h-5" />,
    dbCategory: 'Motherboards',
  },
  {
    id: 'gpu',
    name: 'Graphics Card',
    icon: <Smartphone className="w-5 h-5" />,
    dbCategory: 'Graphics Cards',
  },
  {
    id: 'ram',
    name: 'Memory (RAM)',
    icon: <HardDrive className="w-5 h-5" />,
    dbCategory: 'Memory',
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: <HardDrive className="w-5 h-5" />,
    dbCategory: 'Storage',
  },
  {
    id: 'case',
    name: 'PC Case',
    icon: <Package className="w-5 h-5" />,
    dbCategory: 'Cases',
  },
  {
    id: 'cooling',
    name: 'CPU Cooling',
    icon: <Monitor className="w-5 h-5" />,
    dbCategory: 'Accessories',
  },
  {
    id: 'psu',
    name: 'Power Supply',
    icon: <HardDrive className="w-5 h-5" />,
    dbCategory: 'Power Supply',
  },
]

// Per-category pagination + search state
type CategoryState = {
  products: Product[]
  page: number
  pages: number
  total: number
  hasMore: boolean
  loading: boolean
  search: string
}

const BuildPC = () => {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [selectedParts, setSelectedParts] = useState<
    Record<string, Product | null>
  >({})
  const [selectedStorage, setSelectedStorage] = useState<Product[]>([])

  // Each category manages its own pagination + search state
  const [categoryStates, setCategoryStates] = useState<
    Record<string, CategoryState>
  >(() => {
    const initial: Record<string, CategoryState> = {}
    PART_CATEGORIES.forEach((cat) => {
      initial[cat.id] = {
        products: [],
        page: 1,
        pages: 0,
        total: 0,
        hasMore: false,
        loading: true,
        search: '',
      }
    })
    return initial
  })

  // Track which categories have been loaded at least once
  const loadedRef = useRef<Set<string>>(new Set())

  // Debounce timer per category
  const searchTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const fetchCategory = useCallback(
    async (categoryId: string, page: number = 1, search: string = '') => {
      const cat = PART_CATEGORIES.find((c) => c.id === categoryId)
      if (!cat) return

      setCategoryStates((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], loading: true },
      }))

      try {
        const result = await backendService.products.getAllByCategory(
          cat.dbCategory,
          page,
          ITEMS_PER_PAGE,
          search || undefined
        )
        setCategoryStates((prev) => ({
          ...prev,
          [categoryId]: {
            products: result.products,
            page: result.page,
            pages: result.pages,
            total: result.total,
            hasMore: result.hasMore,
            loading: false,
            search,
          },
        }))
      } catch (error) {
        console.error(`Failed to fetch ${categoryId}:`, error)
        setCategoryStates((prev) => ({
          ...prev,
          [categoryId]: { ...prev[categoryId], loading: false },
        }))
      }
    },
    []
  )

  // Lazy-load each category when its tab is first visited
  const handleTabChange = useCallback(
    (categoryId: string) => {
      if (!loadedRef.current.has(categoryId)) {
        loadedRef.current.add(categoryId)
        fetchCategory(categoryId, 1, '')
      }
    },
    [fetchCategory]
  )

  // Initial load: fetch the first category (CPU) so it's ready immediately
  useEffect(() => {
    handleTabChange(PART_CATEGORIES[0].id)
  }, [handleTabChange])

  // Pagination handlers
  const goToPage = useCallback(
    (categoryId: string, page: number) => {
      const state = categoryStates[categoryId]
      if (page < 1 || page > state.pages) return
      fetchCategory(categoryId, page, state.search)
    },
    [categoryStates, fetchCategory]
  )

  // Search handler with debounce
  const handleSearchChange = useCallback(
    (categoryId: string, value: string) => {
      // Update the search input immediately for responsiveness
      setCategoryStates((prev) => ({
        ...prev,
        [categoryId]: { ...prev[categoryId], search: value },
      }))

      // Debounce the actual API call
      if (searchTimerRef.current[categoryId]) {
        clearTimeout(searchTimerRef.current[categoryId])
      }
      searchTimerRef.current[categoryId] = setTimeout(() => {
        fetchCategory(categoryId, 1, value)
      }, 350)
    },
    [fetchCategory]
  )

  const handlePartSelect = (categoryId: string, part: Product) => {
    if (categoryId === 'storage') {
      setSelectedStorage((prev) => {
        const exists = prev.find((p) => p.id === part.id)
        if (exists) {
          return prev.filter((p) => p.id !== part.id)
        }
        if (prev.length >= MAX_STORAGE) {
          toast({
            title: 'Maximum storage reached',
            description: `You can select up to ${MAX_STORAGE} storage devices. Remove one first.`,
            variant: 'destructive',
          })
          return prev
        }
        toast({
          title: 'Storage added',
          description: `${part.name} added to your build (${prev.length + 1}/${MAX_STORAGE})`,
        })
        return [...prev, { ...part, categoryId }]
      })
    } else {
      setSelectedParts((prev) => ({
        ...prev,
        [categoryId]: {
          ...part,
          categoryId,
        },
      }))

      toast({
        title: 'Part selected',
        description: `${part.name} added to your build`,
      })
    }
  }

  const isStorageSelected = (partId: string | number) =>
    selectedStorage.some((p) => p.id === partId)

  const allSelectedItems: Product[] = [
    ...Object.values(selectedParts).filter((p): p is Product => p !== null),
    ...selectedStorage,
  ]

  const totalPrice = allSelectedItems.reduce((sum, part) => sum + part.price, 0)
  const selectedPartsCount = allSelectedItems.length

  const addAllToCart = () => {
    if (allSelectedItems.length === 0) return

    allSelectedItems.forEach((part) => {
      addToCart({
        id: part.id,
        name: part.name,
        price: part.price,
        image: part.image || '/placeholder.svg',
        category: part.category,
      })
    })

    toast({
      title: 'Added to cart',
      description: 'All selected components have been added to your cart',
    })
  }

  // Pagination component
  const Pagination = ({ categoryId }: { categoryId: string }) => {
    const state = categoryStates[categoryId]
    if (state.pages <= 1) return null

    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-4">
        <p className="text-xs text-muted-foreground">
          {state.total} item{state.total !== 1 ? 's' : ''}
          {state.search && ` matching "${state.search}"`}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-gray-700"
            disabled={state.page <= 1 || state.loading}
            onClick={() => goToPage(categoryId, state.page - 1)}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-xs text-muted-foreground px-2 min-w-[3rem] text-center">
            {state.page}/{state.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-gray-700"
            disabled={!state.hasMore || state.loading}
            onClick={() => goToPage(categoryId, state.page + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Component selection */}
          <div className="w-full md:w-2/3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Build Your Custom PC</h1>
              <p className="text-muted-foreground">
                Select components for your custom build and see real-time
                compatibility and performance insights.
              </p>
            </div>

            <Tabs
              defaultValue={PART_CATEGORIES[0].id}
              className="w-full"
              onValueChange={handleTabChange}
            >
              <TabsList className="w-full flex overflow-x-auto bg-gray-900 border border-gray-700 rounded-lg p-1 mb-8 justify-start">
                {PART_CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex-shrink-0 data-[state=active]:bg-gray-800 data-[state=active]:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span>{category.name}</span>
                      {category.id === 'storage' ? (
                        selectedStorage.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Check size={14} className="text-yellow-400" />
                            <span className="text-xs text-yellow-400">
                              {selectedStorage.length}
                            </span>
                          </span>
                        )
                      ) : (
                        selectedParts[category.id] && (
                          <Check size={14} className="text-yellow-400" />
                        )
                      )}
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>

              {PART_CATEGORIES.map((category) => {
                const state = categoryStates[category.id]

                return (
                  <TabsContent
                    key={category.id}
                    value={category.id}
                    className="space-y-4"
                  >
                    {/* Storage hint */}
                    {category.id === 'storage' && (
                      <div className="bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-muted-foreground">
                        Select up to {MAX_STORAGE} storage devices for your build.
                        {selectedStorage.length > 0 && (
                          <span className="text-yellow-400 ml-1">
                            ({selectedStorage.length}/{MAX_STORAGE} selected)
                          </span>
                        )}
                      </div>
                    )}

                    {/* Search bar */}
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <Input
                        type="text"
                        placeholder={`Search ${category.name.toLowerCase()}...`}
                        value={state.search}
                        onChange={(e) =>
                          handleSearchChange(category.id, e.target.value)
                        }
                        className="pl-9 bg-gray-900 border-gray-700 text-sm"
                      />
                    </div>

                    {/* Loading state */}
                    {state.loading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-yellow-400" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading {category.name.toLowerCase()}...
                        </span>
                      </div>
                    )}

                    {/* Empty state */}
                    {!state.loading && state.products.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          {state.search
                            ? `No ${category.name.toLowerCase()} found matching "${state.search}"`
                            : `No ${category.name.toLowerCase()} available`}
                        </p>
                      </div>
                    )}

                    {/* Product grid */}
                    {!state.loading && state.products.length > 0 && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {state.products.map((part) => {
                            const isSelected =
                              category.id === 'storage'
                                ? isStorageSelected(part.id)
                                : selectedParts[category.id]?.id === part.id

                            return (
                              <Card
                                key={part.id}
                                className={`bg-gray-900 border ${
                                  isSelected
                                    ? 'border-yellow-500'
                                    : 'border-gray-700'
                                } hover:border-yellow-500/70 transition-colors cursor-pointer`}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-start gap-3">
                                    {part.image && (
                                      <img
                                        src={part.image}
                                        alt={part.name}
                                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0">
                                      <CardTitle className="text-lg truncate">
                                        {part.name}
                                      </CardTitle>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-muted-foreground capitalize">
                                        {part.category}
                                      </p>
                                    </div>
                                    <p className="font-semibold">
                                      {formatKESPrice(part.price)}
                                    </p>
                                  </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                  <Button
                                    onClick={() =>
                                      handlePartSelect(category.id, part)
                                    }
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={
                                      isSelected
                                        ? 'bg-yellow-500 hover:bg-yellow-400 text-black w-full'
                                        : 'border-gray-700 w-full'
                                    }
                                  >
                                    {isSelected ? (
                                      <Check size={16} className="mr-2" />
                                    ) : (
                                      <Plus size={16} className="mr-2" />
                                    )}
                                    {isSelected ? 'Selected' : 'Select'}
                                  </Button>
                                </CardFooter>
                              </Card>
                            )
                          })}
                        </div>

                        <Pagination categoryId={category.id} />
                      </>
                    )}
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>

          {/* Build summary */}
          <div className="w-full md:w-1/3 sticky top-24">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Your Build Summary</CardTitle>
                <CardDescription>
                  {selectedPartsCount} of 8+ components selected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {PART_CATEGORIES.map((category) => {
                  if (category.id === 'storage') {
                    return (
                      <div key={category.id}>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                              {category.name}
                            </p>
                            {selectedStorage.length === 0 ? (
                              <p className="text-sm italic text-muted-foreground">
                                Not selected
                              </p>
                            ) : (
                              <p className="text-xs text-yellow-400">
                                {selectedStorage.length}/{MAX_STORAGE} selected
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedStorage.map((drive, idx) => (
                          <div
                            key={drive.id}
                            className="flex justify-between items-center py-2 pl-4"
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm">
                                  <span className="text-muted-foreground text-xs mr-1">
                                    #{idx + 1}
                                  </span>
                                  {drive.name}
                                </p>
                                <p className="text-sm text-yellow-400">
                                  {formatKESPrice(drive.price)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() =>
                                setSelectedStorage((prev) =>
                                  prev.filter((p) => p.id !== drive.id)
                                )
                              }
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  }

                  const part = selectedParts[category.id]
                  return (
                    <div
                      key={category.id}
                      className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {category.name}
                        </p>
                        {part ? (
                          <div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm">{part.name}</p>
                              <p className="text-sm text-yellow-400">
                                {formatKESPrice(part.price)}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            Not selected
                          </p>
                        )}
                      </div>
                      {part && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => {
                            setSelectedParts((prev) => ({
                              ...prev,
                              [category.id]: null,
                            }))
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )
                })}

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl text-yellow-400">
                      {formatKESPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black"
                  disabled={selectedPartsCount === 0}
                  onClick={addAllToCart}
                >
                  Add All to Cart
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-700 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedParts({
                      cpu: null,
                      motherboard: null,
                      gpu: null,
                      ram: null,
                      case: null,
                      cooling: null,
                      psu: null,
                    })
                    setSelectedStorage([])
                    toast({
                      title: 'Build cleared',
                      description: 'Your PC build has been reset',
                    })
                  }}
                >
                  Clear Build
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BuildPC
