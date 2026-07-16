# Stellar PocketPay 🚀

A production-quality React Native Expo application for interacting with the Stellar Testnet. This mobile wallet allows users to securely generate and store keypairs, view XLM balances, send and receive Testnet XLM, view transaction history, manage contacts, and includes a placeholder for a Soroban Savings Vault.

## Features

*   **Wallet Management**: Create a new Stellar Testnet wallet or import an existing one using a secret key. Keys are securely stored on the device using `expo-secure-store`.
*   **Balance & Activity**: View your real-time XLM balance and recent transactions.
*   **Send & Receive**: Send XLM to any Stellar address. Receive XLM easily by sharing your auto-generated QR code.
*   **Address Book**: Save frequently used addresses in your contacts for quick access.
*   **Soroban Vault (Mock)**: A UI placeholder demonstrating where future Soroban smart contract integrations (like a savings vault) would live.
*   **Premium UI**: Clean, modern fintech aesthetic with dark mode support.

For the expected screen sequence, validation, and UI states behind these features, see [Main wallet user flows](docs/user-flows.md).

## Tech Stack

*   **Framework**: React Native with Expo (Managed Workflow)
*   **Navigation**: Expo Router (File-based routing)
*   **State Management**: Zustand
*   **Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
*   **Blockchain**: `@stellar/stellar-sdk` (with required React Native polyfills)

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm or yarn
*   Expo CLI (`npm install -g expo-cli`)
*   Expo Go app on your physical device, or an iOS Simulator / Android Emulator.

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd stellar-pocketpay-mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install --legacy-peer-deps
    ```
    *(Note: `--legacy-peer-deps` is required due to React 19 peer dependency conflicts in some React Native libraries)*

3.  **Environment Variables**:
    The project includes a `.env.example` file. Copy it to `.env`:
    ```bash
    cp .env.example .env
    ```
    The default values are configured for the Stellar Testnet.

### Running the App

Start the Expo development server:

```bash
npm start
```

Press `i` to open in iOS simulator, `a` to open in Android emulator, or scan the QR code with the Expo Go app on your physical device.

## Important Note on Polyfills

The Stellar SDK is designed for Node.js and Browser environments. To make it work in React Native, this project uses specific polyfills (`buffer`, `react-native-get-random-values`, `events`, etc.) which are configured in `shim.js` and imported at the very top of `app/_layout.tsx`.

## Funding Your Testnet Account

When you create a new wallet, it will have a balance of 0 XLM and won't exist on the ledger until funded. To fund it:
1. Copy your new Public Key from the app.
2. Go to the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#create-account).
3. Paste your Public Key and click "Get test network XLM".

## License

MIT
