import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SIZES, RADIUS, ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { useVaultStore, Lock } from '../store/vaultStore';
import { useRouter } from 'expo-router';
import { Calendar, Clock, DollarSign, Lock as LockIcon, Unlock, Info, Timer, HelpCircle } from 'lucide-react-native';
import { formatTimeRemaining, getEligibilityText } from '../utils/lockTime';

interface VaultLockDetailProps {
  lock: Lock;
}

export const VaultLockDetail: React.FC<VaultLockDetailProps> = ({ lock }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const unlockLock = useVaultStore((state) => state.unlockLock);
  
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isMatured = lock.status === 'matured';
  const unlockDate = new Date(lock.unlockDate);
  const createdAt = new Date(lock.createdAt);
  const countdown = formatTimeRemaining(lock.unlockDate);
  const eligibility = getEligibilityText(lock.unlockDate, lock.status);

  const handleWithdraw = () => {
    setIsConfirmVisible(true);
  };

  const performWithdrawal = async () => {
    setIsWithdrawing(true);
    try {
      // TODO: Replace setTimeout with SDK withdrawal method once integrated.
      // e.g. await useVaultStore().withdraw(secretKey, publicKey, lock.amount);
      await new Promise(res => setTimeout(res, 1500));
      
      Alert.alert('Success', `Successfully withdrawn ${lock.amount} XLM to your wallet.`, [
        { 
          text: 'OK', 
          onPress: () => {
            setIsConfirmVisible(false);
            router.back();
            // Call unlockLock slightly later to avoid rendering "Lock Not Found" mid-transition
            setTimeout(() => unlockLock(lock.id), 300);
          } 
        }
      ]);
    } catch (error) {
      Alert.alert('Withdrawal Failed', 'Could not process the withdrawal. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, {
            backgroundColor: isMatured
              ? 'rgba(0, 230, 118, 0.12)'
              : 'rgba(123, 97, 255, 0.12)',
          }]}>
            {isMatured ? (
              <Unlock color={colors.success} size={28} />
            ) : (
              <LockIcon color={colors.secondary} size={28} />
            )}
          </View>
          <View style={styles.headerTextContent}>
            <Text style={styles.amount}>{lock.amount} XLM</Text>
            <View style={[styles.statusBadge, {
              backgroundColor: isMatured
                ? 'rgba(0, 230, 118, 0.12)'
                : 'rgba(123, 97, 255, 0.12)',
            }]}>
              <Text style={[styles.statusText, {
                color: isMatured
                  ? colors.success
                  : colors.secondary,
              }]}>
                {isMatured ? 'Ready to withdraw' : 'Locked'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Calendar color={colors.textMuted} size={18} style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Locked on:</Text>
          <Text style={styles.detailValue}>{createdAt.toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Clock color={colors.textMuted} size={18} style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Available from:</Text>
          <Text style={styles.detailValue}>{unlockDate.toLocaleDateString()}</Text>
        </View>

        {!isMatured && countdown ? (
          <View style={styles.detailRow}>
            <Timer color={colors.textMuted} size={18} style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Time left:</Text>
            <Text style={[styles.detailValue, { color: colors.secondary }]}>{countdown}</Text>
          </View>
        ) : null}

        {/* Eligibility explanation */}
        <View style={styles.eligibilityBox}>
          <Info color={isMatured ? colors.success : colors.secondary} size={18} style={styles.detailIcon} />
          <Text style={[styles.eligibilityText, {
            color: isMatured ? colors.success : colors.textSecondary,
          }]}>
            {eligibility}
          </Text>
        </View>

        {isMatured && (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={handleWithdraw}
            accessibilityLabel="Withdraw funds"
            accessibilityRole="button"
          >
            <DollarSign color={colors.background} size={20} />
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Inline education card */}
      <View style={styles.educationCard}>
        <View style={styles.educationHeader}>
          <HelpCircle color={colors.primary} size={20} style={{ marginRight: SIZES.sm }} />
          <Text style={styles.educationTitle}>Why are my funds locked?</Text>
        </View>
        <Text style={styles.educationBody}>
          When you lock XLM, it's set aside for a fixed period (30 days). During this time the funds stay safely in your vault but cannot be withdrawn.
        </Text>
        <Text style={styles.educationBody}>
          Once the unlock date arrives, you'll see a "Ready to withdraw" badge and can move the funds back to your wallet whenever you like — there's no rush.
        </Text>
        <Text style={styles.educationFootnote}>
          This is a Testnet preview — no real money is involved.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    padding: SIZES.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: SIZES.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  headerTextContent: {
    flex: 1,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  detailIcon: {
    marginRight: SIZES.sm,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
    marginRight: SIZES.xs,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  eligibilityBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(123, 97, 255, 0.06)',
    borderRadius: RADIUS.md,
    padding: SIZES.md,
    marginTop: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  eligibilityText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  withdrawButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.lg,
  },
  withdrawButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
  // ── Inline education card ──────────────────────────────────────
  educationCard: {
    backgroundColor: colors.surface,
    padding: SIZES.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: SIZES.lg,
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  educationTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  educationBody: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: SIZES.sm,
  },
  educationFootnote: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: SIZES.xs,
  },
});