import { create } from 'zustand';
import { VaultLock } from '../types';

interface VaultState {
  locks: VaultLock[];
  findLock: (id: string) => VaultLock | undefined;
  withdraw: (id: string) => void;
}

const mockLocks: VaultLock[] = [
  {
    id: '1',
    amount: '1000',
    createdAt: new Date().toISOString(),
    unlockedAt: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days from now
    status: 'locked',
  },
  {
    id: '2',
    amount: '500',
    createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days ago
    unlockedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days ago
    status: 'unlocked',
  },
];

export const useVault = create<VaultState>((set, get) => ({
  locks: mockLocks,
  findLock: (id: string) => {
    return get().locks.find(lock => lock.id === id);
  },
  withdraw: (id: string) => {
    set(state => ({
      locks: state.locks.filter(lock => lock.id !== id),
    }));
  },
}));