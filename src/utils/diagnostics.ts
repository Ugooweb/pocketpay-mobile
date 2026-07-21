import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAppStore } from '../store/appStore';
import { useWalletStore } from '../store/walletStore';

export const getDiagnostics = () => {
  const appState = useAppStore.getState();
  const walletState = useWalletStore.getState();

  // Redact sensitive data
  const redactedDiagnostics = {
    environment: {
      platform: Platform.OS,
      osVersion: Platform.Version,
      appVersion: Constants.expoConfig?.version ?? 'unknown',
      isDevelopment: __DEV__,
    },
    appState: {
      isInitialized: appState.isInitialized,
      isDarkMode: appState.isDarkMode,
      contactsCount: appState.contacts.length,
    },
    walletState: {
      hasPublicKey: !!walletState.publicKey,
      isBalanceLoaded: walletState.balance !== '0.0000000',
      transactionsCount: walletState.transactions.length,
      isLoading: walletState.isLoading,
      lastError: walletState.error,
    },
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(redactedDiagnostics, null, 2);
};
