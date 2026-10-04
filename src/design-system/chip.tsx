import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './app-text';
import { radii, spacing } from './tokens';
import { useAppTheme } from './theme';

interface ChipProps extends Omit<ComponentProps<typeof Pressable>, 'children'> { label: string; selected?: boolean; }

export function Chip({ label, selected = false, style, ...props }: ChipProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable {...props} accessibilityRole="button" accessibilityState={{ selected }} style={(state) => [styles.base, { backgroundColor: selected ? colors.actionSoft : colors.surface, borderColor: selected ? colors.actionPrimary : colors.border, opacity: state.pressed ? 0.72 : 1 }, typeof style === 'function' ? style(state) : style]}>
      <AppText variant="bodySmall" style={{ color: selected ? colors.actionPrimary : colors.textSecondary, fontWeight: selected ? '600' : '400' }}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({ base: { minHeight: 36, paddingHorizontal: spacing[3], borderRadius: radii.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' } });
