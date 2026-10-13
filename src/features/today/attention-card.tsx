import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronRight, Clock3, Info, Paperclip } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { CategoryIcon } from '@/components/category-icon';
import { Button } from '@/design-system/button';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { addDays, describeTiming, formatDateOnly, getAttentionState, toDateOnly } from '@/domain/attention';
import type { Action, Tracker } from '@/domain/types';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

export function AttentionCard({ action, tracker }: { action: Action; tracker?: Tracker }) {
  const { colors } = useAppTheme();
  const [showWhy, setShowWhy] = useState(false);
  const completeAction = useKeepUpStore((state) => state.completeAction);
  const snoozeAction = useKeepUpStore((state) => state.snoozeAction);
  const date = action.dueDate ?? tracker?.milestone.dateValue;
  const state = tracker ? getAttentionState(tracker) : date && describeTiming(date).toLowerCase().includes('overdue') ? 'overdue' : 'due';
  const context = tracker ? `${tracker.milestone.label} ${date ? describeTiming(date).toLowerCase() : ''}` : date ? describeTiming(date) : copy.today.plannedToday;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable accessibilityLabel={`Open ${action.title}`} accessibilityRole="button" onPress={() => router.push({ pathname: '/action/[id]', params: { id: action.id } })} style={({ pressed }) => [styles.detailsLink, pressed && { opacity: 0.7 }]}>
        <View style={styles.topRow}><StatusBadge state={state} />{date ? <AppText variant="caption" tone="secondary">{formatDateOnly(date)}</AppText> : null}</View>
        <View style={styles.titleRow}><CategoryIcon iconKey={(tracker?.category ?? action.category).icon} colorKey={(tracker?.category ?? action.category).color} size={42} /><View style={styles.copy}><AppText variant="h3">{tracker?.title ?? action.title}</AppText><AppText tone="secondary">{(tracker?.category ?? action.category).name} · {context.charAt(0).toUpperCase() + context.slice(1)}.</AppText></View><ChevronRight color={colors.textTertiary} size={20} /></View>
        {action.source ? <View style={[styles.source, { backgroundColor: colors.surfaceSecondary }]}><Paperclip color={colors.safe} size={17} /><AppText variant="bodySmall" numberOfLines={1} style={styles.sourceName}>{action.source.fileName}</AppText><AppText variant="caption" style={{ color: colors.safe }}>{copy.capture.savedSource}</AppText></View> : null}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showWhy }} onPress={() => setShowWhy((value) => !value)} style={styles.whyButton}><Info color={colors.textSecondary} size={17} /><AppText variant="bodySmall" tone="secondary">{copy.today.whyNow}</AppText></Pressable>
      {showWhy ? <View style={[styles.explanation, { backgroundColor: colors.surfaceSecondary }]}><AppText variant="bodySmall" tone="secondary">{tracker ? copy.today.reminderReason(tracker.reminderPolicy.attentionDays) : copy.today.scheduledReason}</AppText></View> : null}
      <Button label={action.title} onPress={() => completeAction(action.id)} />
      <Button label={copy.today.remindTomorrow} variant="tertiary" icon={<Clock3 color={colors.textSecondary} size={18} />} onPress={() => snoozeAction(action.id, toDateOnly(addDays(new Date(), 1)))} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], gap: spacing[4] }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] }, copy: { flex: 1, gap: spacing[1] },
  detailsLink: { gap: spacing[4] }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  whyButton: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, explanation: { borderRadius: radii.md, padding: spacing[3] },
  source: { minHeight: 44, borderRadius: radii.md, paddingHorizontal: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, sourceName: { flex: 1 },
});
