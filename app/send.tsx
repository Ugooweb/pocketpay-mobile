import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../src/components/Button";
import { FormField } from "../src/components/FormField";
import { QrScanner } from "../src/components/QrScanner";
import { SIZES, RADIUS, ThemeColors } from "../src/constants/theme";
import { useTheme } from "../src/hooks/useTheme";
import { sendXlmTransaction } from "../src/services/stellar";
import { useWalletStore } from "../src/store/walletStore";
import { useAppStore } from "../src/store/appStore";
import {
  validateAddress,
  validateAmount,
  validateMemo,
} from "../src/utils/validation";
import { resolveAddressLabel } from "../src/utils/contacts";
import {
  Send as SendIcon,
  ScanLine,
  ChevronDown,
  User,
} from "lucide-react-native";
import { ScreenHeader } from "@/components";

interface FieldErrors {
  destination?: string;
  amount?: string;
  memo?: string;
}

export default function SendScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { publicKey, getSecretKey, refreshWalletData, balance } =
    useWalletStore();
  const contacts = useAppStore((state) => state.contacts);

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

  const destinationContact =
    destination.trim() && !errors.destination
      ? resolveAddressLabel(destination.trim(), contacts)
      : null;

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setErrors((prev) => ({
      ...prev,
      destination: value.trim()
        ? (validateAddress(value, publicKey) ?? undefined)
        : undefined,
    }));
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setErrors((prev) => ({
      ...prev,
      amount: value.trim()
        ? (validateAmount(value, balance) ?? undefined)
        : undefined,
    }));
  };

  const handleMemoChange = (value: string) => {
    setMemo(value);
    setErrors((prev) => ({
      ...prev,
      memo: validateMemo(value) ?? undefined,
    }));
  };

  const handleSelectContact = (contactPublicKey: string) => {
    setDestination(contactPublicKey);
    setErrors((prev) => ({
      ...prev,
      destination: validateAddress(contactPublicKey, publicKey) ?? undefined,
    }));
    setShowContactPicker(false);
  };

  const handleScanSuccess = (address: string) => {
    setIsScanning(false);
    handleDestinationChange(address);
  };

  const handleScanError = (message: string) => {
    setIsScanning(false);
    Alert.alert("Invalid QR Code", message);
  };

  const handleScanClose = () => {
    setIsScanning(false);
  };

  const handleSend = async () => {
    const fieldErrors: FieldErrors = {
      destination: validateAddress(destination, publicKey) ?? undefined,
      amount: validateAmount(amount, balance) ?? undefined,
      memo: validateMemo(memo) ?? undefined,
    };
    setErrors(fieldErrors);

    if (fieldErrors.destination || fieldErrors.amount || fieldErrors.memo) {
      return;
    }

    try {
      setIsLoading(true);
      const secretKey = await getSecretKey();
      if (!secretKey) throw new Error("Secret key not found.");

      const result = await sendXlmTransaction(
        secretKey,
        destination.trim(),
        amount.trim(),
        memo.trim(),
      );

      refreshWalletData();
      router.replace({
        pathname: "/payment-success",
        params: {
          hash: result.hash,
          amount: amount.trim(),
          destination: destination.trim(),
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Transaction Failed",
        error.message || "An error occurred while sending.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScreenHeader
          title="Send XLM"
          subtitle={`Available Balance: ${balance} XLM`}
        />

        <View style={styles.form}>
          <FormField
            label="Destination Address (Public Key)"
            placeholder="G..."
            value={destination}
            onChangeText={handleDestinationChange}
            error={errors.destination}
            autoCapitalize="none"
            autoCorrect={false}
            helperText="Enter the recipient's Stellar public key (starts with 'G')"
            rightIcon={
              <TouchableOpacity
                onPress={() => setIsScanning(true)}
                accessibilityLabel="Scan QR code for recipient address"
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ScanLine size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            }
          />

          {contacts.length > 0 && (
            <View style={styles.contactPickerContainer}>
              <TouchableOpacity
                style={styles.contactPickerButton}
                onPress={() => setShowContactPicker((prev) => !prev)}
                accessibilityLabel="Choose from saved contacts"
                accessibilityRole="button"
              >
                <User size={18} color={colors.primary} />
                <Text style={styles.contactPickerText}>
                  {showContactPicker
                    ? "Hide contacts"
                    : "Choose from saved contacts"}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {showContactPicker && (
                <View style={styles.contactList}>
                  {contacts.map((contact) => (
                    <TouchableOpacity
                      key={contact.id}
                      style={styles.contactItem}
                      onPress={() => handleSelectContact(contact.publicKey)}
                    >
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text
                        style={styles.contactKey}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                      >
                        {contact.publicKey}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {destinationContact?.isContact ? (
            <View style={styles.contactMatch}>
              <Text style={styles.contactMatchText}>
                Sending to saved contact: {destinationContact.label}
              </Text>
            </View>
          ) : null}

          <FormField
            label="Amount (XLM)"
            placeholder="0.00"
            value={amount}
            onChangeText={handleAmountChange}
            error={errors.amount}
            keyboardType="decimal-pad"
            helperText={`Available balance: ${balance} XLM`}
          />

          <FormField
            label="Memo (Optional)"
            placeholder="Payment reference"
            value={memo}
            onChangeText={handleMemoChange}
            helperText="Add a note for the recipient"
          />
        </View>

        <Button
          title="Send Payment"
          onPress={handleSend}
          isLoading={isLoading}
          style={styles.sendButton}
        />
      </KeyboardAvoidingView>

      <Modal
        visible={isScanning}
        animationType="slide"
        onRequestClose={handleScanClose}
        accessibilityViewIsModal
      >
        <QrScanner
          onScan={handleScanSuccess}
          onError={handleScanError}
          onClose={handleScanClose}
        />
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: SIZES.xl,
    },
    form: {
      flex: 1,
    },
    contactPickerContainer: {
      marginBottom: SIZES.md,
    },
    contactPickerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      paddingHorizontal: SIZES.md,
      paddingVertical: SIZES.md,
      gap: SIZES.sm,
    },
    contactPickerText: {
      flex: 1,
      color: colors.primary,
      fontWeight: "600",
      fontSize: 14,
    },
    contactList: {
      marginTop: SIZES.xs,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: SIZES.sm,
      maxHeight: 200,
    },
    contactItem: {
      paddingVertical: SIZES.sm,
      paddingHorizontal: SIZES.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    contactName: {
      color: colors.textPrimary,
      fontWeight: "600",
      fontSize: 14,
      marginBottom: 2,
    },
    contactKey: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    contactMatch: {
      marginTop: -SIZES.sm,
      marginBottom: SIZES.md,
    },
    contactMatchText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "500",
    },
    sendButton: {
      marginBottom: SIZES.xxl,
    },
  });
