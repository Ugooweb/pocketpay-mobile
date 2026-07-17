import '../shim'; // MUST BE FIRST (See docs/polyfills.md for details)
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useWalletStore } from '../src/store/walletStore';
import { useAppStore } from '../src/store/appStore';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const { loadWalletFromStorage, publicKey } = useWalletStore();
  const { initializeApp, isInitialized } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializeApp();
    loadWalletFromStorage();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (publicKey && inAuthGroup) {
      // User is signed in and trying to access auth screens, redirect to main
      router.replace('/(tabs)');
    } else if (!publicKey && !inAuthGroup && segments[0] !== '(tabs)' && segments[0] !== 'send' && segments[0] !== 'receive') {
      // User is NOT signed in and trying to access main screens, redirect to auth
      router.replace('/(auth)');
    }
  }, [publicKey, isInitialized, segments]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}
