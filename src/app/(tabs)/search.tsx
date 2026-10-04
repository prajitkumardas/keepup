import { Search, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { TrackerRow } from '@/components/tracker-row';
import { AppText } from '@/design-system/app-text';
import { Screen } from '@/design-system/screen';
import { radii, spacing, typography } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { useKeepUpStore } from '@/store/keepup-store';
import { useState } from 'react';
import { copy } from '@/localization/copy.en';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const trackers = useKeepUpStore((state) => state.trackers);
  const normalized = query.trim().toLowerCase();
  const results = normalized ? trackers.filter((tracker) => [tracker.title, tracker.category, tracker.milestone.label, tracker.sourceLabel ?? ''].some((value) => value.toLowerCase().includes(normalized))) : [];
  return (
    <Screen>
      <PageHeader title={copy.search.title} subtitle={copy.search.subtitle} />
      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><Search color={colors.textTertiary} size={21} /><TextInput accessibilityLabel={copy.search.accessibilityLabel} value={query} onChangeText={setQuery} placeholder={copy.search.placeholder} placeholderTextColor={colors.textTertiary} style={[styles.input, { color: colors.textPrimary }]} autoCapitalize="none" returnKeyType="search" />{query ? <Pressable accessibilityRole="button" accessibilityLabel={copy.search.clear} onPress={() => setQuery('')} style={styles.clear}><X color={colors.textSecondary} size={19} /></Pressable> : null}</View>
      <View style={styles.results}>{normalized ? <><AppText variant="label" tone="secondary">{copy.search.results(results.length)}</AppText>{results.map((tracker) => <TrackerRow key={tracker.id} tracker={tracker} />)}{results.length === 0 ? <View style={styles.empty}><AppText variant="title">{copy.search.nothingFound}</AppText><AppText tone="secondary">{copy.search.tryAnother}</AppText></View> : null}</> : <View style={styles.empty}><AppText variant="title">{copy.search.promptTitle}</AppText><AppText tone="secondary">{copy.search.promptBody}</AppText></View>}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({ search: { minHeight: 52, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing[4], flexDirection: 'row', alignItems: 'center', gap: spacing[2] }, input: { ...typography.body, flex: 1, minHeight: 50, paddingVertical: 0 }, clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, results: { marginTop: spacing[6], gap: spacing[3] }, empty: { paddingTop: spacing[10], alignItems: 'center', gap: spacing[2] } });
