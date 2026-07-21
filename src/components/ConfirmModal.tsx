import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SIZES, RADIUS, ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { X, AlertTriangle } from 'lucide-react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  isLoading = false,
  confirmDisabled = false,
  icon,
  children,
  onConfirm,
  onCancel,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const canConfirm = !confirmDisabled && !isLoading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            {icon ? (
              <View style={styles.iconContainer}>{icon}</View>
            ) : destructive ? (
              <View style={[styles.iconContainer, styles.destructiveIconBg]}>
                <AlertTriangle color={colors.error} size={36} />
              </View>
            ) : null}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onCancel}
              disabled={isLoading}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X color={colors.textMuted} size={22} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {children ? <View style={styles.customContent}>{children}</View> : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                destructive
                  ? { backgroundColor: canConfirm ? colors.error : colors.surfaceLight }
                  : { backgroundColor: canConfirm ? colors.primary : colors.surfaceLight },
              ]}
              onPress={onConfirm}
              disabled={!canConfirm}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator
                  color={canConfirm ? colors.background : colors.textMuted}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: canConfirm ? colors.background : colors.textMuted },
                  ]}
                >
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    destructiveIconBg: {
      backgroundColor: 'rgba(244, 67, 54, 0.12)',
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
      marginBottom: SIZES.sm,
    },
    message: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: SIZES.lg,
    },
    customContent: {
      marginBottom: SIZES.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: SIZES.sm,
    },
    actionButton: {
      flex: 1,
      height: 50,
      borderRadius: RADIUS.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: colors.surfaceLight,
    },
    cancelButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    confirmButton: {},
    confirmButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
