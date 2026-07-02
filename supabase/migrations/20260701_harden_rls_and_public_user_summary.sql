-- =============================================================================
-- Migration: Harden RLS and add public_user_summary view
-- =============================================================================
-- Purpose:
--   1) Enable RLS on every public table (users, user_profiles, user_plans,
--      user_progress, notifications, audit_logs, plans).
--   2) Replace per-user policies that were inert (RLS was off) with policies
--      that scope reads/writes to auth.uid().
--   3) Expose a safe `public_user_summary` view that only contains non-
--      sensitive fields from `public.users`, so leaderboards/social features
--      can read usernames without leaking email/password_hash.
--   4) Lock audit_logs and notifications to service_role only.
--
-- Assumptions:
--   - `public.users.id` mirrors `auth.users.id`.
--   - A trigger (or service_role code) creates the `public.users` row on
--     signup; clients never INSERT into `public.users` directly.
--   - `user_profiles.id` FKs into `public.users.id` (1:1).
--   - `notifications` and `audit_logs` are written by the backend using the
--     service_role key.
--
-- Run in Supabase SQL Editor. Review before applying in production.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Clean up: drop existing policies on tables we're going to redefine so the
--    migration is idempotent.
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own profile"      ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile"        ON public.user_profiles;

DROP POLICY IF EXISTS "Users can delete own progress"     ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress"     ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress"     ON public.user_progress;
DROP POLICY IF EXISTS "Users can view own progress"       ON public.user_progress;

DROP POLICY IF EXISTS "race_results_own_insert"           ON public.race_results;
DROP POLICY IF EXISTS "race_results_own_update"           ON public.race_results;
DROP POLICY IF EXISTS "race_results_public_read"          ON public.race_results;
DROP POLICY IF EXISTS "achievements_public_read"          ON public.achievements;
DROP POLICY IF EXISTS "user_achievements_own_insert"      ON public.user_achievements;
DROP POLICY IF EXISTS "user_achievements_public_read"     ON public.user_achievements;

-- -----------------------------------------------------------------------------
-- 1) Enable RLS on every public table
-- -----------------------------------------------------------------------------
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans          ENABLE ROW LEVEL SECURITY;
-- Achievements / race_results / user_achievements already had RLS on; we
-- redefine their policies below for clarity.

-- =============================================================================
-- 2) POLICIES
-- =============================================================================

-- ------------------------------- public.users --------------------------------
-- Each authenticated user can read and update their own row.
-- INSERT is intentionally NOT granted to authenticated: signup is handled by
-- auth.users + a service_role trigger / Edge Function.
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------- public.user_profiles ----------------------------
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------- public.user_progress ----------------------------
CREATE POLICY "user_progress_select_own"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_progress_insert_own"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_update_own"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_progress_delete_own"
  ON public.user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------- public.user_plans -------------------------------
CREATE POLICY "user_plans_all_own"
  ON public.user_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------- public.plans -----------------------------------
-- Plans are a public catalog (free + paid tiers). Read-only for clients.
CREATE POLICY "plans_public_read"
  ON public.plans FOR SELECT
  USING (true);

-- -------------------------- public.achievements -------------------------------
-- Achievements are a public catalog (badges, descriptions, icons, etc.).
CREATE POLICY "achievements_public_read"
  ON public.achievements FOR SELECT
  USING (true);

-- -------------------------- public.race_results -------------------------------
-- Public read (leaderboards), but only the owner can insert/update.
CREATE POLICY "race_results_public_read"
  ON public.race_results FOR SELECT
  USING (true);

CREATE POLICY "race_results_own_insert"
  ON public.race_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "race_results_own_update"
  ON public.race_results FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------- public.user_achievements ----------------------------
-- Own write; public read gated by `users.is_public_profile` so only opt-in
-- profiles appear on social views.
CREATE POLICY "user_achievements_own_insert"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_achievements_public_read"
  ON public.user_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = user_achievements.user_id
        AND u.is_public_profile = true
    )
  );

-- No UPDATE / DELETE policy for clients. Service_role handles corrections.

-- ------------------------- public.notifications -------------------------------
-- Each user can read their own notifications. Writes happen via service_role.
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- --------------------------- public.audit_logs --------------------------------
-- Intentionally NO policies for anon / authenticated. Only the service_role
-- key (used by Edge Functions / backend jobs) can read or write.
-- Clients are fully blocked by RLS.

-- =============================================================================
-- 3) Safe public-facing view: replaces the need to SELECT from public.users
--    for leaderboards, social pages, etc.
-- =============================================================================
CREATE OR REPLACE VIEW public.public_user_summary AS
SELECT
  u.id,
  u.username,
  u.race_name,
  u.race_distance,
  u.race_date,
  u.is_public_profile,
  u.created_at
FROM public.users u
WHERE u.is_public_profile = true;

-- Grant read access to anonymous and authenticated roles.
GRANT SELECT ON public.public_user_summary TO anon, authenticated;

COMMENT ON VIEW public.public_user_summary IS
  'Non-sensitive projection of public.users. Safe to expose to anon/authenticated for leaderboards and social features. Includes only opt-in (is_public_profile = true) users.';

-- =============================================================================
-- End of migration
-- =============================================================================
