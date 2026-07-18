import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react-native';
import { COLORS, SIZES, RADIUS } from '../constants/theme';
import type { NetworkErrorType } from '../hooks/useNetworkStatus';

interface NetworkStatusBannerProps {
  /** The classified network error type. When 'none' the banner is not rendered. */
  networkErrorType: NetworkErrorType;
  /** Human-readable message to display. */
  message: string;
  /** Called when the user taps the Retry button. Should reuse existing refresh logic. */
  onRetry: () => void;
  /** Set to true while a refresh is already in flight to disable the retry button. */
  isRetrying?: boolean;
}

/**
 * NetworkStatusBanner
 *
 * A lightweight, non-intrusive banner displayed below the screen header when
 * a network-related error is detected.  It differentiates between:
 *
 *  - Device offline  (WifiOff icon, warning-tinted)
 *  - Service unavailable  (AlertTriangle icon, warning-tinted)
 *
 * The banner includes a Retry button that delegates back to the existing
 * refresh logic in the wallet store, keeping request code in one place.
 *
 * The component renders nothing when `networkErrorType === 'none'`.
 */
export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({
  networkErrorType,
  message,
  onRetry,
  isRetrying = false,
}) => {
  if (networkErrorType === 'none') return null;

  const isOffline = networkErrorType === 'offline';

  const Icon = isOffline ? WifiOff : AlertTriangle;
  const iconColor = COLORS.warning;

  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={message}
      testID="network-status-banner"
    >
      <View style={styles.content}>
        <Icon
          color={iconColor}
          size={16}
          style={styles.icon}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onRetry}
        disabled={isRetrying}
        style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        accessibilityState={{ disabled: isRetrying }}
        testID="network-status-retry"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <RefreshCw
          color={isRetrying ? COLORS.textMuted : COLORS.primary}
          size={14}
          style={styles.retryIcon}
        />
        <Text style={[styles.retryText, isRetrying && styles.retryTextDisabled]}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 196, 0, 0.10)', // Warning tint, consistent with FundButton error pattern
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 196, 0, 0.30)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginBottom: SIZES.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: SIZES.sm,
  },
  icon: {
    marginRight: SIZES.xs,
    marginTop: 1, // Visual alignment with first line of text
  },
  message: {
    flex: 1,
    color: COLORS.warning,
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  retryButtonDisabled: {
    borderColor: COLORS.border,
  },
  retryIcon: {
    marginRight: 4,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  retryTextDisabled: {
    color: COLORS.textMuted,
  },
});
