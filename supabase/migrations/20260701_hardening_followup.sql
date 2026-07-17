-- =============================================================================
-- Migration: Hardening follow-up
-- =============================================================================
-- Purpose:
--   Apply the critical fixes and warnings from the post-migration review
--   without re-running or breaking previously applied migrations.
--
-- Fixes applied:
--   F1. Enable pgcrypto (defensive, in case it isn't enabled on older
--       Supabase projects).
--   F2. Re-create handle_new_auth_user() with the correct owner
--       (supabase_auth_admin) so the trigger bypasses RLS on public.users.
--   F3. Remove ON CONFLICT DO NOTHING on the user_plans insert (the table
--       has no unique constraint to match, and the public.users ON
--       CONFLICT already prevents double-provisioning).
--   F4. Defensive instance_id handling in the backfill (covered for older
--       Supabase versions; the original block is now wrapped so it can be
--       re-run safely).
--   F5. Tighten audit_logs INSERT: admin_id must equal auth.uid() to
--       prevent admins from forging audit entries on behalf of others.
--   F6. Set is_admin() owner to supabase_auth_admin for stable RLS bypass.
--   F7. Add DROP+CREATE for the new policies in the previous migrations
--       so re-runs of this hardening file are idempotent.
--   F8. Drop the redundant is_public_profile column from public_user_summary
--       (every row already has it = true due to the WHERE clause).
--
-- Re-runnable: yes. Idempotent.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- F1. Ensure pgcrypto is enabled (no-op if already enabled).
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- F2 + F3. Recreate handle_new_auth_user() with correct ownership and
--          fix the user_plans ON CONFLICT issue.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_default_plan_id uuid;
  v_username text;
BEGIN
  -- Default plan: beginner
  SELECT id INTO v_default_plan_id FROM public.plans WHERE level = 'beginner' LIMIT 1;

  -- Derive a username from raw_user_meta_data or the email local part.
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.users (
    id, username, email, plan_id, race_distance, race_date, race_name,
    start_date, role, is_active, is_public_profile, created_at
  ) VALUES (
    NEW.id,
    LOWER(v_username),
    NEW.email,
    v_default_plan_id,
    7,
    (CURRENT_DATE + INTERVAL '56 days')::date,
    'Mi Carrera',
    (CURRENT_DATE + INTERVAL '1 day')::date,
    'user',
    true,
    false,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- No ON CONFLICT here: user_plans has no unique constraint, and the
  -- public.users ON CONFLICT above already prevents double-provisioning.
  IF v_default_plan_id IS NOT NULL THEN
    INSERT INTO public.user_plans (
      user_id, plan_id, plan_name, plan_level,
      race_distance, race_date, race_name, start_date, is_active
    ) VALUES (
      NEW.id, v_default_plan_id, 'beginner', 'beginner',
      7,
      (CURRENT_DATE + INTERVAL '56 days')::date,
      'Mi Carrera',
      (CURRENT_DATE + INTERVAL '1 day')::date,
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Owner must bypass RLS so the trigger can INSERT into public.users.
-- We try to set the owner to supabase_auth_admin (which bypasses RLS on
-- hosted Supabase). If your SQL Editor role can't SET ROLE to it (the
-- common case — ERROR 42501), this block is a safe no-op and the function
-- still works as SECURITY DEFINER, owned by the role that ran the
-- migration (typically `postgres` in hosted Supabase, which also bypasses
-- RLS by default).
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION public.handle_new_auth_user() OWNER TO supabase_auth_admin;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Skipping OWNER change: current role cannot SET ROLE supabase_auth_admin (this is OK on hosted Supabase).';
    WHEN OTHERS THEN
      RAISE NOTICE 'Skipping OWNER change: % (%)', SQLERRM, SQLSTATE;
  END;
END $$;

-- Ensure the authenticator role (used by PostgREST for API requests) can
-- execute the function. This is required so the trigger — fired by the
-- internal auth.users insert path — can call the function. Safe no-op if
-- already granted.
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_auth_user() TO authenticator;

-- Recreate the trigger (idempotent).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- F4. Defensive backfill for legacy users.
--     Idempotent: skips any public.users row that already has a matching
--     auth.users row (by id) or conflicting email.
--     Handles older Supabase versions that lack the instance_id column.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  v_has_instance_id boolean;
  v_has_em_change_token_new boolean;
BEGIN
  v_has_instance_id := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'instance_id'
  );

  v_has_em_change_token_new := EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'email_change_token_new'
  );

  FOR r IN
    SELECT pu.id, pu.email
    FROM public.users pu
    LEFT JOIN auth.users au_id ON au_id.id = pu.id
    LEFT JOIN auth.users au_em ON au_em.email = pu.email
    WHERE au_id.id IS NULL
      AND au_em.id IS NULL
      AND pu.email IS NOT NULL
      AND pu.email NOT LIKE 'legacy+%%@noemail.invalid'
  LOOP
    IF v_has_instance_id AND v_has_em_change_token_new THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        r.id, 'authenticated', 'authenticated', r.email,
        crypt(encode(gen_random_bytes(24), 'hex'), gen_salt('bf')),
        NOW(),
        jsonb_build_object('provider','email','providers', ARRAY['email']),
        jsonb_build_object('username', r.email),
        NOW(), NOW(), '', '', '', ''
      )
      ON CONFLICT (id) DO NOTHING;
    ELSIF v_has_instance_id THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        r.id, 'authenticated', 'authenticated', r.email,
        crypt(encode(gen_random_bytes(24), 'hex'), gen_salt('bf')),
        NOW(),
        jsonb_build_object('provider','email','providers', ARRAY['email']),
        jsonb_build_object('username', r.email),
        NOW(), NOW(), '', '', ''
      )
      ON CONFLICT (id) DO NOTHING;
    ELSE
      INSERT INTO auth.users (
        id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, email_change, recovery_token
      ) VALUES (
        r.id, 'authenticated', 'authenticated', r.email,
        crypt(encode(gen_random_bytes(24), 'hex'), gen_salt('bf')),
        NOW(),
        jsonb_build_object('provider','email','providers', ARRAY['email']),
        jsonb_build_object('username', r.email),
        NOW(), NOW(), '', '', ''
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), r.id, r.id::text,
      jsonb_build_object('sub', r.id::text, 'email', r.email),
      'email', NOW(), NOW(), NOW()
    )
    ON CONFLICT (provider_id, provider) DO NOTHING;
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- F6. Re-define is_admin() with the correct owner.
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

DO $$
BEGIN
  BEGIN
    ALTER FUNCTION public.is_admin() OWNER TO supabase_auth_admin;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Skipping OWNER change: current role cannot SET ROLE supabase_auth_admin (this is OK on hosted Supabase).';
    WHEN OTHERS THEN
      RAISE NOTICE 'Skipping OWNER change: % (%)', SQLERRM, SQLSTATE;
  END;
END $$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticator;

-- -----------------------------------------------------------------------------
-- F5. Tighten audit_logs INSERT: admin_id must equal auth.uid().
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_logs_admin_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (public.is_admin() AND admin_id = auth.uid());

-- -----------------------------------------------------------------------------
-- F7. Make the policies added in the previous migrations idempotent so
--     re-running this hardening file is safe.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- users
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users'      AND policyname='users_select_own')      THEN DROP POLICY "users_select_own"      ON public.users; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users'      AND policyname='users_update_own')      THEN DROP POLICY "users_update_own"      ON public.users; END IF;
  -- user_profiles
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_select_own') THEN DROP POLICY "user_profiles_select_own" ON public.user_profiles; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_insert_own') THEN DROP POLICY "user_profiles_insert_own" ON public.user_profiles; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_profiles' AND policyname='user_profiles_update_own') THEN DROP POLICY "user_profiles_update_own" ON public.user_profiles; END IF;
  -- user_progress
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_select_own') THEN DROP POLICY "user_progress_select_own" ON public.user_progress; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_insert_own') THEN DROP POLICY "user_progress_insert_own" ON public.user_progress; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_update_own') THEN DROP POLICY "user_progress_update_own" ON public.user_progress; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_progress' AND policyname='user_progress_delete_own') THEN DROP POLICY "user_progress_delete_own" ON public.user_progress; END IF;
  -- user_plans
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_plans'   AND policyname='user_plans_all_own')        THEN DROP POLICY "user_plans_all_own"        ON public.user_plans; END IF;
  -- plans
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='plans'         AND policyname='plans_public_read')         THEN DROP POLICY "plans_public_read"         ON public.plans; END IF;
  -- achievements
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='achievements'  AND policyname='achievements_public_read')  THEN DROP POLICY "achievements_public_read"  ON public.achievements; END IF;
  -- race_results
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='race_results'  AND policyname='race_results_public_read')  THEN DROP POLICY "race_results_public_read"  ON public.race_results; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='race_results'  AND policyname='race_results_own_insert')   THEN DROP POLICY "race_results_own_insert"   ON public.race_results; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='race_results'  AND policyname='race_results_own_update')   THEN DROP POLICY "race_results_own_update"   ON public.race_results; END IF;
  -- user_achievements
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_achievements' AND policyname='user_achievements_own_insert')  THEN DROP POLICY "user_achievements_own_insert"  ON public.user_achievements; END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_achievements' AND policyname='user_achievements_public_read') THEN DROP POLICY "user_achievements_public_read" ON public.user_achievements; END IF;
  -- notifications
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='notifications_select_own')  THEN DROP POLICY "notifications_select_own"  ON public.notifications; END IF;
END $$;

-- Re-create the policies (same as in the previous migrations).
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "user_profiles_insert_own" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "user_profiles_update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "user_progress_select_own" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_progress_insert_own" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_update_own" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_delete_own" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_plans_all_own" ON public.user_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "plans_public_read"         ON public.plans         FOR SELECT USING (true);
CREATE POLICY "achievements_public_read"  ON public.achievements  FOR SELECT USING (true);

CREATE POLICY "race_results_public_read"  ON public.race_results  FOR SELECT USING (true);
CREATE POLICY "race_results_own_insert"   ON public.race_results  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "race_results_own_update"   ON public.race_results  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_achievements_own_insert"  ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_achievements_public_read" ON public.user_achievements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_achievements.user_id AND u.is_public_profile = true)
);

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- F8. Drop the redundant is_public_profile column from public_user_summary.
-- -----------------------------------------------------------------------------
-- We must DROP the view first because CREATE OR REPLACE VIEW cannot change
-- the number or types of columns (e.g. removing is_public_profile).
DROP VIEW IF EXISTS public.public_user_summary;

CREATE OR REPLACE VIEW public.public_user_summary AS
SELECT
  u.id,
  u.username,
  u.race_name,
  u.race_distance,
  u.race_date,
  u.created_at
FROM public.users u
WHERE u.is_public_profile = true;

GRANT SELECT ON public.public_user_summary TO anon, authenticated;

COMMENT ON VIEW public.public_user_summary IS
  'Non-sensitive projection of public.users. Safe to expose to anon/authenticated for leaderboards and social features. Includes only opt-in (is_public_profile = true) users. The is_public_profile column is omitted because every row already has it = true.';

-- =============================================================================
-- End of hardening migration
-- =============================================================================
