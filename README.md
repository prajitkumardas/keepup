# KeepUp

KeepUp is a mobile-first personal attention manager for actions, expiries, renewals, return windows, warranties, and other responsibilities that matter later.

This repository currently contains the first production-shaped application slice built from the KeepUp PRD, design guideline, and technical requirements:

- Expo SDK 57, React Native, Expo Router, and strict TypeScript
- Five-destination navigation: Today, Library, Add, Upcoming, and Search
- Shared light/dark semantic design tokens and reusable UI primitives
- Centralized date-only attention-state calculation
- Action completion, undo, and snooze interactions
- Tracker filtering, search, details, provenance, and reminder editing
- Deterministic text capture with user confirmation and no fabricated dates
- Externalized English UI copy, ready for additional locales

## Run locally

```bash
npm install
npm start
```

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

Routes live in `src/app`. Domain rules, state, features, reusable components, and design-system code remain outside the route tree. See [docs/architecture.md](docs/architecture.md) for the current boundaries and the next implementation milestones.

The current Zustand store is intentionally an in-memory product slice. SQLite persistence, the explicit sync queue, Supabase authentication/RLS, private source storage, native capture, notifications, and provider-backed OCR/AI are not represented as production-complete integrations yet.
