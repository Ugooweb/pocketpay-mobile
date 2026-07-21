import { validateAddress, validateAmount, validateMemo } from '../src/utils/validation';

// Mock pocketpay-sdk validatePublicKey
jest.mock('pocketpay-sdk', () => ({
  validatePublicKey: jest.fn((key: string) => {
    // Simple mock: valid if starts with G and is 56 chars
    if (key.startsWith('G') && key.length === 56) {
      return true;
    }
    throw new Error('Invalid public key');
  }),
}));

describe('validation utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAddress', () => {
    it('returns error for empty input', () => {
      expect(validateAddress('')).toBe('Please enter a destination address.');
      expect(validateAddress('   ')).toBe('Please enter a destination address.');
    });

    it('returns error for invalid address', () => {
      expect(validateAddress('invalid')).toBe("This doesn't look like a valid Stellar address. It should start with G and be 56 characters long.");
      expect(validateAddress('G123')).toBe("This doesn't look like a valid Stellar address. It should start with G and be 56 characters long.");
    });

    it('returns null for valid address', () => {
      const valid = 'GABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABC';
      expect(validateAddress(valid)).toBeNull();
      expect(validateAddress(`  ${valid}  `)).toBeNull(); // trimmed
    });

    it('returns error if sending to self', () => {
      const ownKey = 'GOWNKEYABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVW';
      expect(validateAddress(ownKey, ownKey)).toBe("You can't send a payment to your own wallet.");
    });
  });

  describe('validateAmount', () => {
    it('returns error for empty input', () => {
      expect(validateAmount('')).toBe('Please enter an amount.');
      expect(validateAmount('   ')).toBe('Please enter an amount.');
    });

    it('returns error for non-numeric input', () => {
      expect(validateAmount('abc')).toBe('Please enter a valid number.');
      expect(validateAmount('12,34')).toBe('Please enter a valid number.');
      expect(validateAmount('12-34')).toBe('Please enter a valid number.');
    });

    it('returns error for zero or negative amount', () => {
      expect(validateAmount('0')).toBe('Amount must be more than 0.');
      expect(validateAmount('-5')).toBe('Please enter a valid number.');
    });

    it('returns error for too many decimal places', () => {
      expect(validateAmount('123.12345678')).toBe('Amount can have at most 7 decimal places.');
    });

    it('returns error for amount exceeding balance', () => {
      expect(validateAmount('100', '50')).toBe("You don't have enough XLM for this payment.");
    });

    it('returns error for amount leaving less than minimum reserve', () => {
      expect(validateAmount('99.5', '100')).toBe("You need to keep at least 1 XLM in your wallet, so this amount is too high.");
    });

    it('returns null for valid amount', () => {
      expect(validateAmount('10')).toBeNull();
      expect(validateAmount('  10.5  ')).toBeNull();
      expect(validateAmount('0.1234567')).toBeNull();
    });
  });

  describe('validateMemo', () => {
    it('returns null for empty memo', () => {
      expect(validateMemo('')).toBeNull();
      expect(validateMemo('   ')).toBeNull();
    });

    it('returns null for valid memo', () => {
      expect(validateMemo('invoice-123')).toBeNull();
      expect(validateMemo('  invoice-123  ')).toBeNull();
    });

    it('returns error for too long memo', () => {
      const longMemo = 'a'.repeat(30);
      expect(validateMemo(longMemo)).toBe('Memo is too long. Please keep it under 28 bytes.');
    });
  });
});
