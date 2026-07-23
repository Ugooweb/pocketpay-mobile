import { formatAmount } from './amount';

describe('formatAmount', () => {
  it('formats integers correctly', () => {
    expect(formatAmount(50)).toBe('50');
    expect(formatAmount('50')).toBe('50');
    expect(formatAmount(1000)).toBe('1,000');
    expect(formatAmount('1000000')).toBe('1,000,000');
  });

  it('formats floats correctly and trims trailing zeros', () => {
    expect(formatAmount(50.12)).toBe('50.12');
    expect(formatAmount('50.1200000')).toBe('50.12');
    expect(formatAmount('0.0000001')).toBe('0.0000001');
    expect(formatAmount(0.0000001)).toBe('0.0000001');
  });

  it('handles negative values correctly', () => {
    expect(formatAmount(-50)).toBe('-50');
    expect(formatAmount('-50.120')).toBe('-50.12');
    expect(formatAmount('-0.05')).toBe('-0.05');
  });

  it('respects maximumFractionDigits options', () => {
    expect(formatAmount(50.12345678, { maximumFractionDigits: 4 })).toBe('50.1234');
    expect(formatAmount('50.1200000', { maximumFractionDigits: 2 })).toBe('50.12');
  });

  it('respects minimumFractionDigits options', () => {
    expect(formatAmount(50, { minimumFractionDigits: 2 })).toBe('50.00');
    expect(formatAmount(50.1, { minimumFractionDigits: 3 })).toBe('50.100');
  });

  it('handles empty, null, undefined, or invalid inputs gracefully', () => {
    expect(formatAmount(null)).toBe('—');
    expect(formatAmount(undefined)).toBe('—');
    expect(formatAmount('')).toBe('—');
    expect(formatAmount('abc')).toBe('—');
  });
});
