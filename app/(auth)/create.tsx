import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AsyncActionButton } from '../../src/components/AsyncActionButton';
import { SIZES, RADIUS, ThemeColors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { generateKeypair } from '../../src/services/stellar';
import { useWalletStore } from '../../src/store/walletStore';
import { AlertTriangle, Info, Shield, CheckCircle } from 'lucide-react-native';
import { SecretKeyReveal } from '../../src/components/SecretKeyReveal';

export default function CreateWalletScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { setWallet, markBackupPending } = useWalletStore();
  const [keypair, setKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerate = () => {
    try {
      const keys = generateKeypair();
      setKeypair(keys);
    } catch (error: any) {
      Alert.alert('Error', `Failed to generate keypair: ${error?.message || error}`);
    }
  };


  const handleContinue = async () => {
    if (!keypair) return;

    Alert.alert(
      'Save Your Secret Key',
      'This key is the only way to access your wallet. Without it, funds cannot be recovered. Have you saved it?',
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: 'Yes, I Saved It',
          onPress: async () => {
            setIsLoading(true);
            const saved = await setWallet(keypair.publicKey, keypair.secretKey);
            setIsLoading(false);
            if (!saved) {
              Alert.alert('Wallet Not Saved', 'Failed to persist wallet securely. Please try again.');
              return;
            }
            await markBackupPending();
            setIsSuccess(true);
          }
        }
      ]
    );
  };

  const handleGoToWallet = () => {
    router.replace('/(tabs)');
  };

  // ── Success State ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <CheckCircle color={colors.success} size={64} />
          </View>
          <Text style={styles.title}>Wallet Created!</Text>
          <Text style={styles.subtitle}>
            Your Testnet wallet is ready. Fund it with the Friendbot on the home screen to start sending test XLM.
          </Text>
        </View>
        <AsyncActionButton title="Go to Wallet" onPress={handleGoToWallet} />
      </View>
    );
  }

  // ── Generate State ─────────────────────────────────────────
  if (!keypair) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.infoBanner}>
            <Info color={colors.primary} size={20} />
            <Text style={styles.infoText}>
              You're on <Text style={styles.infoBold}>Stellar Testnet</Text>. Wallets use test funds only — no real value.
            </Text>
          </View>

          <Text style={styles.title}>Create Wallet</Text>
          <Text style={styles.subtitle}>
            A new keypair will be generated on your device. Your secret key stays private and never leaves this phone.
          </Text>
        </View>
        <AsyncActionButton title="Generate Keypair" onPress={handleGenerate} />
      </View>
    );
  }

  // ── Keypair Reveal State ───────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
      <View style={styles.warningCard}>
        <AlertTriangle color={colors.warning} size={32} style={{ marginBottom: SIZES.sm }} />
        <Text style={styles.warningTitle}>Save Your Secret Key</Text>
        <Text style={styles.warningText}>
          This is the <Text style={styles.warningBold}>only way</Text> to access your wallet. Anyone with this key can control your funds. Store it safely — it cannot be recovered.
        </Text>
      </View>

      <View style={styles.keyContainer}>
        <Text style={styles.keyLabel}>Public Key (Your Address)</Text>
        <View style={styles.keyBox}>
          <Text style={styles.keyValue} selectable>{keypair.publicKey}</Text>
        </View>
      </View>

      <View style={styles.keyContainer}>
        <Text style={styles.keyLabel}>Secret Key</Text>
        <SecretKeyReveal secretKey={keypair.secretKey} />
      </View>

      <View style={styles.securityNote}>
        <Shield color={colors.textMuted} size={16} />
        <Text style={styles.securityNoteText}>
          Copy and store your secret key offline. Never share it with anyone.
        </Text>
      </View>

      <AsyncActionButton
        title="I've Saved It — Continue"
        onPress={handleContinue}
        isLoading={isLoading}
        style={{ marginTop: SIZES.xl }}
      />
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: SIZES.xl,
    justifyContent: 'space-between',
    paddingBottom: SIZES.xxl,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: SIZES.xl,
    paddingBottom: SIZES.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    padding: SIZES.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    marginBottom: SIZES.xl,
    gap: SIZES.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 196, 0, 0.1)',
    padding: SIZES.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 196, 0, 0.3)',
    marginBottom: SIZES.xl,
    alignItems: 'center',
  },
  warningTitle: {
    color: colors.warning,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  warningText: {
    color: colors.warning,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningBold: {
    fontWeight: 'bold',
    color: colors.warning,
  },
  keyContainer: {
    marginBottom: SIZES.lg,
  },
  keyLabel: {
    color: colors.textSecondary,
    marginBottom: SIZES.xs,
    fontSize: 14,
    fontWeight: '500',
  },
  keyBox: {
    backgroundColor: colors.surface,
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyValue: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    paddingHorizontal: SIZES.xs,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
});
