-- =============================================================================
-- Migration: Medical consent tracking
-- =============================================================================
-- Purpose:
--   1) Add two columns to user_profiles to record the user's acceptance of
--      the medical disclaimer shown in the plan view.
--   2) Enable admins to see who has accepted and when, for legal audit.
--
-- Assumptions:
--   - RLS on user_profiles already lets the user UPDATE their own row.
--   - The frontend sets the timestamp + version atomically when the user
--     accepts the disclaimer modal in /plan.
--
-- Run in Supabase SQL Editor. Idempotent.
-- =============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS medical_consent_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS medical_consent_version TEXT;

-- Index for fast admin queries (e.g. "who hasn't accepted yet?").
CREATE INDEX IF NOT EXISTS idx_user_profiles_medical_consent
  ON public.user_profiles (medical_consent_accepted_at)
  WHERE medical_consent_accepted_at IS NULL;

COMMENT ON COLUMN public.user_profiles.medical_consent_accepted_at IS
  'ISO timestamp at which the user accepted the medical disclaimer. NULL means never accepted.';
COMMENT ON COLUMN public.user_profiles.medical_consent_version IS
  'Version string of the medical disclaimer that the user accepted. E.g. 2026-07-20.';
