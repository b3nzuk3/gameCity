import { useId, useState, type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatKESPrice } from '@/lib/currency'
import type {
  ActiveSpecificationFilters,
  AvailableSpecificationFilter,
  CountedFilterOption,
} from '@/lib/productSpecificationFilters'

type CountedCategory = CountedFilterOption

type ProductFilterSidebarProps = {
  filterBy: string
  conditionFilter: string
  selectedBrands: string[]
  availableBrands: string[]
  priceRange: [number | null, number | null]
  availablePriceRange: [number, number]
  brandCounts?: Record<string, number>
  availableCategories?: CountedCategory[]
  selectedCategories?: string[]
  availableSpecificationFilters?: AvailableSpecificationFilter[]
  selectedSpecificationFilters?: ActiveSpecificationFilters
  onFilterByChange: (value: string) => void
  onConditionChange: (value: string) => void
  onBrandsChange: (brands: string[]) => void
  onPriceRangeChange: (range: [number | null, number | null]) => void
  onCategoriesChange?: (categories: string[]) => void
  onSpecificationFiltersChange?: (filters: ActiveSpecificationFilters) => void
  onClear: () => void
}

const optionClass =
  'flex min-h-9 cursor-pointer items-center gap-2 rounded px-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white'

const FilterSection = ({ label, children }: { label: string; children: ReactNode }) => {
  const headingId = useId()

  return (
    <section
      role="group"
      aria-labelledby={headingId}
      className="border-b border-gray-800 pb-4 pt-[18px] last:border-b-0"
    >
      <h3 id={headingId} className="mb-1 text-sm font-semibold text-white">
        {label}
      </h3>
      {children}
    </section>
  )
}

const CheckboxFilterGroup = ({
  label,
  options,
  selectedValues,
  onChange,
}: {
  label: string
  options: CountedFilterOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const visibleOptions = expanded ? options : options.slice(0, 6)

  return (
    <FilterSection label={label}>
      {visibleOptions.map((option) => (
        <label key={option.value} className={optionClass}>
          <Checkbox
            checked={selectedValues.includes(option.value)}
            onCheckedChange={(checked) =>
              onChange(
                checked === true
                  ? Array.from(new Set([...selectedValues, option.value]))
                  : selectedValues.filter((value) => value !== option.value)
              )
            }
            className="h-4 w-4"
          />
          <span className="min-w-0 flex-1 truncate">{option.label}</span>
          <span className="text-xs tabular-nums text-gray-500">{option.count}</span>
        </label>
      ))}
      {options.length > 6 && (
        <button
          type="button"
          className="mt-1 px-2 text-xs font-medium text-yellow-400 hover:text-yellow-300"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </FilterSection>
  )
}

const ProductFilterSidebar = ({
  filterBy,
  conditionFilter,
  selectedBrands,
  availableBrands,
  priceRange,
  availablePriceRange,
  brandCounts = {},
  availableCategories = [],
  selectedCategories = [],
  availableSpecificationFilters = [],
  selectedSpecificationFilters = {},
  onFilterByChange,
  onConditionChange,
  onBrandsChange,
  onPriceRangeChange,
  onCategoriesChange,
  onSpecificationFiltersChange,
  onClear,
}: ProductFilterSidebarProps) => {
  const priceMinimum = Math.max(0, availablePriceRange[0])
  const priceMaximum = Math.max(
    priceMinimum + 1,
    availablePriceRange[1],
    priceRange[0] ?? 0,
    priceRange[1] ?? 0
  )
  const boundedMinimum = Math.max(
    priceMinimum,
    Math.min(priceRange[0] ?? priceMinimum, priceMaximum)
  )
  const boundedMaximum = Math.max(
    priceMinimum,
    Math.min(priceRange[1] ?? priceMaximum, priceMaximum)
  )
  const sliderPriceRange: [number, number] = [
    Math.min(boundedMinimum, boundedMaximum),
    Math.max(boundedMinimum, boundedMaximum),
  ]
  const priceStep = priceMaximum >= 100_000 ? 1_000 : priceMaximum >= 10_000 ? 500 : 100

  const updatePriceFromSlider = (values: number[]) => {
    const nextMinimum = Math.max(
      priceMinimum,
      Math.min(values[0] ?? priceMinimum, priceMaximum)
    )
    const nextMaximum = Math.max(
      nextMinimum,
      Math.min(values[1] ?? priceMaximum, priceMaximum)
    )

    onPriceRangeChange([
      nextMinimum === priceMinimum ? null : nextMinimum,
      nextMaximum === priceMaximum ? null : nextMaximum,
    ])
  }

  return (
    <aside
      data-desktop-filter-sidebar
      aria-label="Product filters"
      className="hidden w-[280px] shrink-0 lg:block"
    >
      <div className="rounded-lg border border-gray-800 bg-[#171723] p-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h2 className="font-semibold text-white">Filters</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-yellow-400 hover:bg-gray-800 hover:text-yellow-300"
            onClick={onClear}
          >
            Clear all
          </Button>
        </div>

        <FilterSection label="Availability">
          {[
            ['all', 'All products'],
            ['in-stock', 'In stock'],
            ['low-stock', 'Low stock'],
            ['out-of-stock', 'Out of stock'],
          ].map(([value, label]) => (
            <label key={value} className={optionClass}>
              <input
                type="radio"
                name="desktop-availability"
                value={value}
                checked={filterBy === value}
                onChange={() => onFilterByChange(value)}
                className="h-4 w-4 appearance-none rounded-full border border-gray-500 bg-black checked:border-[#FDB813] checked:ring-4 checked:ring-inset checked:ring-[#FDB813] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              />
              {label}
            </label>
          ))}
        </FilterSection>

        <FilterSection label="Condition">
          {[
            ['all', 'All conditions'],
            ['New', 'New'],
            ['Pre-Owned', 'Pre-Owned'],
          ].map(([value, label]) => (
            <label key={value} className={optionClass}>
              <input
                type="radio"
                name="desktop-condition"
                value={value}
                checked={conditionFilter === value}
                onChange={() => onConditionChange(value)}
                className="h-4 w-4 appearance-none rounded-full border border-gray-500 bg-black checked:border-[#FDB813] checked:ring-4 checked:ring-inset checked:ring-[#FDB813] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              />
              {label}
            </label>
          ))}
        </FilterSection>

        <FilterSection label="Price">
          <div className="flex items-center justify-between px-1 text-xs text-gray-400">
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
            thumbLabels={['Desktop minimum price', 'Desktop maximum price']}
            className="h-8 px-1 [&_[role=slider]]:border-[#FDB813] [&_[role=slider]]:bg-[#0f0f19] [&>span:first-child]:bg-gray-700 [&>span:first-child>span]:bg-[#FDB813]"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={priceMinimum}
              max={sliderPriceRange[1]}
              aria-label="Desktop minimum price input"
              placeholder="Min"
              value={priceRange[0] ?? ''}
              onChange={(event) =>
                onPriceRangeChange([
                  event.target.value ? Number(event.target.value) : null,
                  priceRange[1],
                ])
              }
              className="h-9 bg-gray-900 px-2 text-sm"
            />
            <Input
              type="number"
              min={sliderPriceRange[0]}
              max={priceMaximum}
              aria-label="Desktop maximum price input"
              placeholder="Max"
              value={priceRange[1] ?? ''}
              onChange={(event) =>
                onPriceRangeChange([
                  priceRange[0],
                  event.target.value ? Number(event.target.value) : null,
                ])
              }
              className="h-9 bg-gray-900 px-2 text-sm"
            />
          </div>
        </FilterSection>

        {availableCategories.length > 1 && onCategoriesChange && (
          <CheckboxFilterGroup
            label="Category"
            options={availableCategories}
            selectedValues={selectedCategories}
            onChange={onCategoriesChange}
          />
        )}

        {availableBrands.length > 0 ? (
          <CheckboxFilterGroup
            label="Brand"
            options={availableBrands.map((brand) => ({
              value: brand,
              label: brand,
              count: brandCounts[brand] || 0,
            }))}
            selectedValues={selectedBrands}
            onChange={onBrandsChange}
          />
        ) : (
          <FilterSection label="Brand">
            <p className="px-2 text-xs text-gray-500">No brands available</p>
          </FilterSection>
        )}

        {availableSpecificationFilters.map((filter) => (
          <CheckboxFilterGroup
            key={filter.id}
            label={filter.label}
            options={filter.options}
            selectedValues={selectedSpecificationFilters[filter.id] || []}
            onChange={(values) =>
              onSpecificationFiltersChange?.({
                ...selectedSpecificationFilters,
                [filter.id]: values,
              })
            }
          />
        ))}

      </div>
    </aside>
  )
}

export default ProductFilterSidebar
