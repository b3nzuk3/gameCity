export function getPaginationItems(
  currentPage: number,
  totalPages: number
): Array<number | 'ellipsis'>

export function buildPaginationHref(
  pathname: string,
  search: string,
  page: number,
  options?: { queryKey?: string; hash?: string }
): string
