# Auth & RLS migration

This folder contains the SQL migrations applied to harden the Supabase
schema and migrate from the custom SHA-256 password flow to Supabase Auth.

## Files (run in order)

1. `20260701_harden_rls_and_public_user_summary.sql` — Enable RLS on every
   public table, redefine policies scoped to `auth.uid()`, and create the
   `public_user_summary` view that exposes only non-sensitive fields.
2. `20260701_migrate_to_supabase_auth.sql` — Drop `password_hash`, enforce
   unique `email`, install the `on_auth_user_created` trigger that
   provisions a `public.users` row on signup, and backfill existing rows
   into `auth.users`.
3. `20260701_admin_policies.sql` — Add `is_admin()` helper and policies
   that let admin-role users SELECT/UPDATE/DELETE across all rows.

## Frontend changes

- `src/lib/auth.ts` rewritten on top of `supabase.auth`. Exports
  `signIn`, `signUp`, `signOut`, `getSession` (sync, localStorage),
  `getSessionAsync` (authoritative), `refreshSession`, `clearSession`
  (back-compat alias for `signOut` + localStorage wipe).
- Login now uses **email** + password (was username + custom hash).
- `src/app/rankings/page.tsx` reads from `public_user_summary` instead of
  `public.users`.
- Admin panel: hard-delete / password-reset / create-user actions are
  blocked client-side and show a "pending Edge Function" message. Read,
  update, soft-delete and audit log writes work via the admin policies.

## Pending work

- Edge Function with `service_role` for:
  - Admin: create user (with email + temp password)
  - Admin: hard delete (cascade to `auth.users`)
  - Admin: reset password (or send reset email)
- Email confirmation flow: currently `signUp` succeeds even if email
  confirmation is required; the user can only sign in after confirming.
- Migration of any in-flight `running_session` localStorage entries from
  the old shape (they are compatible because the field names overlap, but
  the `username`/`email` distinction matters for login).
