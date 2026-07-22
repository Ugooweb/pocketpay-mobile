import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { Lock } from '../../src/store/vaultStore';
import { MOCK_VAULT_LOCKS } from '../../tests/fixtures/vaultLocks'; // Using mock data for now
import { VaultLockDetail } from '../../src/components/VaultLockDetail'; // Will create this component next

export default function VaultLockDetailScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // In a real scenario, you would fetch the lock details from your store or API
  // For now, we'll use mock data
  const lock: Lock | undefined = MOCK_VAULT_LOCKS.find(lock => lock.id === id);
  const isLoading = false; // Mock loading state

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