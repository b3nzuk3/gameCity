import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { countActiveCatalogFilters } from '@/lib/catalogFilters'
import { formatKESPrice } from '@/lib/currency'

export type MobileCatalogFilterValues = {
  sortBy: string
  filterBy: string
  conditionFilter: string
  priceRange: [number | null, number | null]
  priceFilterActive: boolean
  selectedBrands: string[]
}

type CategoryOption = {
  id: string
  name: string
}

type MobileCatalogControlsProps = {
  categories: CategoryOption[]
  activeCategory: string
  filters: MobileCatalogFilterValues
  availableBrands: string[]
  availablePriceRange: [number, number]
  resultCount: number | null
  resultCountLoading: boolean
  onApplyFilters: (filters: MobileCatalogFilterValues) => void
  onClearFilters: () => void
}

const EMPTY_FILTERS: MobileCatalogFilterValues = {
  sortBy: 'name',
  filterBy: 'all',
  conditionFilter: 'all',
  priceRange: [null, null],
  priceFilterActive: false,
  selectedBrands: [],
}

const fieldClassName =
  'h-11 w-full rounded-md border border-gray-700 bg-[#12121f] px-3 text-sm text-white focus:border-[#FDB813] focus:outline-none focus:ring-1 focus:ring-[#FDB813]'

const AVAILABILITY_OPTIONS = [
  { value: 'all', label: 'All products' },
  { value: 'in-stock', label: 'In stock' },
  { value: 'low-stock', label: 'Low stock' },
  { value: 'out-of-stock', label: 'Out of stock' },
]

const CONDITION_OPTIONS = [
  { value: 'all', label: 'All conditions' },
  { value: 'New', label: 'New' },
  { value: 'Pre-Owned', label: 'Pre-Owned' },
]

const BRAND_PREVIEW_COUNT = 6

const MobileCatalogControls = ({
  categories,
  activeCategory,
  filters,
  availableBrands,
  availablePriceRange,
  resultCount,
  resultCountLoading,
  onApplyFilters,
  onClearFilters,
}: MobileCatalogControlsProps) => {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<MobileCatalogFilterValues>(filters)
  const [brandListExpanded, setBrandListExpanded] = useState(false)
  const activeCategoryRef = useRef<HTMLAnchorElement>(null)
  const activeFilterCount = countActiveCatalogFilters(filters)
  const brandOptions = useMemo(
    () => Array.from(new Set([...availableBrands, ...draftFilters.selectedBrands])).sort(),
    [availableBrands, draftFilters.selectedBrands]
  )
  const collapsedBrandOptions = useMemo(
    () =>
      brandOptions.filter(
        (brand, index) =>
          index < BRAND_PREVIEW_COUNT ||
          draftFilters.selectedBrands.includes(brand)
      ),
    [brandOptions, draftFilters.selectedBrands]
  )
  const brandOverflowOptions = useMemo(
    () => brandOptions.filter((brand) => !collapsedBrandOptions.includes(brand)),
    [brandOptions, collapsedBrandOptions]
  )
  const priceMinimum = Math.max(0, availablePriceRange[0])
  const priceMaximum = Math.max(
    priceMinimum + 1,
    availablePriceRange[1],
    filters.priceRange[0] ?? 0,
    filters.priceRange[1] ?? 0
  )
  const boundedDraftMinimum = Math.max(
    priceMinimum,
    Math.min(draftFilters.priceRange[0] ?? priceMinimum, priceMaximum)
  )
  const boundedDraftMaximum = Math.max(
    priceMinimum,
    Math.min(draftFilters.priceRange[1] ?? priceMaximum, priceMaximum)
  )
  const sliderPriceRange: [number, number] = [
    Math.min(boundedDraftMinimum, boundedDraftMaximum),
    Math.max(boundedDraftMinimum, boundedDraftMaximum),
  ]
  const priceStep = priceMaximum >= 100_000 ? 1_000 : priceMaximum >= 10_000 ? 500 : 100

  useEffect(() => {
    activeCategoryRef.current?.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeCategory])

  const handlePanelOpenChange = (open: boolean) => {
    if (open) {
      setBrandListExpanded(false)
      setDraftFilters({
        ...filters,
        priceRange: [...filters.priceRange],
        selectedBrands: [...filters.selectedBrands],
      })
    }
    setFilterPanelOpen(open)
  }

  const updatePriceFromSlider = (values: number[]) => {
    const boundedMinimum = Math.max(
      priceMinimum,
      Math.min(values[0] ?? priceMinimum, priceMaximum)
    )
    const boundedMaximum = Math.max(
      boundedMinimum,
      Math.min(values[1] ?? priceMaximum, priceMaximum)
    )
    const nextPriceRange: [number | null, number | null] = [
      boundedMinimum === priceMinimum ? null : boundedMinimum,
      boundedMaximum === priceMaximum ? null : boundedMaximum,
    ]
    setDraftFilters((current) => ({
      ...current,
      priceRange: nextPriceRange,
      priceFilterActive:
        nextPriceRange[0] !== null || nextPriceRange[1] !== null,
    }))
  }

  const updatePriceInput = (index: 0 | 1, value: string) => {
    if (value === '') return
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) return
    const nextRange: [number, number] = [...sliderPriceRange]
    nextRange[index] = numericValue
    updatePriceFromSlider(nextRange)
  }

  const toggleBrand = (brand: string, checked: boolean) => {
    setDraftFilters((current) => ({
      ...current,
      selectedBrands: checked
        ? Array.from(new Set([...current.selectedBrands, brand]))
        : current.selectedBrands.filter((selectedBrand) => selectedBrand !== brand),
    }))
  }

  const clearFilters = () => {
    setDraftFilters({
      ...EMPTY_FILTERS,
      priceRange: [null, null],
      selectedBrands: [],
    })
    setBrandListExpanded(false)
    onClearFilters()
  }

  const showResults = () => {
    onApplyFilters({
      ...draftFilters,
      priceRange: [...draftFilters.priceRange],
      selectedBrands: [...draftFilters.selectedBrands],
    })
    setFilterPanelOpen(false)
  }

  return (
    <>
      <div
        data-mobile-catalog-bar
        className="flex h-12 items-center border-t border-gray-800 bg-[#0f0f19]/95 shadow-sm backdrop-blur-md"
      >
        <Button
          type="button"
          variant="ghost"
          className="mx-2 h-9 shrink-0 gap-1.5 rounded-full border border-gray-700 px-3 text-sm text-gray-100 hover:bg-gray-800 hover:text-white"
          onClick={() => handlePanelOpenChange(true)}
          aria-label={
            activeFilterCount > 0
              ? `Filter products, ${activeFilterCount} active`
              : 'Filter products'
          }
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="font-semibold text-[#FDB813]" aria-hidden="true">
              • {activeFilterCount}
            </span>
          )}
        </Button>

        <div className="h-6 w-px shrink-0 bg-gray-700" aria-hidden="true" />
        <nav
          aria-label="Product categories"
          className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <Link
                key={cat.id}
                ref={isActive ? activeCategoryRef : undefined}
                to={`/category/${cat.id}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm whitespace-nowrap transition-colors motion-reduce:transition-none ${
                  isActive
                    ? 'bg-[#FDB813] font-medium text-black'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {cat.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <Sheet open={filterPanelOpen} onOpenChange={handlePanelOpenChange}>
        <SheetContent
          side="bottom"
          className="z-[80] flex h-[min(88dvh,720px)] flex-col gap-0 rounded-t-2xl border-gray-700 bg-[#0f0f19] p-0 md:hidden"
        >
          <SheetHeader className="shrink-0 border-b border-gray-800 px-4 py-4 text-left">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine and sort the products shown in this category.
            </SheetDescription>
            <p className="pt-1 text-sm font-medium text-gray-200" aria-live="polite">
              {resultCountLoading
                ? 'Updating product count...'
                : resultCount === null
                  ? 'Product count unavailable'
                  : `${resultCount} products found`}
            </p>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5 overscroll-contain">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-white">Availability</legend>
              <div data-availability-options className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={draftFilters.filterBy === option.value}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        filterBy: option.value,
                      }))
                    }
                    className={`min-h-11 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      draftFilters.filterBy === option.value
                        ? 'border-[#FDB813] bg-[#FDB813] font-medium text-black'
                        : 'border-gray-700 bg-[#171725] text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-white">Condition</legend>
              <div data-condition-options className="flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={draftFilters.conditionFilter === option.value}
                    onClick={() =>
                      setDraftFilters((current) => ({
                        ...current,
                        conditionFilter: option.value,
                      }))
                    }
                    className={`min-h-11 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                      draftFilters.conditionFilter === option.value
                        ? 'border-[#FDB813] bg-[#FDB813] font-medium text-black'
                        : 'border-gray-700 bg-[#171725] text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-white">Sort by</span>
              <select
                value={draftFilters.sortBy}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    sortBy: event.target.value,
                  }))
                }
                className={fieldClassName}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rating">Rating (High to Low)</option>
              </select>
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-white">Brand</legend>
              {brandOptions.length > 0 ? (
                <div className="grid grid-cols-1 gap-1">
                  {collapsedBrandOptions.map((brand) => {
                    const checked = draftFilters.selectedBrands.includes(brand)
                    return (
                      <label
                        key={brand}
                        className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-gray-200 hover:bg-gray-900"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(nextChecked) =>
                            toggleBrand(brand, nextChecked === true)
                          }
                          className="h-5 w-5"
                        />
                        <span>{brand}</span>
                      </label>
                    )
                  })}
                  <div
                    id="mobile-brand-filter-overflow"
                    data-brand-overflow
                    aria-hidden={!brandListExpanded}
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      brandListExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      {brandOverflowOptions.map((brand) => {
                        const checked = draftFilters.selectedBrands.includes(brand)
                        return (
                          <label
                            key={brand}
                            className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm text-gray-200 hover:bg-gray-900"
                          >
                            <Checkbox
                              checked={checked}
                              tabIndex={brandListExpanded ? 0 : -1}
                              onCheckedChange={(nextChecked) =>
                                toggleBrand(brand, nextChecked === true)
                              }
                              className="h-5 w-5"
                            />
                            <span>{brand}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  {brandOptions.length > BRAND_PREVIEW_COUNT && (
                    <button
                      type="button"
                      aria-expanded={brandListExpanded}
                      aria-controls="mobile-brand-filter-overflow"
                      onClick={() =>
                        setBrandListExpanded((expanded) => !expanded)
                      }
                      className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-medium text-yellow-400"
                    >
                      {brandListExpanded ? 'Show less' : 'See more'}
                      {brandListExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No brand options available.</p>
              )}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-white">Price</legend>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{formatKESPrice(priceMinimum)}</span>
                <span>{formatKESPrice(priceMaximum)}</span>
              </div>
              <Slider
                value={sliderPriceRange}
                onValueChange={updatePriceFromSlider}
                min={priceMinimum}
                max={priceMaximum}
                step={priceStep}
                minStepsBetweenThumbs={1}
                thumbLabels={['Minimum price', 'Maximum price']}
                className="h-8 [&_[role=slider]]:border-[#FDB813] [&_[role=slider]]:bg-[#0f0f19] [&>span:first-child]:bg-gray-700 [&>span:first-child>span]:bg-[#FDB813]"
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-gray-400">Min price</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    aria-label="Minimum price"
                    placeholder="Min"
                    max={sliderPriceRange[1]}
                    value={sliderPriceRange[0]}
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(event) =>
                      updatePriceInput(0, event.target.value)
                    }
                    className="h-11 bg-[#12121f] border-gray-700"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-400">Max price</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={sliderPriceRange[0]}
                    max={priceMaximum}
                    aria-label="Maximum price"
                    placeholder="Max"
                    value={sliderPriceRange[1]}
                    onFocus={(event) => event.currentTarget.select()}
                    onChange={(event) =>
                      updatePriceInput(1, event.target.value)
                    }
                    className="h-11 bg-[#12121f] border-gray-700"
                  />
                </label>
              </div>
            </fieldset>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-gray-800 bg-[#0f0f19] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button type="button" variant="outline" className="h-11" onClick={clearFilters}>
              Clear all
            </Button>
            <Button
              type="button"
              className="h-11 bg-[#FDB813] text-black hover:bg-[#ff9500]"
              onClick={showResults}
            >
              Show results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MobileCatalogControls
