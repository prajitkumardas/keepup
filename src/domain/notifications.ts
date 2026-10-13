import { daysUntil, getActionAttentionState, getAttentionState } from '@/domain/attention';
import type { Action, AttentionState, DateOnly, Tracker } from '@/domain/types';

export type NotificationItem =
  | { kind: 'action'; id: string; action: Action; dateValue: DateOnly; state: AttentionState }
  | { kind: 'tracker'; id: string; tracker: Tracker; dateValue: DateOnly; state: AttentionState };

const ACTION_LOOKAHEAD_DAYS = 30;

export function getNotificationItems(trackers: Tracker[], actions: Action[], now = new Date()): NotificationItem[] {
  const actionItems = actions.flatMap<NotificationItem>((action) => {
    if (!action.dueDate || action.status !== 'open') return [];
    if (action.snoozedUntil && daysUntil(action.snoozedUntil, now) > 0) return [];
    const remaining = daysUntil(action.dueDate, now);
    const state = getActionAttentionState(action, now);
    if (!state || state === 'closed' || remaining > ACTION_LOOKAHEAD_DAYS) return [];
    return [{ kind: 'action', id: action.id, action, dateValue: action.dueDate, state }];
  });
  const trackerIdsWithActions = new Set(actions.flatMap((action) => action.trackerId && action.dueDate && action.status !== 'archived' ? [action.trackerId] : []));
  const trackerItems = trackers.flatMap<NotificationItem>((tracker) => {
    const state = getAttentionState(tracker, now);
    if (state === 'safe' || state === 'closed' || trackerIdsWithActions.has(tracker.id)) return [];
    return [{ kind: 'tracker', id: tracker.id, tracker, dateValue: tracker.milestone.dateValue, state }];
  });
  return [...actionItems, ...trackerItems].sort((left, right) => daysUntil(left.dateValue, now) - daysUntil(right.dateValue, now));
}

export function isAttentionNotification(item: NotificationItem): boolean {
  return item.state === 'needs_attention' || item.state === 'due' || item.state === 'overdue';
}
