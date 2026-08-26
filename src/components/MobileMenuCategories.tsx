import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '@/lib/productCategories'

const MOBILE_CATEGORY_PREVIEW_COUNT = 5

type MobileMenuCategoriesProps = {
  isOpen: boolean
  onNavigate: () => void
}

const MobileMenuCategories = ({
  isOpen,
  onNavigate,
}: MobileMenuCategoriesProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()
  const previewCategories = PRODUCT_CATEGORIES.slice(
    0,
    MOBILE_CATEGORY_PREVIEW_COUNT
  )
  const remainingCategories = PRODUCT_CATEGORIES.slice(
    MOBILE_CATEGORY_PREVIEW_COUNT
  )

  useEffect(() => {
    if (!isOpen) setIsExpanded(false)
  }, [isOpen])

  const renderCategoryLink = (category: ProductCategory) => {
    const categoryPath = `/category/${category.id}`
    const isActive =
      location.pathname === categoryPath ||
      location.pathname.startsWith(`${categoryPath}/`)

    return (
      <Link
        key={category.id}
        to={categoryPath}
        aria-current={isActive ? 'page' : undefined}
        onClick={onNavigate}
        className={cn(
          'flex min-h-11 items-center rounded-md px-3 py-2 text-sm text-gray-300 transition-colors motion-reduce:transition-none hover:bg-gray-800 hover:text-yellow-400',
          isActive && 'bg-gray-800 font-medium text-yellow-400'
        )}
      >
        {category.name}
      </Link>
    )
  }

  return (
    <section data-mobile-menu-categories className="space-y-1">
      <h3 className="px-3 pb-1 text-sm font-semibold text-white">
        Categories
      </h3>

      <nav aria-label="Product categories">
        <div className="space-y-1">
          {previewCategories.map(renderCategoryLink)}
        </div>

        <div
          id="mobile-menu-category-overflow"
          data-mobile-menu-category-overflow
          className={cn(
            'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-1">
              {remainingCategories.map(renderCategoryLink)}
            </div>
          </div>
        </div>
      </nav>

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls="mobile-menu-category-overflow"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex min-h-11 w-full items-center gap-1 rounded-md px-3 py-2 text-left text-sm font-medium text-yellow-400 transition-colors hover:bg-gray-800 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-inset motion-reduce:transition-none"
      >
        {isExpanded ? 'Show less' : 'See all categories'}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </section>
  )
}

export default MobileMenuCategories
