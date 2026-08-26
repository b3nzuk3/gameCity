export function countActiveCatalogFilters(filters = {}) {
  let count = 0

  if (filters.filterBy && filters.filterBy !== 'all') count += 1
  if (filters.conditionFilter && filters.conditionFilter !== 'all') count += 1
  if (Array.isArray(filters.selectedBrands)) count += filters.selectedBrands.length

  const priceRange = Array.isArray(filters.priceRange) ? filters.priceRange : []
  if (
    filters.priceFilterActive &&
    (priceRange[0] !== null && priceRange[0] !== undefined ||
      priceRange[1] !== null && priceRange[1] !== undefined)
  ) {
    count += 1
  }

  return count
}
