export interface VaultLock {
  id: string;
  amount: string;
  createdAt: string;
  unlockedAt: string;
  status: 'locked' | 'unlocked';
}