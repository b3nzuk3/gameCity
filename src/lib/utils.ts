import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Offer helpers
export type OfferLike = {
  enabled?: boolean
  type?: 'percentage' | 'fixed'
  amount?: number
  startDate?: string | Date
  endDate?: string | Date
}

export function isOfferActive(offer?: OfferLike): boolean {
  if (!offer || !offer.enabled) return false
  const now = Date.now()
  const start = offer.startDate
    ? new Date(offer.startDate).getTime()
    : undefined
  const end = offer.endDate ? new Date(offer.endDate).getTime() : undefined
  if (start && now < start) return false
  if (end && now > end) return false
  return (offer.amount ?? 0) > 0 && (!!offer.type || offer.type === 'fixed')
}

export function getOfferPrice(original: number, offer?: OfferLike): number {
  if (!isOfferActive(offer)) return original
  const amount = offer?.amount ?? 0
  if (offer?.type === 'fixed') {
    return Math.max(0, original - amount)
  }
  // default to percentage
  const discount = Math.min(100, Math.max(0, amount))
  const discounted = original * (1 - discount / 100)
  return Math.max(0, Math.round(discounted))
}

export function getDiscountPercent(
  original: number,
  offer?: OfferLike
): number {
  if (!isOfferActive(offer) || original <= 0) return 0
  const amount = offer?.amount ?? 0
  if (offer?.type === 'fixed') {
    const pct = (amount / original) * 100
    return Math.max(0, Math.min(100, Math.round(pct)))
  }
  // percentage
  return Math.max(0, Math.min(100, Math.round(amount)))
}
