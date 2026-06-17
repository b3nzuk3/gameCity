// formatPrice.ts - Price formatting utility for GreenBits Store (Kenyan Shilling)
export function formatPrice(price: number): string {
  // TDD GREEN phase: minimal implementation to pass tests
  return `KES ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}
