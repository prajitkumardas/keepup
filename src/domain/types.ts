export type DateOnly = `${number}-${number}-${number}`;
export type TrackerCategory = 'document' | 'purchase' | 'expiry' | 'warranty' | 'subscription' | 'bill' | 'maintenance' | 'custom';
export type AttentionState = 'safe' | 'upcoming' | 'needs_attention' | 'due' | 'overdue' | 'closed';
export type Provenance = 'manual' | 'extracted' | 'imported' | 'generated' | 'recurring';
export interface ReminderPolicy { awarenessDays: number; attentionDays: number; }
export interface Milestone { id: string; label: string; dateValue: DateOnly; provenance: Provenance; }
export interface Tracker { id: string; title: string; category: TrackerCategory; milestone: Milestone; reminderPolicy: ReminderPolicy; createdAt: string; archivedAt?: string; sourceLabel?: string; }
export type ActionStatus = 'open' | 'completed' | 'archived';
export interface Action { id: string; title: string; status: ActionStatus; dueDate?: DateOnly; trackerId?: string; snoozedUntil?: DateOnly; completedAt?: string; }
