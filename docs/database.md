# KeepUp database structure

The canonical schema is the migration in `supabase/migrations`. Supabase Auth owns credentials and sessions; application data is stored in `public` and linked to `auth.users` with cascading foreign keys.

## Ownership model

- `profiles.id` is the authenticated user ID.
- Every other application table carries `user_id` and is protected by Row Level Security using `auth.uid()`.
- Child tables use composite foreign keys where applicable, preventing a row from linking to another user's tracker even if an ID is known.
- The client receives only the publishable key. RLS, not client-side filtering, is the authorization boundary.

## Tables

| Table | Purpose |
| --- | --- |
| `profiles` | Display name, privacy preferences, source retention, and theme choice. |
| `categories` | User-scoped built-in and custom category definitions, icon/color keys, and normalized-name uniqueness. |
| `trackers` | Durable items KeepUp watches. |
| `milestones` | Date-only lifecycle milestones and provenance. |
| `reminder_policies` | Awareness and attention windows for each tracker. |
| `actions` | User tasks, due dates, completion, and snooze state. |
| `sources` | Metadata for private receipts, photos, and documents linked to a Tracker or Action. |
| `activity_events` | Append-only history for important user-visible changes. |
| `devices` | Installations, timezone information, and future push tokens. |
| `sync_mutations` | Idempotent mutation records for the future offline sync worker. |

The `sources` Storage bucket is private. Object policies require the first path segment to match the authenticated user ID, for example `<user-id>/<source-id>/receipt.pdf`.

## Application flow

Screens call Zustand actions. Zustand performs an optimistic local update where safe, calls `src/data/keepup-repository.ts`, and rolls back with a visible error if the remote write fails. Category creation waits for the server so items never reference a category that failed to persist. Category deletion uses a database function to move linked items and delete the custom category atomically. Session changes trigger a fresh RLS-scoped snapshot load. Screens never instantiate Supabase or query tables directly.
