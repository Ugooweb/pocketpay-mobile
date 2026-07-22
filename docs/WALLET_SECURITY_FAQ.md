# Mobile Wallet Security FAQ

This document outlines the security architecture, local storage mechanics, key handling, reset behaviors, and user responsibilities for the mobile wallet application.

---

## 1. Storage & Key Handling

### How are private keys and secret phrases stored on the device?
Sensitive data (such as secret recovery phrases and private keys) is never stored in plaintext or standard local storage. The application relies on secure device hardware primitives (such as iOS Keychain and Android Keystore via SecureStore) to encrypt and isolate sensitive data at rest.

### Are my private keys ever transmitted to external servers?
No. All cryptographic operations (transaction signing, message verification) occur strictly on the client device. Private keys and secret recovery phrases never leave your device.

---

## 2. Security Guarantees & Assumptions

### What does the app guarantee?
* **Local Isolation:** Keys are stored securely on the local device.
* **No Remote Key Backup:** We do not collect, back up, or host your private keys on any central server.
* **Client-Side Signing:** All transactions are signed locally before broadcast.

### What are the user's responsibilities?
* **Backup Management:** You are solely responsible for writing down and securely storing your secret recovery phrase offline.
* **Device Security:** Maintaining device integrity (e.g., strong passcode, biometrics, avoiding rooted or jailbroken devices).
* **Malware Protection:** Ensuring the mobile OS is up to date to prevent overlay or screen-recording attacks.

---

## 3. Account Reset & Recovery

### What happens when I reset or uninstall the app?
Resetting or uninstalling the app permanently deletes locally cached data, including encrypted keystores.

### Can support help me recover my account if I lose my secret phrase?
No. Because we operate under a non-custodial model and do not store your keys, loss of your secret recovery phrase results in permanent loss of access to your funds. Always keep an offline backup.

---

## 4. Troubleshooting & Vulnerability Reporting

### What should I do if I suspect my device was compromised?
Immediately import your secret recovery phrase into a secure device or wallet and transfer all funds to a new, uncompromised wallet address.

### How do I report a security vulnerability?
If you discover a security flaw in the repository, please refrain from opening a public issue. Follow our responsible disclosure guidelines outlined in `SECURITY.md` or contact the maintainers directly.