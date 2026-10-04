import { useState } from 'react';
import { Clock3, Info, RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
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
      <View style={styles.topRow}><StatusBadge state={state} />{date ? <AppText variant="caption" tone="secondary">{formatDateOnly(date, { day: 'numeric', month: 'short' })}</AppText> : null}</View>
      <View style={styles.copy}><AppText variant="h3">{tracker?.title ?? action.title}</AppText><AppText tone="secondary">{context.charAt(0).toUpperCase() + context.slice(1)}.</AppText></View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showWhy }} onPress={() => setShowWhy((value) => !value)} style={styles.whyButton}><Info color={colors.textSecondary} size={17} /><AppText variant="bodySmall" tone="secondary">{copy.today.whyNow}</AppText></Pressable>
      {showWhy ? <View style={[styles.explanation, { backgroundColor: colors.surfaceSecondary }]}><AppText variant="bodySmall" tone="secondary">{tracker ? copy.today.reminderReason(tracker.reminderPolicy.attentionDays) : copy.today.scheduledReason}</AppText></View> : null}
      <Button label={action.title} onPress={() => completeAction(action.id)} />
      <Button label={copy.today.remindTomorrow} variant="tertiary" icon={<Clock3 color={colors.textSecondary} size={18} />} onPress={() => snoozeAction(action.id, toDateOnly(addDays(new Date(), 1)))} />
    </View>
  );
}

export function UndoCompletion() {
  const { colors } = useAppTheme();
  const actionId = useKeepUpStore((state) => state.lastCompletedActionId);
  const undo = useKeepUpStore((state) => state.undoLastCompletion);
  if (!actionId) return null;
  return <View style={[styles.undo, { backgroundColor: colors.textPrimary }]}><AppText variant="bodySmall" style={{ color: colors.background }}>{copy.today.completed}</AppText><Pressable accessibilityRole="button" onPress={undo} style={styles.undoButton}><RotateCcw color={colors.background} size={16} /><AppText variant="label" style={{ color: colors.background }}>{copy.today.undo}</AppText></Pressable></View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], gap: spacing[4] }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] }, copy: { gap: spacing[1] },
  whyButton: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, explanation: { borderRadius: radii.md, padding: spacing[3] },
  undo: { marginHorizontal: spacing[5], marginBottom: spacing[3], minHeight: 52, paddingHorizontal: spacing[4], borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  undoButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingHorizontal: spacing[2] },
});
