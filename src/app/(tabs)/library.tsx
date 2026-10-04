import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { TrackerRow } from '@/components/tracker-row';
import { AppText } from '@/design-system/app-text';
import { Chip } from '@/design-system/chip';
import { Screen } from '@/design-system/screen';
import { spacing } from '@/design-system/tokens';
import type { TrackerCategory } from '@/domain/types';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

type Filter = 'all' | TrackerCategory;
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: copy.library.filters.all }, { value: 'document', label: copy.library.filters.document }, { value: 'purchase', label: copy.library.filters.purchase },
  { value: 'expiry', label: copy.library.filters.expiry }, { value: 'warranty', label: copy.library.filters.warranty }, { value: 'subscription', label: copy.library.filters.subscription }, { value: 'custom', label: copy.library.filters.custom },
];

export default function LibraryScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const trackers = useKeepUpStore((state) => state.trackers);
  const visible = filter === 'all' ? trackers : trackers.filter((tracker) => tracker.category === filter);
  return (
    <Screen>
      <PageHeader title={copy.library.title} subtitle={copy.library.subtitle} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map((item) => <Chip key={item.value} label={item.label} selected={filter === item.value} onPress={() => setFilter(item.value)} />)}</ScrollView>
      <View style={styles.section}><AppText variant="label" tone="secondary">{copy.common.items(visible.length)}</AppText><View style={styles.list}>{visible.map((tracker) => <TrackerRow key={tracker.id} tracker={tracker} />)}</View></View>
    </Screen>
  );
}

const styles = StyleSheet.create({ filters: { gap: spacing[2], paddingRight: spacing[5] }, section: { marginTop: spacing[6], gap: spacing[3] }, list: { gap: spacing[3] } });
