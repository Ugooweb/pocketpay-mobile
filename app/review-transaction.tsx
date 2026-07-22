import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';
import { useSignerStore } from '../src/store/signerStore';
import { useWalletStore } from '../src/store/walletStore';
import { SIZES, RADIUS, ThemeColors } from '../src/constants/theme';
import { formatAmount } from '../src/utils/amount';
import { resolveAddressLabel } from '../src/utils/contacts';
import { useAppStore } from '../src/store/appStore';
import {
  ArrowRight,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { Button, ScreenHeader } from '@/components';

const getNetworkLabel = (): string => {
  const network = (process.env.EXPO_PUBLIC_STELLAR_NETWORK || 'TESTNET').toUpperCase();
  if (network === 'PUBLIC' || network === 'MAINNET') return 'Public Network';
  if (network === 'TESTNET') return 'Testnet';
  return network;
};

/**
 * Transaction Review Screen
 *
 * Full-screen transaction review before signing. This replaces the modal-based
 * confirmation with a dedicated review surface that:
 * - Shows complete transaction details
 * - Displays the active signer and its security model
 * - Handles all handoff phases (review -> handoff -> signing -> submitting)
 * - Provides cancellation at any point before submission
 * - Handles failure and success states inline
 */
export default function ReviewTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destination?: string;
    amount?: string;
    memo?: string;
  }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { publicKey, getSecretKey, refreshWalletData } = useWalletStore();
  const contacts = useAppStore((state) => state.contacts);
  const store = useSignerStore();
  const { phase, error } = store;

  const destination = params.destination || '';
  const amount = params.amount || '';
  const memo = params.memo || '';

  const destinationContact =
    destination.trim() ? resolveAddressLabel(destination.trim(), contacts) : null;

  // Start the review when the screen mounts
  useEffect(() => {
    if (!destination || !amount || !publicKey) {
      router.back();
      return;
    }
  }, [destination, amount, publicKey]);

  // Handle success - navigate away
  useEffect(() => {
    if (phase === 'completed' && store.lastResult) {
      refreshWalletData();
      const timer = setTimeout(() => {
        store.reset();
        router.replace({
          pathname: '/payment-success',
          params: {
            hash: store.lastResult!.hash,
            amount: amount.trim(),
            destination: destination.trim(),
          },
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, store.lastResult]);

  const handleConfirmSign = async () => {
    const { sendXlmTransaction } = await import('../src/services/stellar');
    const secretKey = await getSecretKey();
    if (!secretKey) {
      store.failSigning({
        type: 'signer_unavailable',
        message: 'Secret key not available.',
      });
      return;
    }

    store.startReview({
      requestId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      sourcePublicKey: publicKey!,
      destinationPublicKey: destination.trim(),
      destinationLabel: destinationContact?.isContact ? destinationContact.label : null,
      amount: amount.trim(),
      assetCode: 'XLM',
      memo: memo.trim() || undefined,
      network: getNetworkLabel(),
      createdAt: new Date().toISOString(),
      timeoutSeconds: 30,
    });

    store.enterHandoff();
    store.enterSigning();

    try {
      const result = await sendXlmTransaction(
        secretKey,
        destination.trim(),
        amount.trim(),
        memo.trim() || undefined,
      );
      store.enterSubmitting();

      const signingResult = {
        hash: result.hash,
        review: store.currentReview!,
        signerType: 'local' as const,
        completedAt: new Date().toISOString(),
      };
      store.completeSigning(signingResult);
    } catch (err: any) {
      const message = err?.message || 'Transaction failed.';
      store.failSigning({
        type: /cancel|abort/i.test(message) ? 'user_cancelled' : 'unknown',
        message,
        raw: err,
      });
    }
  };

  const handleCancel = () => {
    store.cancelSigning();
    setTimeout(() => {
      store.reset();
      router.back();
    }, 300);
  };

  const handleRetry = () => {
    store.reset();
  };

  const handleDismissError = () => {
    store.reset();
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader title="Review Transaction" subtitle="Verify details before signing" />

      {/* Transaction Details Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>From</Text>
          <Text
            style={[styles.rowValue, { color: colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {publicKey}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>To</Text>
          <View style={styles.rowValueGroup}>
            {destinationContact?.isContact ? (
              <Text style={[styles.contactLabel, { color: colors.primary }]}>
                {destinationContact.label}
              </Text>
            ) : null}
            <Text
              style={[
                destinationContact?.isContact
                  ? styles.rowValueSecondary
                  : styles.rowValue,
                { color: destinationContact?.isContact ? colors.textMuted : colors.textPrimary },
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {destination.trim()}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Amount</Text>
          <Text style={[styles.rowValueEmphasis, { color: colors.primary }]}>
            {formatAmount(amount.trim())} XLM
          </Text>
        </View>
        {memo.trim() ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Memo</Text>
              <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{memo.trim()}</Text>
            </View>
          </>
        ) : null}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Network</Text>
          <Text style={[styles.rowValue, { color: colors.textPrimary }]}>{getNetworkLabel()}</Text>
        </View>
      </View>

      {/* Signer Info Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.signerHeader}>
          <Smartphone size={18} color={colors.primary} />
          <Text style={[styles.signerTitle, { color: colors.textPrimary }]}>Signing With</Text>
        </View>
        <View style={styles.signerInfo}>
          <Text style={[styles.signerLabel, { color: colors.primary }]}>This Device</Text>
          <Text style={[styles.signerDescription, { color: colors.textMuted }]}>
            Signed securely on this device using the stored key. Your secret key never
            leaves the device and is not exposed to the network.
          </Text>
        </View>
      </View>

      {/* Phase Indicator */}
      {(phase === 'handoff' || phase === 'signing' || phase === 'submitting') && (
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <View style={styles.statusTextGroup}>
            <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
              {phase === 'handoff' && 'Preparing Transaction...'}
              {phase === 'signing' && 'Signing...'}
              {phase === 'submitting' && 'Submitting to Network...'}
            </Text>
            <Text style={[styles.statusSubtitle, { color: colors.textMuted }]}>
              {phase === 'handoff' && 'Building the transaction for review.'}
              {phase === 'signing' && 'Your device is signing the transaction securely.'}
              {phase === 'submitting' && 'Transaction signed. Waiting for network confirmation.'}
            </Text>
          </View>
        </View>
      )}

      {/* Success State */}
      {phase === 'completed' && store.lastResult && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.success }]}>
          <CheckCircle size={24} color={colors.success} />
          <View style={styles.statusTextGroup}>
            <Text style={[styles.statusTitle, { color: colors.success }]}>Transaction Submitted</Text>
            <Text style={[styles.hashText, { color: colors.textSecondary }]} numberOfLines={1}>
              Hash: {store.lastResult.hash}
            </Text>
          </View>
        </View>
      )}

      {/* Failure State */}
      {phase === 'failed' && error && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.error }]}>
          <XCircle size={24} color={colors.error} />
          <View style={styles.statusTextGroup}>
            <Text style={[styles.statusTitle, { color: colors.error }]}>Transaction Failed</Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error.message}</Text>
          </View>
          <Button
            title="Dismiss"
            variant="secondary"
            onPress={handleDismissError}
            style={styles.retryButton}
          />
        </View>
      )}

      {/* Cancelled State */}
      {phase === 'cancelled' && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.warning }]}>
          <AlertTriangle size={24} color={colors.warning} />
          <View style={styles.statusTextGroup}>
            <Text style={[styles.statusTitle, { color: colors.warning }]}>Cancelled</Text>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              Signing was cancelled. No transaction was submitted.
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      {phase === 'review' && (
        <View style={styles.actions}>
          <Button
            title="Sign & Send"
            onPress={handleConfirmSign}
            style={styles.signButton}
          />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={handleCancel}
          />
        </View>
      )}

      {(phase === 'failed' || phase === 'cancelled') && (
        <View style={styles.actions}>
          <Button
            title="Go Back"
            variant="secondary"
            onPress={handleDismissError}
          />
        </View>
      )}

      {/* Security Notice */}
      <View style={[styles.securityNotice, { backgroundColor: 'rgba(0, 229, 255, 0.08)' }]}>
        <ArrowRight size={14} color={colors.primary} style={{ marginRight: SIZES.sm }} />
        <Text style={[styles.securityText, { color: colors.textMuted }]}>
          Your secret key is stored securely on this device and is never sent over the network.
          Signing happens locally using device-backed encryption.
        </Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: SIZES.xl,
      paddingBottom: SIZES.xxl,
    },
    card: {
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      padding: SIZES.md,
      marginBottom: SIZES.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: SIZES.sm,
    },
    rowLabel: {
      fontSize: 12,
      fontWeight: '500',
      width: 80,
    },
    rowValueGroup: {
      flex: 1,
      alignItems: 'flex-end',
    },
    rowValue: {
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'right',
      flexShrink: 1,
    },
    rowValueSecondary: {
      fontSize: 11,
      textAlign: 'right',
      marginTop: 2,
    },
    rowValueEmphasis: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    contactLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    divider: {
      height: 1,
    },
    signerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SIZES.sm,
      marginBottom: SIZES.sm,
    },
    signerTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    signerInfo: {
      gap: SIZES.xs,
    },
    signerLabel: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    signerDescription: {
      fontSize: 12,
      lineHeight: 18,
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      padding: SIZES.md,
      marginBottom: SIZES.md,
      gap: SIZES.md,
    },
    resultCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      padding: SIZES.md,
      marginBottom: SIZES.md,
      gap: SIZES.sm,
      flexWrap: 'wrap',
    },
    statusTextGroup: {
      flex: 1,
      gap: 2,
    },
    statusTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    statusSubtitle: {
      fontSize: 12,
      lineHeight: 18,
    },
    hashText: {
      fontSize: 11,
      fontFamily: 'monospace',
    },
    errorText: {
      fontSize: 12,
      lineHeight: 18,
    },
    actions: {
      gap: SIZES.sm,
      marginBottom: SIZES.md,
    },
    signButton: {
      marginBottom: SIZES.xs,
    },
    retryButton: {
      marginTop: SIZES.sm,
      alignSelf: 'flex-start',
    },
    securityNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: RADIUS.sm,
      padding: SIZES.sm,
      marginTop: SIZES.sm,
    },
    securityText: {
      fontSize: 11,
      lineHeight: 16,
      flex: 1,
    },
  });
