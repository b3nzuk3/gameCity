import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getPaginationItems } from '@/lib/catalogPagination'
import { cn } from '@/lib/utils'

type DesktopPaginationProps = {
  currentPage: number
  totalPages: number
  hrefForPage: (page: number) => string
  className?: string
}

const DesktopPagination = ({
  currentPage,
  totalPages,
  hrefForPage,
  className,
}: DesktopPaginationProps) => {
  if (totalPages <= 1) return null

  const page = Math.min(totalPages, Math.max(1, currentPage))
  const items = getPaginationItems(page, totalPages)
  const controlClass =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB813]'
  const enabledClass =
    'border-gray-700 bg-[#171723] text-gray-200 hover:border-[#FDB813]/60 hover:text-white'
  const disabledClass =
    'cursor-not-allowed border-gray-800 bg-[#171723] text-gray-600 opacity-60'

  return (
    <nav
      aria-label="Product pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {page > 1 ? (
        <Link
          to={hrefForPage(page - 1)}
          aria-label="Previous page"
          className={cn(controlClass, enabledClass)}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-label="Previous page" aria-disabled="true" className={cn(controlClass, disabledClass)}>
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </span>
      )}

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="inline-flex h-8 min-w-6 items-center justify-center px-1 text-sm text-gray-500"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            to={hrefForPage(item)}
            aria-label={`Go to page ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              controlClass,
              item === page
                ? 'border-[#FDB813] bg-[#FDB813] font-semibold text-black'
                : enabledClass
            )}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          to={hrefForPage(page + 1)}
          aria-label="Next page"
          className={cn(controlClass, enabledClass)}
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-label="Next page" aria-disabled="true" className={cn(controlClass, disabledClass)}>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}

export default DesktopPagination
