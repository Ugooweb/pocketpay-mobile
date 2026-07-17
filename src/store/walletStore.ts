import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { fetchXlmBalance, fetchRecentTransactions, fundWithFriendbot } from '../services/stellar';

const WALLET_KEY = 'pocketpay_wallet_secret';
const DEFAULT_BALANCE = '0.0000000';
const PERSIST_WALLET_ERROR = 'Failed to persist wallet securely';
const RESTORE_WALLET_ERROR = 'Failed to restore wallet securely';
const CLEAR_WALLET_ERROR = 'Failed to clear wallet securely';

export type TransactionRecord = PaymentRecord;

interface WalletState {
  publicKey: string | null;
  balance: string;
  transactions: TransactionRecord[];
  isLoading: boolean;
  isFunding: boolean;
  fundError: string | null;
  error: string | null;
  
  // Actions
  setWallet: (publicKey: string, secretKey: string) => Promise<boolean>;
  loadWalletFromStorage: () => Promise<boolean>;
  refreshWalletData: () => Promise<void>;
  clearWallet: () => Promise<boolean>;
  getSecretKey: () => Promise<string | null>;
  fundWallet: () => Promise<void>;
}

const resetWalletState = () => ({
  publicKey: null,
  balance: DEFAULT_BALANCE,
  transactions: [],
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

const clearStoredWalletValue = async () => {
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
  isLoading: false,
  isFunding: false,
  fundError: null,
  error: null,

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
    try {
      const storedValue = await SecureStore.getItemAsync(WALLET_KEY);
      if (storedValue === null) {
        set({ ...resetWalletState(), error: null });
        return false;
      }

      const secretKey = parseStoredSecret(storedValue);
      if (!secretKey) {
        await clearStoredWalletValue();
        set({ ...resetWalletState(), error: RESTORE_WALLET_ERROR });
        return false;
      }

      const keypair = StellarSdk.Keypair.fromSecret(secretKey);
      set({ publicKey: keypair.publicKey(), error: null });
      return true;
    } catch {
      console.error(RESTORE_WALLET_ERROR);
      await clearStoredWalletValue();
      set({ ...resetWalletState(), error: RESTORE_WALLET_ERROR });
      return false;
    }
  },

  refreshWalletData: async () => {
    const { publicKey } = get();
    if (!publicKey) return;

    set({ isLoading: true, error: null });
    try {
      const [balance, txs] = await Promise.all([
        fetchXlmBalance(publicKey),
        fetchRecentTransactions(publicKey),
      ]);
      set({ balance, transactions: txs, isLoading: false });
    } catch (err: any) {
      console.error('Failed to refresh wallet data');
      set({ isLoading: false, error: err.message || 'Failed to sync data' });
    }
  },

  clearWallet: async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_KEY);
      set({ ...resetWalletState(), error: null });
      return true;
    } catch {
      console.error(CLEAR_WALLET_ERROR);
      set({ error: CLEAR_WALLET_ERROR });
      return false;
    }
  },

  getSecretKey: async () => {
    try {
      return await SecureStore.getItemAsync(WALLET_KEY);
    } catch {
      console.error('Failed to read wallet securely');
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

