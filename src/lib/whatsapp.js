export function normalizeWhatsAppPhone(phone) {
  let digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('0')) digits = digits.slice(1)
  return `254${digits}`
}

export function buildWhatsAppUrl(phone, message = '') {
  const number = normalizeWhatsAppPhone(phone)
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${text}`
}

export function buildProductInquiryMessage(productName, productUrl) {
  return `Hi GameCity Electronics, I'm interested in ${productName}.\n${productUrl}`
}
