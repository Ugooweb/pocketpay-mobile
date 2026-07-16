# Security Guide

This document covers how PocketPay handles keys and data, what the Testnet means for your funds, and how to keep your wallet safe.

---

## Testnet Only

PocketPay connects to the **Stellar Testnet**. Testnet XLM has no real-world monetary value — it exists solely for development and testing purposes.

- Do not send real funds to a Testnet address.
- Testnet accounts and balances can be reset by the Stellar Development Foundation at any time.
- When a Mainnet integration is added in the future, it will be clearly labelled and a separate security review will be conducted.

---

## Your Secret Key

Your Stellar secret key (starting with `S…`) is the only credential that controls your wallet. Anyone who has it can move your funds without any further authentication.

**Keep it private:**
- Never share your secret key with anyone — not developers, not support staff, not this app's maintainers.
- Never paste it into a chat, email, issue tracker, or form outside the app.
- Never commit it to source control, even in a private repository.
- If you believe your secret key has been exposed, generate a new keypair immediately and stop using the compromised one.

---

## How Keys Are Stored on Your Device

PocketPay stores your secret key using [`expo-secure-store`](https://docs.expo.dev/versions/latest/sdk/securestore/), which maps to:

| Platform | Underlying storage |
|---|---|
| iOS | Keychain Services |
| Android | Android Keystore / EncryptedSharedPreferences |

The key is never written to plain `AsyncStorage`, logs, or the filesystem. It is only read at the moment a transaction needs to be signed, and the derived public key is used for everything else.

**What this means in practice:**
- The key is encrypted at rest using hardware-backed storage where available.
- It does not leave the device over the network (signing happens locally).
- Uninstalling the app removes the stored key. Make sure you have a backup before uninstalling.

---

## Backing Up Your Secret Key

There is no cloud backup or recovery phrase in this version of PocketPay. If you lose access to your device without a backup, **your wallet cannot be recovered**.

Recommended backup steps:
1. After creating a wallet, write your secret key down on paper and store it somewhere physically secure (e.g. a safe).
2. Do not store it in a notes app, cloud drive, or screenshot unless it is encrypted with a strong password.
3. Verify the backup by importing it into the app before relying on it.

---

## Logging and Debugging

When building or modifying the app:

- Do not log secret keys, even temporarily. Use `console.log(keypair.publicKey())` rather than `console.log(keypair.secret())`.
- Be careful with error objects from the Stellar SDK — in some cases they may echo back request parameters. Review what you log before shipping.
- Remove or gate all debug logging behind `__DEV__` before a production build.

Example of what **not** to do:

```ts
// ❌ Never log the secret key
console.log('keypair:', keypair.secret());

// ✅ Log only the public key
console.log('public key:', keypair.publicKey());
```

---

## Screen Capture and Clipboard

- The app currently does not disable screenshots or screen recording. Avoid displaying your secret key on screen in a public place.
- When copying your public key via the share/copy feature, be aware that clipboard contents can be read by other apps on some Android versions.

---

## Reporting a Security Issue

If you discover a security vulnerability, please do **not** open a public GitHub issue. Instead, contact the maintainers directly via the email listed in the repository profile. We aim to respond within 72 hours.

---

## Summary Checklist

| Topic | Guidance |
|---|---|
| Testnet funds | No real value — safe to experiment |
| Secret key sharing | Never share with anyone |
| Device storage | Encrypted via `expo-secure-store` |
| Backup | Write it down offline; no cloud recovery |
| Logging | Never log the secret key |
| Lost device | Without a backup, the wallet cannot be recovered |
