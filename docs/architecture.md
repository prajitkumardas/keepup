# KeepUp implementation foundation

## Product interpretation

The three source documents define one durable domain model and one simplified user-facing model:

- Domain: Action, Tracker, TrackerCycle, Milestone, Source, ReminderPolicy, ActivityEvent, and SyncMutation.
- Navigation: Today, Library, Add, Upcoming, and Search.
- Mental model: what needs attention now, what KeepUp is watching, what comes next, and how something was captured.

Actions and Trackers remain separate domain objects even though the Library presents a simpler combined product concept. The deterministic attention engine—not AI—owns urgency and date-window calculations.

## Current vertical slice

- `src/domain`: date-only handling, attention-state derivation, and core types.
- `src/store`: shared prototype state and mutations for completion, snooze, capture, and reminder editing.
- `src/design-system`: semantic light/dark tokens and reusable text, button, chip, badge, and screen primitives.
- `src/features`: feature-specific capture parsing and Today attention-card behavior.
- `src/app`: Expo Router screens and navigation only.
- `src/localization`: externalized user-facing English copy.

Seed dates are generated relative to the device date so the demonstration remains meaningful after the initial development day. Date-only values stay in `YYYY-MM-DD` form and are never converted through UTC timestamps for display.

## Trust and privacy boundaries

- The local capture parser only recognizes explicit dates; it never fabricates a missing date.
- A Tracker cannot be saved without a valid date in the current capture flow.
- AI/OCR, cloud auth, uploads, and source retention are not simulated with insecure client-side secrets.
- Source labels are presentation-only seed data. Production sources require private object storage, signed URLs, content validation, retention controls, and server-side ownership checks.

## Next milestones

1. Introduce the SQLite repository and schema migrations behind the current store selectors.
2. Add a client-generated mutation queue, device identity, idempotency keys, and explicit sync conflict handling.
3. Add Supabase authentication, PostgreSQL migrations, Row Level Security, and account deletion workflows.
4. Implement contextual onboarding and permission requests.
5. Connect camera, photo, PDF, and share-sheet capture through a shared normalization pipeline.
6. Add replaceable OCR/AI provider interfaces with per-field confidence and confirmation.
7. Add local/server notification scheduling, quiet hours, deduplication, timezone rescheduling, and deep links.
8. Add unit tests for attention/date rules, store mutations, capture parsing, and lifecycle advancement; then add device E2E coverage for the PRD’s critical journeys.

These milestones preserve the required flow: Capture → Extract/Understand → Lifecycle → Attention → Reminder → Today, backed by Local Database ↔ Sync Engine ↔ Cloud Database.
