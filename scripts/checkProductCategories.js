// Usage: node scripts/checkProductCategories.js <products.json>
const fs = require('fs')

const canonicalCategories = [
  'monitors',
  'graphics cards',
  'memory',
  'processors',
  'storage',
  'motherboards',
  'cases',
  'power supply',
  'gaming pc',
  'oem',
  'accessories',
]

const normalizeCategory = (category) => {
  if (!category) return ''
  const categoryMappings = {
    monitors: 'monitors',
    'graphics-cards': 'graphics cards',
    'graphics card': 'graphics cards',
    'graphics cards': 'graphics cards',
    graphics: 'graphics cards',
    memory: 'memory',
    processors: 'processors',
    storage: 'storage',
    motherboards: 'motherboards',
    cases: 'cases',
    'power-supply': 'power supply',
    'power supply': 'power supply',
    'gaming-pc': 'gaming pc',
    'gaming-pcs': 'gaming pc',
    'gaming pc': 'gaming pc',
    'gaming pcs': 'gaming pc',
    oem: 'oem',
    OEM: 'oem',
    accessories: 'accessories',
  }
  const key = category.toLowerCase().trim()
  return categoryMappings[key] || key
}

if (process.argv.length < 3) {
  console.error('Usage: node scripts/checkProductCategories.js <products.json>')
  process.exit(1)
}

const file = process.argv[2]
const products = JSON.parse(fs.readFileSync(file, 'utf-8'))

let foundInvalid = false
products.forEach((product) => {
  const normalized = normalizeCategory(product.category)
  if (!canonicalCategories.includes(normalized)) {
    foundInvalid = true
    console.log(
      `Product ID: ${product.id}, Name: ${product.name}, Category: ${product.category} (normalized: ${normalized})`
    )
  }
})

if (!foundInvalid) {
  console.log('All product categories are valid.')
}
