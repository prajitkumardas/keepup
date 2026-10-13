import { formatDateOnly } from '@/domain/attention';
import type { Action, Tracker } from '@/domain/types';

export type LibraryItem =
  | { kind: 'action'; action: Action }
  | { kind: 'tracker'; tracker: Tracker };

export function getLibraryItems(trackers: Tracker[], actions: Action[]): LibraryItem[] {
  return [
    ...trackers.map((tracker): LibraryItem => ({ kind: 'tracker', tracker })),
    ...actions.map((action): LibraryItem => ({ kind: 'action', action })),
  ].sort((left, right) => {
    const leftCreatedAt = left.kind === 'tracker' ? left.tracker.createdAt : left.action.createdAt;
    const rightCreatedAt = right.kind === 'tracker' ? right.tracker.createdAt : right.action.createdAt;
    return Date.parse(rightCreatedAt) - Date.parse(leftCreatedAt);
  });
}

export function libraryItemMatches(item: LibraryItem, normalizedQuery: string): boolean {
  const searchable = item.kind === 'tracker'
    ? [item.tracker.title, item.tracker.category.name, item.tracker.trackerType, item.tracker.milestone.label, formatDateOnly(item.tracker.milestone.dateValue), item.tracker.sourceLabel ?? '']
    : [item.action.title, item.action.category.name, 'action', item.action.status, item.action.dueDate ? formatDateOnly(item.action.dueDate) : '', item.action.source?.fileName ?? ''];
  return searchable.some((value) => value.toLowerCase().includes(normalizedQuery));
}
