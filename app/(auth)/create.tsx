import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { COLORS, SIZES, RADIUS } from '../../src/constants/theme';
import { generateKeypair } from '../../src/services/stellar';
import { useWalletStore } from '../../src/store/walletStore';
import { AlertTriangle } from 'lucide-react-native';
import { SecretKeyReveal } from '../../src/components/SecretKeyReveal';

export default function CreateWalletScreen() {
  const router = useRouter();
  const { setWallet } = useWalletStore();
  const [keypair, setKeypair] = useState<{ publicKey: string; secretKey: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = () => {
    try {
      const keys = generateKeypair();
      setKeypair(keys);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate keypair.');
    }
  };


  const handleContinue = async () => {
    if (!keypair) return;
    
    Alert.alert(
      'Are you sure?',
      'Have you saved your secret key securely? If you lose it, you lose access to your funds.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, I saved it', 
          onPress: async () => {
            setIsLoading(true);
            const saved = await setWallet(keypair.publicKey, keypair.secretKey);
            setIsLoading(false);
            if (!saved) {
              Alert.alert('Wallet Not Saved', 'Failed to persist wallet securely. Please try again.');
            }
            // Router will automatically redirect to (main) due to root layout logic
          }
        }
      ]
    );
  };

  if (!keypair) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Generate Your Keys</Text>
          <Text style={styles.subtitle}>
            We will generate a secure Stellar Testnet keypair for you. This happens entirely on your device.
          </Text>
        </View>
        <Button title="Generate Keypair" onPress={handleGenerate} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
      <View style={styles.warningCard}>
        <AlertTriangle color={COLORS.warning} size={32} style={{ marginBottom: SIZES.sm }} />
        <Text style={styles.warningTitle}>Save Your Secret Key!</Text>
        <Text style={styles.warningText}>
          This is the only way to access your wallet. Do not share it with anyone. If you lose it, your funds are gone forever.
        </Text>
      </View>

      <View style={styles.keyContainer}>
        <Text style={styles.keyLabel}>Public Key (Address)</Text>
        <View style={styles.keyBox}>
          <Text style={styles.keyValue} selectable>{keypair.publicKey}</Text>
        </View>
      </View>

      <View style={styles.keyContainer}>
        <Text style={styles.keyLabel}>Secret Key</Text>
        <SecretKeyReveal secretKey={keypair.secretKey} />
      </View>

      <Button 
        title="I've Saved It, Continue" 
        onPress={handleContinue} 
        isLoading={isLoading}
        style={{ marginTop: SIZES.xl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.xl,
    justifyContent: 'space-between',
    paddingBottom: SIZES.xxl,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
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
    color: COLORS.warning,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  warningText: {
    color: COLORS.warning,
    textAlign: 'center',
    lineHeight: 22,
  },
  keyContainer: {
    marginBottom: SIZES.lg,
  },
  keyLabel: {
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
    fontSize: 14,
    fontWeight: '500',
  },
  keyBox: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  keyValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },

});
