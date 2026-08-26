export const PRODUCT_CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'monitors', name: 'Monitors' },
  { id: 'graphics-cards', name: 'Graphics Cards' },
  { id: 'memory', name: 'Memory' },
  { id: 'processors', name: 'Processors' },
  { id: 'storage', name: 'Storage' },
  { id: 'motherboards', name: 'Motherboards' },
  { id: 'cases', name: 'Cases' },
  { id: 'power-supply', name: 'Power Supply' },
  { id: 'pre-built', name: 'PRE-BUILT' },
  { id: 'cpu-cooling', name: 'CPU Cooling' },
  { id: 'oem', name: 'OEM' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'laptops', name: 'Laptops' },
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

const normalizeCategoryValue = (value: string) =>
  value.toLowerCase().trim().replace(/[_\s]+/g, '-')

export const findProductCategoryId = (value?: string | null) => {
  if (!value) return undefined

  const normalizedValue = normalizeCategoryValue(value)
  return PRODUCT_CATEGORIES.find(
    (category) =>
      category.id === normalizedValue ||
      normalizeCategoryValue(category.name) === normalizedValue
  )?.id
}
