import { Bell, CheckCircle2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { PageHeader } from '@/components/page-header';
import { TrackerRow } from '@/components/tracker-row';
import { AppText } from '@/design-system/app-text';
import { Screen } from '@/design-system/screen';
import { spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { daysUntil } from '@/domain/attention';
import { AttentionCard, UndoCompletion } from '@/features/today/attention-card';
import { useKeepUpStore } from '@/store/keepup-store';
import { copy } from '@/localization/copy.en';

function getGreeting() {
  const hour = new Date().getHours();
  return hour < 12 ? copy.today.morning : hour < 18 ? copy.today.afternoon : copy.today.evening;
}

export default function TodayScreen() {
  const { colors } = useAppTheme();
  const actions = useKeepUpStore((state) => state.actions);
  const trackers = useKeepUpStore((state) => state.trackers);
  const visibleActions = actions.filter((action) => action.status === 'open' && action.dueDate && daysUntil(action.dueDate) <= 1 && (!action.snoozedUntil || daysUntil(action.snoozedUntil) <= 0));
  const comingUp = [...trackers].filter((tracker) => daysUntil(tracker.milestone.dateValue) > 1).sort((a, b) => daysUntil(a.milestone.dateValue) - daysUntil(b.milestone.dateValue)).slice(0, 2);

  return (
    <Screen footer={<UndoCompletion />}>
      <PageHeader title={getGreeting()} subtitle={visibleActions.length === 0 ? copy.today.allClearSummary : copy.today.attentionSummary(visibleActions.length)} action={<View style={[styles.headerIcon, { backgroundColor: colors.surface }]}><Bell color={colors.textSecondary} size={21} /></View>} />
      {visibleActions.length ? <View style={styles.cardList}>{visibleActions.map((action) => <AttentionCard key={action.id} action={action} tracker={trackers.find((tracker) => tracker.id === action.trackerId)} />)}</View> : <View style={[styles.empty, { backgroundColor: colors.safeSoft }]}><CheckCircle2 color={colors.safe} size={30} /><View style={styles.emptyCopy}><AppText variant="title">{copy.today.allCaughtUp}</AppText><AppText tone="secondary">{copy.today.stillWatching}</AppText></View></View>}
      <View style={styles.section}><AppText variant="h3">{copy.today.comingUp}</AppText><View style={styles.list}>{comingUp.map((tracker) => <TrackerRow key={tracker.id} tracker={tracker} />)}</View></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }, cardList: { gap: spacing[4] },
  empty: { borderRadius: 16, padding: spacing[5], flexDirection: 'row', gap: spacing[3], alignItems: 'center' }, emptyCopy: { flex: 1, gap: spacing[1] },
  section: { marginTop: spacing[8], gap: spacing[4] }, list: { gap: spacing[3] },
});
