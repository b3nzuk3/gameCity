export function getPaginationItems(currentPage, totalPages) {
  const total = Math.max(1, Math.floor(Number(totalPages) || 1))
  const current = Math.min(
    total,
    Math.max(1, Math.floor(Number(currentPage) || 1))
  )

  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  if (current <= 3) return [1, 2, 3, 'ellipsis', total]
  if (current >= total - 2) {
    return [1, 'ellipsis', total - 2, total - 1, total]
  }
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', total]
}

export function buildPaginationHref(pathname, search, page, options = {}) {
  const params = new URLSearchParams(search)
  if (options.queryKey) params.set(options.queryKey, String(page))
  else params.delete('page')

  const query = params.toString()
  return `${pathname}${query ? `?${query}` : ''}${options.hash || ''}`
}
