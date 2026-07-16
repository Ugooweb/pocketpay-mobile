import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { mockFetchVaultBalance, mockDepositToVault, mockWithdrawFromVault } from '../../src/services/stellar';
import { validateAmount } from '../../src/utils/validation';
import { PiggyBank, ShieldCheck } from 'lucide-react-native';

export default function VaultScreen() {
  const { publicKey, getSecretKey, balance } = useWalletStore();
  const [vaultBalance, setVaultBalance] = useState('0.0000000');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadVaultBalance();
    }
  }, [publicKey]);

  const loadVaultBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await mockFetchVaultBalance(publicKey);
      setVaultBalance(balance);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setAmountError(value.trim() ? validateAmount(value, balance) ?? undefined : undefined);
  };

  const handleDeposit = async () => {
    const error = validateAmount(amount, balance) ?? undefined;
    setAmountError(error);
    if (error) return;
    try {
      setIsLoading(true);
      const secret = await getSecretKey();
      if (!secret) throw new Error('Secret key not found');
      
      // MOCK CALL TO SOROBAN CONTRACT
      await mockDepositToVault(secret, amount);
      
      Alert.alert('Success', 'Funds deposited into Soroban Vault (Mock)');
      setAmount('');
      setAmountError(undefined);
      loadVaultBalance();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <PiggyBank color={COLORS.primary} size={40} />
        </View>
        <Text style={styles.cardTitle}>Soroban Savings Vault</Text>
        <Text style={styles.balanceValue}>{vaultBalance} XLM</Text>
        <Text style={styles.cardSubtitle}>Earning ~5% APY (Mock)</Text>
      </View>

      <View style={styles.infoBox}>
        <ShieldCheck color={COLORS.success} size={24} style={{ marginRight: SIZES.sm }} />
        <Text style={styles.infoText}>
          This is a placeholder for a Soroban Smart Contract integration. Real funds are not moved.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Amount to Deposit/Withdraw (XLM)"
          placeholder="0.00"
          value={amount}
          onChangeText={handleAmountChange}
          error={amountError}
          keyboardType="decimal-pad"
        />
        <View style={styles.actions}>
          <Button 
            title="Deposit" 
            onPress={handleDeposit} 
            isLoading={isLoading}
            style={styles.actionButton}
          />
          <Button 
            title="Withdraw" 
            variant="secondary"
            onPress={() => Alert.alert('Notice', 'Withdrawal mock action triggered')} 
            disabled={isLoading}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: SIZES.sm,
  },
  balanceValue: {
    color: COLORS.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  cardSubtitle: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '500',
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
    color: COLORS.success,
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
  }
});
