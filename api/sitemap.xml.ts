// Vercel serverless function - no imports needed

interface Product {
  id: string
  name: string
  category?: string
  updatedAt?: string
  createdAt?: string
}

interface ProductsResponse {
  products: Product[]
  page: number
  pages: number
  count: number
}

// Generate SEO-friendly slug from product name
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .concat('-nairobi')
}

// Generate product URL
function generateProductUrl(product: Product): string {
  const slug = generateSlug(product.name)
  return `/product/${slug}`
}

export async function GET(request: Request) {
  try {
    // Set proper XML content type
    const headers = new Headers()
    headers.set('Content-Type', 'application/xml; charset=utf-8')
    headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    const baseUrl = 'https://www.gamecityelectronics.co.ke'
    const currentDate = new Date().toISOString()

    // Fetch products from your backend API
    let products: Product[] = []
    let categories: string[] = []

    // Static fallback categories
    const staticCategories = [
      'monitors',
      'graphics-cards',
      'memory',
      'processors',
      'storage',
      'motherboards',
      'cases',
      'power-supply',
      'pre-built',
      'cpu-cooling',
      'oem',
      'accessories',
    ]

    try {
      const backendUrl = process.env.BACKEND_URL

      if (!backendUrl || backendUrl === 'https://your-backend-url.com') {
        console.warn('BACKEND_URL not configured, using static sitemap')
        categories = staticCategories
      } else {
        console.log('Fetching products from:', `${backendUrl}/api/products`)

        const response = await fetch(
          `${backendUrl}/api/products?pageNumber=1&limit=1000`,
          {
            headers: {
              Accept: 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000), // 10 second timeout
          }
        )

        if (response.ok) {
          const data: ProductsResponse = await response.json()
          products = data.products || []

          // Get unique categories
          categories = [
            ...new Set(
              products
                .map((p) => p.category)
                .filter((cat): cat is string => Boolean(cat))
            ),
          ]

          console.log(
            `Successfully fetched ${products.length} products and ${categories.length} categories`
          )
        } else {
          console.warn(
            `Backend API returned ${response.status}: ${response.statusText}`
          )
          categories = staticCategories
        }
      }
    } catch (error) {
      console.warn('Error fetching products from backend:', error)
      categories = staticCategories
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Homepage
    xml += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`

    // Category pages
    categories.forEach((category) => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
      xml += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // Individual product pages - THE KEY FEATURE!
    products.forEach((product) => {
      const lastmod = product.updatedAt
        ? new Date(product.updatedAt).toISOString()
        : product.createdAt
        ? new Date(product.createdAt).toISOString()
        : currentDate

      const productUrl = generateProductUrl(product)

      xml += `
  <url>
    <loc>${baseUrl}${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    })

    // Static pages
    const staticPages = [
      { url: '/search', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/build-pc', priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
      { url: '/sitemap', priority: '0.4', changefreq: 'monthly' },
    ]

    staticPages.forEach((page) => {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    })

    xml += `
</urlset>`

    return new Response(xml, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)

    // Return a minimal sitemap even if there's an error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.gamecityelectronics.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`

    const headers = new Headers()
    headers.set('Content-Type', 'application/xml; charset=utf-8')

    return new Response(fallbackXml, {
      status: 200,
      headers,
    })
  }
}
