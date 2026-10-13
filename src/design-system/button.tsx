import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './app-text';
import { radii, spacing } from './tokens';
import { useAppTheme } from './theme';

interface ButtonProps extends Omit<ComponentProps<typeof Pressable>, 'children'> { label: string; variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'; icon?: ReactNode; }

export function Button({ label, variant = 'primary', icon, disabled, onPress, style, ...props }: ButtonProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={disabled}
      onPress={(event) => { void Haptics.selectionAsync(); onPress?.(event); }}
      style={(state) => [
        styles.base,
        variant === 'primary' && { backgroundColor: state.pressed ? colors.actionPrimaryPressed : colors.actionPrimary },
        variant === 'secondary' && { backgroundColor: state.pressed ? colors.surfaceSecondary : colors.surface, borderColor: colors.borderStrong, borderWidth: 1 },
        variant === 'tertiary' && { backgroundColor: state.pressed ? colors.actionSoft : 'transparent' },
        variant === 'danger' && { backgroundColor: colors.overdue, opacity: state.pressed ? 0.8 : 1 },
        disabled && { opacity: 0.45 },
        typeof style === 'function' ? style(state) : style,
      ]}>
      <View style={styles.content}>{icon}<AppText variant="label" style={{ color: variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.textPrimary }}>{label}</AppText></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: radii.md, paddingHorizontal: spacing[4], alignItems: 'center', justifyContent: 'center' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
});
