/**
 * ContactsScreen
 *
 * Supports two ways to add a contact:
 *  1. Manual entry – type a name and a Stellar public key.
 *  2. Scan-to-add  – open the QR scanner, scan an address, then type a name.
 *
 * Duplicate detection: if the scanned or typed address already exists in the
 * contact list, the user is informed before they can save.
 *
 * Accessibility: interactive elements carry accessibilityLabel / accessibilityRole.
 */

import React, { useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Alert, Modal } from "react-native";
import { Button } from "../src/components/Button";
import { Input } from "../src/components/Input";
import { QrScanner } from "../src/components/QrScanner";
import { SIZES, RADIUS, ThemeColors } from "../src/constants/theme";
import { useTheme } from "../src/hooks/useTheme";
import { useAppStore, Contact } from "../src/store/appStore";
import { validateAddress } from "../src/utils/validation";
import { Trash2, User } from "lucide-react-native";
import { EmptyState } from "../src/components/EmptyState";

// ── View modes ───────────────────────────────────────────────────────────────
type Mode =
  | "list" // Default: show contact list
  | "manual" // Manual add form (name + address)
  | "scanning" // Full-screen QR scanner
  | "confirm-scan"; // Post-scan form: address pre-filled, enter name

export default function ContactsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { contacts, addContactIfUnique, removeContact, findDuplicateContact } =
    useAppStore();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("list");
  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [nameWarning, setNameWarning] = useState<string | undefined>();
  const [keyError, setKeyError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setName("");
    setPublicKey("");
    setNameError(undefined);
    setNameWarning(undefined);
    setKeyError(undefined);
    setIsSaving(false);
  }, []);

  // ── Field change handlers ───────────────────────────────────────────────────

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError && value.trim()) setNameError(undefined);
    // Check for duplicate name (case-insensitive) — warn but don't block
    if (value.trim()) {
      const result = findDuplicateContact(value, publicKey || "G");
      if (result.type === "name") {
        setNameWarning(result.message);
      } else {
        setNameWarning(undefined);
      }
    } else {
      setNameWarning(undefined);
    }
  };

  const handleKeyChange = (value: string) => {
    setPublicKey(value);
    if (!value.trim()) {
      setKeyError(undefined);
      return;
    }
    const addrError = validateAddress(value);
    if (addrError) {
      setKeyError(addrError);
      return;
    }
    // Check for duplicate address using the store's centralized logic
    const result = findDuplicateContact(name || "temp", value);
    if (result.type === "address") {
      setKeyError(result.message);
      return;
    }
    setKeyError(undefined);
  };

  // ── Save handler (used by both manual and scan-confirm forms) ───────────────

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedKey = publicKey.trim();

    const currentNameError = trimmedName ? undefined : "Please enter a name.";
    const addrValidationError = validateAddress(trimmedKey) ?? undefined;
    const currentKeyError = addrValidationError;

    setNameError(currentNameError);
    setKeyError(currentKeyError);

    if (currentNameError || currentKeyError) return;

    const newContact: Contact = {
      id: Date.now().toString(),
      name: trimmedName,
      publicKey: trimmedKey,
    };

    try {
      setIsSaving(true);
      const result = await addContactIfUnique(newContact);

      if (result.type === "address") {
        setKeyError(result.message);
        return;
      }

      resetForm();
      setMode("list");
    } catch {
      Alert.alert("Error", "Failed to save contact. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── QR scanner callbacks ────────────────────────────────────────────────────

  const handleScanSuccess = useCallback(
    (address: string) => {
      // Check for duplicates using the store's centralized logic.
      const result = findDuplicateContact("", address);
      if (result.type === "address") {
        Alert.alert("Already saved", result.message);
        setMode("list");
        return;
      }
      // Pre-fill the address and switch to the confirm form.
      setPublicKey(address);
      setMode("confirm-scan");
    },
    [findDuplicateContact],
  );

  const handleScanError = useCallback((message: string) => {
    Alert.alert("Invalid QR Code", message);
    setMode("list");
  }, []);

  const handleScanClose = useCallback(() => {
    setMode("list");
    resetForm();
  }, [resetForm]);

  // ── Remove handler ──────────────────────────────────────────────────────────

  const handleRemove = (id: string) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to remove this contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeContact(id),
        },
      ],
    );
  };

  // ── Render: full-screen QR scanner ─────────────────────────────────────────
  if (mode === "scanning") {
    return (
      <Modal
        visible
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
    );
  }

  // ── Render: add form (manual or post-scan confirm) ──────────────────────────
  const isFormMode = mode === "manual" || mode === "confirm-scan";

  return (
    <View style={styles.container}>
      {isFormMode ? (
        <View style={styles.addForm}>
          <Text style={styles.title}>
            {mode === "confirm-scan"
              ? "Save Scanned Contact"
              : "Add New Contact"}
          </Text>

          {/* Name field */}
          <Input
            label="Name"
            placeholder="Alice"
            value={name}
            onChangeText={handleNameChange}
            error={nameError}
            autoFocus
            accessibilityLabel="Contact name"
          />
          {nameWarning && !nameError && (
            <Text style={styles.warningText}>{nameWarning}</Text>
          )}

          {/* Address field – read-only when pre-filled from scan */}
          <Input
            label="Stellar Address"
            placeholder="G..."
            value={publicKey}
            onChangeText={handleKeyChange}
            error={keyError}
            autoCapitalize="none"
            autoCorrect={false}
            editable={mode !== "confirm-scan"}
            accessibilityLabel="Stellar public key address"
          />

          {/* Scan button (only in manual mode – lets the user switch to scanner) */}
          {mode === "manual" && (
            <Button
              title="Scan QR Instead"
              variant="outline"
              onPress={() => {
                resetForm();
                setMode("scanning");
              }}
              style={styles.scanInsteadBtn}
              accessibilityLabel="Open QR scanner"
            />
          )}

          <View style={styles.actions}>
            <Button
              title="Save Contact"
              onPress={handleSave}
              isLoading={isSaving}
              style={styles.actionBtn}
              accessibilityLabel="Save contact"
            />
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => {
                resetForm();
                setMode("list");
              }}
              style={styles.actionBtn}
              accessibilityLabel="Cancel"
            />
          </View>
        </View>
      ) : (
        <>
          {/* ── List header: two action buttons ────────────────────────────── */}
          <View style={styles.headerActions}>
            <Button
              title="+ Add Manually"
              onPress={() => {
                resetForm();
                setMode("manual");
              }}
              style={styles.headerBtn}
              accessibilityLabel="Add contact manually"
            />
            <Button
              title="Scan QR"
              variant="secondary"
              onPress={() => {
                resetForm();
                setMode("scanning");
              }}
              style={styles.headerBtn}
              accessibilityLabel="Scan QR code to add contact"
            />
          </View>

          {/* ── Contact list ─────────────────────────────────────────────────── */}
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                icon={<User color={colors.textMuted} size={48} />}
                title="No contacts yet"
                message="Add a contact manually or scan a QR code."
              />
            }
            renderItem={({ item }) => (
              <View style={styles.contactItem}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text
                    style={styles.contactKey}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {item.publicKey}
                  </Text>
                </View>
                <Trash2
                  color={colors.error}
                  size={20}
                  onPress={() => handleRemove(item.id)}
                  accessibilityLabel={`Remove ${item.name}`}
                  accessibilityRole="button"
                />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: SIZES.lg,
    },
    // ── Header ──────────────────────────────────────────────────────────────────
    headerActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: SIZES.lg,
      gap: SIZES.sm,
    },
    headerBtn: {
      flex: 1,
    },
    // ── Add / confirm form ───────────────────────────────────────────────────────
    addForm: {
      backgroundColor: colors.surface,
      padding: SIZES.xl,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: SIZES.lg,
    },
    warningText: {
      color: colors.warning,
      fontSize: 12,
      marginTop: -SIZES.xs,
      marginBottom: SIZES.md,
      marginLeft: SIZES.xs,
    },
    scanInsteadBtn: {
      marginBottom: SIZES.md,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: SIZES.md,
      gap: SIZES.sm,
    },
    actionBtn: {
      flex: 1,
    },
    // ── Contact list ─────────────────────────────────────────────────────────────
    listContent: {
      paddingBottom: SIZES.xxl,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: SIZES.lg,
      borderRadius: RADIUS.md,
      marginBottom: SIZES.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contactInfo: {
      flex: 1,
      marginRight: SIZES.md,
    },
    contactName: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    contactKey: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });
