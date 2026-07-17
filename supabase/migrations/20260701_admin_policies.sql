-- =============================================================================
-- Migration: Admin role policies
-- =============================================================================
-- Purpose:
--   The previous migration enabled RLS on public tables, but only allowed
--   `auth.uid() = id` (or `user_id`) — meaning admins couldn't manage
--   other users from the client.
--
--   This migration adds admin-scoped policies: an authenticated user with
--   `public.users.role = 'admin'` may SELECT, UPDATE and DELETE any row
--   in `public.users`, `public.user_profiles`, `public.user_progress`,
--   `public.user_plans`, and INSERT into `public.audit_logs` and
--   `public.notifications`.
--
--   Admins still cannot read `auth.users` (Supabase-managed) or bypass
--   service_role protections on `audit_logs` writes.
--
--   IMPORTANT: For full admin operations (creating users, resetting
--   passwords, hard-deletes) the admin should call Supabase Edge Functions
--   that use the service_role key. The policies below cover read/update of
--   public tables; CREATE/DELETE/reset-password still need Edge Functions.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: is_admin() — read-only check that the calling user is an admin.
-- Marked SECURITY DEFINER + STABLE so it can be inlined into policy quals.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;

-- -----------------------------------------------------------------------------
-- public.users — admin can read all rows and update most fields
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "users_admin_select_all" ON public.users;
CREATE POLICY "users_admin_select_all"
  ON public.users FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "users_admin_update_all" ON public.users;
CREATE POLICY "users_admin_update_all"
  ON public.users FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users_admin_delete_all" ON public.users;
CREATE POLICY "users_admin_delete_all"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- Insert: only via auth trigger (admin client should not INSERT directly;
-- use Edge Function / admin invite endpoint that calls auth.admin.createUser).

-- -----------------------------------------------------------------------------
-- public.user_profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_profiles_admin_all" ON public.user_profiles;
CREATE POLICY "user_profiles_admin_all"
  ON public.user_profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- public.user_progress
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_progress_admin_all" ON public.user_progress;
CREATE POLICY "user_progress_admin_all"
  ON public.user_progress FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- public.user_plans
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_plans_admin_all" ON public.user_plans;
CREATE POLICY "user_plans_admin_all"
  ON public.user_plans FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- public.notifications — admins can insert and read all
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "notifications_admin_select_all" ON public.notifications;
CREATE POLICY "notifications_admin_select_all"
  ON public.notifications FOR SELECT
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- public.audit_logs — admins can SELECT and INSERT
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_admin_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- =============================================================================
-- End of migration
-- =============================================================================
