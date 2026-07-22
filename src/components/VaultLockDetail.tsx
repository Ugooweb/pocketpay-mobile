import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SIZES, RADIUS, ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { Lock } from '../store/vaultStore';
import { Calendar, Clock, DollarSign, Lock as LockIcon, Unlock, Info } from 'lucide-react-native';

interface VaultLockDetailProps {
  lock: Lock;
}

export const VaultLockDetail: React.FC<VaultLockDetailProps> = ({ lock }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isMatured = lock.status === 'matured';
  const unlockDate = new Date(lock.unlockDate);
  const createdAt = new Date(lock.createdAt);

  const handleWithdraw = () => {
    // TODO: Implement withdrawal logic
    console.log('Withdraw funds for lock:', lock.id);
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
                {isMatured ? 'Matured' : 'Locked'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Calendar color={colors.textMuted} size={18} style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Created Date:</Text>
          <Text style={styles.detailValue}>{createdAt.toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Clock color={colors.textMuted} size={18} style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Unlock Date:</Text>
          <Text style={styles.detailValue}>{unlockDate.toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Info color={colors.textMuted} size={18} style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Withdrawal Eligibility:</Text>
          <Text style={[styles.detailValue, { color: isMatured ? colors.success : colors.error }]}>
            {isMatured ? 'Eligible' : 'Not yet eligible'}
          </Text>
        </View>

        {isMatured && (
          <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
            <DollarSign color={colors.buttonText} size={20} />
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        )}
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
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SIZES.xs,
  },
});