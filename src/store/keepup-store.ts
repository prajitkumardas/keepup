import { create } from 'zustand';
import { initialActions, initialTrackers } from '@/data/seed';
import type { Action, DateOnly, Tracker, TrackerCategory } from '@/domain/types';

interface AddTrackerInput { title: string; category: TrackerCategory; dateValue: DateOnly; }
interface AddActionInput { title: string; dueDate?: DateOnly; }
interface KeepUpState {
  actions: Action[]; trackers: Tracker[]; lastCompletedActionId?: string;
  completeAction: (actionId: string) => void; undoLastCompletion: () => void; snoozeAction: (actionId: string, until: DateOnly) => void;
  addTracker: (input: AddTrackerInput) => string; addAction: (input: AddActionInput) => string; updateReminder: (trackerId: string, attentionDays: number) => void;
}

export const useKeepUpStore = create<KeepUpState>((set) => ({
  actions: initialActions,
  trackers: initialTrackers,
  completeAction: (actionId) => set((state) => ({ actions: state.actions.map((action) => action.id === actionId ? { ...action, status: 'completed', completedAt: new Date().toISOString() } : action), lastCompletedActionId: actionId })),
  undoLastCompletion: () => set((state) => state.lastCompletedActionId ? ({ actions: state.actions.map((action) => action.id === state.lastCompletedActionId ? { ...action, status: 'open', completedAt: undefined } : action), lastCompletedActionId: undefined }) : state),
  snoozeAction: (actionId, until) => set((state) => ({ actions: state.actions.map((action) => action.id === actionId ? { ...action, snoozedUntil: until } : action) })),
  addTracker: (input) => {
    const id = `tracker-${Date.now()}`;
    const tracker: Tracker = { id, title: input.title, category: input.category, milestone: { id: `milestone-${Date.now()}`, label: input.category === 'document' ? 'Expires' : 'Date', dateValue: input.dateValue, provenance: 'manual' }, reminderPolicy: { awarenessDays: input.category === 'document' ? 90 : 30, attentionDays: input.category === 'document' ? 30 : 7 }, createdAt: new Date().toISOString() };
    set((state) => ({ trackers: [tracker, ...state.trackers] }));
    return id;
  },
  addAction: (input) => {
    const id = `action-${Date.now()}`;
    set((state) => ({ actions: [{ id, title: input.title, dueDate: input.dueDate, status: 'open' }, ...state.actions] }));
    return id;
  },
  updateReminder: (trackerId, attentionDays) => set((state) => ({
    trackers: state.trackers.map((tracker) => tracker.id === trackerId
      ? { ...tracker, reminderPolicy: { ...tracker.reminderPolicy, attentionDays, awarenessDays: Math.max(attentionDays, tracker.reminderPolicy.awarenessDays) } }
      : tracker),
  })),
}));
