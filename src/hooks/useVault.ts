import { useVaultStore, Lock } from '../store/vaultStore';

export type { Lock };

export function useVault() {
  const {
    balance,
    locks,
    lockedBalance,
    unlockTime,
    isConfigured,
    contractId,
    isLoadingBalance,
    isLoadingLocks,
    isSubmitting,
    balanceError,
    loadBalance,
    loadLocks,
    addLock,
    unlockLock,
    loadLockedState,
    lockFunds,
    deposit,
    withdraw,
  } = useVaultStore();

  const findLock = (id: string) => locks.find(lock => lock.id === id);

  return {
    balance,
    locks,
    lockedBalance,
    unlockTime,
    isConfigured,
    contractId,
    isLoadingBalance,
    isLoadingLocks,
    isSubmitting,
    balanceError,
    loadBalance,
    loadLocks,
    addLock,
    unlockLock,
    loadLockedState,
    lockFunds,
    deposit,
    withdraw,
    findLock,
  };
}
