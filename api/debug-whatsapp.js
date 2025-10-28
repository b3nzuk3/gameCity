export default async function handler(req, res) {
  try {
    const SITE_ORIGIN =
      process.env.SITE_ORIGIN || 'https://www.gamecityelectronics.co.ke'
    const API_BASE = process.env.API_BASE_URL || process.env.VITE_API_URL || ''

    const slug = String((req.query && req.query.slug) || '').trim()
    if (!slug) {
      res.status(400).send('Missing slug')
      return
    }

    const apiBases = [
      API_BASE,
      `${SITE_ORIGIN}/api`,
      'http://localhost:5000/api',
    ].filter(Boolean)

    let product = null
    let lastError
    for (const base of apiBases) {
      try {
        const r = await fetch(
          `${base}/products/slug/${encodeURIComponent(slug)}`
        )
        if (r.ok) {
          product = await r.json()
          break
        }
        lastError = `Status ${r.status} from ${base}`
      } catch (e) {
        lastError = (e && e.message) || e
      }
    }

    const rawImage =
      product && (product.image || (product.images && product.images[0]))
        ? product.image || product.images[0]
        : `${SITE_ORIGIN}/gamecity.png`

    // Test different image formats for WhatsApp
    const imageTests = {
      original: rawImage,
      jpeg_optimized: optimizeImageForWhatsApp(rawImage, 'jpg'),
      png_optimized: optimizeImageForWhatsApp(rawImage, 'png'),
      webp_optimized: optimizeImageForWhatsApp(rawImage, 'webp'),
    }

    const debugInfo = {
      slug,
      product: product
        ? {
            name: product.name,
            hasImage: !!(
              product.image ||
              (product.images && product.images[0])
            ),
            imageCount: product.images ? product.images.length : 0,
          }
        : null,
      rawImage,
      imageTests,
      userAgent: req.headers['user-agent'],
      lastError,
    }

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json(debugInfo)
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || 'Server error' })
  }
}

function optimizeImageForWhatsApp(imageUrl, format = 'jpg') {
  if (!imageUrl) return null

  if (imageUrl.includes('cloudinary.com')) {
    const baseUrl = imageUrl.split('/upload/')[0] + '/upload/'
    const path = imageUrl.split('/upload/')[1]

    const transformations = [
      'w_1200',
      'h_630',
      'c_fill',
      'q_80',
      `f_${format}`,
      'fl_progressive',
    ]

    return `${baseUrl}${transformations.join(',')}/${path}`
  }

  return imageUrl
}
