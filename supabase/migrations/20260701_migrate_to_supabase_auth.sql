-- =============================================================================
-- Migration: Migrate to Supabase Auth
-- =============================================================================
-- Purpose:
--   The app currently stores users in `public.users` with a custom
--   `password_hash` column and validates credentials client-side. This is
--   insecure and breaks under the new RLS policies (which scope reads to
--   `auth.uid()`).
--
--   This migration:
--     1) Drops the `password_hash` column (no longer needed; Supabase Auth
--        manages credentials in `auth.users`).
--     2) Ensures `public.users.email` is unique and not null.
--     3) Mirrors the auth user_id into `public.users.id` via a backfill.
--     4) Creates a trigger on `auth.users` INSERT so future signups
--        automatically create a row in `public.users`.
--     5) Creates a SECURITY DEFINER helper to provision the public profile
--        row + user_plans row from a new signup.
--
--   After running this, the app must use `supabase.auth.signUp` /
--   `supabase.auth.signInWithPassword` instead of the custom flow.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Drop password_hash — no longer used by the app.
-- -----------------------------------------------------------------------------
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- -----------------------------------------------------------------------------
-- 1) Make email required + unique.
-- -----------------------------------------------------------------------------
-- Backfill any null emails to a placeholder so the NOT NULL passes; the
-- placeholder is unusable for login and should be re-set by the user.
UPDATE public.users
SET email = CONCAT('legacy+', id::text, '@noemail.invalid')
WHERE email IS NULL;

ALTER TABLE public.users
  ALTER COLUMN email SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2) Trigger: when a row is created in `auth.users`, create the matching
--    public.users row with default values. The trigger uses the SECURITY
--    DEFINER helper to bypass RLS during the bootstrap.
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

  -- Derive a username from the email local part if not provided in metadata
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.users (
    id,
    username,
    email,
    plan_id,
    race_distance,
    race_date,
    race_name,
    start_date,
    role,
    is_active,
    is_public_profile,
    created_at
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

  -- Also create a user_plans row so the plan page can read it.
  -- No ON CONFLICT here: user_plans has no unique constraint covering these
  -- columns, and this is the first insert for a brand-new auth user.
  IF v_default_plan_id IS NOT NULL THEN
    INSERT INTO public.user_plans (user_id, plan_id, plan_name, plan_level, race_distance, race_date, race_name, start_date, is_active)
    VALUES (
      NEW.id,
      v_default_plan_id,
      'beginner',
      'beginner',
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 3) Backfill: for existing `public.users` rows that don't have a matching
--    `auth.users` row, create one with a random unusable password. These
--    users will need to use "reset password" to set a real password.
--    (In a fresh project this step is a no-op.)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT pu.id, pu.email
    FROM public.users pu
    LEFT JOIN auth.users au ON au.id = pu.id
    WHERE au.id IS NULL
  LOOP
    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token,
      email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      r.id,
      'authenticated',
      'authenticated',
      r.email,
      crypt(encode(gen_random_bytes(24), 'hex'), gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider','email','providers', ARRAY['email']),
      jsonb_build_object('username', r.email),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      r.id,
      r.id::text,
      jsonb_build_object('sub', r.id::text, 'email', r.email),
      'email',
      NOW(),
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =============================================================================
-- End of migration
-- =============================================================================
