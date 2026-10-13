import { Check, ChevronDown, Plus, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { CategoryIcon, categoryColors } from '@/components/category-icon';
import { AppText } from '@/design-system/app-text';
import { Button } from '@/design-system/button';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { categoryColorKeys, categoryIconKeys, inferCategoryAppearance, normalizeCategoryName } from '@/domain/categories';
import type { Category, CategoryColorKey, CategoryIconKey } from '@/domain/types';

interface CategoryPickerProps {
  categories: Category[];
  label?: string;
  onCreate: (input: { name: string; icon: CategoryIconKey; color: CategoryColorKey }) => Promise<Category | undefined>;
  onSelect: (category: Category) => void;
  recentCategoryIds?: string[];
  selected?: Category;
}

export function CategoryPicker({ categories, label = 'Category', onCreate, onSelect, recentCategoryIds = [], selected }: CategoryPickerProps) {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [icon, setIcon] = useState<CategoryIconKey>('tag');
  const [color, setColor] = useState<CategoryColorKey>('slate');
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const normalizedQuery = normalizeCategoryName(query);
  const matching = categories.filter((category) => category.normalizedName.includes(normalizedQuery));
  const exactMatch = categories.find((category) => category.normalizedName === normalizedQuery);
  const recent = [...new Set(recentCategoryIds)].flatMap((id) => categories.find((category) => category.id === id) ?? []).slice(0, 4);
  const recentIds = new Set(recent.map((category) => category.id));
  const available = matching.filter((category) => !recentIds.has(category.id));

  const openCreate = (name = query) => {
    const trimmed = name.trim();
    const appearance = inferCategoryAppearance(trimmed);
    setDraftName(trimmed);
    setIcon(appearance.icon);
    setColor(appearance.color);
    setError(undefined);
    setIsCreating(true);
  };

  const saveCategory = async () => {
    const normalized = normalizeCategoryName(draftName);
    if (!normalized) { setError('Enter a category name.'); return; }
    const duplicate = categories.find((category) => category.normalizedName === normalized);
    if (duplicate) { setError(`“${duplicate.name}” already exists. Select it instead.`); return; }
    setIsSaving(true);
    const created = await onCreate({ name: draftName.trim(), icon, color });
    setIsSaving(false);
    if (!created) { setError('KeepUp could not create this category. Check your connection and try again.'); return; }
    onSelect(created);
    setVisible(false);
    setIsCreating(false);
    setQuery('');
  };

  const choose = (category: Category) => {
    onSelect(category);
    setVisible(false);
    setQuery('');
  };

  const iconOptions = useMemo(() => categoryIconKeys, []);

  return <>
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <Pressable accessibilityLabel={selected ? `Category ${selected.name}. Change category` : 'Select or create a category'} accessibilityRole="button" onPress={() => setVisible(true)} style={({ pressed }) => [styles.trigger, { backgroundColor: colors.background, borderColor: selected ? colors.actionPrimary : colors.borderStrong, opacity: pressed ? 0.72 : 1 }]}>
        {selected ? <CategoryIcon iconKey={selected.icon} colorKey={selected.color} size={40} /> : <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}><Plus color={colors.textSecondary} size={20} /></View>}
        <View style={styles.flex}><AppText variant={selected ? 'label' : 'body'} tone={selected ? 'primary' : 'secondary'}>{selected?.name ?? 'Select or create a category'}</AppText>{selected ? <AppText variant="caption" style={{ color: colors.actionPrimary }}>{selected.isCustom ? 'Custom category' : 'Selected category'}</AppText> : null}</View>
        <ChevronDown color={colors.textTertiary} size={20} />
      </Pressable>
    </View>

    <Modal animationType="slide" onRequestClose={() => setVisible(false)} presentationStyle="pageSheet" visible={visible}>
      <View style={[styles.modal, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}><View><AppText variant="h2">{isCreating ? 'Create category' : 'Choose category'}</AppText><AppText variant="bodySmall" tone="secondary">{isCreating ? 'Choose a consistent icon and color.' : 'Search existing categories or make your own.'}</AppText></View><Pressable accessibilityLabel="Close category picker" accessibilityRole="button" onPress={() => { setVisible(false); setIsCreating(false); }} style={styles.close}><X color={colors.textPrimary} size={22} /></Pressable></View>
        {isCreating ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.createContent}>
          <View style={styles.field}><AppText variant="label">Category name</AppText><TextInput accessibilityLabel="Category name" autoCapitalize="words" autoFocus value={draftName} onChangeText={(value) => { setDraftName(value); setError(undefined); const appearance = inferCategoryAppearance(value); setIcon(appearance.icon); setColor(appearance.color); }} placeholder="e.g. Pet" placeholderTextColor={colors.textTertiary} style={[styles.input, { backgroundColor: colors.surface, borderColor: error ? colors.overdue : colors.borderStrong, color: colors.textPrimary }]} />{error ? <AppText variant="bodySmall" style={{ color: colors.overdue }}>{error}</AppText> : null}</View>
          <View style={styles.field}><AppText variant="label">Icon</AppText><View style={styles.optionGrid}>{iconOptions.map((item) => <Pressable key={item} accessibilityLabel={`${item} icon`} accessibilityRole="button" accessibilityState={{ selected: icon === item }} onPress={() => setIcon(item)} style={[styles.iconOption, { borderColor: icon === item ? colors.actionPrimary : colors.border, backgroundColor: colors.surface }]}><CategoryIcon iconKey={item} colorKey={color} size={40} />{icon === item ? <View style={[styles.check, { backgroundColor: colors.actionPrimary }]}><Check color="#FFFFFF" size={11} /></View> : null}</Pressable>)}</View></View>
          <View style={styles.field}><AppText variant="label">Color</AppText><View style={styles.colorRow}>{categoryColorKeys.map((item) => <Pressable key={item} accessibilityLabel={`${item} color`} accessibilityRole="button" accessibilityState={{ selected: color === item }} onPress={() => setColor(item)} style={[styles.colorOption, { backgroundColor: categoryColors[item].background, borderColor: color === item ? colors.textPrimary : colors.border }]}><View style={[styles.colorDot, { backgroundColor: categoryColors[item].foreground }]} />{color === item ? <Check color={categoryColors[item].foreground} size={16} /> : null}</Pressable>)}</View></View>
          <View style={styles.createActions}><Button label="Back" variant="secondary" onPress={() => { setIsCreating(false); setError(undefined); }} style={styles.flexButton} /><Button label={isSaving ? 'Creating...' : 'Create category'} disabled={isSaving || !draftName.trim()} onPress={() => void saveCategory()} style={styles.flexButton} /></View>
        </ScrollView> : <>
          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Search color={colors.textTertiary} size={20} /><TextInput accessibilityLabel="Search or create a category" autoCapitalize="words" autoFocus value={query} onChangeText={setQuery} placeholder="Search or create a category" placeholderTextColor={colors.textTertiary} style={[styles.searchInput, { color: colors.textPrimary }]} /></View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.results}>
            {!normalizedQuery && recent.length ? <CategorySection label="Recently used" categories={recent} onChoose={choose} /> : null}
            <CategorySection label={normalizedQuery ? 'Matches' : 'Suggested categories'} categories={available} onChoose={choose} />
            {normalizedQuery && !exactMatch ? <Pressable accessibilityRole="button" onPress={() => openCreate(query)} style={[styles.createRow, { backgroundColor: colors.actionSoft }]}><Plus color={colors.actionPrimary} size={20} /><AppText variant="label" style={{ color: colors.actionPrimary }}>Create “{query.trim()}”</AppText></Pressable> : null}
            {!normalizedQuery ? <Button label="Create new category" icon={<Plus color={colors.actionPrimary} size={18} />} onPress={() => openCreate('')} variant="secondary" /> : null}
            {normalizedQuery && matching.length === 0 ? <AppText variant="bodySmall" tone="secondary" style={styles.empty}>No category matches yet. You can create this as a custom category.</AppText> : null}
          </ScrollView>
        </>}
      </View>
    </Modal>
  </>;
}

function CategorySection({ categories, label, onChoose }: { categories: Category[]; label: string; onChoose: (category: Category) => void }) {
  const { colors } = useAppTheme();
  if (!categories.length) return null;
  return <View style={styles.section}><AppText variant="caption" tone="secondary">{label.toUpperCase()}</AppText>{categories.map((category) => <Pressable key={category.id} accessibilityRole="button" onPress={() => onChoose(category)} style={({ pressed }) => [styles.categoryRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}><CategoryIcon iconKey={category.icon} colorKey={category.color} size={42} /><View style={styles.flex}><AppText variant="label">{category.name}</AppText>{category.isCustom ? <AppText variant="caption" tone="secondary">Custom</AppText> : null}</View></Pressable>)}</View>;
}

const styles = StyleSheet.create({
  field: { gap: spacing[2] }, flex: { flex: 1, gap: 2 }, trigger: { minHeight: 64, borderWidth: 1, borderRadius: radii.md, padding: spacing[3], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, emptyIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1 }, modalHeader: { paddingHorizontal: spacing[5], paddingVertical: spacing[4], paddingTop: spacing[6], borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  search: { margin: spacing[5], marginBottom: 0, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, searchInput: { ...typography.body, flex: 1, minHeight: 50 }, results: { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[10] }, section: { gap: spacing[2] }, categoryRow: { minHeight: 62, borderWidth: 1, borderRadius: radii.md, padding: spacing[2], flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, createRow: { minHeight: 54, borderRadius: radii.md, paddingHorizontal: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, empty: { textAlign: 'center' },
  createContent: { padding: spacing[5], gap: spacing[6], paddingBottom: spacing[10] }, input: { ...typography.body, minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4] }, optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }, iconOption: { width: 54, height: 54, borderWidth: 1, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' }, check: { position: 'absolute', top: 2, right: 2, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }, colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }, colorOption: { width: 46, height: 46, borderWidth: 1, borderRadius: 23, alignItems: 'center', justifyContent: 'center' }, colorDot: { width: 14, height: 14, borderRadius: 7, position: 'absolute' }, createActions: { flexDirection: 'row', gap: spacing[3] }, flexButton: { flex: 1 },
});
