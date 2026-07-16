# Stellar PocketPay

React Native Expo wallet for Stellar Testnet.

## Documentation

- [Storage Guide](./docs/storage.md) - SecureStore vs AsyncStorage
- [Polyfills Guide](./docs/polyfills.md) - React Native polyfills and import order for Stellar SDK

> ⚠️ **This app runs on the Stellar Testnet only.** Testnet XLM has no real monetary value. Read the [Security Guide](docs/security.md) before storing or sharing any keys.

## Features

- Wallet creation and import
- XLM balance and transactions
- Send and receive with QR codes
- Address book contacts
- Soroban vault placeholder

For the expected screen sequence, validation, and UI states behind these features, see [Main wallet user flows](docs/user-flows.md).

## Documentation

*   [Screen Inventory](docs/screen-inventory.md) - A map of the main screens and routes in the app.

## Tech Stack

React Native, Expo Router, Zustand, Stellar SDK, SecureStore, AsyncStorage

## Quick Start

npm install --legacy-peer-deps
cp .env.example .env
npm start

## Contributing

Before adding new screens or components, read the [Design System guide](docs/design-system.md). It covers colour tokens, typography, spacing, card patterns, buttons, inputs, and dark mode rules derived directly from the existing codebase.

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) and review our [Accessibility Checklist](docs/accessibility.md) before making UI changes.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full list of notable changes across releases.

## Security

See the full [Security Guide](docs/security.md) for details on secret key handling, device storage, backups, and safe development practices.

## License

MIT
