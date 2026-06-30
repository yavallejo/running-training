-- Migration: Fase 2 race results + achievement system
-- Run this in Supabase SQL editor (https://app.supabase.com → SQL)
-- Idempotent: safe to re-run

-- =========================================================================
-- 1. race_results: add skipped flag + deadline_at
-- =========================================================================

ALTER TABLE race_results
  ADD COLUMN IF NOT EXISTS skipped BOOLEAN DEFAULT FALSE;

ALTER TABLE race_results
  ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMPTZ;

-- Backfill: any existing rows get a default deadline (race_date + 10 days)
UPDATE race_results
SET deadline_at = (race_date::date + INTERVAL '10 days')::timestamptz
WHERE deadline_at IS NULL;

-- =========================================================================
-- 2. user_achievements: ensure unique constraint (needed for upsert)
-- =========================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_achievements_user_id_achievement_id_key'
  ) THEN
    ALTER TABLE user_achievements
      ADD CONSTRAINT user_achievements_user_id_achievement_id_key
      UNIQUE (user_id, achievement_id);
  END IF;
END $$;

-- =========================================================================
-- 3. achievements: sync codes with src/lib/achievements.ts BADGES list
-- The runtime checks badges by code; rows here populate the TrophiesSection.
-- 9 codes were seeded in the initial migration; we add the 2 new ones.
-- =========================================================================

INSERT INTO achievements (code, name, description, icon, requirement_type, requirement_value)
VALUES
  ('streak-7',  'En llamas',     '7 sesiones seguidas completadas',           '🔥🔥',  'streak', 7),
  ('10k-complete', 'Doble dígito', 'Acumulaste 10 km de distancia real',     '🚀',  'distance', 10),
  ('finish',     'Meta Cumplida',  '100% de las sesiones completadas',        '🏆',  'completion', 100)
ON CONFLICT (code) DO NOTHING;

-- =========================================================================
-- 4. is_public_profile: should already exist per Fase 1, but defensive
-- =========================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_public_profile BOOLEAN DEFAULT FALSE;

-- =========================================================================
-- Verification queries (run separately to confirm):
-- =========================================================================
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'race_results';
SELECT * FROM achievements ORDER BY code;
SELECT conname FROM pg_constraint WHERE conname LIKE 'user_achievements%';
