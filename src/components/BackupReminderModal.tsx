import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SIZES, RADIUS } from '../constants/theme';
import { Button } from './Button';
import { ShieldAlert, CheckSquare, Square } from 'lucide-react-native';

interface BackupReminderModalProps {
  visible: boolean;
  onAcknowledge: () => void;
}

export const BackupReminderModal: React.FC<BackupReminderModalProps> = ({
  visible,
  onAcknowledge,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <ShieldAlert color={COLORS.warning} size={48} />
          </View>
          
          <Text style={styles.title}>Secure Your Wallet</Text>
          
          <Text style={styles.description}>
            Your secret key is the <Text style={styles.boldText}>ONLY</Text> way to access your wallet and recover your funds.
          </Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              • PocketPay does not store your secret key on any servers.{"\n"}
              • If you lose your secret key, your funds are lost forever.{"\n"}
              • Do not share your secret key with anyone, including PocketPay support.
            </Text>
          </View>

          <Pressable 
            style={styles.checkboxContainer} 
            onPress={() => setIsChecked(!isChecked)}
          >
            {isChecked ? (
              <CheckSquare color={COLORS.primary} size={24} style={styles.checkbox} />
            ) : (
              <Square color={COLORS.textSecondary} size={24} style={styles.checkbox} />
            )}
            <Text style={styles.checkboxLabel}>
              I confirm that I have securely backed up my secret key and understand its importance.
            </Text>
          </Pressable>
          
          <Button
            title="I Understand, Continue"
            disabled={!isChecked}
            onPress={onAcknowledge}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 17, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.md,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 196, 0, 0.1)',
    padding: SIZES.md,
    borderRadius: RADIUS.round,
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.md,
  },
  boldText: {
    color: COLORS.warning,
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: RADIUS.md,
    padding: SIZES.md,
    width: '100%',
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  warningText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: SIZES.xl,
  },
  checkbox: {
    marginRight: SIZES.sm,
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    height: 48,
  },
});
