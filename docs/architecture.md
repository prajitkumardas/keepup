# KeepUp implementation foundation

## Product interpretation

The three source documents define one durable domain model and one simplified user-facing model:

- Domain: Action, Tracker, TrackerCycle, Milestone, Source, ReminderPolicy, ActivityEvent, and SyncMutation.
- Navigation: Today, Library, Add, Upcoming, and Search.
- Mental model: what needs attention now, what KeepUp is watching, what comes next, and how something was captured.

Actions and Trackers remain separate domain objects even though the Library presents a simpler combined product concept. The deterministic attention engine—not AI—owns urgency and date-window calculations.

## Current vertical slice

- `src/domain`: date-only handling, attention-state derivation, and core types.
- `src/auth`: session lifecycle, recovery-link handling, and authenticated data bootstrap.
- `src/data`: database types and the only application-facing Supabase repository.
- `src/store`: shared optimistic state and mutations for completion, snooze, capture, profile settings, and reminder editing. Failed remote writes roll back and expose a dismissible error.
- `src/lib`: configured Supabase client and shared error normalization.
- `src/design-system`: semantic light/dark tokens and reusable text, button, chip, badge, and screen primitives.
- `src/features`: feature-specific capture parsing and Today attention-card behavior.
- `src/app`: Expo Router screens and navigation only.
- `src/localization`: externalized user-facing English copy.

Seed dates are generated relative to the device date so the demonstration remains meaningful after the initial development day. Date-only values stay in ISO `YYYY-MM-DD` form internally for database compatibility, while every user-facing input and display uses `DD-MM-YYYY`. Date-only display values are never converted through UTC timestamps.

## Trust and privacy boundaries

- The local capture parser only recognizes explicit dates; it never fabricates a missing date.
- A Tracker cannot be saved without a valid date in the current capture flow.
- Only the Supabase project URL and publishable key are allowed in the client. Service-role credentials remain server-only.
- Every application table is protected with ownership-based Row Level Security. Source files use a private bucket and a user-ID path boundary.
- Native capture uploads validated source files to the private `sources` bucket and stores owner-scoped metadata linked to its Tracker or Action. Signed URL presentation and automated retention cleanup remain future work.

## Next milestones

1. Introduce SQLite persistence behind the repository and process the existing `sync_mutations` table as an explicit offline queue.
2. Register device identity, idempotency keys, and conflict resolution.
3. Add a trusted server-side account deletion workflow that removes auth, database, and private storage data.
4. Implement contextual onboarding and permission requests.
5. Add share-sheet capture and replace the current picker normalization with a background-capable upload queue.
6. Add replaceable OCR/AI provider interfaces with per-field confidence and confirmation.
7. Add local/server notification scheduling, quiet hours, deduplication, timezone rescheduling, and deep links.
8. Add unit tests for attention/date rules, store mutations, capture parsing, and lifecycle advancement; then add device E2E coverage for the PRD’s critical journeys.

These milestones preserve the required flow: Capture → Extract/Understand → Lifecycle → Attention → Reminder → Today, backed by Local Database ↔ Sync Engine ↔ Cloud Database.
