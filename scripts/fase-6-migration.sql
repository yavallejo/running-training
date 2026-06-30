-- Migration: Fase 6 plan history (per-user plan tracking)
-- Run this in Supabase SQL editor.
-- Idempotent.

-- =========================================================================
-- user_plans: one row per (user, plan) so we can track history
-- =========================================================================

CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  plan_name TEXT,
  plan_level TEXT,
  race_distance INTEGER NOT NULL,
  race_date DATE,
  race_name TEXT,
  start_date DATE,
  total_sessions INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS user_plans_user_id_idx ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS user_plans_user_active_idx ON user_plans(user_id, is_active);

-- Backfill from existing users (one active plan per user)
INSERT INTO user_plans (user_id, plan_id, race_distance, race_date, race_name, start_date, is_active, created_at)
SELECT
  id AS user_id,
  plan_id,
  race_distance,
  race_date::date,
  race_name,
  start_date::date,
  TRUE,
  created_at
FROM users
WHERE plan_id IS NOT NULL
  AND id NOT IN (SELECT user_id FROM user_plans);

-- =========================================================================
-- user_progress: add plan_id column so we can count per-plan sessions
-- =========================================================================

ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS plan_id TEXT;

CREATE INDEX IF NOT EXISTS user_progress_plan_idx
  ON user_progress(user_id, plan_id)
  WHERE plan_id IS NOT NULL;
