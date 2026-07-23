import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../../src/store/walletStore';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/Button';
import { FundButton } from '../../src/components/FundButton';
import { TransactionListItem } from '../../src/components/TransactionListItem';
import { NetworkStatusBanner } from '../../src/components/NetworkStatusBanner';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { Clock, RefreshCw } from 'lucide-react-native';
import { formatAmount } from '../../src/utils/amount';
import { BackupReminderModal } from '../../src/components/BackupReminderModal';

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    publicKey,
    balance,
    transactions,
    lastRefreshed,
    isLoading,
    isFunding,
    fundError,
    error,
    refreshWalletData,
    fundWallet,
    showBackupReminder,
    acknowledgeBackupReminder,
  } = useWalletStore();

  const { networkErrorType, message } = useNetworkStatus(error);

  useEffect(() => {
    refreshWalletData();
  }, []);

  const isFunded = balance !== '0.0000000';
  const recentTransactions = transactions.slice(0, 3); // Preview

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWalletData}
            tintColor={colors.primary}
          />
        }
      >
        <NetworkStatusBanner
          networkErrorType={networkErrorType}
          message={message}
          onRetry={refreshWalletData}
          isRetrying={isLoading}
        />

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance (Testnet)</Text>
          <Text style={styles.balanceValue}>{formatAmount(balance)} XLM</Text>
          <Text style={styles.publicKey} numberOfLines={1} ellipsizeMode="middle">
            {publicKey}
          </Text>
          {lastRefreshed !== null && (
            <View style={styles.lastRefreshed}>
              <RefreshCw color={colors.textMuted} size={12} />
              <Text style={styles.lastRefreshedText}>
                Updated {formatRelativeTime(lastRefreshed)}
              </Text>
            </View>
          )}
        </View>

        <FundButton
          isFunding={isFunding}
          fundError={fundError}
          onFund={fundWallet}
          isFunded={isFunded}
        />

        <View style={styles.actionsContainer}>
          <Button
            title="Send"
            onPress={() => router.push('/send')}
            style={styles.actionButton}
          />
          <Button
            title="Receive"
            variant="secondary"
            onPress={() => router.push('/receive')}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text
            style={styles.seeAll}
            onPress={() => router.push('/(tabs)/history')}
          >
            See All
          </Text>
        </View>

        <View style={styles.transactionsList}>
          {recentTransactions.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Clock color={colors.textMuted} size={48} style={{ marginBottom: SIZES.md }} />
              <Text style={styles.emptyText}>No recent transactions</Text>
            </View>
          )}
          {recentTransactions.map((tx, index) => (
            <TransactionListItem
              key={tx.id || index}
              transaction={tx}
              currentPublicKey={publicKey}
              variant="inline"
              onPress={() => router.push(`/transaction/${tx.id}`)}
            />
          ))}
        </View>
      </ScrollView>
      <BackupReminderModal
        visible={showBackupReminder}
        onAcknowledge={() => acknowledgeBackupReminder()}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: SIZES.lg,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: SIZES.xs,
  },
  balanceValue: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: SIZES.sm,
  },
  publicKey: {
    color: colors.textMuted,
    fontSize: 12,
    backgroundColor: colors.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: RADIUS.round,
  },
  lastRefreshed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.sm,
  },
  lastRefreshedText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xxl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SIZES.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.md,
    marginBottom: SIZES.xxl,
  },
  emptyState: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
