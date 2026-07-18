import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWalletStore, TransactionRecord } from '../../src/store/walletStore';
import { COLORS, SIZES } from '../../src/constants/theme';
import { TransactionListItem } from '../../src/components/TransactionListItem';
import { NetworkStatusBanner } from '../../src/components/NetworkStatusBanner';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * Footer rendered below the list while loading more items or when the
 * end-of-list has been reached.
 */
const ListFooter: React.FC<{
  isLoadingMore: boolean;
  hasMoreTransactions: boolean;
  hasTransactions: boolean;
}> = ({ isLoadingMore, hasMoreTransactions, hasTransactions }) => {
  if (!hasTransactions) return null;

  if (isLoadingMore) {
    return (
      <View style={styles.footer} testID="loading-more-indicator">
        <ActivityIndicator color={COLORS.primary} size="small" />
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
const EmptyState: React.FC = () => (
  <View style={styles.emptyState} testID="empty-state">
    <Clock color={COLORS.textMuted} size={48} style={{ marginBottom: SIZES.md }} />
    <Text style={styles.emptyText}>No transactions found</Text>
    <Text style={styles.emptySubtext}>Your recent activity will appear here.</Text>
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

  // Load the first page on mount.
  useEffect(() => {
    refreshWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      />
    ),
    [isLoadingMore, hasMoreTransactions, transactions.length]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshWalletData}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
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
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        // Avoid stale closures while also keeping rendering performant.
        extraData={{ isLoadingMore, hasMoreTransactions }}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
    gap: SIZES.sm,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
