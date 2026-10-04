import { AlertCircle, CalendarClock, CheckCircle2, CircleAlert, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { AttentionState } from '@/domain/types';
import { AppText } from './app-text';
import { radii, spacing } from './tokens';
import { useAppTheme } from './theme';
import { copy } from '@/localization/copy.en';

const labels: Record<AttentionState, string> = copy.status;

export function StatusBadge({ state }: { state: AttentionState }) {
  const { colors } = useAppTheme();
  const color = state === 'safe' || state === 'closed' ? colors.safe : state === 'upcoming' ? colors.upcoming : state === 'needs_attention' ? colors.attention : colors.overdue;
  const backgroundColor = state === 'safe' || state === 'closed' ? colors.safeSoft : state === 'upcoming' ? colors.upcomingSoft : state === 'needs_attention' ? colors.attentionSoft : colors.overdueSoft;
  const Icon = state === 'safe' ? ShieldCheck : state === 'upcoming' ? CalendarClock : state === 'needs_attention' ? CircleAlert : state === 'closed' ? CheckCircle2 : AlertCircle;
  return <View accessibilityLabel={`Status: ${labels[state]}`} style={[styles.badge, { backgroundColor }]}><Icon color={color} size={14} strokeWidth={2} /><AppText variant="caption" style={{ color }}>{labels[state]}</AppText></View>;
}

const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing[1], paddingHorizontal: spacing[2], minHeight: 28, borderRadius: radii.full } });
