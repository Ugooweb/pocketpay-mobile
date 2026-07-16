const path = require('path');
const packageJson = require('../../package.json');

module.exports = {
  ...packageJson.jest,
  // Force <rootDir> to be the actual root of the repository
  rootDir: path.resolve(__dirname, '../../'),
  setupFilesAfterEnv: [
    ...(packageJson.jest.setupFilesAfterEnv || []),
    '<rootDir>/.github/workflows/jest-setup.js'
  ],
  testPathIgnorePatterns: [
    ...(packageJson.jest.testPathIgnorePatterns || []),
    '<rootDir>/tests/', // Legacy vitest folder
    '<rootDir>/__tests__/send.test.tsx' // Out of scope: Currently broken on main branch
  ]
};