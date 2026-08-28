import { findProductCategoryId } from '@/lib/productCategories'
import type { Product } from '@/services/backendService'

export type ActiveSpecificationFilters = Record<string, string[]>

export type CountedFilterOption = {
  value: string
  label: string
  count: number
}

export type AvailableSpecificationFilter = {
  id: string
  label: string
  options: CountedFilterOption[]
}

type SpecificationFilterDefinition = {
  id: string
  label: string
  keys: string[]
  format?: (value: string) => string
}

const appendUnit = (unit: string) => (value: string) =>
  new RegExp(`[a-z"']`, 'i').test(value) ? value : `${value}${unit}`

const appendWord = (word: string) => (value: string) =>
  new RegExp(`\\b${word}s?\\b`, 'i').test(value) ? value : `${value} ${word}`

const FILTER_DEFINITIONS: Record<string, SpecificationFilterDefinition> = {
  vram: { id: 'vram', label: 'VRAM', keys: ['Vram in GB'], format: appendUnit(' GB') },
  gpuMemoryType: { id: 'gpuMemoryType', label: 'GPU Memory Type', keys: ['Memory type'] },
  gpuFanCount: { id: 'gpuFanCount', label: 'GPU Fan Count', keys: ['No. of fans'], format: appendWord('fan') },
  videoOutputs: { id: 'videoOutputs', label: 'Video Outputs', keys: ['Video output ports'] },
  screenSize: { id: 'screenSize', label: 'Screen Size', keys: ['Size in Inches', 'Screen Size', 'Screen Size (inches)'], format: appendUnit('"') },
  resolution: { id: 'resolution', label: 'Resolution', keys: ['Resolution'] },
  refreshRate: { id: 'refreshRate', label: 'Refresh Rate', keys: ['Refresh Rate'], format: appendUnit(' Hz') },
  monitorPorts: { id: 'monitorPorts', label: 'Monitor Ports', keys: ['Ports'] },
  cpuSocket: { id: 'cpuSocket', label: 'CPU Socket', keys: ['CPU Socket', 'Cpu socket'] },
  cpuCores: { id: 'cpuCores', label: 'Core Count', keys: ['CPU Cores'], format: appendWord('core') },
  cpuThreads: { id: 'cpuThreads', label: 'Thread Count', keys: ['CPU Threads'], format: appendWord('thread') },
  cpuSpeed: { id: 'cpuSpeed', label: 'CPU Speed', keys: ['CPU Speed'] },
  motherboardFormFactor: { id: 'motherboardFormFactor', label: 'Form Factor', keys: ['Form Factor'] },
  motherboardMemoryType: { id: 'motherboardMemoryType', label: 'Memory Type', keys: ['Ram type'] },
  ramSlots: { id: 'ramSlots', label: 'RAM Slots', keys: ['Ram slots'], format: appendWord('slot') },
  nvmeSlots: { id: 'nvmeSlots', label: 'NVMe Slots', keys: ['Nvme slots'], format: appendWord('slot') },
  memorySpeed: { id: 'memorySpeed', label: 'Memory Speed', keys: ['Memory Speed'] },
  memoryKitSize: { id: 'memoryKitSize', label: 'Kit Size', keys: ['No. of modules'], format: appendWord('module') },
  storageType: { id: 'storageType', label: 'Storage Type', keys: ['Type'] },
  storageCapacity: { id: 'storageCapacity', label: 'Storage Capacity', keys: ['Capacity', 'Storage', 'Storage (GB/TB)'] },
  storageInterface: { id: 'storageInterface', label: 'Storage Interface', keys: ['Interface'] },
  wattage: { id: 'wattage', label: 'Wattage', keys: ['Watts', 'Power supply wattage'], format: appendUnit(' W') },
  efficiencyRating: { id: 'efficiencyRating', label: 'Efficiency Rating', keys: ['Power Rating', 'Psu rating'] },
  psuFeatures: { id: 'psuFeatures', label: 'Power Supply Features', keys: ['Special Features'] },
  motherboardCompatibility: { id: 'motherboardCompatibility', label: 'Motherboard Compatibility', keys: ['Motherboard Compatibility'] },
  includedFans: { id: 'includedFans', label: 'Included Fans', keys: ['No. Of fans included', 'No. of fans'], format: appendWord('fan') },
  caseFanSize: { id: 'caseFanSize', label: 'Fan Size', keys: ['Fan size'] },
  caseFeatures: { id: 'caseFeatures', label: 'Case Features', keys: ['Special Features'] },
  coolingType: { id: 'coolingType', label: 'Cooler Type', keys: ['Cooling method'] },
  radiatorSize: { id: 'radiatorSize', label: 'Radiator Size', keys: ['Radiator size'] },
  coolerFanSize: { id: 'coolerFanSize', label: 'Cooler Fan Size', keys: ['Fans size'] },
  coolerFanCount: { id: 'coolerFanCount', label: 'Cooler Fan Count', keys: ['No. of fans'], format: appendWord('fan') },
  coolerFeatures: { id: 'coolerFeatures', label: 'Cooler Features', keys: ['Special Features'] },
  color: { id: 'color', label: 'Color', keys: ['Color'] },
  laptopProcessor: { id: 'laptopProcessor', label: 'Laptop CPU', keys: ['Processor'] },
  laptopGpu: { id: 'laptopGpu', label: 'Laptop GPU', keys: ['Graphics Card'] },
  laptopRam: { id: 'laptopRam', label: 'Laptop RAM', keys: ['RAM', 'RAM (GB)'], format: appendUnit(' GB') },
}

export const CATEGORY_SPECIFICATION_FILTERS: Record<string, string[]> = {
  'graphics-cards': ['vram', 'gpuMemoryType', 'gpuFanCount', 'videoOutputs'],
  monitors: ['screenSize', 'resolution', 'refreshRate', 'monitorPorts'],
  processors: ['cpuSocket', 'cpuCores', 'cpuThreads', 'cpuSpeed'],
  motherboards: ['cpuSocket', 'motherboardFormFactor', 'motherboardMemoryType', 'ramSlots', 'nvmeSlots'],
  memory: ['memorySpeed', 'memoryKitSize'],
  storage: ['storageType', 'storageCapacity', 'storageInterface'],
  'power-supply': ['wattage', 'efficiencyRating', 'psuFeatures'],
  cases: ['motherboardCompatibility', 'includedFans', 'caseFanSize', 'caseFeatures'],
  'cpu-cooling': ['coolingType', 'radiatorSize', 'coolerFanSize', 'coolerFanCount', 'coolerFeatures', 'color'],
  laptops: ['laptopProcessor', 'laptopGpu', 'laptopRam', 'storageCapacity', 'screenSize', 'resolution', 'refreshRate'],
  'pre-built': ['cpuSocket', 'ramSlots', 'nvmeSlots', 'efficiencyRating', 'includedFans'],
  oem: ['cpuSocket', 'ramSlots', 'nvmeSlots', 'wattage'],
  accessories: [],
}

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const normalizeValue = (value: string) => value.trim().toLowerCase()

const cleanValue = (value: unknown) => {
  if (value === null || value === undefined) return undefined
  const cleaned = String(value).trim()
  if (!cleaned || /^(n\/a|none|null|undefined|-)$/i.test(cleaned)) return undefined
  return cleaned
}

const getDefinitionValue = (product: Product, definition: SpecificationFilterDefinition) => {
  const specifications = product.specifications || {}
  const valuesByKey = new Map(
    Object.entries(specifications).map(([key, value]) => [normalizeKey(key), value])
  )
  for (const key of definition.keys) {
    const value = cleanValue(valuesByKey.get(normalizeKey(key)))
    if (value) return value
  }
  return undefined
}

const productSupportsFilter = (product: Product, filterId: string) => {
  const categoryId = findProductCategoryId(product.category)
  return Boolean(categoryId && CATEGORY_SPECIFICATION_FILTERS[categoryId]?.includes(filterId))
}

export const buildAvailableSpecificationFilters = (
  products: Product[]
): AvailableSpecificationFilter[] => {
  const representedFilterIds = new Set<string>()
  products.forEach((product) => {
    const categoryId = findProductCategoryId(product.category)
    CATEGORY_SPECIFICATION_FILTERS[categoryId || '']?.forEach((id) => representedFilterIds.add(id))
  })

  return Array.from(representedFilterIds)
    .map((id) => {
      const definition = FILTER_DEFINITIONS[id]
      if (!definition) return undefined
      const optionMap = new Map<string, CountedFilterOption>()

      products.forEach((product) => {
        if (!productSupportsFilter(product, id)) return
        const value = getDefinitionValue(product, definition)
        if (!value) return
        const normalized = normalizeValue(value)
        const existing = optionMap.get(normalized)
        if (existing) existing.count += 1
        else {
          optionMap.set(normalized, {
            value,
            label: definition.format?.(value) || value,
            count: 1,
          })
        }
      })

      const options = Array.from(optionMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      )
      if (options.length < 2) return undefined
      return { id, label: definition.label, options }
    })
    .filter((filter): filter is AvailableSpecificationFilter => Boolean(filter))
}

export const matchesSpecificationFilters = (
  product: Product,
  activeFilters: ActiveSpecificationFilters
) => Object.entries(activeFilters).every(([id, selectedValues]) => {
  if (selectedValues.length === 0) return true
  const definition = FILTER_DEFINITIONS[id]
  if (!definition || !productSupportsFilter(product, id)) return false
  const productValue = getDefinitionValue(product, definition)
  return Boolean(
    productValue && selectedValues.some((value) => normalizeValue(value) === normalizeValue(productValue))
  )
})

export const getCompactProductSpecifications = (product: Product, limit = 3) => {
  const categoryId = findProductCategoryId(product.category)
  const filterIds = CATEGORY_SPECIFICATION_FILTERS[categoryId || ''] || []
  const values: string[] = []

  for (const id of filterIds) {
    const definition = FILTER_DEFINITIONS[id]
    if (!definition) continue
    const value = getDefinitionValue(product, definition)
    if (!value) continue
    const formatted = definition.format?.(value) || value
    if (!values.some((existing) => normalizeValue(existing) === normalizeValue(formatted))) {
      values.push(formatted)
    }
    if (values.length === limit) break
  }
  return values
}
