import { Check, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CategoryIcon, categoryColors } from '@/components/category-icon';
import { InnerPageHeader } from '@/components/inner-page-header';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { Screen } from '@/design-system/screen';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { categoryColorKeys, categoryIconKeys, categoryUsage, inferCategoryAppearance, normalizeCategoryName } from '@/domain/categories';
import type { Category, CategoryColorKey, CategoryIconKey } from '@/domain/types';
import { useKeepUpStore } from '@/store/keepup-store';

type Draft = { name: string; icon: CategoryIconKey; color: CategoryColorKey };

export default function CategoriesScreen() {
  const { colors } = useAppTheme();
  const categories = useKeepUpStore((state) => state.categories);
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const createCategory = useKeepUpStore((state) => state.createCategory);
  const updateCategory = useKeepUpStore((state) => state.updateCategory);
  const deleteCategory = useKeepUpStore((state) => state.deleteCategory);
  const [editing, setEditing] = useState<Category | 'new'>();
  const [draft, setDraft] = useState<Draft>({ name: '', icon: 'tag', color: 'slate' });
  const [formError, setFormError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [deleting, setDeleting] = useState<Category>();
  const other = categories.find((category) => category.normalizedName === 'other');
  const [replacementId, setReplacementId] = useState<string>();

  const openEditor = (category?: Category) => {
    setEditing(category ?? 'new');
    setDraft(category ? { name: category.name, icon: category.icon, color: category.color ?? 'slate' } : { name: '', icon: 'tag', color: 'slate' });
    setFormError(undefined);
  };
  const changeName = (name: string) => {
    setDraft((current) => ({ ...current, name, ...(editing === 'new' ? inferCategoryAppearance(name) : {}) }));
    setFormError(undefined);
  };
  const save = async () => {
    if (!draft.name.trim()) { setFormError('Enter a category name.'); return; }
    const duplicate = categories.find((category) => category.id !== (editing === 'new' ? undefined : editing?.id) && category.normalizedName === normalizeCategoryName(draft.name));
    if (duplicate) { setFormError(`“${duplicate.name}” already exists.`); return; }
    setIsSaving(true);
    const success = editing === 'new' ? Boolean(await createCategory(draft)) : editing ? await updateCategory(editing.id, draft) : false;
    setIsSaving(false);
    if (success) setEditing(undefined);
    else setFormError('KeepUp could not save this category. It may already exist, or you may be offline.');
  };
  const openDelete = (category: Category) => { setDeleting(category); setReplacementId(other?.id ?? categories.find((item) => item.id !== category.id)?.id); };
  const confirmDelete = async () => {
    if (!deleting || !replacementId) return;
    setIsSaving(true);
    const success = await deleteCategory(deleting.id, replacementId);
    setIsSaving(false);
    if (success) setDeleting(undefined);
  };

  return <Screen>
    <InnerPageHeader title="Categories" action={<Pressable accessibilityLabel="Create category" accessibilityRole="button" onPress={() => openEditor()} style={[styles.addButton, { backgroundColor: colors.actionPrimary }]}><Plus color="#FFFFFF" size={22} /></Pressable>} />
    <View style={styles.list}>{categories.map((category) => { const count = categoryUsage(category.id, trackers, actions); return <View key={category.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}><CategoryIcon iconKey={category.icon} colorKey={category.color} /><View style={styles.flex}><AppText variant="title">{category.name}</AppText><AppText variant="bodySmall" tone="secondary">{count} {count === 1 ? 'item' : 'items'} · {category.isCustom ? 'Custom' : 'Built in'}</AppText></View>{category.isCustom ? <View style={styles.rowActions}><Pressable accessibilityLabel={`Edit ${category.name}`} accessibilityRole="button" onPress={() => openEditor(category)} style={styles.iconButton}><Pencil color={colors.textSecondary} size={19} /></Pressable><Pressable accessibilityLabel={`Delete ${category.name}`} accessibilityRole="button" onPress={() => openDelete(category)} style={styles.iconButton}><Trash2 color={colors.overdue} size={19} /></Pressable></View> : <ChevronRight color={colors.textTertiary} size={18} />}</View>; })}</View>

    <Modal animationType="slide" onRequestClose={() => setEditing(undefined)} presentationStyle="pageSheet" visible={Boolean(editing)}><View style={[styles.modal, { backgroundColor: colors.background }]}><View style={[styles.modalHeader, { borderBottomColor: colors.border }]}><View><AppText variant="h2">{editing === 'new' ? 'Create category' : 'Edit category'}</AppText><AppText variant="bodySmall" tone="secondary">Choose a clear name, icon, and color.</AppText></View><Pressable accessibilityLabel="Close category editor" accessibilityRole="button" onPress={() => setEditing(undefined)} style={styles.iconButton}><X color={colors.textPrimary} size={22} /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}><View style={styles.field}><AppText variant="label">Category name</AppText><TextInput accessibilityLabel="Category name" autoCapitalize="words" autoFocus value={draft.name} onChangeText={changeName} placeholder="e.g. Pet" placeholderTextColor={colors.textTertiary} style={[styles.input, { backgroundColor: colors.surface, borderColor: formError ? colors.overdue : colors.borderStrong, color: colors.textPrimary }]} />{formError ? <AppText variant="bodySmall" style={{ color: colors.overdue }}>{formError}</AppText> : null}</View><View style={styles.field}><AppText variant="label">Icon</AppText><View style={styles.options}>{categoryIconKeys.map((item) => <Pressable key={item} accessibilityLabel={`${item} icon`} accessibilityRole="button" accessibilityState={{ selected: draft.icon === item }} onPress={() => setDraft((current) => ({ ...current, icon: item }))} style={[styles.iconOption, { backgroundColor: colors.surface, borderColor: draft.icon === item ? colors.actionPrimary : colors.border }]}><CategoryIcon iconKey={item} colorKey={draft.color} size={40} />{draft.icon === item ? <View style={[styles.check, { backgroundColor: colors.actionPrimary }]}><Check color="#FFFFFF" size={11} /></View> : null}</Pressable>)}</View></View><View style={styles.field}><AppText variant="label">Color</AppText><View style={styles.options}>{categoryColorKeys.map((item) => <Pressable key={item} accessibilityLabel={`${item} color`} accessibilityRole="button" accessibilityState={{ selected: draft.color === item }} onPress={() => setDraft((current) => ({ ...current, color: item }))} style={[styles.colorOption, { backgroundColor: categoryColors[item].background, borderColor: draft.color === item ? colors.textPrimary : colors.border }]}><View style={[styles.colorDot, { backgroundColor: categoryColors[item].foreground }]} />{draft.color === item ? <Check color={categoryColors[item].foreground} size={16} /> : null}</Pressable>)}</View></View><Button disabled={isSaving || !draft.name.trim()} label={isSaving ? 'Saving...' : editing === 'new' ? 'Create category' : 'Save changes'} onPress={() => void save()} /></ScrollView></View></Modal>

    <Modal animationType="fade" onRequestClose={() => setDeleting(undefined)} transparent visible={Boolean(deleting)}><View style={styles.dialogRoot}><Pressable accessibilityLabel="Cancel delete category" accessibilityRole="button" onPress={() => setDeleting(undefined)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} /><View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: colors.surfaceElevated }]}><View style={styles.field}><AppText variant="h3">Delete “{deleting?.name}”?</AppText><AppText tone="secondary">{deleting ? categoryUsage(deleting.id, trackers, actions) : 0} items currently use this category. Choose where to move them.</AppText></View><ScrollView style={styles.replacements} contentContainerStyle={styles.replacementList}>{categories.filter((category) => category.id !== deleting?.id).map((category) => <Pressable key={category.id} accessibilityRole="button" accessibilityState={{ selected: replacementId === category.id }} onPress={() => setReplacementId(category.id)} style={[styles.replacement, { borderColor: replacementId === category.id ? colors.actionPrimary : colors.border }]}><CategoryIcon iconKey={category.icon} colorKey={category.color} size={36} /><AppText variant="label" style={styles.flex}>{category.name}</AppText>{replacementId === category.id ? <Check color={colors.actionPrimary} size={19} /> : null}</Pressable>)}</ScrollView><View style={styles.dialogActions}><Button disabled={isSaving} label="Cancel" onPress={() => setDeleting(undefined)} style={styles.flex} variant="secondary" /><Button disabled={isSaving || !replacementId} label={isSaving ? 'Deleting...' : 'Move and delete'} onPress={() => void confirmDelete()} style={styles.flex} variant="danger" /></View></View></View></Modal>
  </Screen>;
}

const styles = StyleSheet.create({ addButton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 }, list: { gap: spacing[3] }, row: { minHeight: 76, borderWidth: 1, borderRadius: radii.lg, padding: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, rowActions: { flexDirection: 'row' }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, modal: { flex: 1 }, modalHeader: { paddingHorizontal: spacing[5], paddingVertical: spacing[4], paddingTop: spacing[6], borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, form: { padding: spacing[5], gap: spacing[6], paddingBottom: spacing[10] }, field: { gap: spacing[2] }, input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] }, options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }, iconOption: { width: 54, height: 54, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }, check: { position: 'absolute', top: 2, right: 2, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, colorOption: { width: 46, height: 46, borderWidth: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, colorDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7 }, dialogRoot: { flex: 1, justifyContent: 'center', padding: spacing[5] }, dialog: { width: '100%', maxWidth: 440, maxHeight: '80%', alignSelf: 'center', borderRadius: radii.xl, padding: spacing[5], gap: spacing[5] }, replacements: { maxHeight: 280 }, replacementList: { gap: spacing[2] }, replacement: { minHeight: 54, borderWidth: 1, borderRadius: radii.md, padding: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, dialogActions: { flexDirection: 'row', gap: spacing[3] } });
