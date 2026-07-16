export const errorFixtures = {
  networkError: {
    message: 'Network request failed',
    status: 0,
    code: 'ECONNRESET',
  },
  rateLimitError: {
    message: 'Too many requests',
    status: 429,
    retryAfter: 30,
  },
  accountNotFound: {
    message: 'Resource not found',
    status: 404,
  },
  insufficientBalance: {
    message: 'Insufficient balance',
    code: 'tx_insufficient_balance',
  },
};
