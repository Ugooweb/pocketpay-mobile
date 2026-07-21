import React, { useMemo } from "react";
import { View, Text, StyleSheet, Share } from "react-native";
import { Button } from "../src/components/Button";
import { ScreenHeader } from "../src/components/ScreenHeader";
import { SIZES, RADIUS, ThemeColors } from "../src/constants/theme";
import { useTheme } from "../src/hooks/useTheme";
import { useWalletStore } from "../src/store/walletStore";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

export default function ReceiveScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { publicKey } = useWalletStore();

  const handleCopy = async () => {
    if (publicKey) {
      await Clipboard.setStringAsync(publicKey);
    }
  };

  const handleShare = async () => {
    if (publicKey) {
      await Share.share({
        message: publicKey,
        title: "My Stellar Address",
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Receive XLM"
        subtitle="Show this QR code to receive payments on the Stellar Testnet."
      />

      <View style={styles.qrContainer}>
        {publicKey ? (
          <QRCode
            value={publicKey}
            size={250}
            color={colors.background}
            backgroundColor={colors.textPrimary}
          />
        ) : (
          <Text style={{ color: colors.textMuted }}>No public key found</Text>
        )}
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Your Public Key</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText} selectable>
            {publicKey}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Copy Address"
          onPress={handleCopy}
          style={styles.actionButton}
        />
        <Button
          title="Share"
          variant="secondary"
          onPress={handleShare}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: SIZES.xl,
      alignItems: "center",
    },
    qrContainer: {
      backgroundColor: colors.textPrimary,
      padding: SIZES.lg,
      borderRadius: RADIUS.lg,
      marginBottom: SIZES.xl,
    },
    addressContainer: {
      width: "100%",
      marginBottom: SIZES.xl,
    },
    addressLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: SIZES.xs,
    },
    addressBox: {
      backgroundColor: colors.surface,
      padding: SIZES.md,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addressText: {
      color: colors.textPrimary,
      fontSize: 14,
      textAlign: "center",
    },
    actions: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    actionButton: {
      flex: 1,
      marginHorizontal: SIZES.xs,
    },
  });
