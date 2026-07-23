import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isVaultConfigured,
  getVaultContractId,
  getVaultBalance,
  depositToVault,
  withdrawFromVault,
} from '../services/vault';
import {
  mockFetchVaultBalance,
  mockDepositToVault,
  mockWithdrawFromVault,
} from '../services/stellar';

const LOCKS_KEY = '@pocketpay_vault_locks';

export interface Lock {
  id: string;
  amount: string;
  unlockDate: string;
  status: 'locked' | 'matured';
  createdAt: string;
}

interface VaultState {
  balance: string;
  locks: Lock[];
  isConfigured: boolean;
  contractId: string;
  isLoadingBalance: boolean;
  isLoadingLocks: boolean;
  isSubmitting: boolean;
  balanceError: string | null;

  loadBalance: (publicKey: string) => Promise<void>;
  loadLocks: () => Promise<void>;
  addLock: (amount: string, unlockDate: string) => Promise<void>;
  unlockLock: (lockId: string) => Promise<void>;
  deposit: (secretKey: string, publicKey: string, amount: string) => Promise<string | null>;
  withdraw: (secretKey: string, publicKey: string, amount: string) => Promise<string | null>;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  balance: '0.0000000',
  locks: [],
  isConfigured: isVaultConfigured(),
  contractId: getVaultContractId(),
  isLoadingBalance: false,
  isLoadingLocks: false,
  isSubmitting: false,
  balanceError: null,

  loadBalance: async (publicKey: string) => {
    set({ isLoadingBalance: true, balanceError: null });
    try {
      const balance = get().isConfigured
        ? await getVaultBalance(publicKey)
        : await mockFetchVaultBalance(publicKey);
      set({ balance, isLoadingBalance: false });
    } catch (err: any) {
      set({
        isLoadingBalance: false,
        balanceError: err.message || 'Failed to load vault balance',
      });
    }
  },

  loadLocks: async () => {
    set({ isLoadingLocks: true });
    try {
      const locksJson = await AsyncStorage.getItem(LOCKS_KEY);
      let locks: Lock[] = locksJson ? JSON.parse(locksJson) : [];
      
      // Update lock statuses based on current time
      const now = new Date();
      locks = locks.map(lock => {
        const unlockDate = new Date(lock.unlockDate);
        const status = now >= unlockDate ? 'matured' : 'locked';
        return { ...lock, status };
      });
      
      set({ locks, isLoadingLocks: false });
    } catch (err: any) {
      console.error('Failed to load locks:', err);
      set({ locks: [], isLoadingLocks: false });
    }
  },

  addLock: async (amount: string, unlockDate: string) => {
    set({ isSubmitting: true });
    try {
      const newLock: Lock = {
        id: Date.now().toString(),
        amount,
        unlockDate,
        status: 'locked',
        createdAt: new Date().toISOString(),
      };
      
      const updatedLocks = [...get().locks, newLock];
      await AsyncStorage.setItem(LOCKS_KEY, JSON.stringify(updatedLocks));
      set({ locks: updatedLocks });
    } finally {
      set({ isSubmitting: false });
    }
  },

  unlockLock: async (lockId: string) => {
    set({ isSubmitting: true });
    try {
      const updatedLocks = get().locks.filter(lock => lock.id !== lockId);
      await AsyncStorage.setItem(LOCKS_KEY, JSON.stringify(updatedLocks));
      set({ locks: updatedLocks });
    } finally {
      set({ isSubmitting: false });
    }
  },



  // Returns the transaction hash on-chain, or null in mock mode.
  deposit: async (secretKey: string, publicKey: string, amount: string) => {
    set({ isSubmitting: true });
    try {
      let hash: string | null = null;
      if (get().isConfigured) {
        hash = await depositToVault(secretKey, amount);
      } else {
        await mockDepositToVault(secretKey, amount);
      }
      await get().loadBalance(publicKey);
      return hash;
    } finally {
      set({ isSubmitting: false });
    }
  },

  withdraw: async (secretKey: string, publicKey: string, amount: string) => {
    set({ isSubmitting: true });
    try {
      let hash: string | null = null;
      if (get().isConfigured) {
        hash = await withdrawFromVault(secretKey, amount);
      } else {
        await mockWithdrawFromVault(secretKey, amount);
      }
      await get().loadBalance(publicKey);
      return hash;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
