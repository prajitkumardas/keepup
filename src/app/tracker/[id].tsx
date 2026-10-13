import { router, useLocalSearchParams } from 'expo-router';
import { BellRing, CalendarDays, FileCheck2, History, LockKeyhole, Pencil, Trash2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { ConfirmationDialog } from '@/design-system/confirmation-dialog';
import { Screen } from '@/design-system/screen';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { describeTiming, formatDateOnly, formatTimestampDate, getAttentionState } from '@/domain/attention';
import { useKeepUpStore } from '@/store/keepup-store';
import { Chip } from '@/design-system/chip';
import { copy } from '@/localization/copy.en';
import { ReminderEditor } from '@/components/reminder-editor';
import { InnerPageHeader } from '@/components/inner-page-header';
import { CategoryIcon } from '@/components/category-icon';
import { CategoryPicker } from '@/components/category-picker';
import type { Category } from '@/domain/types';

export default function TrackerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editCategory, setEditCategory] = useState<Category>();
  const tracker = useKeepUpStore((state) => state.trackers.find((item) => item.id === id));
  const categories = useKeepUpStore((state) => state.categories);
  const createCategory = useKeepUpStore((state) => state.createCategory);
  const updateReminder = useKeepUpStore((state) => state.updateReminder);
  const updateTrackerDetails = useKeepUpStore((state) => state.updateTrackerDetails);
  const deleteTracker = useKeepUpStore((state) => state.deleteTracker);

  if (!tracker) return <Screen><InnerPageHeader title="Tracker details" /><View style={styles.notFound}><AppText variant="h2">{copy.tracker.notFound}</AppText><AppText tone="secondary">{copy.tracker.notFoundBody}</AppText></View></Screen>;

  const state = getAttentionState(tracker);
  const saveDetails = async (title: string, date = tracker.milestone.dateValue) => {
    setIsSaving(true);
    const saved = await updateTrackerDetails(tracker.id, { title, category: editCategory ?? tracker.category, dateValue: date });
    setIsSaving(false);
    if (saved) setIsEditingDetails(false);
  };
  const confirmDelete = async () => {
    setIsDeleting(true);
    const deleted = await deleteTracker(tracker.id);
    setIsDeleting(false);
    if (deleted) router.replace('/library');
    else setIsDeleteOpen(false);
  };

  return (
    <Screen>
      <InnerPageHeader title={tracker.title} />
      <View style={styles.hero}><StatusBadge state={state} /><View style={[styles.categoryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}><CategoryIcon iconKey={tracker.category.icon} colorKey={tracker.category.color} size={32} /><AppText variant="label">{tracker.category.name}</AppText></View></View>
      {isEditingDetails ? (
        <View style={styles.editor}><CategoryPicker categories={categories} onCreate={createCategory} onSelect={setEditCategory} selected={editCategory ?? tracker.category} /><ReminderEditor dateLabel={copy.capture.trackerDate} dateRequired initialDate={tracker.milestone.dateValue} initialTitle={tracker.title} isSaving={isSaving} onCancel={() => setIsEditingDetails(false)} onSave={(title, date) => { if (date) void saveDetails(title, date); }} /></View>
      ) : (
        <><View style={[styles.dateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><CalendarDays color={colors.actionPrimary} size={24} /><View style={styles.flex}><AppText variant="bodySmall" tone="secondary">{tracker.milestone.label}</AppText><AppText variant="h2">{formatDateOnly(tracker.milestone.dateValue)}</AppText><AppText variant="bodySmall" style={{ color: state === 'safe' ? colors.safe : colors.attention }}>{describeTiming(tracker.milestone.dateValue)}</AppText></View></View><Button icon={<Pencil color={colors.textPrimary} size={17} />} label={copy.itemEditor.edit} onPress={() => { setEditCategory(tracker.category); setIsEditingDetails(true); }} style={styles.editButton} variant="secondary" /></>
      )}
      <View style={styles.section}><AppText variant="h3">{copy.tracker.whyNow}</AppText><View style={[styles.infoCard, { backgroundColor: colors.surfaceSecondary }]}><BellRing color={colors.attention} size={21} /><AppText tone="secondary" style={styles.flex}>{copy.tracker.reminderExplanation(tracker.reminderPolicy.attentionDays, tracker.reminderPolicy.awarenessDays)}</AppText></View>{isEditingReminder ? <View style={[styles.reminderEditor, { backgroundColor: colors.surface, borderColor: colors.border }]}><AppText variant="label">{copy.tracker.reminderLeadTime}</AppText><View style={styles.reminderOptions}>{[7, 30, 90].map((days) => <Chip key={days} label={`${days} days`} selected={tracker.reminderPolicy.attentionDays === days} onPress={() => updateReminder(tracker.id, days)} />)}</View><Button label={copy.tracker.doneEditing} variant="secondary" onPress={() => setIsEditingReminder(false)} /></View> : <Button label={copy.tracker.editReminder} variant="secondary" onPress={() => setIsEditingReminder(true)} />}</View>
      <View style={styles.section}><AppText variant="h3">{copy.tracker.timeline}</AppText><View style={[styles.timeline, { borderColor: colors.border }]}><View style={styles.timelineItem}><View style={[styles.timelineIcon, { backgroundColor: colors.actionSoft }]}><FileCheck2 color={colors.actionPrimary} size={18} /></View><View><AppText variant="label">{tracker.milestone.label}</AppText><AppText variant="bodySmall" tone="secondary">{formatDateOnly(tracker.milestone.dateValue)}</AppText></View></View><View style={styles.timelineItem}><View style={[styles.timelineIcon, { backgroundColor: colors.surfaceSecondary }]}><History color={colors.textSecondary} size={18} /></View><View><AppText variant="label">{copy.tracker.added}</AppText><AppText variant="bodySmall" tone="secondary">{formatTimestampDate(tracker.createdAt)}</AppText></View></View></View></View>
      {tracker.sourceLabel ? <View style={styles.section}><AppText variant="h3">{copy.tracker.source}</AppText><View style={[styles.source, { backgroundColor: colors.surface, borderColor: colors.border }]}><LockKeyhole color={colors.safe} size={22} /><View style={styles.flex}><AppText variant="label">{tracker.sourceLabel}</AppText><AppText variant="bodySmall" tone="secondary">{copy.tracker.sourceDescription(tracker.milestone.provenance)}</AppText></View></View></View> : null}
      <View style={styles.dangerZone}><Button icon={<Trash2 color="#FFFFFF" size={17} />} label={copy.itemEditor.delete} onPress={() => setIsDeleteOpen(true)} variant="danger" /></View>
      <ConfirmationDialog cancelLabel={copy.common.cancel} confirmLabel={isDeleting ? copy.itemEditor.deleting : copy.itemEditor.delete} isConfirming={isDeleting} message={copy.itemEditor.deleteTrackerMessage} onCancel={() => setIsDeleteOpen(false)} onConfirm={() => void confirmDelete()} title={copy.itemEditor.deleteTitle} visible={isDeleteOpen} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing[2], marginBottom: spacing[6] },
  dateCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], flexDirection: 'row', alignItems: 'flex-start', gap: spacing[4] }, flex: { flex: 1 },
  section: { marginTop: spacing[8], gap: spacing[3] }, infoCard: { borderRadius: radii.md, padding: spacing[4], flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  timeline: { borderLeftWidth: 2, marginLeft: spacing[3], paddingLeft: spacing[5], gap: spacing[5] }, timelineItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, timelineIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  source: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, notFound: { paddingTop: spacing[16], gap: spacing[2], alignItems: 'center' },
  reminderEditor: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], gap: spacing[3] }, reminderOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  editButton: { marginTop: spacing[3] }, dangerZone: { marginTop: spacing[10] },
  categoryChip: { alignSelf: 'flex-start', minHeight: 40, borderWidth: 1, borderRadius: radii.full, paddingRight: spacing[3], paddingLeft: spacing[1], flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, editor: { gap: spacing[4] },
});
