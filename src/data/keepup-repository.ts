import * as Crypto from 'expo-crypto';
import { File as ExpoFile } from 'expo-file-system';

import type { Action, Category, CategoryColorKey, CategoryIconKey, DateOnly, Provenance, SourceAttachment, SourceKind, Tracker, TrackerCategory } from '@/domain/types';
import { requireSupabaseClient } from '@/lib/supabase';

export type SourceRetention = 'keep' | 'delete' | 'ask';
export type ThemeMode = 'light' | 'dark';
export interface UserProfile { displayName: string; showNotificationDetails: boolean; sourceRetention: SourceRetention; themeMode: ThemeMode; }
export interface KeepUpSnapshot { profile: UserProfile; categories: Category[]; trackers: Tracker[]; actions: Action[]; }
export interface SourceUploadInput { kind: SourceKind; uri: string; fileName: string; mimeType?: string; sizeBytes?: number; file?: Blob; }
type SourceTarget = { trackerId: string; actionId?: never } | { trackerId?: never; actionId: string };

const trackerCategories = new Set<TrackerCategory>(['document', 'purchase', 'expiry', 'warranty', 'subscription', 'bill', 'maintenance', 'custom']);
const provenances = new Set<Provenance>(['manual', 'extracted', 'imported', 'generated', 'recurring']);
const supportedSourceMimeTypes = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/gif', 'application/pdf']);

function asDateOnly(value: string): DateOnly { return value as DateOnly; }
function asCategory(value: string): TrackerCategory { return trackerCategories.has(value as TrackerCategory) ? value as TrackerCategory : 'custom'; }
function asProvenance(value: string): Provenance { return provenances.has(value as Provenance) ? value as Provenance : 'manual'; }
function asSourceKind(value: unknown): SourceKind { return value === 'scan' || value === 'document' || value === 'photo' ? value : 'document'; }
function asIconKey(value: string): CategoryIconKey { return value as CategoryIconKey; }
function asColorKey(value: string | null): CategoryColorKey | undefined { return value ? value as CategoryColorKey : undefined; }
function sourceKind(metadata: unknown): SourceKind {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return 'document';
  return asSourceKind((metadata as Record<string, unknown>).capture_kind);
}

function toSource(row: DatabaseSourceRow): SourceAttachment {
  return { id: row.id, storagePath: row.storage_path, fileName: row.file_name, mimeType: row.mime_type, sizeBytes: row.size_bytes, kind: sourceKind(row.metadata) };
}

function toCategory(row: DatabaseCategoryRow): Category {
  return { id: row.id, userId: row.user_id, name: row.name, normalizedName: row.normalized_name, icon: asIconKey(row.icon_key), color: asColorKey(row.color_key), isCustom: row.is_custom, createdAt: row.created_at, updatedAt: row.updated_at };
}

type DatabaseSourceRow = Awaited<ReturnType<typeof querySources>>[number];
type DatabaseCategoryRow = Awaited<ReturnType<typeof queryCategories>>[number];

async function querySources(userId: string) {
  const { data, error } = await requireSupabaseClient().from('sources').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}


async function queryCategories(userId: string) {
  const { data, error } = await requireSupabaseClient().from('categories').select('*').eq('user_id', userId).order('is_custom').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function loadKeepUpSnapshot(userId: string): Promise<KeepUpSnapshot> {
  const supabase = requireSupabaseClient();
  const [profileResult, trackersResult, milestonesResult, remindersResult, actionsResult, sourceRows, categoryRows] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('trackers').select('*').eq('user_id', userId).is('archived_at', null).order('created_at', { ascending: false }),
    supabase.from('milestones').select('*').eq('user_id', userId),
    supabase.from('reminder_policies').select('*').eq('user_id', userId),
    supabase.from('actions').select('*').eq('user_id', userId).neq('status', 'archived').order('created_at', { ascending: false }),
    querySources(userId),
    queryCategories(userId),
  ]);
  const error = profileResult.error ?? trackersResult.error ?? milestonesResult.error ?? remindersResult.error ?? actionsResult.error;
  if (error) throw error;

  if (!profileResult.data) throw new Error('Your KeepUp profile is missing. Apply the latest database migration and try again.');
  const profileRow = profileResult.data;
  const milestoneByTracker = new Map((milestonesResult.data ?? []).map((row) => [row.tracker_id, row]));
  const reminderByTracker = new Map((remindersResult.data ?? []).map((row) => [row.tracker_id, row]));
  const sourceByTracker = new Map(sourceRows.filter((row) => row.tracker_id).map((row) => [row.tracker_id, toSource(row)]));
  const sourceByAction = new Map(sourceRows.filter((row) => row.action_id).map((row) => [row.action_id, toSource(row)]));
  const categories = categoryRows.map(toCategory);
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const trackers = (trackersResult.data ?? []).flatMap<Tracker>((row) => {
    const milestone = milestoneByTracker.get(row.id);
    const reminder = reminderByTracker.get(row.id);
    const category = categoryById.get(row.category_id);
    if (!milestone || !reminder || !category) return [];
    const source = sourceByTracker.get(row.id);
    return [{ id: row.id, title: row.title, trackerType: asCategory(row.category), category, milestone: { id: milestone.id, label: milestone.label, dateValue: asDateOnly(milestone.date_value), provenance: asProvenance(milestone.provenance) }, reminderPolicy: { awarenessDays: reminder.awareness_days, attentionDays: reminder.attention_days }, createdAt: row.created_at, archivedAt: row.archived_at ?? undefined, sourceLabel: source?.fileName ?? row.source_label ?? undefined, source }];
  });
  const actions: Action[] = (actionsResult.data ?? []).flatMap((row) => {
    const category = categoryById.get(row.category_id);
    return category ? [{ id: row.id, title: row.title, category, status: row.status, dueDate: row.due_date ? asDateOnly(row.due_date) : undefined, trackerId: row.tracker_id ?? undefined, snoozedUntil: row.snoozed_until ? asDateOnly(row.snoozed_until) : undefined, completedAt: row.completed_at ?? undefined, createdAt: row.created_at, source: sourceByAction.get(row.id) }] : [];
  });
  return { profile: { displayName: profileRow.display_name, showNotificationDetails: profileRow.show_notification_details, sourceRetention: profileRow.source_retention, themeMode: profileRow.theme_mode }, categories, trackers, actions };
}

export async function createTracker(id: string, input: { title: string; trackerType: TrackerCategory; categoryId: string; dateValue: DateOnly; sourceLabel?: string }) {
  const { data, error } = await requireSupabaseClient().rpc('create_tracker', { p_id: id, p_title: input.title, p_category: input.trackerType, p_category_id: input.categoryId, p_date_value: input.dateValue, p_source_label: input.sourceLabel ?? null });
  if (error) throw error;
  return data;
}

export async function createAction(userId: string, id: string, input: { title: string; categoryId: string; dueDate?: DateOnly }) {
  const { data, error } = await requireSupabaseClient().from('actions').insert({ id, user_id: userId, title: input.title, category_id: input.categoryId, due_date: input.dueDate ?? null }).select('*').single();
  if (error) throw error;
  return data;
}

function safeFileName(fileName: string) {
  const name = fileName.split(/[\\/]/).pop()?.trim() || 'attachment';
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'attachment';
}

function resolvedMimeType(input: SourceUploadInput) {
  const supplied = input.mimeType?.toLowerCase();
  if (supplied) return supplied === 'image/jpg' ? 'image/jpeg' : supplied;
  const extension = input.fileName.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'application/pdf';
  if (extension === 'png') return 'image/png';
  if (extension === 'heic') return 'image/heic';
  if (extension === 'heif') return 'image/heif';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  return 'image/jpeg';
}

async function readSourceBody(input: SourceUploadInput) {
  if (input.file) return input.file;
  try {
    return await new ExpoFile(input.uri).arrayBuffer();
  } catch {
    const response = await fetch(input.uri);
    if (!response.ok) throw new Error('KeepUp could not read the selected file.');
    return response.arrayBuffer();
  }
}

export async function uploadSource(userId: string, target: SourceTarget, input: SourceUploadInput, retentionMode: SourceRetention) {
  const supabase = requireSupabaseClient();
  const sourceId = Crypto.randomUUID();
  const fileName = safeFileName(input.fileName);
  const storagePath = `${userId}/${sourceId}/${fileName}`;
  const mimeType = resolvedMimeType(input);
  if (!supportedSourceMimeTypes.has(mimeType)) throw new Error('Only PDF, JPEG, PNG, HEIC, WebP, and GIF files can be saved.');
  const fileBody = await readSourceBody(input);
  const measuredSize = 'size' in fileBody ? fileBody.size : fileBody.byteLength;
  const sizeBytes = measuredSize || input.sizeBytes || 0;
  if (sizeBytes > 25 * 1024 * 1024) throw new Error('Choose a file smaller than 25 MB.');

  const { error: uploadError } = await supabase.storage.from('sources').upload(storagePath, fileBody, { contentType: mimeType, upsert: false });
  if (uploadError) throw uploadError;

  const { data, error: sourceError } = await supabase.from('sources').insert({
    id: sourceId,
    user_id: userId,
    tracker_id: target.trackerId ?? null,
    action_id: target.actionId ?? null,
    storage_path: storagePath,
    file_name: input.fileName.slice(0, 255),
    mime_type: mimeType,
    size_bytes: sizeBytes,
    retention_mode: retentionMode,
    metadata: { capture_kind: input.kind },
  }).select('*').single();
  if (sourceError) {
    await supabase.storage.from('sources').remove([storagePath]);
    throw sourceError;
  }
  return toSource(data);
}

export async function updateAction(actionId: string, changes: { status?: 'open' | 'completed'; completed_at?: string | null; snoozed_until?: string | null }) {
  const { error } = await requireSupabaseClient().from('actions').update(changes).eq('id', actionId);
  if (error) throw error;
}

export async function updateTrackerDetails(trackerId: string, input: { title: string; categoryId: string; dateValue: DateOnly }) {
  const { error } = await requireSupabaseClient().rpc('update_tracker_details', { p_tracker_id: trackerId, p_title: input.title, p_category_id: input.categoryId, p_date_value: input.dateValue });
  if (error) throw error;
}

export async function updateActionDetails(actionId: string, input: { title: string; categoryId: string; dueDate?: DateOnly }) {
  const { data, error } = await requireSupabaseClient().from('actions').update({ title: input.title, category_id: input.categoryId, due_date: input.dueDate ?? null }).eq('id', actionId).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('The action could not be updated.');
}

async function removeStoredSources(storagePaths: string[]): Promise<boolean> {
  if (storagePaths.length === 0) return true;
  const { error } = await requireSupabaseClient().storage.from('sources').remove([...new Set(storagePaths)]);
  return !error;
}

export async function deleteTracker(trackerId: string, storagePaths: string[]): Promise<{ sourceCleanupSucceeded: boolean }> {
  const { data, error } = await requireSupabaseClient().from('trackers').delete().eq('id', trackerId).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('The reminder could not be deleted.');
  return { sourceCleanupSucceeded: await removeStoredSources(storagePaths) };
}

export async function deleteAction(actionId: string, storagePaths: string[]): Promise<{ sourceCleanupSucceeded: boolean }> {
  const { data, error } = await requireSupabaseClient().from('actions').delete().eq('id', actionId).select('id').single();
  if (error) throw error;
  if (!data) throw new Error('The action could not be deleted.');
  return { sourceCleanupSucceeded: await removeStoredSources(storagePaths) };
}

export async function updateReminderPolicy(trackerId: string, attentionDays: number, awarenessDays: number) {
  const { error } = await requireSupabaseClient().from('reminder_policies').update({ attention_days: attentionDays, awareness_days: awarenessDays }).eq('tracker_id', trackerId);
  if (error) throw error;
}

export async function updateProfile(userId: string, changes: { display_name?: string; show_notification_details?: boolean; source_retention?: SourceRetention; theme_mode?: ThemeMode }) {
  const { error } = await requireSupabaseClient().from('profiles').update(changes).eq('id', userId);
  if (error) throw error;
}

export async function createCategory(userId: string, id: string, input: { name: string; normalizedName: string; icon: CategoryIconKey; color: CategoryColorKey }) {
  const { data, error } = await requireSupabaseClient().from('categories').insert({ id, user_id: userId, name: input.name, normalized_name: input.normalizedName, icon_key: input.icon, color_key: input.color, is_custom: true }).select('*').single();
  if (error) throw error;
  return toCategory(data);
}

export async function updateCategory(categoryId: string, input: { name: string; normalizedName: string; icon: CategoryIconKey; color: CategoryColorKey }) {
  const { data, error } = await requireSupabaseClient().from('categories').update({ name: input.name, normalized_name: input.normalizedName, icon_key: input.icon, color_key: input.color }).eq('id', categoryId).eq('is_custom', true).select('*').single();
  if (error) throw error;
  return toCategory(data);
}

export async function deleteCategory(categoryId: string, replacementCategoryId: string) {
  const { error } = await requireSupabaseClient().rpc('delete_custom_category', { p_category_id: categoryId, p_replacement_category_id: replacementCategoryId });
  if (error) throw error;
}
