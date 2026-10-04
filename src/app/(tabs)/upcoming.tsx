import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { AppText } from '@/design-system/app-text';
import { Chip } from '@/design-system/chip';
import { Screen } from '@/design-system/screen';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { daysUntil, formatDateOnly } from '@/domain/attention';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

type Range = 30 | 90 | 'all';

export default function UpcomingScreen() {
  const { colors } = useAppTheme();
  const [range, setRange] = useState<Range>(30);
  const trackers = useKeepUpStore((state) => state.trackers);
  const upcoming = [...trackers]
    .filter((tracker) => {
      const days = daysUntil(tracker.milestone.dateValue);
      return days >= 0 && (range === 'all' || days <= range);
    })
    .sort((a, b) => daysUntil(a.milestone.dateValue) - daysUntil(b.milestone.dateValue));
  return (
    <Screen>
      <PageHeader title={copy.upcoming.title} subtitle={copy.upcoming.subtitle} />
      <View style={styles.filters}>
        <Chip label={copy.upcoming.ranges.thirty} selected={range === 30} onPress={() => setRange(30)} />
        <Chip label={copy.upcoming.ranges.ninety} selected={range === 90} onPress={() => setRange(90)} />
        <Chip label={copy.upcoming.ranges.all} selected={range === 'all'} onPress={() => setRange('all')} />
      </View>
      <View style={styles.timeline}>{upcoming.map((tracker, index) => <View key={tracker.id} style={styles.item}><View style={styles.rail}><View style={[styles.dot, { backgroundColor: colors.actionPrimary }]} />{index < upcoming.length - 1 ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}</View><View style={[styles.event, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.date}><CalendarDays color={colors.upcoming} size={18} /><AppText variant="label" style={{ color: colors.upcoming }}>{formatDateOnly(tracker.milestone.dateValue, { day: 'numeric', month: 'short' })}</AppText></View><AppText variant="title">{tracker.title}</AppText><AppText variant="bodySmall" tone="secondary">{tracker.milestone.label}</AppText></View></View>)}</View>
      {upcoming.length === 0 ? <AppText tone="secondary">{copy.upcoming.empty}</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ filters: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[6] }, timeline: { gap: 0 }, item: { flexDirection: 'row', gap: spacing[3] }, rail: { width: 14, alignItems: 'center' }, dot: { width: 10, height: 10, borderRadius: 5, marginTop: spacing[5] }, line: { width: 2, flex: 1, minHeight: 86 }, event: { flex: 1, borderRadius: radii.lg, borderWidth: 1, padding: spacing[4], marginBottom: spacing[3], gap: spacing[1] }, date: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] } });
