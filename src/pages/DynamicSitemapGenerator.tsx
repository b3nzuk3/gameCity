import React, { useEffect, useState } from 'react'
import backendService from '@/services/backendService'
import { generateProductUrl } from '@/lib/slugUtils'

interface SitemapData {
  products: Array<{
    id: string
    name: string
    category?: string
    updatedAt?: string
    createdAt?: string
  }>
  categories: string[]
}

const DynamicSitemapGenerator: React.FC = () => {
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateSitemap = async () => {
      try {
        // Fetch all products with a high limit to get all products
        const productsResponse = await backendService.products.getAll(1)
        const products = productsResponse.products

        // Get unique categories
        const categories = [
          ...new Set(products.map((p) => p.category).filter(Boolean)),
        ]

        setSitemapData({
          products,
          categories,
        })
      } catch (error) {
        console.error('Error generating sitemap:', error)
        // Fallback to empty data if API fails
        setSitemapData({
          products: [],
          categories: [],
        })
      } finally {
        setLoading(false)
      }
    }

    generateSitemap()
  }, [])

  const generateXMLSitemap = () => {
    if (!sitemapData) return ''

    const baseUrl = 'https://www.gamecityelectronics.com'
    const currentDate = new Date().toISOString()

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
    sitemapData.categories.forEach((category) => {
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
      xml += `
  <url>
    <loc>${baseUrl}/category/${categorySlug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // Individual product pages - THIS IS THE KEY IMPROVEMENT!
    sitemapData.products.forEach((product) => {
      const lastmod = product.updatedAt
        ? new Date(product.updatedAt).toISOString()
        : product.createdAt
        ? new Date(product.createdAt).toISOString()
        : currentDate

      const productUrl = generateProductUrl({ ...product, _id: product.id })
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
      { url: '/search', priority: '0.7' },
      { url: '/contact', priority: '0.6' },
      { url: '/build-pc', priority: '0.7' },
      { url: '/privacy', priority: '0.3' },
      { url: '/terms', priority: '0.3' },
    ]

    staticPages.forEach((page) => {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    })

    xml += `
</urlset>`

    return xml
  }

  // If this is being accessed as /sitemap.xml, serve XML content
  useEffect(() => {
    if (window.location.pathname === '/sitemap.xml') {
      // Set proper XML content type header
      document.title = 'Sitemap'

      // Generate and serve XML content
      const xmlContent = generateXMLSitemap()

      // Create a blob with XML content
      const blob = new Blob([xmlContent], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)

      // Trigger download or display
      const link = document.createElement('a')
      link.href = url
      link.download = 'sitemap.xml'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, [sitemapData])

  if (loading) {
    return <div>Generating dynamic sitemap...</div>
  }

  const xmlSitemap = generateXMLSitemap()

  // If accessing /sitemap.xml, return XML content directly
  if (window.location.pathname === '/sitemap.xml') {
    return (
      <div style={{ display: 'none' }}>
        <pre>{xmlSitemap}</pre>
      </div>
    )
  }

  // Regular HTML view for debugging/admin purposes
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dynamic XML Sitemap</h1>
      <p className="text-muted-foreground mb-4">
        This sitemap dynamically includes all products from your backend API.
        It's automatically generated and includes individual product URLs for
        better SEO.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="text-sm overflow-x-auto">
          <code>{xmlSitemap}</code>
        </pre>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          Total URLs:{' '}
          {sitemapData
            ? 1 +
              sitemapData.categories.length +
              sitemapData.products.length +
              5
            : 0}
        </p>
        <p>Categories: {sitemapData?.categories.length || 0}</p>
        <p>Products: {sitemapData?.products.length || 0}</p>
        <p className="text-green-600 font-semibold">
          ✅ Individual product URLs included for better SEO!
        </p>
      </div>
    </div>
  )
}

export default DynamicSitemapGenerator
