import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { Button } from './button';
import { radii, spacing } from './tokens';
import { useAppTheme } from './theme';

interface ConfirmationDialogProps {
  cancelLabel: string;
  confirmLabel: string;
  isConfirming?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  visible: boolean;
}

export function ConfirmationDialog({ cancelLabel, confirmLabel, isConfirming = false, message, onCancel, onConfirm, title, visible }: ConfirmationDialogProps) {
  const { colors } = useAppTheme();
  const close = () => { if (!isConfirming) onCancel(); };

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View style={styles.root}>
        <Pressable accessibilityLabel={cancelLabel} accessibilityRole="button" onPress={close} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
        <View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: colors.surfaceElevated }]}>
          <View style={styles.copy}>
            <AppText variant="h3">{title}</AppText>
            <AppText tone="secondary">{message}</AppText>
          </View>
          <View style={styles.actions}>
            <Button disabled={isConfirming} label={cancelLabel} onPress={onCancel} style={styles.action} variant="secondary" />
            <Button disabled={isConfirming} label={confirmLabel} onPress={onConfirm} style={styles.action} variant="danger" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: spacing[5] },
  dialog: { width: '100%', maxWidth: 440, alignSelf: 'center', borderRadius: radii.xl, padding: spacing[5], gap: spacing[5] },
  copy: { gap: spacing[2] },
  actions: { flexDirection: 'row', gap: spacing[3] },
  action: { flex: 1 },
});
