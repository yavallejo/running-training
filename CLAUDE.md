# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite. No tests need to be written.

## Key Patterns

**Custom auth, not Supabase Auth.** Passwords are SHA-256 hashed client-side via Web Crypto API. Sessions live in `localStorage` under `running_session` with a 24-hour TTL. See `src/lib/auth.ts` for how to handle session creation, validation, and expiry.

**Race details stored in localStorage during onboarding.** The onboarding quiz (6 steps) writes `raceDetails` to localStorage; this is then read by `/plan`. Don't expect race data to always be in Supabase immediately after onboarding.

**Training plan generation is deterministic.** `generateTrainingPlan(profile, raceDistance, raceDate, startDate)` in `src/lib/training-plan.ts` returns the full `TrainingSession[]` based on `DISTANCE_CONFIGS` (3K–42K with varying weeks and intensity). Plans are stable across rerenders.

**Styling with Tailwind CSS v4 design tokens.** Theme is managed by `ThemeProvider` (in `src/hooks/useTheme.tsx`) via `.dark` class on `<html>`. Design tokens in `globals.css` use `@theme inline` to alias CSS custom properties. Don't hardcode colors—use design token names.

**Next.js 16 has breaking changes.** Before writing App Router code, check `node_modules/next/dist/docs/01-app/` for the current API. Patterns from your training data may be deprecated.
