import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BellRing, CalendarDays, FileCheck2, History, LockKeyhole } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { Screen } from '@/design-system/screen';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { describeTiming, formatDateOnly, getAttentionState } from '@/domain/attention';
import { useKeepUpStore } from '@/store/keepup-store';
import { Chip } from '@/design-system/chip';
import { copy } from '@/localization/copy.en';

export default function TrackerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const tracker = useKeepUpStore((state) => state.trackers.find((item) => item.id === id));
  const updateReminder = useKeepUpStore((state) => state.updateReminder);

  if (!tracker) return <Screen><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><ArrowLeft color={colors.textPrimary} size={22} /><AppText variant="label">{copy.common.back}</AppText></Pressable><View style={styles.notFound}><AppText variant="h2">{copy.tracker.notFound}</AppText><AppText tone="secondary">{copy.tracker.notFoundBody}</AppText></View></Screen>;

  const state = getAttentionState(tracker);
  return (
    <Screen>
      <Pressable accessibilityRole="button" accessibilityLabel={copy.common.goBack} onPress={() => router.back()} style={styles.back}><ArrowLeft color={colors.textPrimary} size={22} /><AppText variant="label">{copy.common.back}</AppText></Pressable>
      <View style={styles.hero}><StatusBadge state={state} /><AppText variant="h1">{tracker.title}</AppText><AppText variant="bodyLarge" tone="secondary">{tracker.category.charAt(0).toUpperCase() + tracker.category.slice(1)}</AppText></View>
      <View style={[styles.dateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><CalendarDays color={colors.actionPrimary} size={24} /><View style={styles.flex}><AppText variant="bodySmall" tone="secondary">{tracker.milestone.label}</AppText><AppText variant="h2">{formatDateOnly(tracker.milestone.dateValue)}</AppText><AppText variant="bodySmall" style={{ color: state === 'safe' ? colors.safe : colors.attention }}>{describeTiming(tracker.milestone.dateValue)}</AppText></View></View>
      <View style={styles.section}><AppText variant="h3">{copy.tracker.whyNow}</AppText><View style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary }]}><BellRing color={colors.attention} size={21} /><AppText tone="secondary" style={styles.flex}>{copy.tracker.reminderExplanation(tracker.reminderPolicy.attentionDays, tracker.reminderPolicy.awarenessDays)}</AppText></View>{isEditingReminder ? <View style={[styles.reminderEditor, { backgroundColor: colors.surface, borderColor: colors.border }]}><AppText variant="label">{copy.tracker.reminderLeadTime}</AppText><View style={styles.reminderOptions}>{[7, 30, 90].map((days) => <Chip key={days} label={`${days} days`} selected={tracker.reminderPolicy.attentionDays === days} onPress={() => updateReminder(tracker.id, days)} />)}</View><Button label={copy.tracker.doneEditing} variant="secondary" onPress={() => setIsEditingReminder(false)} /></View> : <Button label={copy.tracker.editReminder} variant="secondary" onPress={() => setIsEditingReminder(true)} />}</View>
      <View style={styles.section}><AppText variant="h3">{copy.tracker.timeline}</AppText><View style={[styles.timeline, { borderColor: colors.border }]}><View style={styles.timelineItem}><View style={[styles.timelineIcon, { backgroundColor: colors.actionSoft }]}><FileCheck2 color={colors.actionPrimary} size={18} /></View><View><AppText variant="label">{tracker.milestone.label}</AppText><AppText variant="bodySmall" tone="secondary">{formatDateOnly(tracker.milestone.dateValue)}</AppText></View></View><View style={styles.timelineItem}><View style={[styles.timelineIcon, { backgroundColor: colors.surfaceSecondary }]}><History color={colors.textSecondary} size={18} /></View><View><AppText variant="label">{copy.tracker.added}</AppText><AppText variant="bodySmall" tone="secondary">{new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(tracker.createdAt))}</AppText></View></View></View></View>
      {tracker.sourceLabel ? <View style={styles.section}><AppText variant="h3">{copy.tracker.source}</AppText><View style={[styles.source, { backgroundColor: colors.surface, borderColor: colors.border }]}><LockKeyhole color={colors.safe} size={22} /><View style={styles.flex}><AppText variant="label">{tracker.sourceLabel}</AppText><AppText variant="bodySmall" tone="secondary">{copy.tracker.sourceDescription(tracker.milestone.provenance)}</AppText></View></View></View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[5] }, hero: { gap: spacing[2], marginBottom: spacing[6] },
  dateCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], flexDirection: 'row', alignItems: 'flex-start', gap: spacing[4] }, flex: { flex: 1 },
  section: { marginTop: spacing[8], gap: spacing[3] }, infoCard: { borderRadius: radii.md, padding: spacing[4], flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  timeline: { borderLeftWidth: 2, marginLeft: spacing[3], paddingLeft: spacing[5], gap: spacing[5] }, timelineItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, timelineIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  source: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, notFound: { paddingTop: spacing[16], gap: spacing[2], alignItems: 'center' },
  reminderEditor: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], gap: spacing[3] }, reminderOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
});
