import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StellarSdk from '@stellar/stellar-sdk';
import { fetchXlmBalance, fetchTransactionsPage, fundWithFriendbot, PaymentRecord } from '../services/stellar';

const WALLET_KEY = 'pocketpay_wallet_secret';
// Tracks whether the post-creation backup reminder has been acknowledged.
// Persisted (not just in-memory) so the reminder survives an app kill that
// happens after wallet creation but before the user dismisses the modal —
// otherwise the in-memory `showBackupReminder` flag resets to false on the
// next launch and the user never sees the warning again.
const BACKUP_ACK_KEY = '@pocketpay_backup_acknowledged';
const DEFAULT_BALANCE = '0.0000000';
const TX_PAGE_SIZE = 20;
const PERSIST_WALLET_ERROR = 'Failed to persist wallet securely';
const RESTORE_WALLET_ERROR = 'Failed to restore wallet securely';
const CLEAR_WALLET_ERROR = 'Failed to clear wallet securely';
const READ_WALLET_ERROR = 'Failed to read wallet securely';

// Transaction records from the Stellar Horizon API – use a flexible type
// until a proper typed SDK wrapper is available.
export type TransactionRecord = Record<string, any> & { id: string };

interface WalletState {
  publicKey: string | null;
  balance: string;
  transactions: TransactionRecord[];
  lastRefreshed: number | null;
  isLoading: boolean;
  isFunding: boolean;
  fundError: string | null;
  error: string | null;
  showBackupReminder: boolean;

  // Pagination
  isLoadingMore: boolean;
  hasMoreTransactions: boolean;
  nextCursor: string | null;

  // Actions
  setWallet: (publicKey: string, secretKey: string) => Promise<boolean>;
  loadWalletFromStorage: () => Promise<boolean>;
  /** Pull-to-refresh: resets pagination and loads the first page fresh. */
  refreshWalletData: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
  clearWallet: () => Promise<boolean>;
  getSecretKey: () => Promise<string | null>;
  fundWallet: () => Promise<void>;
  /** Marks the backup reminder as pending (shown) and persists that state. */
  markBackupPending: () => Promise<void>;
  /** Marks the backup reminder as acknowledged and persists that state. */
  acknowledgeBackupReminder: () => Promise<void>;
}

const resetWalletState = () => ({
  publicKey: null,
  balance: DEFAULT_BALANCE,
  transactions: [],
  lastRefreshed: null,
  isLoadingMore: false,
  hasMoreTransactions: false,
  nextCursor: null,
});

const parseStoredSecret = (storedValue: string): string | null => {
  const trimmedValue = storedValue.trim();
  if (!trimmedValue) return null;

  if (trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmedValue);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        typeof parsed.secretKey === 'string' &&
        parsed.secretKey.trim()
      ) {
        return parsed.secretKey.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  return trimmedValue;
};

const clearStoredSecrets = async () => {
  try {
    await SecureStore.deleteItemAsync(WALLET_KEY);
  } catch {
    console.warn('Failed to clear invalid wallet storage');
  }
};

export const useWalletStore = create<WalletState>((set, get) => ({
  publicKey: null,
  balance: DEFAULT_BALANCE,
  transactions: [],
  lastRefreshed: null,
  isLoading: false,
  isFunding: false,
  fundError: null,
  error: null,
  isLoadingMore: false,
  hasMoreTransactions: false,
  nextCursor: null,
  showBackupReminder: false,

  markBackupPending: async () => {
    set({ showBackupReminder: true });
    try {
      await AsyncStorage.setItem(BACKUP_ACK_KEY, 'false');
    } catch {
      console.warn('Failed to persist backup reminder state');
    }
  },

  acknowledgeBackupReminder: async () => {
    set({ showBackupReminder: false });
    try {
      await AsyncStorage.setItem(BACKUP_ACK_KEY, 'true');
    } catch {
      console.warn('Failed to persist backup reminder state');
    }
  },

  setWallet: async (publicKey: string, secretKey: string) => {
    try {
      await SecureStore.setItemAsync(WALLET_KEY, secretKey);
      set({ publicKey, balance: DEFAULT_BALANCE, transactions: [], error: null });
      return true;
    } catch {
      console.error(PERSIST_WALLET_ERROR);
      set({ ...resetWalletState(), error: PERSIST_WALLET_ERROR });
      return false;
    }
  },

  loadWalletFromStorage: async () => {
    let storedValue: string | null = null;
    try {
      storedValue = await SecureStore.getItemAsync(WALLET_KEY);
    } catch {
      console.error(RESTORE_WALLET_ERROR);
      set({ ...resetWalletState(), error: RESTORE_WALLET_ERROR });
      return false;
    }

    if (storedValue === null) {
      set({ ...resetWalletState(), error: null });
      return false;
    }

    const secretKey = parseStoredSecret(storedValue);
    if (!secretKey) {
      await clearStoredSecrets();
      set({ ...resetWalletState(), error: RESTORE_WALLET_ERROR });
      return false;
    }

    try {
      const keypair = StellarSdk.Keypair.fromSecret(secretKey);

      // Re-show the backup reminder if it was left pending from a previous
      // session (e.g. the app was killed before the user acknowledged it).
      let showBackupReminder = false;
      try {
        showBackupReminder = (await AsyncStorage.getItem(BACKUP_ACK_KEY)) === 'false';
      } catch {
        // Non-critical: default to not re-showing the reminder on read failure.
      }

      set({ publicKey: keypair.publicKey(), error: null, showBackupReminder });
      return true;
    } catch {
      console.error(RESTORE_WALLET_ERROR);
      await clearStoredSecrets();
      set({ ...resetWalletState(), error: RESTORE_WALLET_ERROR });
      return false;
    }
  },

  refreshWalletData: async () => {
    const { publicKey } = get();
    if (!publicKey) return;

    set({ isLoading: true, error: null, isLoadingMore: false, nextCursor: null, hasMoreTransactions: false });
    try {
      const [balance, page] = await Promise.all([
        fetchXlmBalance(publicKey),
        fetchTransactionsPage(publicKey, TX_PAGE_SIZE),
      ]);
      set({
        balance,
        transactions: page.records,
        nextCursor: page.nextCursor,
        hasMoreTransactions: page.hasMore,
        lastRefreshed: Date.now(),
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to refresh wallet data');
      set({ isLoading: false, error: err.message || 'Failed to sync data' });
    }
  },

  loadMoreTransactions: async () => {
    const { publicKey, isLoadingMore, hasMoreTransactions, nextCursor, transactions } = get();

    // Guard: nothing to do if already loading or no more pages.
    if (!publicKey || isLoadingMore || !hasMoreTransactions || !nextCursor) return;

    set({ isLoadingMore: true, error: null });
    try {
      const page = await fetchTransactionsPage(publicKey, TX_PAGE_SIZE, nextCursor);

      // Deduplicate: build a set of existing IDs then filter the new records.
      const existingIds = new Set(transactions.map((tx) => tx.id));
      const newRecords = (page.records as TransactionRecord[]).filter(
        (tx) => !existingIds.has(tx.id)
      );

      set({
        transactions: [...transactions, ...newRecords],
        nextCursor: page.nextCursor,
        hasMoreTransactions: page.hasMore,
        isLoadingMore: false,
      });
    } catch (err: any) {
      console.error('Failed to load more transactions:', err);
      set({ isLoadingMore: false, error: err.message || 'Failed to load more' });
    }
  },

  clearWallet: async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_KEY);
      set({ ...resetWalletState(), showBackupReminder: false, error: null });
      try {
        await AsyncStorage.removeItem(BACKUP_ACK_KEY);
      } catch {
        // Non-critical: a stale flag only affects the reminder's re-show behavior.
      }
      return true;
    } catch {
      console.error(CLEAR_WALLET_ERROR);
      set({ error: CLEAR_WALLET_ERROR });
      return false;
    }
  },

  getSecretKey: async () => {
    try {
      const value = await SecureStore.getItemAsync(WALLET_KEY);
      if (value !== null) set({ error: null });
      return value;
    } catch {
      console.error(READ_WALLET_ERROR);
      set({ error: READ_WALLET_ERROR });
      return null;
    }
  },

  fundWallet: async () => {
    const { publicKey } = get();
    if (!publicKey) return;

    set({ isFunding: true, fundError: null });
    try {
      await fundWithFriendbot(publicKey);
      // Refresh balance after successful funding
      await get().refreshWalletData();
      set({ isFunding: false });
    } catch (err: any) {
      console.error('Friendbot funding failed:', err);
      set({ isFunding: false, fundError: err.message || 'Funding failed. Please try again.' });
    }
  }
}));

