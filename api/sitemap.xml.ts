import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(request: NextRequest) {
  try {
    // Set proper XML content type
    const headers = new Headers()
    headers.set('Content-Type', 'application/xml; charset=utf-8')
    headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    const baseUrl = 'https://www.gamecityelectronics.com'
    const currentDate = new Date().toISOString()

    // Fetch products from your backend API
    let products: Product[] = []
    let categories: string[] = []

    try {
      // Replace with your actual backend URL
      const backendUrl =
        process.env.BACKEND_URL || 'https://your-backend-url.com'
      const response = await fetch(
        `${backendUrl}/api/products?pageNumber=1&limit=1000`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (response.ok) {
        const data: ProductsResponse = await response.json()
        products = data.products || []

        // Get unique categories
        categories = [
          ...new Set(products.map((p) => p.category).filter(Boolean)),
        ]
      } else {
        console.warn(
          'Failed to fetch products from backend, using static sitemap'
        )
      }
    } catch (error) {
      console.warn('Error fetching products from backend:', error)
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

    return new NextResponse(xml, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
