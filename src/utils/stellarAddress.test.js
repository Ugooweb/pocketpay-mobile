const assert = require('node:assert/strict');
const { validateDestinationAddress } = require('./stellarAddress');

test('validates Stellar public keys and returns a clear error for invalid values', () => {
  assert.equal(validateDestinationAddress('GBAJ4V3Q...').error, 'Enter a valid Stellar public key.');
  assert.equal(validateDestinationAddress('G' + 'A'.repeat(55)).error, undefined);
  assert.equal(validateDestinationAddress('').error, undefined);
});
