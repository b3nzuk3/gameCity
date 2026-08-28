import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function ProductSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'listing'
}) {
  const isListing = variant === 'listing'

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-gray-800 bg-[#232334]',
        isListing
          ? 'grid min-h-[178px] grid-cols-[minmax(112px,38%)_minmax(0,1fr)] lg:flex lg:min-h-0 lg:flex-col lg:space-y-3 lg:border-0 lg:bg-transparent'
          : 'flex flex-col space-y-3 border-0 bg-transparent'
      )}
      aria-hidden="true"
    >
      <Skeleton
        className={cn(
          'rounded-none lg:rounded-lg',
          isListing
            ? 'h-full min-h-[178px] w-full bg-[#1b1b27] lg:bg-muted lg:h-[200px] lg:min-h-0'
            : 'h-[200px] w-full'
        )}
      />
      <div className={cn('min-w-0 space-y-2', isListing ? 'p-3 lg:p-0' : '')}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="hidden h-10 flex-1 lg:block lg:h-9" />
          <Skeleton className="h-10 flex-1 lg:h-9" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
