import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SIZES, RADIUS, ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';
import { Lock, Clock, AlertCircle, X } from 'lucide-react-native';

interface VaultLockEducationModalProps {
  visible: boolean;
  onClose: () => void;
  lockedBalance?: string;
  unlockTime?: string | null;
}

export const VaultLockEducationModal: React.FC<VaultLockEducationModalProps> = ({
  visible,
  onClose,
  lockedBalance,
  unlockTime,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isLocked = lockedBalance && parseFloat(lockedBalance) > 0 && unlockTime;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Lock color={colors.secondary} size={36} />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X color={colors.textMuted} size={22} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>About Locked Funds</Text>
          <Text style={styles.subtitle}>
            Why you can't withdraw locked funds right away
          </Text>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {isLocked ? (
              <View style={styles.currentLockInfo}>
                <View style={styles.currentLockIcon}>
                  <Clock color={colors.secondary} size={24} />
                </View>
                <View style={styles.currentLockText}>
                  <Text style={styles.currentLockLabel}>Currently Locked</Text>
                  <Text style={styles.currentLockAmount}>{lockedBalance} XLM</Text>
                  {unlockTime && (
                    <Text style={styles.currentUnlockTime}>Unlocks on {unlockTime}</Text>
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.point}>
              <View style={[styles.pointIcon, { backgroundColor: 'rgba(123, 97, 255, 0.12)' }]}>
                <Lock color={colors.secondary} size={18} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>Lock period</Text>
                <Text style={styles.pointBody}>
                  When you lock funds, they're held for a fixed time (30 days by default). You can't withdraw them until the unlock date passes.
                </Text>
              </View>
            </View>

            <View style={styles.point}>
              <View style={[styles.pointIcon, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                <Clock color={colors.success} size={18} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>Matured locks</Text>
                <Text style={styles.pointBody}>
                  Once the unlock date passes, locks become "matured" and you can unlock the funds.
                </Text>
              </View>
            </View>

            <View style={styles.point}>
              <View style={[styles.pointIcon, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
                <Clock color={colors.primary} size={18} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>Multiple locks</Text>
                <Text style={styles.pointBody}>
                  You can create multiple independent locks, each with their own amount and unlock date.
                </Text>
              </View>
            </View>

            <View style={styles.point}>
              <View style={[styles.pointIcon, { backgroundColor: 'rgba(255, 196, 0, 0.12)' }]}>
                <AlertCircle color={colors.warning} size={18} />
              </View>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>Testnet note</Text>
                <Text style={styles.pointBody}>
                  This is a testnet feature. Locking currently uses mock data stored locally on your device for demonstration purposes.
                </Text>
              </View>
            </View>
          </ScrollView>

          <Button title="Got it" onPress={onClose} style={styles.continueButton} />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SIZES.lg,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      maxHeight: '85%',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.xl,
      padding: SIZES.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: SIZES.md,
      position: 'relative',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(123, 97, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      position: 'absolute',
      right: 0,
      top: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: SIZES.xs,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: SIZES.lg,
    },
    body: {
      marginBottom: SIZES.md,
    },
    currentLockInfo: {
      flexDirection: 'row',
      backgroundColor: 'rgba(123, 97, 255, 0.08)',
      borderRadius: RADIUS.md,
      padding: SIZES.md,
      marginBottom: SIZES.lg,
      alignItems: 'flex-start',
    },
    currentLockIcon: {
      marginRight: SIZES.sm,
      marginTop: 2,
    },
    currentLockText: {
      flex: 1,
    },
    currentLockLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 2,
    },
    currentLockAmount: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    currentUnlockTime: {
      color: colors.secondary,
      fontSize: 13,
      fontWeight: '500',
    },
    point: {
      flexDirection: 'row',
      marginBottom: SIZES.lg,
    },
    pointIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: SIZES.sm,
    },
    pointText: {
      flex: 1,
    },
    pointTitle: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    pointBody: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    continueButton: {
      width: '100%',
    },
  });
