export const SITE_URL = 'https://www.gamecityelectronics.co.ke'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

/** Canonical business facts published by GameCity's existing public pages. */
export const BUSINESS_IDENTITY = {
  name: 'GameCity Electronics',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Gaming electronics store in Nairobi, Kenya',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kai Plaza 3rd floor shop 6, Tom Mboya St',
    addressLocality: 'Nairobi',
    addressCountry: 'KE',
  },
  sameAs: [
    'https://www.facebook.com/gamecityelectronics',
    'https://www.instagram.com/gamecityelectronics',
    'https://twitter.com/gamecityelectronics',
  ],
} as const

export const HOMEPAGE_SEO = {
  title:
    'Custom-Built PCs for Gaming & Streaming, Graphics Design, Architectural Design and Machine learning | GameCity Electronics',
  description:
    'Shop gaming PCs, PlayStation 5, Xbox Series X, graphics cards & gaming accessories in Nairobi. Fast delivery across Kenya. Best prices guaranteed!',
  keywords:
    'gaming PCs Nairobi, PlayStation 5 Kenya, Xbox Series X, graphics cards, gaming accessories, RTX 4070, RTX 4080, gaming monitors, Nairobi electronics',
}

export function canonicalUrl(path = '/') {
  const pathname = path.startsWith('http') ? new URL(path).pathname : path
  const normalized = `/${pathname.replace(/^\/+|\/+$/g, '')}`
  return normalized === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalized}`
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

export function conciseDescription(value: string, maxLength = 160) {
  const text = stripHtml(value)
  if (text.length <= maxLength) return text
  const sentence = text.slice(0, maxLength + 1).replace(/\s+\S*$/, '').trim()
  return `${sentence.replace(/[.,;:!?-]+$/, '')}.`
}

export function buildSeoMetadata(input: {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}) {
  const title = input.title || HOMEPAGE_SEO.title
  return {
    title: title.includes('GameCity Electronics') ? title : `${title} | GameCity Electronics`,
    description: input.description || HOMEPAGE_SEO.description,
    keywords: input.keywords || HOMEPAGE_SEO.keywords,
    canonical: canonicalUrl(input.url || '/'),
    image: input.image?.startsWith('http') ? input.image : `${SITE_URL}${input.image || '/og-image.png'}`,
    type: input.type || 'website',
  }
}
