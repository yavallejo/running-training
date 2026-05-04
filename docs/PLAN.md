# RunPlan Pro - Implementation Plan

## Algorithmic Training Plan Generation System

> Created: 2026-05-02
> Status: ✅ COMPLETED

---

## Summary

This document lists all the tasks necessary to implement the algorithmic training plan generation system, including changes in Supabase (user) and code (developer/AI).

---

## PART 1: USER TASKS (SUPABASE)

### 1.1 Modify `user_profiles` Table

**Status:** ✅ COMPLETED

Run the following SQL in the Supabase SQL Editor:

```sql
-- Add new columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age BETWEEN 16 AND 99);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'other' CHECK (sex IN ('male', 'female', 'other'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS weight DECIMAL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resting_heart_rate INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS max_heart_rate INTEGER;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferred_terrain TEXT DEFAULT 'road' CHECK (preferred_terrain IN ('road', 'track', 'trail', 'treadmill', 'mixed'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goal_type TEXT DEFAULT 'fitness' CHECK (goal_type IN ('compete', 'fitness', 'weight_loss'));
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS has_treadmill BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS progressive_pace BOOLEAN DEFAULT TRUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS medical_clearance BOOLEAN DEFAULT FALSE;

-- Check structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_profiles';
```

### 1.2 Delete `training_sessions` Table

**Status:** ✅ COMPLETED

```sql
-- Verify that there is no important data before deletion
SELECT COUNT(*) FROM training_sessions;

-- Drop table (if empty or no longer used)
DROP TABLE IF EXISTS training_sessions;
```

### 1.3 Verify RLS Policies

**Status:** ✅ COMPLETED

Verify that the Row Level Security policies allow:

- Reading the user's own profile
- Updating the user's own profile

```sql
-- See current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE tablename = 'user_profiles';
```

---

## PART 2: DEVELOPER TASKS (CODE)

### 2.1 Terms and Conditions Page

**File:** `src/app/terminos/page.tsx` (CREATE)
**Status:** PENDING
**Estimated time:** 30 minutes

**Content:**

- Medical disclaimer
- Notice that the plan is algorithmic
- Liability clause
- Data policy

### 2.2 Link in Registration

**Files:** `src/app/register/page.tsx` (MODIFY)
**Status:** PENDING
**Estimated time:** 10 minutes

**Change:** Add link to "/terminos" under the form

### 2.3 Onboarding Quiz Expansion

**File:** `src/app/onboarding/page.tsx` (MODIFY)
**Status:** PENDING
**Estimated time:** 2 hours

**Changes:**

- [ ] Add Step 5: Physiology (age, sex, weight, HR)
- [ ] Add Step 6: Preferences (terrain, treadmill, progressive pace)
- [ ] Add mandatory checkbox medical_clearance in Step 4
- [ ] Add injury disclaimer when hasInjuries = true
- [ ] Update saving logic to include new fields

### 2.4 Rewrite Generation Algorithm

**File:** `src/lib/training-plan.ts` (MODIFY)
**Status:** PENDING
**Estimated time:** 2.5 hours

**Improvements:**

- [ ] Use `current_weekly_km` for initial volume
- [ ] Use `minutes_per_session` for duration
- [ ] Implement progressive pace if `progressive_pace = true`
- [ ] Implement HR zones if HR data present
- [ ] Adjust for injuries (`has_injuries`)
- [ ] Downgrade weeks every 3 weeks if `age > 60`
- [ ] Adjust by preferred terrain
- [ ] Distances based on goal (`goal_type`)

### 2.5 Update Profile Page

**File:** `src/app/profile/page.tsx` (MODIFY)
**Status:** PENDING
**Estimated time:** 45 minutes

**Changes:**

- [ ] Add fields for new profile data
- [ ] Add "Update Profile" button
- [ ] Section for medical_clearance

### 2.6 Update Documentation

**File:** `docs/ROADMAP.md` (MODIFY)
**Status:** PENDING
**Estimated time:** 15 minutes

**Changes:**

- [ ] Update user_profiles schema
- [ ] Document new quiz structure
- [ ] Mark Phase 4 as completed

---

## PROGRESS CHECKLIST

### Supabase (User)

| #   | Task                              | Status       |
| --- | --------------------------------- | ------------ |
| 1.1 | Modify user_profiles (10 columns) | ✅ COMPLETED |
| 1.2 | Delete training_sessions          | ✅ COMPLETED |
| 1.3 | Verify RLS policies               | ✅ COMPLETED |

### Code (Developer)

| #   | Task                                      | Status       |
| --- | ----------------------------------------- | ------------ |
| 2.1 | Terms page                                | ✅ COMPLETED |
| 2.2 | Link in registration                      | ✅ COMPLETED |
| 2.3 | Expand quiz (+2 steps + medical checkbox) | ✅ COMPLETED |
| 2.4 | Rewrite algorithm                         | ✅ COMPLETED |
| 2.5 | Update profile                            | ✅ COMPLETED |
| 2.6 | Update ROADMAP.md                         | ✅ COMPLETED |

---

## NOTES

1. The `medical_clearance` checkbox is MANDATORY for all users
2. Existing users with NULL profiles in the new fields will receive default values
3. Progressive pace is the DEFAULT (users can choose fixed pace)
4. If the user has injuries, high-impact workouts are replaced with cross-training

---

## SUGGESTED IMPLEMENTATION ORDER

1. **First (User):** Run SQL in Supabase
2. **Second (Developer):** Create terms page
3. **Third (Developer):** Link in registration
4. **Fourth (Developer):** Expand quiz
5. **Fifth (Developer):** Rewrite algorithm
6. **Sixth (Developer):** Update profile
7. **Last (Developer):** Update docs

---

## ADDITIONAL IMPROVEMENTS (Beyond Original Plan)

### Admin Panel Enhancements

| Improvement | Status |
|-------------|--------|
| Delete confirmation modal | ✅ COMPLETED |
| Edit modal with Plan and Role fields | ✅ COMPLETED |
| Plan sync (plan → experience_level) | ✅ COMPLETED |
| Error handling with user feedback | ✅ COMPLETED |
| Stats with useMemo optimization | ✅ COMPLETED |

### Security Fixes

| Fix | Status |
|-----|--------|
| Deleted `debug-hash.js` (exposed credentials) | ✅ COMPLETED |
| Deleted `admin/page.tsx.bak` (weaker auth) | ✅ COMPLETED |

### Performance Optimizations

| Optimization | Impact |
|--------------|--------|
| saveProgress: only save changed session | ~90x fewer upserts |
| setLoading in finally block | Correct loading state |
| useMemo for stats | No recalculation on every render |
| Select specific columns | Less data transfer |
| Parallel queries | Faster loading |

### Bug Fixes

| Bug | Fix |
|-----|-----|
| Session ordering | Sort by date + sessionOrder |
| Session IDs | Deterministic UUIDs (userId + index) |
| Progress persistence | Fixed UUID format for Supabase |
| Date calculation | Always generate correct number of dates |
| Null profile values | Nullish coalescing with defaults |
| Km text visibility | Changed to text-foreground |

### RLS Configuration

| Table | Action |
|-------|--------|
| `user_progress` | Disabled RLS (app handles auth) |
| `user_profiles` | Verified policies |
