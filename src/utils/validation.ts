import { validatePublicKey } from 'pocketpay-sdk';
import { Buffer } from 'buffer';

// Stellar text memos are limited to 28 bytes.
export const MEMO_MAX_BYTES = 28;

// Accounts must keep a minimum XLM balance to stay active on the network.
export const MIN_XLM_RESERVE = 1;

/**
 * Validate a Stellar destination address.
 * Returns a readable error message, or null if valid.
 */
export const validateAddress = (
  address: string,
  ownPublicKey?: string | null
): string | null => {
  const trimmed = address.trim();

  if (!trimmed) {
    return 'Please enter a destination address.';
  }

  try {
    validatePublicKey(trimmed);
  } catch {
    return "This doesn't look like a valid Stellar address. It should start with G and be 56 characters long.";
  }

  if (ownPublicKey && trimmed === ownPublicKey) {
    return "You can't send a payment to your own wallet.";
  }

  return null;
};

/**
 * Validate a payment amount. If a balance is provided, also checks
 * that the amount can actually be sent.
 * Returns a readable error message, or null if valid.
 */
export const validateAmount = (
  amount: string,
  balance?: string
): string | null => {
  const trimmed = amount.trim();

  if (!trimmed) {
    return 'Please enter an amount.';
  }

  const value = Number(trimmed);
  if (!/^\d+(\.\d+)?$/.test(trimmed) || Number.isNaN(value)) {
    return 'Please enter a valid number.';
  }

  if (value <= 0) {
    return 'Amount must be more than 0.';
  }

  const decimals = trimmed.split('.')[1];
  if (decimals && decimals.length > 7) {
    return 'Amount can have at most 7 decimal places.';
  }

  if (balance !== undefined) {
    const balanceValue = Number(balance);
    if (value > balanceValue) {
      return "You don't have enough XLM for this payment.";
    }
    if (value > balanceValue - MIN_XLM_RESERVE) {
      return `You need to keep at least ${MIN_XLM_RESERVE} XLM in your wallet, so this amount is too high.`;
    }
  }

  return null;
};

/**
 * Validate an optional text memo (max 28 bytes on Stellar).
 * Returns a readable error message, or null if valid.
 */
export const validateMemo = (memo: string): string | null => {
  if (!memo) {
    return null;
  }

  if (Buffer.byteLength(memo, 'utf8') > MEMO_MAX_BYTES) {
    return `Memo is too long. Please keep it under ${MEMO_MAX_BYTES} characters.`;
  }

  return null;
};
