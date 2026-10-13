export type DateOnly = `${number}-${number}-${number}`;
export type TrackerCategory = 'document' | 'purchase' | 'expiry' | 'warranty' | 'subscription' | 'bill' | 'maintenance' | 'custom';
export type CategoryIconKey = 'check' | 'file-text' | 'pill' | 'shopping-bag' | 'calendar-clock' | 'car' | 'shield-check' | 'wallet-cards' | 'repeat' | 'utensils' | 'house' | 'plane' | 'sparkles' | 'paw-print' | 'tag';
export type CategoryColorKey = 'purple' | 'rose' | 'blue' | 'green' | 'orange' | 'teal' | 'violet' | 'amber' | 'slate';
export interface Category { id: string; userId: string; name: string; normalizedName: string; icon: CategoryIconKey; color?: CategoryColorKey; isCustom: boolean; createdAt: string; updatedAt: string; }
export type AttentionState = 'safe' | 'upcoming' | 'needs_attention' | 'due' | 'overdue' | 'closed';
export type Provenance = 'manual' | 'extracted' | 'imported' | 'generated' | 'recurring';
export interface ReminderPolicy { awarenessDays: number; attentionDays: number; }
export interface Milestone { id: string; label: string; dateValue: DateOnly; provenance: Provenance; }
export type SourceKind = 'scan' | 'document' | 'photo';
export interface SourceAttachment { id: string; storagePath: string; fileName: string; mimeType: string; sizeBytes: number; kind: SourceKind; }
export interface Tracker { id: string; title: string; trackerType: TrackerCategory; category: Category; milestone: Milestone; reminderPolicy: ReminderPolicy; createdAt: string; archivedAt?: string; sourceLabel?: string; source?: SourceAttachment; }
export type ActionStatus = 'open' | 'completed' | 'archived';
export interface Action { id: string; title: string; category: Category; status: ActionStatus; dueDate?: DateOnly; trackerId?: string; snoozedUntil?: DateOnly; completedAt?: string; createdAt: string; source?: SourceAttachment; }
