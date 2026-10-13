import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { CategoryIcon } from '@/components/category-icon';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { formatDateOnly, getActionAttentionState } from '@/domain/attention';
import type { Action } from '@/domain/types';

export function ActionRow({ action }: { action: Action }) {
  const { colors } = useAppTheme();
  const state = getActionAttentionState(action);
  const detail = action.dueDate ? `${action.category.name} · ${formatDateOnly(action.dueDate)}` : `${action.category.name} · No due date`;

  return (
    <Pressable accessibilityLabel={`Open ${action.title}. ${detail}`} accessibilityRole="button" onPress={() => router.push({ pathname: '/action/[id]', params: { id: action.id } })} style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.74 : 1 }]}>
      <CategoryIcon iconKey={action.category.icon} colorKey={action.category.color} />
      <View style={styles.main}><View style={styles.titleRow}><AppText variant="title" numberOfLines={1} style={styles.title}>{action.title}</AppText>{state ? <StatusBadge state={state} /> : null}</View><AppText variant="bodySmall" tone="secondary">{detail}</AppText></View>
      <ChevronRight color={colors.textTertiary} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 92, borderRadius: radii.lg, borderWidth: 1, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  main: { flex: 1, gap: spacing[2] },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { flex: 1 },
});
