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

## Screenshots

> 📸 Screenshots below are placeholders. To update them, capture each screen from a simulator or device (use dummy/funded Testnet data only — never real keys or mainnet funds) and replace the files in `docs/screenshots/`.

| Wallet | Send | Receive |
|:---:|:---:|:---:|
| ![Wallet screen](docs/screenshots/wallet.png) | ![Send screen](docs/screenshots/send.png) | ![Receive screen](docs/screenshots/receive.png) |
| *Balance overview and quick actions* | *Send XLM to any Stellar address* | *QR code for your public key* |

| Activity | Contacts | Vault |
|:---:|:---:|:---:|
| ![Activity screen](docs/screenshots/activity.png) | ![Contacts screen](docs/screenshots/contacts.png) | ![Vault screen](docs/screenshots/vault.png) |
| *Transaction history with sent/received indicators* | *Saved addresses for quick access* | *Soroban Savings Vault (mock)* |

### Updating screenshots

1. Run the app in a simulator with a funded Testnet account.
2. Navigate to the relevant screen.
3. Take a screenshot and export it at roughly **390 × 844 px** (iPhone 14 logical resolution) or equivalent Android size.
4. Save it to `docs/screenshots/<screen-name>.png` using the filenames shown above.
5. Commit only the image files — never include screenshots that reveal a real secret key or personal data.

## Tech Stack

React Native, Expo Router, Zustand, PocketPay SDK, SecureStore, AsyncStorage

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm start
```

The PocketPay SDK is pinned to an official source commit and built by the
app's `postinstall` script because the SDK is not currently published to npm.

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
