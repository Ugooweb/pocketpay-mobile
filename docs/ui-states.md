# UI State Catalogue

This document catalogues the six core UI states — **Loading, Empty, Error, Success, Disabled, Pending** — for each of PocketPay Mobile's primary screens: Wallet, Send, Receive, Transactions (Activity), Contacts, and Vault.

Use this as a quick reference when building or reviewing a screen so its states stay consistent with the rest of the app. For full step-by-step journeys (e.g. the multi-step create/import wallet flow), see [Main wallet user flows](./user-flows.md). For vault-specific Testnet/mock-mode language, see [Vault UI Guidance](./vault-ui-guidance.md). For visual tokens (colours, spacing, the shared `Button`/`Input` components), see the [Design System guide](./design-system.md).

State conventions used throughout the app:

- **Loading** — `Button` with `isLoading` shows a spinner and is auto-disabled; screen-level loading uses `RefreshControl` or a centred `ActivityIndicator`.
- **Empty** — centred layout, 48px `lucide-react-native` icon in `colors.textMuted`, brief muted label. See [Empty States](./design-system.md#empty-states).
- **Error** — inline `Input` `error` prop (red border + `colors.error` text below the field) for validation; `Alert` or a tinted banner (`colors.error` at 10% opacity) for submission/network failures.
- **Success** — confirmation message or updated data, `colors.success` used for positive banners/icons.
- **Disabled** — `Button` `disabled` prop (background → `colors.surfaceLight`, text → `colors.textMuted`), or a read-only `Input`.
- **Pending** — an action has been accepted locally but is not yet final; use clear progress copy such as `Reviewing`, `Signing`, `Submitting`, `Waiting for confirmation`, or `Vault action pending` so users know the app is working and can avoid repeating the action.

---

## Wallet (Home)

**Route:** `app/(tabs)/index.tsx` · **Store:** `useWalletStore` (`publicKey`, `balance`, `transactions`, `isLoading`, `refreshWalletData`)

| State | Behavior |
|---|---|
| **Loading** | Pull-to-refresh `RefreshControl` is active while balance and the 3-item recent activity preview load together. |
| **Empty** | A valid, non-error state: unfunded wallet shows `0.0000000 XLM` and **No recent transactions** — not treated as an error. |
| **Error** | A failed refresh stops loading and leaves the screen in a recoverable state (data preserved, user can pull to refresh again); if Horizon is unavailable, loading stops without clearing existing data. |
| **Success** | Populated balance, abbreviated public key, and the 3 most recent operations (sent shown with a minus sign, received with a plus sign). |
| **Disabled** | *Not applicable* — Home has no primary action to disable; the header/tab remains interactive during loading. |
| **Pending** | While a send/receive-related action is being prepared elsewhere in the flow, keep the wallet visible and avoid implying the balance is final if the transaction has not been confirmed yet. |

## Send

**Route:** `app/send.tsx` · **Store:** `useWalletStore` (`getSecretKey`, `refreshWalletData`, `balance`)

| State | Behavior |
|---|---|
| **Loading** | **Send Payment** button shows `isLoading` while the transaction is built, signed on-device, and submitted — prevents duplicate payments. |
| **Empty** | *Not applicable* — form always renders with empty/default input values on entry. |
| **Error** | Local validation (missing destination/amount, amount ≤ 0, amount exceeds balance) surfaces via `Input` `error`/`Alert` before signing; a rejected transaction shows **Transaction Failed** with a safe, actionable message and keeps entered fields intact for correction. |
| **Success** | **Transaction sent successfully!** confirmation; acknowledging it refreshes wallet data and navigates back. |
| **Disabled** | Send button is disabled during submission (via `isLoading`) to block duplicate submits. |
| **Pending** | After the user initiates a send, show a clear intermediate status while the app is reviewing, signing, or submitting the transaction so the action does not feel stalled or duplicated. |

## Receive

**Route:** `app/receive.tsx` · **Store:** `useWalletStore` (`publicKey`)

| State | Behavior |
|---|---|
| **Loading** | *Not applicable* — the QR code and public key render immediately from local wallet state; no network fetch. |
| **Empty** | **No public key found** is shown if the public key is unavailable; **Copy Address** / **Share** must not be invoked with an empty value. |
| **Error** | Shares the "Missing key" empty state above — there is no separate network-error case, since Receive doesn't fetch anything. |
| **Success** | QR code, full public key (selectable text), **Copy Address**, and **Share** (opens OS share sheet with title "My Stellar Address") are all available. |
| **Disabled** | Copy/Share actions are effectively disabled (not invoked) when no public key is present. |
| **Pending** | No long-running pending state is expected; if share/copy is in progress, keep the UI responsive and return to the steady receive view immediately after the OS action is triggered. |

## Transactions (Activity)

**Route:** `app/(tabs)/history.tsx` · **Store:** `useWalletStore` (`transactions`, `isLoading`, `refreshWalletData`, `publicKey`)

| State | Behavior |
|---|---|
| **Loading** | `RefreshControl` indicator is visible while the full transaction list (up to 20 recent Horizon operations) loads. |
| **Empty** | **No transactions found** with explanatory copy — a valid state for a new/unfunded wallet. |
| **Error** | Refresh failure ends loading, the list remains usable with previously-loaded data, and another pull-to-refresh can be attempted. |
| **Success** | Full list renders newest-first, with sent/received direction, amount, and localized timestamp per row. |
| **Disabled** | *Not applicable* — list has no primary action to disable. |
| **Pending** | During an in-flight transfer, show the new transaction as pending or keep the list stable with a clear "pending confirmation" indicator until Horizon confirms it. |

## Contacts

**Route:** `app/contacts.tsx` · **Store:** `useAppStore` (`contacts`, `addContact`, `removeContact`)

| State | Behavior |
|---|---|
| **Loading** | **Scanning**: full-screen `QrScanner` camera view with a scan-window overlay and Close action (functions as this screen's loading/in-progress state). |
| **Empty** | **No contacts yet**, with **+ Add Manually** and **Scan QR** entry points. |
| **Error** | Invalid/duplicate address or missing name shows inline error (manual form) or an `Alert` (scan flow); entered values remain editable. Delete is gated behind a destructive confirmation alert to prevent accidental removal. |
| **Success** | Contact list populated with name + abbreviated public key per row; after a QR scan, the address field is pre-filled and read-only under **Save Scanned Contact**. |
| **Disabled** | Address field becomes read-only after a successful scan (user can only edit the name before saving). |
| **Pending** | While scanning or saving a scanned contact, show that the device is working and prevent duplicate submissions. |

**Note:** contacts scanning has a debounce guard (`hasScanned` + `lastScanTime`, `SCAN_DEBOUNCE_MS` = 1.5s) so a single physical QR code can't fire multiple scan events — see `user-flows.md` for detail and the `AC11` test group in `__tests__/contacts.scan.test.tsx`.

## Vault

**Route:** `app/(tabs)/vault.tsx` · **Store:** `useWalletStore` (`publicKey`, `getSecretKey`) / `vaultStore` (`locks`, `lockedBalance`, `unlockTime`)

| State | Behavior |
|---|---|
| **Loading** | `VaultLockList` shows a loading state while fetching/calculating lock status; balance fetch shows loading via `mockFetchVaultBalance` (mock mode) or Soroban simulation (real mode). |
| **Empty** | `VaultLockList` has a dedicated empty state when the user has no locks yet. |
| **Error** | Real-mode balance/deposit/withdraw calls that fail (e.g. RPC unavailable) surface an error — the app currently has **no RPC-failure fallback**, so this should be treated as an area needing careful, honest error copy rather than a silent failure. Contract/Soroban result codes are **not yet mapped** to user-friendly messages — mock functions currently throw generic errors only. |
| **Success** | Vault balance, TESTNET badge, and the locks list (each with locked amount, unlock date, status, and eligible actions for matured locks) render correctly. |
| **Disabled** | "Lock Funds (30 days)" and withdraw actions must clearly indicate **mock mode** when no real contract is configured (`EXPO_PUBLIC_VAULT_CONTRACT_ID` unset) — this isn't a literal disabled button, but the UI must not imply a live/production action is being taken. Matured vs. immature locks must be visually distinct so users can tell which locks are eligible for withdrawal. |
| **Pending** | Vault deposit, withdraw, and lock actions should show a clear in-flight state while the transaction is being prepared or confirmed, especially in mock mode where the outcome is simulated. |

**Testnet & custody language:** every vault state must follow [Vault UI Guidance](./vault-ui-guidance.md) — no "savings account"/"bank"/"insured"/"secured" language, and mock mode must be visually distinguished from real contract mode at all times, per that doc's Summary Checklist.

---

## Screens without a dedicated state row above

This catalogue covers the six screens named in the tracking issue. Other routes (`app/(auth)/*` onboarding, `app/scan.tsx`, `app/payment-success.tsx`, `app/transaction/*`) have their own state behavior documented step-by-step in [user-flows.md](./user-flows.md) and aren't duplicated here to avoid drift between two sources of truth.
