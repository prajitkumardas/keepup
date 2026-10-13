# KeepUp

KeepUp is a mobile-first personal attention manager for actions, expiries, renewals, return windows, warranties, and other responsibilities that matter later.

This repository currently contains the first production-shaped application slice built from the KeepUp PRD, design guideline, and technical requirements:

- Expo SDK 57, React Native, Expo Router, and strict TypeScript
- Five-destination navigation: Today, Library, Add, Upcoming, and Search
- Shared light/dark semantic design tokens and reusable UI primitives
- Centralized date-only attention-state calculation
- Action completion, undo, and snooze interactions
- Tracker filtering, search, details, provenance, and reminder editing
- User-scoped custom categories with smart suggestions, reusable icons/colors, dynamic Library filters, and safe reassignment on deletion
- Deterministic text capture with user confirmation and no fabricated dates
- Camera, photo, and PDF capture with private, owner-scoped Supabase Storage
- Externalized English UI copy, ready for additional locales
- Supabase email/password authentication with persisted sessions and recovery links
- Protected application routes plus user-owned PostgreSQL tables and Row Level Security

## Run locally

```bash
npm install
npm start
```

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and publishable key. Never place a service-role key in the app.
3. Apply every SQL file in `supabase/migrations` in filename order through the Supabase SQL editor, or link the Supabase CLI and run `supabase db push`.
4. In Supabase Auth URL configuration, add the app recovery redirect (`keepup://reset-password`) and the local web URL used during development (for example `http://localhost:8081/reset-password`).
5. Start Expo again after changing environment variables.

The app displays a configuration notice instead of attempting authentication when the required public environment variables are missing.

Useful targets:

```bash
npm run android
npm run ios
npm run web
```

## Validate

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Architecture

Routes live in `src/app`. Domain rules, authentication, repositories, state, features, reusable components, and design-system code remain outside the route tree. See [docs/architecture.md](docs/architecture.md) and [docs/database.md](docs/database.md) for the current boundaries.

Authenticated cloud data and private capture sources now flow through the Supabase repository, Storage, and RLS schema. SQLite/offline persistence, the mutation-queue processor, share-sheet capture, notifications, account deletion orchestration, and provider-backed OCR/AI remain future integrations.
