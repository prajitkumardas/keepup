import type { Action, AttentionState, DateOnly, Tracker } from './types';

const DAY_MS = 86_400_000;
function padDatePart(value: number): string { return `${value}`.padStart(2, '0'); }
function isValidDateParts(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function dateOnlyToEpochDay(value: DateOnly): number { const [year, month, day] = value.split('-').map(Number); return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS); }
export function toDateOnly(date: Date): DateOnly { const year = date.getFullYear(); const month = padDatePart(date.getMonth() + 1); const day = padDatePart(date.getDate()); return `${year}-${month}-${day}` as DateOnly; }
export function dateOnlyToLocalDate(value: DateOnly): Date { const [year, month, day] = value.split('-').map(Number); return new Date(year, month - 1, day); }
export function addDays(value: Date, days: number): Date { const next = new Date(value); next.setDate(next.getDate() + days); return next; }
export function daysUntil(value: DateOnly, now = new Date()): number { return dateOnlyToEpochDay(value) - dateOnlyToEpochDay(toDateOnly(now)); }
export function getAttentionState(tracker: Tracker, now = new Date()): AttentionState { if (tracker.archivedAt) return 'closed'; const remaining = daysUntil(tracker.milestone.dateValue, now); if (remaining < 0) return 'overdue'; if (remaining === 0) return 'due'; if (remaining <= tracker.reminderPolicy.attentionDays) return 'needs_attention'; if (remaining <= tracker.reminderPolicy.awarenessDays) return 'upcoming'; return 'safe'; }
export function getActionAttentionState(action: Action, now = new Date()): AttentionState | undefined {
  if (action.status !== 'open') return 'closed';
  if (!action.dueDate) return undefined;
  const remaining = daysUntil(action.dueDate, now);
  if (remaining < 0) return 'overdue';
  if (remaining === 0) return 'due';
  return 'upcoming';
}
export function isDateOnly(value: string): value is DateOnly {
  const match = value.match(/^(\d{4})-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/);
  return Boolean(match && isValidDateParts(Number(match[1]), Number(match[2]), Number(match[3])));
}
export function parseDateOnlyInput(value: string): DateOnly | undefined {
  const match = value.trim().match(/^([0-2]\d|3[01])-(0[1-9]|1[0-2])-(\d{4})$/);
  if (!match || !isValidDateParts(Number(match[3]), Number(match[2]), Number(match[1]))) return undefined;
  return `${match[3]}-${match[2]}-${match[1]}` as DateOnly;
}
export function formatDateOnly(value: DateOnly): string { const [year, month, day] = value.split('-'); return `${day}-${month}-${year}`; }
export function formatTimestampDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${padDatePart(date.getDate())}-${padDatePart(date.getMonth() + 1)}-${date.getFullYear()}`;
}
export function describeTiming(value: DateOnly, now = new Date()): string { const remaining = daysUntil(value, now); if (remaining < -1) return `${Math.abs(remaining)} days overdue`; if (remaining === -1) return 'Overdue since yesterday'; if (remaining === 0) return 'Due today'; if (remaining === 1) return 'Due tomorrow'; return `In ${remaining} days`; }
