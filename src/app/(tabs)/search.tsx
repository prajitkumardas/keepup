import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { LibraryItemRow } from '@/components/library-item-row';
import { AppText } from '@/design-system/app-text';
import { SearchField } from '@/design-system/search-field';
import { Screen } from '@/design-system/screen';
import { spacing } from '@/design-system/tokens';
import { getLibraryItems, libraryItemMatches } from '@/domain/library';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const normalized = query.trim().toLowerCase();
  const results = normalized ? getLibraryItems(trackers, actions).filter((item) => libraryItemMatches(item, normalized)) : [];
  return (
    <Screen header={<PageHeader title={copy.search.title} />}>
      <SearchField accessibilityLabel={copy.search.accessibilityLabel} clearAccessibilityLabel={copy.search.clear} onChangeText={setQuery} placeholder={copy.search.placeholder} value={query} />
      <View style={styles.results}>{normalized ? <><AppText variant="label" tone="secondary">{copy.search.results(results.length)}</AppText>{results.map((item) => <LibraryItemRow key={`${item.kind}-${item.kind === 'tracker' ? item.tracker.id : item.action.id}`} item={item} />)}{results.length === 0 ? <View style={styles.empty}><AppText variant="title">{copy.search.nothingFound}</AppText><AppText tone="secondary">{copy.search.tryAnother}</AppText></View> : null}</> : <View style={styles.empty}><AppText variant="title">{copy.search.promptTitle}</AppText><AppText tone="secondary">{copy.search.promptBody}</AppText></View>}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({ results: { marginTop: spacing[6], gap: spacing[3] }, empty: { paddingTop: spacing[10], alignItems: 'center', gap: spacing[2] } });
