import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useVault } from '../../src/hooks/useVault';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { Lock } from '../../src/store/vaultStore';
import { VaultLockDetail } from '../../src/components/VaultLockDetail';

export default function VaultLockDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { locks, isLoadingLocks, findLock } = useVault();

  const lock: Lock | undefined = findLock(typeof id === 'string' ? id : '');
  const isLoading = isLoadingLocks;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lock details...</Text>
      </View>
    );
  }

  if (!lock) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Stack.Screen options={{ title: 'Lock Not Found' }} />
        <Text style={styles.errorText}>Vault lock with ID "{id}" not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Vault Lock Details' }} />
      <VaultLockDetail lock={lock} />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SIZES.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: SIZES.md,
  },
  errorText: {
    color: colors.error,
    marginTop: SIZES.md,
    fontSize: 16,
  },
});