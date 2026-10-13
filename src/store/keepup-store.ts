import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

import {
  createAction as createRemoteAction,
  createCategory as createRemoteCategory,
  createTracker as createRemoteTracker,
  deleteCategory as deleteRemoteCategory,
  deleteAction as deleteRemoteAction,
  deleteTracker as deleteRemoteTracker,
  updateAction as updateRemoteAction,
  updateActionDetails as updateRemoteActionDetails,
  updateCategory as updateRemoteCategory,
  updateProfile as updateRemoteProfile,
  updateReminderPolicy,
  updateTrackerDetails as updateRemoteTrackerDetails,
  uploadSource,
  type KeepUpSnapshot,
  type SourceUploadInput,
  type SourceRetention,
  type ThemeMode,
  type UserProfile,
} from '@/data/keepup-repository';
import type { Action, Category, CategoryColorKey, CategoryIconKey, DateOnly, Tracker, TrackerCategory } from '@/domain/types';
import { normalizeCategoryName } from '@/domain/categories';
import { getErrorMessage } from '@/lib/errors';

interface AddTrackerInput { title: string; trackerType: TrackerCategory; category: Category; dateValue: DateOnly; attachment?: SourceUploadInput; }
interface AddActionInput { title: string; category: Category; dueDate?: DateOnly; attachment?: SourceUploadInput; }

const defaultProfile: UserProfile = { displayName: 'My profile', showNotificationDetails: false, sourceRetention: 'ask', themeMode: 'light' };

interface KeepUpState {
  userId?: string;
  actions: Action[];
  categories: Category[];
  trackers: Tracker[];
  profile: UserProfile;
  dataError?: string;
  lastCompletedActionId?: string;
  hydrate: (userId: string, snapshot: KeepUpSnapshot) => void;
  clearUserData: () => void;
  clearDataError: () => void;
  dismissLastCompletion: () => void;
  completeAction: (actionId: string) => Promise<void>;
  undoLastCompletion: () => Promise<void>;
  snoozeAction: (actionId: string, until: DateOnly) => Promise<void>;
  addTracker: (input: AddTrackerInput) => Promise<string>;
  addAction: (input: AddActionInput) => Promise<string>;
  updateTrackerDetails: (trackerId: string, input: { title: string; category: Category; dateValue: DateOnly }) => Promise<boolean>;
  updateActionDetails: (actionId: string, input: { title: string; category: Category; dueDate?: DateOnly }) => Promise<boolean>;
  createCategory: (input: { name: string; icon: CategoryIconKey; color: CategoryColorKey }) => Promise<Category | undefined>;
  updateCategory: (categoryId: string, input: { name: string; icon: CategoryIconKey; color: CategoryColorKey }) => Promise<boolean>;
  deleteCategory: (categoryId: string, replacementCategoryId: string) => Promise<boolean>;
  deleteTracker: (trackerId: string) => Promise<boolean>;
  deleteAction: (actionId: string) => Promise<boolean>;
  updateReminder: (trackerId: string, attentionDays: number) => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  setNotificationDetails: (enabled: boolean) => Promise<void>;
  setSourceRetention: (mode: SourceRetention) => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const useKeepUpStore = create<KeepUpState>((set, get) => {
  const setDataError = (error: unknown) => set({ dataError: getErrorMessage(error, 'KeepUp could not save that change.') });

  const persistProfile = async (previous: UserProfile, next: UserProfile, changes: Parameters<typeof updateRemoteProfile>[1]) => {
    const userId = get().userId;
    if (!userId) return;
    set({ profile: next, dataError: undefined });
    try {
      await updateRemoteProfile(userId, changes);
    } catch (error) {
      set({ profile: previous });
      setDataError(error);
    }
  };

  return {
    actions: [],
    categories: [],
    trackers: [],
    profile: defaultProfile,
    hydrate: (userId, snapshot) => set({ userId, ...snapshot, dataError: undefined, lastCompletedActionId: undefined }),
    clearUserData: () => set({ userId: undefined, actions: [], categories: [], trackers: [], profile: defaultProfile, dataError: undefined, lastCompletedActionId: undefined }),
    clearDataError: () => set({ dataError: undefined }),
    dismissLastCompletion: () => set({ lastCompletedActionId: undefined }),
    completeAction: async (actionId) => {
      const previous = get().actions;
      const completedAt = new Date().toISOString();
      set({ actions: previous.map((action) => action.id === actionId ? { ...action, status: 'completed', completedAt } : action), lastCompletedActionId: actionId, dataError: undefined });
      try { await updateRemoteAction(actionId, { status: 'completed', completed_at: completedAt }); }
      catch (error) { set({ actions: previous, lastCompletedActionId: undefined }); setDataError(error); }
    },
    undoLastCompletion: async () => {
      const actionId = get().lastCompletedActionId;
      if (!actionId) return;
      const previous = get().actions;
      set({ actions: previous.map((action) => action.id === actionId ? { ...action, status: 'open', completedAt: undefined } : action), lastCompletedActionId: undefined, dataError: undefined });
      try { await updateRemoteAction(actionId, { status: 'open', completed_at: null }); }
      catch (error) { set({ actions: previous, lastCompletedActionId: actionId }); setDataError(error); }
    },
    snoozeAction: async (actionId, until) => {
      const previous = get().actions;
      set({ actions: previous.map((action) => action.id === actionId ? { ...action, snoozedUntil: until } : action), dataError: undefined });
      try { await updateRemoteAction(actionId, { snoozed_until: until }); }
      catch (error) { set({ actions: previous }); setDataError(error); }
    },
    addTracker: async (input) => {
      const userId = get().userId;
      if (!userId) throw new Error('Authentication required.');
      set({ dataError: undefined });
      const id = Crypto.randomUUID();
      const tracker: Tracker = { id, title: input.title, trackerType: input.trackerType, category: input.category, milestone: { id: Crypto.randomUUID(), label: input.trackerType === 'document' ? 'Expires' : 'Date', dateValue: input.dateValue, provenance: 'manual' }, reminderPolicy: { awarenessDays: input.trackerType === 'document' ? 90 : 30, attentionDays: input.trackerType === 'document' ? 30 : 7 }, createdAt: new Date().toISOString() };
      set((state) => ({ trackers: [tracker, ...state.trackers] }));
      try {
        await createRemoteTracker(id, { title: input.title, trackerType: input.trackerType, categoryId: input.category.id, dateValue: input.dateValue });
      } catch {
        setDataError(new Error('Added for this session. Cloud sync is pending until the database migration is applied.'));
        return id;
      }
      if (input.attachment) {
        try {
          const source = await uploadSource(userId, { trackerId: id }, input.attachment, get().profile.sourceRetention);
          set((state) => ({ trackers: state.trackers.map((item) => item.id === id ? { ...item, source, sourceLabel: source.fileName } : item) }));
        } catch (error) {
          setDataError(new Error(`The reminder was saved, but its attachment was not. ${getErrorMessage(error, 'Please try another file.')}`));
        }
      }
      return id;
    },
    addAction: async (input) => {
      const userId = get().userId;
      if (!userId) throw new Error('Authentication required.');
      set({ dataError: undefined });
      const id = Crypto.randomUUID();
      const action: Action = { id, title: input.title, category: input.category, status: 'open', dueDate: input.dueDate, createdAt: new Date().toISOString() };
      set((state) => ({ actions: [action, ...state.actions] }));
      try {
        await createRemoteAction(userId, id, { title: input.title, categoryId: input.category.id, dueDate: input.dueDate });
      } catch {
        setDataError(new Error('Added for this session. Cloud sync is pending until the database migration is applied.'));
        return id;
      }
      if (input.attachment) {
        try {
          const source = await uploadSource(userId, { actionId: id }, input.attachment, get().profile.sourceRetention);
          set((state) => ({ actions: state.actions.map((item) => item.id === id ? { ...item, source } : item) }));
        } catch (error) {
          setDataError(new Error(`The action was saved, but its attachment was not. ${getErrorMessage(error, 'Please try another file.')}`));
        }
      }
      return id;
    },
    updateTrackerDetails: async (trackerId, input) => {
      const previous = get().trackers;
      const tracker = previous.find((item) => item.id === trackerId);
      if (!tracker) return false;
      set({ trackers: previous.map((item) => item.id === trackerId ? { ...item, title: input.title, category: input.category, milestone: { ...item.milestone, dateValue: input.dateValue } } : item), dataError: undefined });
      try {
        await updateRemoteTrackerDetails(trackerId, { title: input.title, categoryId: input.category.id, dateValue: input.dateValue });
        return true;
      } catch (error) {
        set({ trackers: previous });
        setDataError(error);
        return false;
      }
    },
    updateActionDetails: async (actionId, input) => {
      const previous = get().actions;
      const action = previous.find((item) => item.id === actionId);
      if (!action) return false;
      set({ actions: previous.map((item) => item.id === actionId ? { ...item, title: input.title, category: input.category, dueDate: input.dueDate } : item), dataError: undefined });
      try {
        await updateRemoteActionDetails(actionId, { title: input.title, categoryId: input.category.id, dueDate: input.dueDate });
        return true;
      } catch (error) {
        set({ actions: previous });
        setDataError(error);
        return false;
      }
    },
    createCategory: async (input) => {
      const userId = get().userId;
      if (!userId) return undefined;
      const normalizedName = normalizeCategoryName(input.name);
      const existing = get().categories.find((category) => category.normalizedName === normalizedName);
      if (existing) return existing;
      try {
        const category = await createRemoteCategory(userId, Crypto.randomUUID(), { ...input, name: input.name.trim(), normalizedName });
        set((state) => ({ categories: [...state.categories, category].sort((left, right) => left.name.localeCompare(right.name)), dataError: undefined }));
        return category;
      } catch (error) { setDataError(error); return undefined; }
    },
    updateCategory: async (categoryId, input) => {
      const previousCategories = get().categories;
      const current = previousCategories.find((category) => category.id === categoryId);
      if (!current?.isCustom) return false;
      const normalizedName = normalizeCategoryName(input.name);
      if (previousCategories.some((category) => category.id !== categoryId && category.normalizedName === normalizedName)) { setDataError(new Error('A category with that name already exists.')); return false; }
      try {
        const category = await updateRemoteCategory(categoryId, { ...input, name: input.name.trim(), normalizedName });
        set((state) => ({ categories: state.categories.map((item) => item.id === categoryId ? category : item), trackers: state.trackers.map((item) => item.category.id === categoryId ? { ...item, category } : item), actions: state.actions.map((item) => item.category.id === categoryId ? { ...item, category } : item), dataError: undefined }));
        return true;
      } catch (error) { setDataError(error); return false; }
    },
    deleteCategory: async (categoryId, replacementCategoryId) => {
      const previous = { categories: get().categories, trackers: get().trackers, actions: get().actions };
      const replacement = previous.categories.find((category) => category.id === replacementCategoryId);
      const category = previous.categories.find((item) => item.id === categoryId);
      if (!category?.isCustom || !replacement || replacement.id === categoryId) return false;
      try {
        await deleteRemoteCategory(categoryId, replacementCategoryId);
        set({ categories: previous.categories.filter((item) => item.id !== categoryId), trackers: previous.trackers.map((item) => item.category.id === categoryId ? { ...item, category: replacement } : item), actions: previous.actions.map((item) => item.category.id === categoryId ? { ...item, category: replacement } : item), dataError: undefined });
        return true;
      } catch (error) { setDataError(error); return false; }
    },
    deleteTracker: async (trackerId) => {
      const tracker = get().trackers.find((item) => item.id === trackerId);
      if (!tracker) return false;
      const relatedActions = get().actions.filter((action) => action.trackerId === trackerId);
      const storagePaths = [tracker.source?.storagePath, ...relatedActions.map((action) => action.source?.storagePath)].filter((path): path is string => Boolean(path));
      set({ dataError: undefined });
      try {
        const result = await deleteRemoteTracker(trackerId, storagePaths);
        set((state) => ({
          trackers: state.trackers.filter((item) => item.id !== trackerId),
          actions: state.actions.filter((action) => action.trackerId !== trackerId),
          lastCompletedActionId: relatedActions.some((action) => action.id === state.lastCompletedActionId) ? undefined : state.lastCompletedActionId,
        }));
        if (!result.sourceCleanupSucceeded) setDataError(new Error('The item was deleted, but KeepUp could not remove its attached file. Please try again later.'));
        return true;
      } catch (error) {
        setDataError(error);
        return false;
      }
    },
    deleteAction: async (actionId) => {
      const action = get().actions.find((item) => item.id === actionId);
      if (!action) return false;
      const storagePaths = action.source ? [action.source.storagePath] : [];
      set({ dataError: undefined });
      try {
        const result = await deleteRemoteAction(actionId, storagePaths);
        set((state) => ({ actions: state.actions.filter((item) => item.id !== actionId), lastCompletedActionId: state.lastCompletedActionId === actionId ? undefined : state.lastCompletedActionId }));
        if (!result.sourceCleanupSucceeded) setDataError(new Error('The item was deleted, but KeepUp could not remove its attached file. Please try again later.'));
        return true;
      } catch (error) {
        setDataError(error);
        return false;
      }
    },
    updateReminder: async (trackerId, attentionDays) => {
      const previous = get().trackers;
      const tracker = previous.find((item) => item.id === trackerId);
      if (!tracker) return;
      const awarenessDays = Math.max(attentionDays, tracker.reminderPolicy.awarenessDays);
      set({ trackers: previous.map((item) => item.id === trackerId ? { ...item, reminderPolicy: { attentionDays, awarenessDays } } : item), dataError: undefined });
      try { await updateReminderPolicy(trackerId, attentionDays, awarenessDays); }
      catch (error) { set({ trackers: previous }); setDataError(error); }
    },
    updateDisplayName: async (displayName) => { const previous = get().profile; await persistProfile(previous, { ...previous, displayName }, { display_name: displayName }); },
    setNotificationDetails: async (showNotificationDetails) => { const previous = get().profile; await persistProfile(previous, { ...previous, showNotificationDetails }, { show_notification_details: showNotificationDetails }); },
    setSourceRetention: async (sourceRetention) => { const previous = get().profile; await persistProfile(previous, { ...previous, sourceRetention }, { source_retention: sourceRetention }); },
    setThemeMode: async (themeMode) => { const previous = get().profile; await persistProfile(previous, { ...previous, themeMode }, { theme_mode: themeMode }); },
  };
});
