import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWalletStore, TransactionRecord } from '../../src/store/walletStore';
import { SIZES, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { TransactionListItem } from '../../src/components/TransactionListItem';
import { NetworkStatusBanner } from '../../src/components/NetworkStatusBanner';
import { EmptyState } from '../../src/components/EmptyState';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { groupTransactionsByDate } from '../../src/utils/transactions';

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Footer rendered below the list while loading more items or when the
 * end-of-list has been reached.
 */
const ListFooter: React.FC<{
  isLoadingMore: boolean;
  hasMoreTransactions: boolean;
  hasTransactions: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}> = ({ isLoadingMore, hasMoreTransactions, hasTransactions, colors, styles }) => {
  if (!hasTransactions) return null;

  if (isLoadingMore) {
    return (
      <View style={styles.footer} testID="loading-more-indicator">
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={styles.footerText}>Loading older transactions…</Text>
      </View>
    );
  }

  if (!hasMoreTransactions) {
    return (
      <View style={styles.footer} testID="end-of-list-indicator">
        <Text style={styles.footerText}>You've reached the beginning of your history.</Text>
      </View>
    );
  }

  return null;
};

/**
 * Shown when there are no transactions and the screen is not loading.
 */
const ActivityEmptyState: React.FC<{
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
  onReceivePress: () => void;
}> = ({ colors, styles, onReceivePress }) => (
  <View style={styles.emptyState} testID="empty-state">
    <EmptyState
      icon={<Clock color={colors.textMuted} size={48} />}
      title="No activity yet"
      message="Your payments and transfers will appear here once you send or receive XLM."
      action={{
        label: 'Receive XLM',
        onPress: onReceivePress,
        variant: 'outline',
      }}
    />
  </View>
);

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const router = useRouter();
  const {
    transactions,
    isLoading,
    isLoadingMore,
    hasMoreTransactions,
    publicKey,
    error,
    refreshWalletData,
    loadMoreTransactions,
  } = useWalletStore();

  const { networkErrorType, message } = useNetworkStatus(error);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Load the first page on mount.
  useEffect(() => {
    refreshWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions]
  );

  const renderItem = useCallback(
    ({ item }: { item: TransactionRecord }) => (
      <TransactionListItem
        transaction={item}
        currentPublicKey={publicKey}
        variant="card"
        onPress={(tx) => router.push(`/transaction/${tx.id}`)}
      />
    ),
    [publicKey, router]
  );

  const keyExtractor = useCallback((item: TransactionRecord) => item.id, []);

  const renderSectionHeader = useCallback(
    ({ section: { title } }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    ),
    [styles]
  );

  /**
   * Triggered when the FlatList scrolls close to the end.
   * Only fires when there are more pages and we are not already fetching.
   */
  const handleEndReached = useCallback(() => {
    if (hasMoreTransactions && !isLoadingMore) {
      loadMoreTransactions();
    }
  }, [hasMoreTransactions, isLoadingMore, loadMoreTransactions]);

  const renderFooter = useCallback(
    () => (
      <ListFooter
        isLoadingMore={isLoadingMore}
        hasMoreTransactions={hasMoreTransactions}
        hasTransactions={transactions.length > 0}
        colors={colors}
        styles={styles}
      />
    ),
    [isLoadingMore, hasMoreTransactions, transactions.length, colors, styles]
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedTransactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWalletData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        // Trigger load-more when 20 % of the list remains below the viewport.
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.2}
        ListHeaderComponent={
          <NetworkStatusBanner
            networkErrorType={networkErrorType}
            message={message}
            onRetry={refreshWalletData}
            isRetrying={isLoading}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading ? (
            <ActivityEmptyState
              colors={colors}
              styles={styles}
              onReceivePress={() => router.push('/receive')}
            />
          ) : null
        }
        // Avoid stale closures while also keeping rendering performant.
        extraData={{ isLoadingMore, hasMoreTransactions, colors, styles }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  /** When there are no items the FlatList should fill the screen so the
   *  empty state is centred vertically. */
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    padding: SIZES.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.xxl * 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
    gap: SIZES.sm,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sectionHeader: {
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.xs,
    marginBottom: SIZES.xs,
  },
  sectionHeaderText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
