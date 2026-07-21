# Development Diagnostics Export

Debugging mobile applications often requires insight into the app's internal state. However, ensuring that sensitive user data is protected is paramount.

The Development Diagnostics feature allows contributors to easily export and share non-sensitive app state when debugging issues or reporting bugs.

## How It Works

When running the application in development mode (`__DEV__` is true), a **Development** section will appear in the Settings tab. Tapping **Export Diagnostics** will gather relevant application state and open the native share dialog, allowing you to copy the data or send it to another application.

## Redacted Information

The diagnostics payload is explicitly designed to **exclude** any sensitive data that could compromise a user's wallet or privacy. 

The following information is **REDACTED**:
- Secret Keys
- Public Keys
- Exact contact details (names, public keys)
- Full transaction history and amounts

## Included Information

The exported JSON string includes useful metadata for debugging:
- **Environment**: OS Platform, OS Version, App Version, Build Version, Development status
- **App State**: Initialization status, UI Theme (Dark Mode), total count of saved contacts
- **Wallet State**: Wallet initialization status (has public key), balance load status, transaction count, loading state, and the most recent error message (if any)

### Example Payload

```json
{
  "environment": {
    "platform": "ios",
    "osVersion": "16.4",
    "appVersion": "1.0.0",
    "isDevelopment": true
  },
  "appState": {
    "isInitialized": true,
    "isDarkMode": true,
    "contactsCount": 2
  },
  "walletState": {
    "hasPublicKey": true,
    "isBalanceLoaded": true,
    "transactionsCount": 5,
    "isLoading": false,
    "lastError": null
  },
  "timestamp": "2023-10-25T14:48:00.000Z"
}
```
