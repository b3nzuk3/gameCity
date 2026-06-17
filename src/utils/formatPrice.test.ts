import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formats price with 2 decimal places', () => {
    expect(formatPrice(1299.99)).toBe('KES 1,299.99');
  });

  it('formats whole numbers correctly', () => {
    expect(formatPrice(1000)).toBe('KES 1,000.00');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('KES 0.00');
  });
});
