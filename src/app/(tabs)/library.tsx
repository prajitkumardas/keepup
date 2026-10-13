import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/category-icon';
import { PageHeader } from '@/components/page-header';
import { LibraryItemRow } from '@/components/library-item-row';
import { AppText } from '@/design-system/app-text';
import { Chip } from '@/design-system/chip';
import { SearchField } from '@/design-system/search-field';
import { Screen } from '@/design-system/screen';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { getLibraryItems, libraryItemMatches } from '@/domain/library';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

export default function LibraryScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const categories = useKeepUpStore((state) => state.categories);
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const items = useMemo(() => getLibraryItems(trackers, actions), [actions, trackers]);
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const id = item.kind === 'tracker' ? item.tracker.category.id : item.action.category.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [items]);
  const relevantCategories = [...categories].filter((category) => categoryCounts.has(category.id)).sort((left, right) => (categoryCounts.get(right.id) ?? 0) - (categoryCounts.get(left.id) ?? 0) || left.name.localeCompare(right.name));
  const primaryCategories = relevantCategories.slice(0, 4);
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const activeCategoryId = selectedCategory?.id;
  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(
    () => items.filter((item) => {
      const itemCategoryId = item.kind === 'tracker' ? item.tracker.category.id : item.action.category.id;
      return (!activeCategoryId || itemCategoryId === activeCategoryId) && (!normalizedQuery || libraryItemMatches(item, normalizedQuery));
    }),
    [activeCategoryId, items, normalizedQuery],
  );
  const chooseCategory = (id?: string) => { setCategoryId(id); setShowAllCategories(false); };
  return (
    <Screen header={<PageHeader title={copy.library.title} />}>
      <View style={styles.search}><SearchField accessibilityLabel={copy.search.accessibilityLabel} clearAccessibilityLabel={copy.search.clear} onChangeText={setQuery} placeholder={copy.search.placeholder} value={query} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}><Chip label="All" selected={!activeCategoryId} onPress={() => setCategoryId(undefined)} />{primaryCategories.map((category) => <Chip key={category.id} label={category.name} selected={activeCategoryId === category.id} onPress={() => setCategoryId(category.id)} />)}{categories.length > primaryCategories.length ? <Chip label={selectedCategory && !primaryCategories.some((item) => item.id === selectedCategory.id) ? selectedCategory.name : 'More'} selected={Boolean(selectedCategory && !primaryCategories.some((item) => item.id === selectedCategory.id))} onPress={() => setShowAllCategories(true)} /> : null}</ScrollView>
      <View style={styles.section}><AppText variant="label" tone="secondary">{copy.common.items(visible.length)}</AppText><View style={styles.list}>{visible.map((item) => <LibraryItemRow key={`${item.kind}-${item.kind === 'tracker' ? item.tracker.id : item.action.id}`} item={item} />)}{visible.length === 0 ? <View style={styles.empty}><AppText variant="title">{normalizedQuery ? copy.search.nothingFound : 'No items here yet'}</AppText><AppText tone="secondary">{normalizedQuery ? copy.search.tryAnother : 'Choose another category or add something to KeepUp.'}</AppText></View> : null}</View></View>
      <Modal animationType="slide" onRequestClose={() => setShowAllCategories(false)} presentationStyle="pageSheet" visible={showAllCategories}><View style={[styles.modal, { backgroundColor: colors.background }]}><View style={[styles.modalHeader, { borderBottomColor: colors.border }]}><View><AppText variant="h2">All categories</AppText><AppText variant="bodySmall" tone="secondary">Filter your Library by category.</AppText></View><Pressable accessibilityLabel="Close categories" accessibilityRole="button" onPress={() => setShowAllCategories(false)} style={styles.close}><X color={colors.textPrimary} size={22} /></Pressable></View><ScrollView contentContainerStyle={styles.modalList}><Pressable accessibilityRole="button" onPress={() => chooseCategory()} style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: !activeCategoryId ? colors.actionPrimary : colors.border }]}><View style={[styles.allIcon, { backgroundColor: colors.actionSoft }]}><AppText variant="label" style={{ color: colors.actionPrimary }}>All</AppText></View><AppText variant="label" style={styles.flex}>All categories</AppText><AppText variant="bodySmall" tone="secondary">{items.length}</AppText></Pressable>{categories.map((category) => <Pressable key={category.id} accessibilityRole="button" onPress={() => chooseCategory(category.id)} style={[styles.categoryRow, { backgroundColor: colors.surface, borderColor: activeCategoryId === category.id ? colors.actionPrimary : colors.border }]}><CategoryIcon iconKey={category.icon} colorKey={category.color} size={42} /><AppText variant="label" style={styles.flex}>{category.name}</AppText><AppText variant="bodySmall" tone="secondary">{categoryCounts.get(category.id) ?? 0}</AppText></Pressable>)}</ScrollView></View></Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({ search: { marginBottom: spacing[4] }, filters: { gap: spacing[2], paddingRight: spacing[5] }, section: { marginTop: spacing[6], gap: spacing[3] }, list: { gap: spacing[3] }, empty: { paddingVertical: spacing[10], alignItems: 'center', gap: spacing[2] }, modal: { flex: 1 }, modalHeader: { paddingHorizontal: spacing[5], paddingVertical: spacing[4], paddingTop: spacing[6], borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, modalList: { padding: spacing[5], gap: spacing[2], paddingBottom: spacing[10] }, categoryRow: { minHeight: 62, padding: spacing[2], borderWidth: 1, borderRadius: radii.md, flexDirection: 'row', alignItems: 'center', gap: spacing[3] }, allIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, flex: { flex: 1 } });
