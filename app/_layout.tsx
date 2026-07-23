import '../shim'; // MUST BE FIRST (See docs/polyfills.md for details)
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { installGlobalErrorHandlers } from '../src/utils/globalErrorHandler';
import { StatusBar } from 'expo-status-bar';
import { useWalletStore } from '../src/store/walletStore';
import { useAppStore } from '../src/store/appStore';
import { LockScreen } from '../src/components/LockScreen';
import { View, ActivityIndicator, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { Button } from '../src/components/Button';
import { ShieldAlert } from 'lucide-react-native';
import { SIZES, RADIUS } from '../src/constants/theme';

installGlobalErrorHandlers(); // MUST run before anything else can throw

export default function RootLayout() {
  const { loadWalletFromStorage, publicKey, error, clearWallet } = useWalletStore();
  const { initializeApp, isInitialized } = useAppStore();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializeApp();
    loadWalletFromStorage();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    if (error === 'Failed to restore wallet securely') return; // Stay on error screen

    const inAuthGroup = segments[0] === '(auth)';

    if (publicKey && inAuthGroup) {
      // User is signed in and trying to access auth screens, redirect to main
      router.replace('/(tabs)');
    } else if (!publicKey && !inAuthGroup && segments[0] !== '(tabs)' && segments[0] !== 'send' && segments[0] !== 'receive' && segments[0] !== 'review-transaction') {
      // User is NOT signed in and trying to access main screens, redirect to auth
      router.replace('/(auth)');
    }
  }, [publicKey, isInitialized, segments, error]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error === 'Failed to restore wallet securely') {
    const handleRetry = async () => {
      await loadWalletFromStorage();
    };

    const handleReset = () => {
      Alert.alert(
        'Confirm Wallet Reset',
        'This will erase the secure storage database for PocketPay. If you do not have your secret key backed up offline, you will permanently lose access to your wallet and funds. Are you sure you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Wallet',
            style: 'destructive',
            onPress: async () => {
              const cleared = await clearWallet();
              if (!cleared) {
                Alert.alert(
                  'Reset Failed',
                  'PocketPay could not clear secure storage on this device. Please restart the app and try again, or check your device storage permissions.'
                );
              }
            }
          }
        ]
      );
    };

    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <View style={styles.errorContent}>
          <ShieldAlert color={colors.error} size={64} style={{ marginBottom: SIZES.md }} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Secure Storage Inaccessible</Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            PocketPay was unable to retrieve your wallet secret. This can happen due to device restrictions, locked keystore/keychain, or missing permissions.
          </Text>

          <View style={[styles.guidanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.guidanceTitle, { color: colors.textPrimary }]}>Troubleshooting Guidance:</Text>
            <Text style={[styles.guidanceText, { color: colors.textSecondary }]}>
              1. Unlock your phone if it was just restarted.{"\n"}
              2. Ensure device security (PIN, passcode, or biometrics) is active.{"\n"}
              3. Check that the app is permitted to use local authentication.{"\n"}
              4. Try restarting the app.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Retry Access" onPress={handleRetry} style={{ marginBottom: SIZES.sm }} />
          <Button title="Reset & Import Again" variant="secondary" onPress={handleReset} />
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <LockScreen>
        <Slot />
      </LockScreen>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: SIZES.xl,
    justifyContent: 'space-between',
    paddingBottom: SIZES.xxl,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  guidanceCard: {
    width: '100%',
    padding: SIZES.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  guidanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  guidanceText: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
});
