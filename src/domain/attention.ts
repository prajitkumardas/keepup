import type { AttentionState, DateOnly, Tracker } from './types';

const DAY_MS = 86_400_000;
function dateOnlyToEpochDay(value: DateOnly): number { const [year, month, day] = value.split('-').map(Number); return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS); }
export function toDateOnly(date: Date): DateOnly { const year = date.getFullYear(); const month = `${date.getMonth() + 1}`.padStart(2, '0'); const day = `${date.getDate()}`.padStart(2, '0'); return `${year}-${month}-${day}` as DateOnly; }
export function addDays(value: Date, days: number): Date { const next = new Date(value); next.setDate(next.getDate() + days); return next; }
export function daysUntil(value: DateOnly, now = new Date()): number { return dateOnlyToEpochDay(value) - dateOnlyToEpochDay(toDateOnly(now)); }
export function getAttentionState(tracker: Tracker, now = new Date()): AttentionState { if (tracker.archivedAt) return 'closed'; const remaining = daysUntil(tracker.milestone.dateValue, now); if (remaining < 0) return 'overdue'; if (remaining === 0) return 'due'; if (remaining <= tracker.reminderPolicy.attentionDays) return 'needs_attention'; if (remaining <= tracker.reminderPolicy.awarenessDays) return 'upcoming'; return 'safe'; }
export function formatDateOnly(value: DateOnly, options?: Intl.DateTimeFormatOptions): string { const [year, month, day] = value.split('-').map(Number); return new Intl.DateTimeFormat(undefined, options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day)); }
export function describeTiming(value: DateOnly, now = new Date()): string { const remaining = daysUntil(value, now); if (remaining < -1) return `${Math.abs(remaining)} days overdue`; if (remaining === -1) return 'Overdue since yesterday'; if (remaining === 0) return 'Due today'; if (remaining === 1) return 'Due tomorrow'; return `In ${remaining} days`; }
