import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';

export function InnerPageHeader({ action, title }: { action?: ReactNode; title: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}>
        <ChevronLeft color={colors.textPrimary} size={26} />
      </Pressable>
      <AppText variant="h2" numberOfLines={2} style={styles.title}>{title}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { minHeight: 52, marginBottom: spacing[5], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  back: { width: 48, height: 48, borderRadius: radii.full, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
});
