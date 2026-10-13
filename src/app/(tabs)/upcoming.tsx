import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { LibraryItemRow } from '@/components/library-item-row';
import { AppText } from '@/design-system/app-text';
import { Chip } from '@/design-system/chip';
import { Screen } from '@/design-system/screen';
import { spacing } from '@/design-system/tokens';
import { daysUntil } from '@/domain/attention';
import type { LibraryItem } from '@/domain/library';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

type Range = 0 | 1 | 7 | 15 | 30 | 90;

const ranges: { label: string; value: Range }[] = [
  { label: copy.upcoming.ranges.today, value: 0 },
  { label: copy.upcoming.ranges.tomorrow, value: 1 },
  { label: copy.upcoming.ranges.seven, value: 7 },
  { label: copy.upcoming.ranges.fifteen, value: 15 },
  { label: copy.upcoming.ranges.thirty, value: 30 },
  { label: copy.upcoming.ranges.ninety, value: 90 },
];

function isInRange(days: number, range: Range) {
  if (range === 0 || range === 1) return days === range;
  return days <= range;
}

export default function UpcomingScreen() {
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const futureItems = useMemo<{ days: number; item: LibraryItem }[]>(
    () => [
      ...trackers
        .filter((tracker) => !tracker.archivedAt)
        .map((tracker) => ({ item: { kind: 'tracker' as const, tracker }, days: daysUntil(tracker.milestone.dateValue) })),
      ...actions.flatMap((action) => action.status === 'open' && action.dueDate
        ? [{ item: { kind: 'action' as const, action }, days: daysUntil(action.dueDate) }]
        : []),
    ]
        .filter(({ days }) => days >= 0)
        .sort((a, b) => a.days - b.days),
    [actions, trackers],
  );
  const dataRange = ranges.find(({ value }) => futureItems.some(({ days }) => isInRange(days, value)))?.value ?? 90;
  const range = selectedRange ?? dataRange;
  const upcoming = useMemo(
    () =>
      futureItems
        .filter(({ days }) => isInRange(days, range))
        .map(({ item }) => item),
    [futureItems, range],
  );
  return (
    <Screen header={<PageHeader title={copy.upcoming.title} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
        {ranges.map((option) => (
          <Chip key={option.value} label={option.label} selected={range === option.value} onPress={() => setSelectedRange(option.value)} />
        ))}
      </ScrollView>
      <View style={styles.list}>{upcoming.map((item) => <LibraryItemRow key={`${item.kind}-${item.kind === 'tracker' ? item.tracker.id : item.action.id}`} item={item} />)}</View>
      {upcoming.length === 0 ? <AppText tone="secondary">{copy.upcoming.empty}</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ filterScroll: { marginBottom: spacing[6] }, filters: { flexDirection: 'row', gap: spacing[2] }, list: { gap: spacing[3] } });
