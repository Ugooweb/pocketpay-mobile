import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ChevronDown, ChevronUp, Bug } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { SIZES, RADIUS, ThemeColors } from '../constants/theme';
import { Button } from './Button';

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  onReset: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  onReset,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage = error?.message || 'Unknown error';
  const errorStack = error?.stack || '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Icon Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <AlertTriangle size={48} color={colors.error} />
            </View>
          </View>

          {/* User Facing Copy */}
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected problem occurred in the app. Don't worry — your data and funds on the network are safe.
          </Text>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Button
              title="Try Again"
              onPress={onReset}
              variant="primary"
              accessibilityLabel="Try again and reset the app"
              style={styles.retryButton}
            />
          </View>

          {/* Technical / Developer Debug Details (Rendered ONLY in __DEV__) */}
          {__DEV__ && error && (
            <View style={styles.devSection}>
              <TouchableOpacity
                style={styles.devHeader}
                onPress={() => setShowDetails((prev) => !prev)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Show or hide technical debug details"
              >
                <View style={styles.devHeaderLeft}>
                  <Bug size={16} color={colors.warning} style={styles.bugIcon} />
                  <Text style={styles.devHeaderText}>Debug Details (Dev Only)</Text>
                </View>
                {showDetails ? (
                  <ChevronUp size={18} color={colors.textMuted} />
                ) : (
                  <ChevronDown size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>

              {showDetails && (
                <View style={styles.devBox}>
                  <Text style={styles.devErrorTitle}>{error.name || 'Error'}</Text>
                  <Text style={styles.devErrorMessage}>{errorMessage}</Text>
                  {Boolean(errorStack) && (
                    <ScrollView horizontal style={styles.stackScroll} nestedScrollEnabled>
                      <Text style={styles.devErrorStack}>{errorStack}</Text>
                    </ScrollView>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: SIZES.lg,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SIZES.xxl,
    },
    iconContainer: {
      marginBottom: SIZES.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBackground: {
      width: 96,
      height: 96,
      borderRadius: RADIUS.round,
      backgroundColor: colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: SIZES.sm,
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: SIZES.xl,
      maxWidth: 320,
    },
    actionContainer: {
      width: '100%',
      maxWidth: 320,
      marginBottom: SIZES.xl,
    },
    retryButton: {
      width: '100%',
    },
    devSection: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: SIZES.md,
      overflow: 'hidden',
    },
    devHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: SIZES.md,
      backgroundColor: colors.surfaceLight,
    },
    devHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bugIcon: {
      marginRight: SIZES.xs,
    },
    devHeaderText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.warning,
    },
    devBox: {
      padding: SIZES.md,
      backgroundColor: colors.surface,
    },
    devErrorTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.error,
      marginBottom: 4,
    },
    devErrorMessage: {
      fontSize: 12,
      color: colors.textPrimary,
      marginBottom: SIZES.sm,
      fontFamily: 'System',
    },
    stackScroll: {
      backgroundColor: colors.background,
      padding: SIZES.sm,
      borderRadius: RADIUS.sm,
      maxHeight: 180,
    },
    devErrorStack: {
      fontSize: 10,
      lineHeight: 14,
      color: colors.textMuted,
      fontFamily: 'System',
    },
  });
