import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Copy, Check, ArrowLeft, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { useWalletStore } from '../../src/store/walletStore';
import { useAppStore } from '../../src/store/appStore';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { resolveAddressLabel } from '../../src/utils/contacts';

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, publicKey } = useWalletStore();
  const contacts = useAppStore((state) => state.contacts);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  interface TransactionDetail {
    id: string;
    from?: string;
    to?: string;
    amount?: string;
    asset?: string;
    createdAt?: string;
    timestamp?: string;
    hash?: string;
    transaction_hash?: string;
  }

  const transaction = transactions.find((tx) => tx.id === id);

  if (!transaction) {
    return (
      <View style={styles.errorContainer} testID="error-container">
        <Text style={styles.errorText}>Transaction not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const tx = transaction as TransactionDetail;

  const isSent = !!publicKey && tx.from === publicKey;
  const directionLabel = isSent ? 'Sent' : 'Received';
  const amountColor = isSent ? COLORS.textPrimary : COLORS.success;
  const formattedAmount = `${isSent ? '-' : '+'}${tx.amount || 'N/A'} ${tx.asset || 'XLM'}`;
  const formattedDate = tx.createdAt 
    ? new Date(tx.createdAt).toLocaleString() 
    : tx.timestamp 
    ? new Date(tx.timestamp).toLocaleString()
    : 'Unknown date';

  const txHash = tx.hash || tx.transaction_hash || '';
  const senderAddress = tx.from || '';
  const recipientAddress = tx.to || '';

  const senderLabel = resolveAddressLabel(senderAddress, contacts);
  const recipientLabel = resolveAddressLabel(recipientAddress, contacts);

  const handleCopy = async (text: string, fieldName: string) => {
    if (!text) return;
    try {
      await Clipboard.setStringAsync(text);
      setCopiedField(fieldName);
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error: any) {
      console.error('Clipboard copy failed:', error);
      Alert.alert('Copy Failed', 'Failed to copy to clipboard. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Transaction Details',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.textPrimary,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={COLORS.textPrimary} size={24} />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.heroSection}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: isSent ? 'rgba(255, 61, 0, 0.1)' : 'rgba(0, 230, 118, 0.1)' },
          ]}
        >
          {isSent ? (
            <ArrowUpRight color={COLORS.error} size={32} />
          ) : (
            <ArrowDownLeft color={COLORS.success} size={32} />
          )}
        </View>
        <Text style={[styles.amountText, { color: amountColor }]} testID="detail-amount">
          {formattedAmount}
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      <View style={styles.detailsCard}>
        {/* Type / Direction */}
        <View style={styles.detailRow}>
          <Text style={styles.rowLabel}>Type</Text>
          <Text style={styles.rowValue}>{directionLabel} XLM</Text>
        </View>

        {/* Transaction Hash */}
        {txHash ? (
          <View style={styles.detailRow}>
            <View style={styles.labelWithAction}>
              <Text style={styles.rowLabel}>Transaction Hash</Text>
              <TouchableOpacity 
                onPress={() => handleCopy(txHash, 'hash')} 
                style={styles.copyBtn}
                testID="copy-hash-btn"
              >
                {copiedField === 'hash' ? (
                  <View style={styles.copiedFeedback}>
                    <Check color={COLORS.success} size={16} />
                    <Text style={styles.copiedText}>Copied</Text>
                  </View>
                ) : (
                  <Copy color={COLORS.primary} size={16} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText} selectable numberOfLines={2}>
              {txHash}
            </Text>
          </View>
        ) : null}

        {/* Sender Address */}
        {senderAddress ? (
          <View style={styles.detailRow}>
            <View style={styles.labelWithAction}>
              <Text style={styles.rowLabel}>
                Sender (From){senderLabel.isContact ? ` · ${senderLabel.label}` : ''}
              </Text>
              <TouchableOpacity 
                onPress={() => handleCopy(senderAddress, 'sender')} 
                style={styles.copyBtn}
                testID="copy-sender-btn"
              >
                {copiedField === 'sender' ? (
                  <View style={styles.copiedFeedback}>
                    <Check color={COLORS.success} size={16} />
                    <Text style={styles.copiedText}>Copied</Text>
                  </View>
                ) : (
                  <Copy color={COLORS.primary} size={16} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText} selectable numberOfLines={2}>
              {senderAddress}
            </Text>
          </View>
        ) : null}

        {/* Recipient Address */}
        {recipientAddress ? (
          <View style={styles.detailRow}>
            <View style={styles.labelWithAction}>
              <Text style={styles.rowLabel}>
                Recipient (To){recipientLabel.isContact ? ` · ${recipientLabel.label}` : ''}
              </Text>
              <TouchableOpacity 
                onPress={() => handleCopy(recipientAddress, 'recipient')} 
                style={styles.copyBtn}
                testID="copy-recipient-btn"
              >
                {copiedField === 'recipient' ? (
                  <View style={styles.copiedFeedback}>
                    <Check color={COLORS.success} size={16} />
                    <Text style={styles.copiedText}>Copied</Text>
                  </View>
                ) : (
                  <Copy color={COLORS.primary} size={16} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.addressText} selectable numberOfLines={2}>
              {recipientAddress}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  backButton: {
    marginRight: SIZES.md,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: SIZES.xl,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailRow: {
    marginBottom: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SIZES.md,
  },
  rowLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  labelWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  rowValue: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: SIZES.xs,
  },
  addressText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
    marginTop: SIZES.xs,
  },
  copyBtn: {
    padding: SIZES.xs,
  },
  copiedFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copiedText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '500',
  },
});