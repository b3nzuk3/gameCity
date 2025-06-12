// Currency formatting utility
export function formatKESPrice(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return 'KES 0'
  return `KES ${value.toLocaleString('en-KE')}`
}

// Parse price input to handle KES values
export const parseKESInput = (input: string): number => {
  // Remove 'KES' and any commas, then parse as number
  const cleanedInput = input.replace(/[^0-9.]/g, '')
  return parseFloat(cleanedInput) || 0
}
