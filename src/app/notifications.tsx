import { router } from 'expo-router';
import { CheckCircle2, ChevronRight, Clock3 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppText } from '@/design-system/app-text';
import { InnerPageHeader } from '@/components/inner-page-header';
import { Button } from '@/design-system/button';
import { Chip } from '@/design-system/chip';
import { Screen } from '@/design-system/screen';
import { StatusBadge } from '@/design-system/status-badge';
import { radii, spacing } from '@/design-system/tokens';
import { useAppTheme } from '@/design-system/theme';
import { addDays, describeTiming, formatDateOnly, toDateOnly } from '@/domain/attention';
import { getNotificationItems, isAttentionNotification, type NotificationItem } from '@/domain/notifications';
import { copy } from '@/localization/copy.en';
import { useKeepUpStore } from '@/store/keepup-store';

type Filter = 'all' | 'attention' | 'upcoming';

function NotificationCard({ item }: { item: NotificationItem }) {
  const { colors } = useAppTheme();
  const completeAction = useKeepUpStore((state) => state.completeAction);
  const snoozeAction = useKeepUpStore((state) => state.snoozeAction);
  const title = item.kind === 'tracker' ? item.tracker.title : item.action.title;
  const context = item.kind === 'tracker' ? item.tracker.milestone.label : copy.notifications.action;
  const details = `${context} · ${formatDateOnly(item.dateValue)} · ${describeTiming(item.dateValue)}`;

  if (item.kind === 'tracker') {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={copy.notifications.openTracker(title)} onPress={() => router.push({ pathname: '/tracker/[id]', params: { id: item.tracker.id } })} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.72 : 1 }]}>
        <View style={styles.cardHeader}><StatusBadge state={item.state} /><ChevronRight color={colors.textTertiary} size={20} /></View>
        <View style={styles.cardCopy}><AppText variant="title">{title}</AppText><AppText variant="bodySmall" tone="secondary">{details}</AppText></View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}><StatusBadge state={item.state} /><AppText variant="caption" tone="secondary">{copy.notifications.action}</AppText></View>
      <Pressable accessibilityLabel={copy.notifications.openAction(title)} accessibilityRole="button" onPress={() => router.push({ pathname: '/action/[id]', params: { id: item.action.id } })} style={({ pressed }) => [styles.actionDetails, pressed && { opacity: 0.7 }]}><View style={[styles.cardCopy, styles.flex]}><AppText variant="title">{title}</AppText><AppText variant="bodySmall" tone="secondary">{details}</AppText></View><ChevronRight color={colors.textTertiary} size={20} /></Pressable>
      <View style={styles.actions}>
        <Button label={copy.notifications.remindTomorrow} variant="secondary" icon={<Clock3 color={colors.textSecondary} size={17} />} onPress={() => void snoozeAction(item.action.id, toDateOnly(addDays(new Date(), 1)))} style={styles.actionButton} />
        <Button label={copy.notifications.complete} icon={<CheckCircle2 color="#FFFFFF" size={17} />} onPress={() => void completeAction(item.action.id)} style={styles.actionButton} />
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const trackers = useKeepUpStore((state) => state.trackers);
  const actions = useKeepUpStore((state) => state.actions);
  const profile = useKeepUpStore((state) => state.profile);
  const setNotificationDetails = useKeepUpStore((state) => state.setNotificationDetails);
  const notifications = getNotificationItems(trackers, actions);
  const visible = notifications.filter((item) => {
    if (filter === 'all') return true;
    return filter === 'attention' ? isAttentionNotification(item) : item.state === 'upcoming';
  });

  return (
    <Screen>
      <InnerPageHeader title={copy.notifications.title} />

      <View style={styles.filters}>
        <Chip label={copy.notifications.filters.all} selected={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label={copy.notifications.filters.attention} selected={filter === 'attention'} onPress={() => setFilter('attention')} />
        <Chip label={copy.notifications.filters.upcoming} selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
      </View>

      <View style={[styles.privacy, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.flex}><AppText variant="label">{copy.notifications.privacyTitle}</AppText><AppText variant="bodySmall" tone="secondary">{copy.notifications.privacyBody}</AppText></View>
        <Switch accessibilityLabel={copy.notifications.privacyTitle} value={profile.showNotificationDetails} onValueChange={setNotificationDetails} trackColor={{ false: colors.borderStrong, true: colors.actionPrimary }} thumbColor="#FFFFFF" />
      </View>

      <View style={styles.list}>
        {visible.map((item) => <NotificationCard key={`${item.kind}-${item.id}`} item={item} />)}
        {visible.length === 0 ? <View style={[styles.empty, { backgroundColor: colors.safeSoft }]}><CheckCircle2 color={colors.safe} size={30} /><View style={styles.flex}><AppText variant="title">{copy.notifications.emptyTitle}</AppText><AppText tone="secondary">{filter === 'all' ? copy.notifications.emptyBody : copy.notifications.emptyFilter}</AppText></View></View> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: spacing[1] },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  privacy: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], marginTop: spacing[5], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  list: { marginTop: spacing[5], gap: spacing[3] }, card: { borderWidth: 1, borderRadius: radii.lg, padding: spacing[4], gap: spacing[3] }, cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing[3] }, cardCopy: { gap: spacing[1] },
  actions: { flexDirection: 'row', gap: spacing[2] }, actionButton: { flex: 1, paddingHorizontal: spacing[2] },
  actionDetails: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  empty: { borderRadius: radii.lg, padding: spacing[5], flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
});
