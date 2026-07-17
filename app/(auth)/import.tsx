import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/Button';
import { FormField } from '../../src/components/FormField';
import { COLORS, SIZES } from '../../src/constants/theme';
import { useWalletStore } from '../../src/store/walletStore';
import { importWallet } from 'pocketpay-sdk';

export default function ImportWalletScreen() {
  const router = useRouter();
  const { setWallet } = useWalletStore();
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    setError('');
    if (!secretKey.trim()) {
      setError('Please enter a secret key');
      return;
    }

    try {
      setIsLoading(true);
      const { publicKey } = importWallet(secretKey.trim());
      
      const saved = await setWallet(publicKey, secretKey.trim());
      if (!saved) {
        setError('Failed to persist wallet securely. Please try again.');
      }
      // Router will automatically redirect to (main)
    } catch {
      setError('Invalid secret key. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Import Existing Wallet</Text>
          <Text style={styles.subtitle}>
            Enter your 56-character Stellar secret key (starts with 'S').
          </Text>
        </View>

        <FormField
          label="Secret Key"
          placeholder="S..."
          value={secretKey}
          onChangeText={(text) => {
            setSecretKey(text);
            setError('');
          }}
          secureTextEntry
          error={error}
          helperText="Enter your 56-character Stellar secret key starting with 'S'"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Button 
        title="Import Wallet" 
        onPress={handleImport} 
        isLoading={isLoading}
      />
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  header: {
    marginBottom: SIZES.xl,
    marginTop: SIZES.md,
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
});
