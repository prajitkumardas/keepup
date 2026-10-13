import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { radii, spacing } from './tokens';
import { useAppTheme } from './theme';

const SNACKBAR_DURATION_MS = 3000;

interface SnackbarProps {
  actionLabel?: string;
  danger?: boolean;
  duration?: number;
  message: string;
  onAction?: () => void;
  onDismiss: () => void;
}

export function Snackbar({ actionLabel, danger = false, duration = SNACKBAR_DURATION_MS, message, onAction, onDismiss }: SnackbarProps) {
  const { colors } = useAppTheme();
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), duration);
    return () => clearTimeout(timer);
  }, [duration, message]);

  const foreground = danger ? '#FFFFFF' : colors.background;

  return (
    <View accessibilityLiveRegion={danger ? 'assertive' : 'polite'} accessibilityRole="alert" style={[styles.root, { backgroundColor: danger ? colors.overdue : colors.textPrimary }]}>
      <AppText variant="bodySmall" style={[styles.message, { color: foreground }]}>{message}</AppText>
      {actionLabel && onAction ? (
        <Pressable accessibilityLabel={actionLabel} accessibilityRole="button" hitSlop={8} onPress={() => { onAction(); onDismiss(); }} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
          <AppText variant="label" style={{ color: foreground }}>{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { minHeight: 52, marginHorizontal: spacing[5], marginBottom: spacing[3], paddingLeft: spacing[4], paddingRight: spacing[2], borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  message: { flex: 1, paddingVertical: spacing[3] },
  action: { minHeight: 44, paddingHorizontal: spacing[2], alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
});
