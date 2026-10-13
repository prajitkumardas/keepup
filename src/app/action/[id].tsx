import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, History, LockKeyhole, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { InnerPageHeader } from '@/components/inner-page-header';
import { ReminderEditor } from '@/components/reminder-editor';
import { CategoryIcon } from '@/components/category-icon';
import { CategoryPicker } from '@/components/category-picker';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { ConfirmationDialog } from '@/design-system/confirmation-dialog';
import { Screen } from '@/design-system/screen';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { formatDateOnly, formatTimestampDate, getActionAttentionState } from '@/domain/attention';
import type { Category, DateOnly } from '@/domain/types';
import { copy } from '@/localization/copy.en';
import { useKeepUpStore } from '@/store/keepup-store';

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editCategory, setEditCategory] = useState<Category>();
  const action = useKeepUpStore((state) => state.actions.find((item) => item.id === id));
  const categories = useKeepUpStore((state) => state.categories);
  const createCategory = useKeepUpStore((state) => state.createCategory);
  const updateActionDetails = useKeepUpStore((state) => state.updateActionDetails);
  const deleteAction = useKeepUpStore((state) => state.deleteAction);

  if (!action) return <Screen><InnerPageHeader title="Action details" /><View style={styles.notFound}><AppText variant="h2">{copy.action.notFound}</AppText><AppText tone="secondary">{copy.action.notFoundBody}</AppText></View></Screen>;

  const state = getActionAttentionState(action);
  const saveDetails = async (title: string, dueDate?: DateOnly) => {
    setIsSaving(true);
    const saved = await updateActionDetails(action.id, { title, category: editCategory ?? action.category, dueDate });
    setIsSaving(false);
    if (saved) setIsEditing(false);
  };
  const confirmDelete = async () => {
    setIsDeleting(true);
    const deleted = await deleteAction(action.id);
    setIsDeleting(false);
    if (deleted) router.replace('/library');
    else setIsDeleteOpen(false);
  };

  return (
    <Screen>
      <InnerPageHeader title={action.title} />
      <View style={styles.hero}>{state ? <StatusBadge state={state} /> : null}<View style={[styles.categoryChip, { backgroundColor: colors.surface, borderColor: colors.border }]}><CategoryIcon iconKey={action.category.icon} colorKey={action.category.color} size={32} /><AppText variant="label">{action.category.name}</AppText></View></View>

      {isEditing ? (
        <View style={styles.editor}><CategoryPicker categories={categories} onCreate={createCategory} onSelect={setEditCategory} selected={editCategory ?? action.category} /><ReminderEditor dateLabel={copy.action.dueDate} initialDate={action.dueDate} initialTitle={action.title} isSaving={isSaving} onCancel={() => setIsEditing(false)} onSave={(title, dueDate) => void saveDetails(title, dueDate)} /></View>
      ) : (
        <><View style={[styles.dateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><CalendarDays color={colors.actionPrimary} size={24} /><View style={styles.flex}><AppText variant="bodySmall" tone="secondary">{copy.action.dueDate}</AppText><AppText variant="h2">{action.dueDate ? formatDateOnly(action.dueDate) : copy.action.noDueDate}</AppText></View></View><Button icon={<Pencil color={colors.textPrimary} size={17} />} label={copy.itemEditor.edit} onPress={() => { setEditCategory(action.category); setIsEditing(true); }} style={styles.editButton} variant="secondary" /></>
      )}

      <View style={styles.section}><AppText variant="h3">{copy.action.details}</AppText><View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><History color={colors.textSecondary} size={20} /><View style={styles.flex}><AppText variant="label">{copy.action.created}</AppText><AppText variant="bodySmall" tone="secondary">{formatTimestampDate(action.createdAt)}</AppText></View></View></View>
      {action.source ? <View style={styles.section}><AppText variant="h3">{copy.action.source}</AppText><View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><LockKeyhole color={colors.safe} size={21} /><View style={styles.flex}><AppText variant="label" numberOfLines={1}>{action.source.fileName}</AppText><AppText variant="bodySmall" tone="secondary">{copy.capture.savedSource}</AppText></View></View></View> : null}

      <View style={styles.dangerZone}><Button icon={<Trash2 color="#FFFFFF" size={17} />} label={copy.itemEditor.delete} onPress={() => setIsDeleteOpen(true)} variant="danger" /></View>
      <ConfirmationDialog cancelLabel={copy.common.cancel} confirmLabel={isDeleting ? copy.itemEditor.deleting : copy.itemEditor.delete} isConfirming={isDeleting} message={copy.itemEditor.deleteActionMessage} onCancel={() => setIsDeleteOpen(false)} onConfirm={() => void confirmDelete()} title={copy.itemEditor.deleteTitle} visible={isDeleteOpen} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing[3], marginBottom: spacing[6] },
  flex: { flex: 1 },
  dateCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  editButton: { marginTop: spacing[3] },
  section: { marginTop: spacing[8], gap: spacing[3] },
  detailCard: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  dangerZone: { marginTop: spacing[10] },
  notFound: { paddingTop: spacing[16], gap: spacing[2], alignItems: 'center' },
  categoryChip: { alignSelf: 'flex-start', minHeight: 40, borderWidth: 1, borderRadius: radii.full, paddingRight: spacing[3], paddingLeft: spacing[1], flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, editor: { gap: spacing[4] },
});
