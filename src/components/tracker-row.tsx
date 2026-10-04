import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { formatDateOnly, getAttentionState } from '@/domain/attention';
import type { Tracker } from '@/domain/types';

export function TrackerRow({ tracker }: { tracker: Tracker }) {
  const { colors } = useAppTheme();
  const state = getAttentionState(tracker);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${tracker.title}`} onPress={() => router.push({ pathname: '/tracker/[id]', params: { id: tracker.id } })} style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.74 : 1 }]}>
      <View style={styles.main}><View style={styles.titleRow}><AppText variant="title" numberOfLines={1} style={styles.title}>{tracker.title}</AppText><StatusBadge state={state} /></View><AppText variant="bodySmall" tone="secondary">{tracker.milestone.label} {formatDateOnly(tracker.milestone.dateValue, { day: 'numeric', month: 'short', year: 'numeric' })}</AppText></View>
      <ChevronRight color={colors.textTertiary} size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({ row: { minHeight: 92, borderRadius: radii.lg, borderWidth: 1, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, main: { flex: 1, gap: spacing[2] }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, title: { flex: 1 } });
