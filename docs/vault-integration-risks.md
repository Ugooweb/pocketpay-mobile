# Soroban Savings Vault: Integration Risks & Assumptions

This document outlines assumptions, placeholder states, and integration risks between the PocketPay Mobile vault UI, PocketPay SDK helpers, and deployed Soroban smart contract behavior.

## Summary of Current State

- **Mobile UI**: Full vault UI is implemented (deposit, withdraw, lock funds, multi‑lock list, education modal, lock detail)
- **Mock mode**: Default experience uses AsyncStorage/local timestamps, no real Soroban transactions
- **Real mode**: Can be enabled with `EXPO_PUBLIC_VAULT_CONTRACT_ID`, but integration points are still evolving
- **SDK**: PocketPay SDK is a stub in `src/sdk-stub`, full integration pending

## Assumptions: Mobile UI → Contract

### Multi-Lock Data
- **UI Assumption**: Each lock has a unique `id`, `amount`, `unlockDate`, and `status` (`locked`/`matured`). Multiple locks per user are supported and listed separately.
- **Contract Assumption**: The deployed Soroban contract must store locks per user address with these fields. If the contract uses a different schema (e.g., combined locks, different statuses, no unique IDs), the UI will need updates.
- **Placeholder Behavior**: In mock mode, locks are stored in AsyncStorage with local timestamps; unlock status is calculated based on device time (not ledger time).

### Deposits & Withdrawals
- **UI Assumption**:
  - Deposits are a single payment operation to the vault contract
  - Withdrawals are a single transaction that can withdraw any available (unlocked) amount
  - Both deposit and withdrawal return a transaction hash for explorer linking
- **Contract Assumption**:
  - Contract accepts XLM deposits
  - Contract allows partial/full withdrawals of unlocked funds
  - Both operations are single Soroban invocations that return a successful result on success
- **Placeholder Behavior**: In mock mode, no real transactions are submitted; the vault balance is incremented/decremented locally without network calls.

### Lock Periods
- **UI Assumption**: Lock duration is currently hardcoded to **30 days**. The user cannot choose a custom duration.
- **Contract Assumption**: Contract must support configurable lock durations, or 30-day locks by default. If the contract uses different units (e.g., ledgers instead of seconds), the UI needs adjustments to duration calculation and display.
- **Placeholder Behavior**: Mock mode calculates `unlockDate` as `Date.now() + 30 * 24 * 60 * 60 * 1000`.

## Assumptions: Mobile UI → SDK Helpers

### SDK Interface
- **UI Assumption**: There will be SDK helpers (similar to `src/services/vault.ts`) that expose:
  - `isVaultConfigured()`
  - `getVaultContractId()`
  - `getVaultBalance(publicKey)`
  - `depositToVault(secretKey, amount)`
  - `withdrawFromVault(secretKey, amount)`
  - Additional functions for listing locks, creating locks, unlocking matured locks
- **Placeholder Behavior**: The current `src/services/vault.ts` and mock functions are placeholders that will be replaced with real SDK calls once the SDK is ready.

### Error Handling
- **UI Assumption**: SDK helpers will throw human-readable errors that can be shown directly to users (e.g., "Insufficient unlocked balance", "Lock period not yet ended").
- **Placeholder Behavior**: Mock functions throw generic errors; real contract errors (Soroban result codes) are not yet mapped to user-friendly messages.

### Transaction Signing
- **UI Assumption**: SDK helpers will handle transaction building, signing (using the app's existing secret key storage), and submission to the Soroban RPC node.
- **Placeholder Behavior**: Currently, transactions are built manually in `src/services/vault.ts` using `@stellar/stellar-sdk` directly.

## Assumptions: Contract → SDK Helpers

### Contract Interface
- **SDK Assumption**: Contract has well‑defined Soroban functions (e.g., `deposit`, `withdraw`, `lock`, `unlock`, `get_balance`, `get_locks`) that can be called via SDK helpers.
- **Risk**: If the contract interface changes (function names, parameters, return types), the SDK helpers and mobile UI will need updates.

### Network & RPC
- **Assumption**: A Soroban RPC node is available (configured via `EXPO_PUBLIC_SOROBAN_RPC_URL`, defaults to public Testnet RPC).
- **Risk**: If the RPC node is down or rate-limited, the vault UI will show errors; the app currently has no fallback for RPC failures.

## Placeholder UI Behavior to Document

| Placeholder | Current Behavior | What It Will Do in Production |
|-------------|-----------------|--------------------------------|
| Lock storage | Locks stored in AsyncStorage | Locks read from Soroban contract state |
| Unlock calculation | Uses device time | Uses Stellar ledger time |
| Vault balance | Mock balance (starts at 0) | Real balance queried from contract |
| Deposit/withdraw transactions | No real transactions | Submit real Soroban transactions to the network |
| Lock duration | Hardcoded 30 days | User-selectable (or contract-defined) duration |

## Integration Points That Need Coordination

1. **Contract Deployment**: A stable test contract must be deployed and its ID set in `EXPO_PUBLIC_VAULT_CONTRACT_ID`
2. **SDK Integration**: Replace `src/services/vault.ts` with PocketPay SDK calls once the SDK is ready
3. **Error Mapping**: Define how contract/Soroban errors map to user-facing messages
4. **Lock Schema Alignment**: Ensure contract, SDK, and UI agree on lock data structure
5. **Transaction Confirmation**: Add explorer links and transaction status updates (pending/finalized) for real vault transactions

## Risk Mitigation Checklist

- [ ] Keep contract, SDK, and UI in sync via shared schema (e.g., TypeScript types for contract data)
- [ ] Use feature flags for new vault features during development
- [ ] Add integration tests that run against a test contract
- [ ] Document all contract/SDK breaking changes in a shared changelog
- [ ] Preserve mock mode as a safe fallback for development and demos
