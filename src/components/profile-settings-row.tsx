import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';

interface ProfileSettingsRowProps {
  destructive?: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
}

export function ProfileSettingsRow({ destructive = false, icon, label, onPress, showDivider = true }: ProfileSettingsRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityHint={`Opens ${label}`}
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={styles.icon}>{icon}</View>
      <AppText variant="bodyLarge" numberOfLines={2} style={[styles.label, destructive && { color: colors.overdue }]}>{label}</AppText>
      <ChevronRight accessibilityElementsHidden color={colors.textTertiary} importantForAccessibility="no-hide-descendants" size={20} />
      {showDivider ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, paddingHorizontal: spacing[4], paddingVertical: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  icon: { width: 24, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
  divider: { position: 'absolute', height: 1, left: 52, right: spacing[4], bottom: 0 },
});
