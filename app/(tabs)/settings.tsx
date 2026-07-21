import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { useAppStore } from '../../src/store/appStore';
import { useAppLockStore } from '../../src/store/appLockStore';
import { Users, LogOut, Key, Moon, Sun, Shield } from 'lucide-react-native';
import { SecretKeyReveal } from '../../src/components/SecretKeyReveal';
import { WalletResetConfirmModal } from '../../src/components/WalletResetConfirmModal';

const THEME_OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', Icon: Sun },
  { mode: 'dark', label: 'Dark', Icon: Moon },
  { mode: 'system', label: 'System', Icon: Monitor },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { clearWallet, getSecretKey } = useWalletStore();
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const { isLockEnabled, enableLock, disableLock, authenticate } = useAppLockStore();
  const [showSecret, setShowSecret] = useState(false);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleExportKey = async () => {
    if (!showSecret) {
      const secret = await getSecretKey();
      if (secret) {
        setSecretKey(secret);
        setShowSecret(true);
      }
    } else {
      setShowSecret(false);
      setSecretKey(null);
    }
  };

  const handleSignOut = () => {
    setShowResetModal(true);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    const cleared = await clearWallet();
    setIsResetting(false);
    setShowResetModal(false);
    if (!cleared) {
      Alert.alert('Wallet Not Cleared', 'Failed to clear wallet securely. Please try again.');
    }
  };

  const handleToggleLock = async (enable: boolean) => {
    if (enable) {
      await enableLock();
      await authenticate();
    } else {
      Alert.alert(
        'Disable App Lock',
        'Anyone with your device can access your wallet without app lock. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await disableLock();
            },
          },
        ]
      );
    }
  };

  return (
    <><ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield color={COLORS.primary} size={24} />
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowText}>App Lock</Text>
                <Text style={styles.rowHelper}>
                  Require biometrics or passcode to open
                </Text>
              </View>
            </View>
            <Switch
              value={isLockEnabled}
              onValueChange={handleToggleLock}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              {isDarkMode ? <Moon color={COLORS.textPrimary} size={24} /> : <Sun color={COLORS.textPrimary} size={24} />}
              <View style={styles.rowTextGroup}>
                <Text style={styles.rowText}>Dark Mode</Text>
              </View>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.card}>
          <Button
            title="Address Book / Contacts"
            variant="outline"
            onPress={() => router.push('/contacts')}
            style={styles.menuButton}
          />
          <Button
            title={showSecret ? "Hide Export Menu" : "Export Secret Key"}
            variant="outline"
            onPress={handleExportKey}
            style={styles.menuButton}
          />
          {showSecret && secretKey && (
            <View style={{ padding: SIZES.lg, paddingTop: 0, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ color: colors.textSecondary, marginBottom: SIZES.sm, fontSize: 14 }}>
                Your secret key is highly sensitive. Proceed with caution.
              </Text>
              <SecretKeyReveal secretKey={secretKey} />
            </View>
          )}
        </View>
      </View>

      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Development</Text>
          <View style={styles.card}>
            <Button 
              title="Export Diagnostics" 
              variant="outline" 
              onPress={handleExportDiagnostics}
              style={[styles.menuButton, { borderBottomWidth: 0 }]}
            />
          </View>
        </View>
      )}

      <View style={[styles.section, { marginTop: SIZES.xl }]}>
        <Button
          title="Sign Out & Clear Wallet"
          variant="danger"
          onPress={handleSignOut}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Stellar PocketPay v1.0.0</Text>
        <Text style={styles.footerText}>Network: Testnet</Text>
      </View>
    </ScrollView>
      <WalletResetConfirmModal
        visible={showResetModal}
        isLoading={isResetting}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetModal(false)}
      />
    </>);
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: SIZES.lg,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeRow: {
    flexDirection: 'row',
    padding: SIZES.sm,
    gap: SIZES.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    flex: 1,
  },
  rowTextGroup: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  rowText: {
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  rowHelper: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SIZES.lg,
  },
  menuButton: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 0,
    justifyContent: 'flex-start',
    paddingHorizontal: SIZES.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    paddingBottom: SIZES.xxl * 2,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  }
});
