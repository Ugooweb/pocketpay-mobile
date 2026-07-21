import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { VaultConfirmModal, VaultAction } from '../../src/components/VaultConfirmModal';
import { VaultIntroModal } from '../../src/components/VaultIntroModal';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useWalletStore } from '../../src/store/walletStore';
import { useVaultStore } from '../../src/store/vaultStore';
import { validateAmount } from '../../src/utils/validation';
import { PiggyBank, ShieldCheck, AlertTriangle, XCircle, Info } from 'lucide-react-native';

const LOCK_PERIOD_SECONDS = 30 * 24 * 60 * 60; // 30 days
const VAULT_INTRO_SEEN_KEY = '@pocketpay_vault_intro_seen';

export default function VaultScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { publicKey, getSecretKey, balance: walletBalance } = useWalletStore();
  const {
    balance,
    isConfigured,
    contractId,
    isLoadingBalance,
    isSubmitting,
    balanceError,
    loadBalance,
    deposit,
    withdraw,
  } = useVaultStore();

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | undefined>();
  const [isLoadingActivity] = useState(false);

  // Vault unavailable state
  const isMissingContractId = !isConfigured;
  const isMissingRpcUrl = !process.env.EXPO_PUBLIC_SOROBAN_RPC_URL;
  const isVaultUnavailable = isMissingContractId || isMissingRpcUrl;

  // Confirmation modal state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<VaultAction>('deposit');
  const [pendingUnlockTime, setPendingUnlockTime] = useState('');

  // Vault introduction modal state
  const [introVisible, setIntroVisible] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadBalance(publicKey);
    }
  }, [publicKey]);

  useEffect(() => {
    AsyncStorage.getItem(VAULT_INTRO_SEEN_KEY)
      .then((seen) => {
        if (!seen) setIntroVisible(true);
      })
      .catch(() => setIntroVisible(true));
  }, []);

  const dismissIntro = () => {
    setIntroVisible(false);
    AsyncStorage.setItem(VAULT_INTRO_SEEN_KEY, 'true').catch((e) =>
      console.error('Failed to save vault intro state:', e)
    );
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setAmountError(value.trim() ? validateAmount(value) ?? undefined : undefined);
  };

  const handleAction = (action: VaultAction) => {
    if (!publicKey) return;

    // Deposits are limited by the wallet balance; withdrawals by the vault balance.
    const error =
      validateAmount(amount, action === 'deposit' ? walletBalance : undefined) ??
      (action === 'withdraw' && Number(amount) > Number(balance)
        ? "You don't have enough XLM in the vault for this withdrawal."
        : undefined);
    setAmountError(error);
    if (error) return;

    setPendingAction(action);
    if (action === 'lock') {
      const unlockDate = new Date(Date.now() + LOCK_PERIOD_SECONDS * 1000);
      setPendingUnlockTime(unlockDate.toLocaleDateString());
    }
    setConfirmVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!publicKey || !pendingAction) return;

    try {
      const secret = await getSecretKey();
      if (!secret) throw new Error('Secret key not found');

      if (pendingAction === 'lock') {
        setConfirmVisible(false);
        Alert.alert(
          'Notice',
          'Vault lock is not yet implemented. This is a placeholder for Soroban time-lock functionality.'
        );
        return;
      }

      const hash =
        pendingAction === 'deposit'
          ? await deposit(secret, publicKey, amount)
          : await withdraw(secret, publicKey, amount);

      setAmount('');
      setAmountError(undefined);
      setConfirmVisible(false);
      const verb = pendingAction === 'deposit' ? 'deposited into' : 'withdrawn from';
      Alert.alert(
        'Success',
        hash
          ? `Funds ${verb} the Soroban vault.\n\nTransaction: ${hash.slice(0, 8)}…${hash.slice(-8)}`
          : `Funds ${verb} the vault (mock — no real funds moved).`
      );
    } catch (e: any) {
      setConfirmVisible(false);
      Alert.alert(
        `${pendingAction === 'deposit' ? 'Deposit' : 'Withdrawal'} failed`,
        e.message
      );
    }
  };

  const cancelAction = () => {
    setConfirmVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <VaultIntroModal visible={introVisible} onContinue={dismissIntro} />
      <VaultConfirmModal
        visible={confirmVisible}
        actionType={pendingAction}
        amount={amount}
        isLoading={isSubmitting}
        contractId={isConfigured ? contractId : undefined}
        unlockTime={pendingAction === 'lock' ? pendingUnlockTime : undefined}
        onConfirm={handleConfirmAction}
        onCancel={cancelAction}
      />
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setIntroVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Info color={colors.textMuted} size={18} />
        </TouchableOpacity>
        <View style={styles.iconContainer}>
          <PiggyBank color={colors.primary} size={40} />
        </View>
        <Text style={styles.cardTitle}>Soroban Savings Vault</Text>
        {isLoadingBalance ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.balanceLoader} />
        ) : (
          <Text style={styles.balanceValue}>{balance} XLM</Text>
        )}
        <Text style={styles.cardSubtitle}>
          {isConfigured
            ? `Contract ${contractId.slice(0, 4)}…${contractId.slice(-4)}`
            : 'Mock balance'}
        </Text>
        {balanceError && (
          <View style={styles.balanceErrorBox}>
            <Text style={styles.balanceErrorText}>{balanceError}</Text>
            <TouchableOpacity onPress={() => publicKey && loadBalance(publicKey)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isConfigured ? (
        <View style={styles.infoBox}>
          <ShieldCheck color={colors.success} size={24} style={{ marginRight: SIZES.sm }} />
          <Text style={styles.infoText}>
            Connected to a live Soroban smart contract on{' '}
            {process.env.EXPO_PUBLIC_STELLAR_NETWORK || 'TESTNET'}. Deposits and withdrawals
            submit real transactions.
          </Text>
        </View>
      ) : (
        <View style={styles.warningBox}>
          <AlertTriangle color={colors.warning} size={24} style={{ marginRight: SIZES.sm }} />
          <Text style={styles.warningText}>
            No vault contract configured. Set EXPO_PUBLIC_VAULT_CONTRACT_ID in your .env file to
            connect to a deployed Soroban contract. Running in mock mode — no real funds are
            moved.
          </Text>
        </View>
      )}

      {isVaultUnavailable ? (
        <View style={styles.unavailableCard}>
          <XCircle color={colors.error} size={48} />
          <Text style={styles.unavailableTitle}>Vault Unavailable</Text>
          <Text style={styles.unavailableText}>
            The Soroban Savings Vault cannot be used right now because the required configuration is
            missing.
          </Text>
          {isMissingContractId && (
            <View style={styles.unavailableDetail}>
              <Text style={styles.unavailableDetailLabel}>Missing configuration:</Text>
              <Text style={styles.unavailableDetailValue}>EXPO_PUBLIC_VAULT_CONTRACT_ID</Text>
              <Text style={styles.unavailableDetailHint}>
                Set this in your .env file to the deployed Soroban contract ID.
              </Text>
            </View>
          )}
          {isMissingRpcUrl && (
            <View style={styles.unavailableDetail}>
              <Text style={styles.unavailableDetailLabel}>Missing configuration:</Text>
              <Text style={styles.unavailableDetailValue}>EXPO_PUBLIC_SOROBAN_RPC_URL</Text>
              <Text style={styles.unavailableDetailHint}>
                Set this in your .env file to a Soroban RPC endpoint.
              </Text>
            </View>
          )}
          <Text style={styles.unavailableDocsLink}>
            See docs/vault-ui-guidance.md for more information.
          </Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Input
            label="Amount (XLM)"
            placeholder="0.00"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            error={amountError}
            editable={!isSubmitting}
          />
          <View style={styles.actions}>
            <Button
              title="Deposit"
              onPress={() => handleAction('deposit')}
              isLoading={isSubmitting && pendingAction === 'deposit'}
              loadingText="Depositing…"
              disabled={isLoadingBalance}
              style={styles.actionButton}
            />
            <Button
              title="Withdraw"
              variant="secondary"
              onPress={() => handleAction('withdraw')}
              isLoading={isSubmitting && pendingAction === 'withdraw'}
              loadingText="Withdrawing…"
              disabled={isLoadingBalance}
              style={styles.actionButton}
            />
          </View>
          <Button
            title="Lock Funds (30 days)"
            variant="outline"
            onPress={() => handleAction('lock')}
            isLoading={isSubmitting && pendingAction === 'lock'}
            loadingText="Locking…"
            disabled={isSubmitting}
            style={styles.lockButton}
          />
        </View>
      )}
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
  card: {
    backgroundColor: colors.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  infoButton: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: SIZES.sm,
  },
  balanceValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  balanceLoader: {
    marginVertical: SIZES.sm,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  balanceErrorBox: {
    marginTop: SIZES.md,
    alignItems: 'center',
  },
  balanceErrorText: {
    color: colors.error,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  retryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  infoText: {
    color: colors.success,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 196, 0, 0.1)',
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  warningText: {
    color: colors.warning,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  form: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SIZES.xs,
  },
  lockButton: {
    marginTop: SIZES.md,
  },
  unavailableCard: {
    backgroundColor: colors.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    marginBottom: SIZES.xl,
  },
  unavailableTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  unavailableText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.lg,
  },
  unavailableDetail: {
    backgroundColor: 'rgba(255, 61, 0, 0.06)',
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    width: '100%',
    marginBottom: SIZES.sm,
  },
  unavailableDetailLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  unavailableDetailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
    marginBottom: 4,
  },
  unavailableDetailHint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  unavailableDocsLink: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
});
