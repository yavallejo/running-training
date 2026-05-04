# RunPlan Pro - Development Roadmap

> Last updated: 2026-05-02
> Status: In Progress

---

## Overview

Personalized training system that adapts running plans based on the runner's actual level, availability, and goals. The system should be smart enough to generate appropriate plans without having to manually create templates for each parameter combination.

---

## Development Phases

### Phase 1: Extended Data Model ✅ COMPLETED

**Priority:** HIGH
**Status:** COMPLETED

#### Objectives

- [x] `users` table with core fields (start_date, race_date, race_distance)
- [x] `user_profiles` table with extended evaluation data
- [x] Indices and relationships in Supabase

#### Fields for `user_profiles`

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id),
  -- Experience level
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  current_weekly_km DECIMAL,
  available_days_per_week INTEGER CHECK (available_days_per_week BETWEEN 2 AND 7),
  minutes_per_session INTEGER,
  -- Injuries
  has_injuries BOOLEAN DEFAULT FALSE,
  injury_description TEXT,
  medical_clearance BOOLEAN DEFAULT FALSE,
  -- Physiology
  age INTEGER CHECK (age BETWEEN 16 AND 99),
  sex TEXT DEFAULT 'other' CHECK (sex IN ('male', 'female', 'other')),
  weight DECIMAL,
  resting_heart_rate INTEGER,
  max_heart_rate INTEGER,
  -- Preferences
  preferred_terrain TEXT DEFAULT 'road' CHECK (preferred_terrain IN ('road', 'track', 'trail', 'treadmill', 'mixed')),
  goal_type TEXT DEFAULT 'fitness' CHECK (goal_type IN ('compete', 'fitness', 'weight_loss')),
  has_treadmill BOOLEAN DEFAULT FALSE,
  progressive_pace BOOLEAN DEFAULT TRUE,
  -- Metadata
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 2: Initial Assessment Quiz ✅ COMPLETED

**Priority:** HIGH
**Status:** COMPLETED

#### Objectives

- [x] Create onboarding flow to capture user info before generating plan
- [x] Implement 7-step wizard
- [x] Integrate with automatic plan generation
- [x] Mandatory medical clearance checkbox

#### Quiz Questions

**Step 1: Running Experience**

1. How long have you been running regularly?
2. Approximately how many kilometers would you run per week?

**Step 2: Goal** 3. What distance are you preparing for? 4. When is your target race? 5. Do you already have a race name?

**Step 3: Availability** 6. How many days per week can you train? 7. How much time do you have available per session?

**Step 4: Physical Conditions** 8. Do you have any injury or medical condition? 9. Briefly describe your injury (optional) 10. Mandatory checkbox: I have consulted my doctor

**Step 5: Physiology** 11. How old are you? (required) 12. Biological sex 13. Weight in kg (optional) 14. Resting heart rate (optional) 15. Max heart rate (optional)

**Step 6: Preferences** 16. Where do you mostly run? 17. Do you have access to treadmill? 18. Progressive pace? (checkbox)

**Step 7: Confirmation**

- Data summary
- Generate plan button

#### File: `/src/app/onboarding/page.tsx`

- 7-step wizard with navigation
- At end: automatic plan generation
- Saved in `user_profiles` and updates `users`

#### Experience Level Assignment Logic

```typescript
function calculateExperienceLevel(
  timeRunning: string,
  weeklyKm: number,
): string {
  const isBeginner =
    timeRunning === "never" || timeRunning === "less-3-months" || weeklyKm < 10;
  const isAdvanced =
    (timeRunning === "more-1-year" || timeRunning === "6-12-months") &&
    weeklyKm >= 30;

  if (isBeginner) return "beginner";
  if (isAdvanced) return "advanced";
  return "intermediate";
}
```

---

### Phase 3: User Profile Page ✅ COMPLETED

**Priority:** MEDIUM
**Status:** COMPLETED

#### Objectives

- [x] Create `/profile` page
- [x] Allow editing personal info
- [x] View current plan stats
- [x] Button to regenerate/recalculate plan

#### Editable Fields

- Race: Username, distance, date, name
- Training: Level, current km, available days, minutes/session, injuries
- Physiology: Age, sex, weight, resting HR, max HR
- Preferences: Terrain, goal, treadmill, progressive pace

---

### Phase 4: Improved Algorithmic Generation ✅ COMPLETED

**Priority:** HIGH
**Status:** COMPLETED

#### Objectives

- [x] Rewrite `generateTrainingPlan()` to consider multiple variables
- [x] Use `experience_level` to adjust intensities
- [x] Use `available_days_per_week` to decide sessions/week
- [x] Use `minutes_per_session` to scale distances
- [x] Use `current_weekly_km` for initial volume
- [x] Implement optional progressive pace
- [x] Implement heart rate zones if HR data available
- [x] Adjust for injuries (replace intervals with cross)
- [x] Adjust for age (more frequent deload weeks if >60)
- [x] Adjust for preferred terrain
- [x] Adjust for goal (compete/fitness/weight_loss)

#### Workout Types

| Type        | Intensity | Description              | HR Zone |
| ----------- | --------- | ------------------------ | ------- |
| `easy`      | 60-70% HR | Easy conversational run  | 60-70%  |
| `steady`    | 70-80% HR | Moderate pace            | 70-80%  |
| `tempo`     | 80-85% HR | Hard but sustainable     | 80-85%  |
| `intervals` | 85-95% HR | Speed with recovery      | 85-95%  |
| `long_run`  | 70-80% HR | Longest weekly run       | 70-80%  |
| `recovery`  | 55-65% HR | Very easy jog/walk       | 55-65%  |
| `cross`     | 60-75% HR | Cross-training exercises | 60-75%  |

#### Adjustment Factors

- **Injuries:** ×0.7 intensity, replace intervals with cross
- **Terrain:** Treadmill ×0.98, Road ×1.02, Trail ×1.05
- **Goal:** Compete ×1.1, Fitness ×1.0, Weight ×0.9
- **Age >60:** Deload every 3 weeks (vs normal every 4)
- **Initial volume:** Based on 30% of current weekly km

#### Progressive Pace

```typescript
// If progressive_pace = true
// Weeks 1-4:   base pace × 1.15 (slower, base building)
// Weeks 5-8:   base pace × 1.08
// Weeks 9-12:  base pace × 1.02
// Weeks 13+:   base pace (fastest)
```

#### Heart Rate Zones (if HR available)

```typescript
// Karvonen: Target HR = (Max HR - Resting HR) × intensity + Resting HR
// easy: 60-70%  |  steady: 70-80%  |  tempo: 80-85%  |  intervals: 85-95%
```

---

### Phase 5: Terms and Conditions Page ✅ COMPLETED

**Priority:** HIGH
**Status:** COMPLETED

#### Objectives

- [x] Create `/terminos` page
- [x] Include medical disclaimer
- [x] Include algorithm information
- [x] Include liability clause
- [x] Link from registration and onboarding

---

### Phase 6: Admin Templates (Future)

**Priority:** LOW
**Status:** PENDING

#### Objectives

- [ ] CRUD for workout templates in admin
- [ ] Manual override for sessions
- [ ] Library of predefined workouts

---

## Files Added/Modified

### New Files

| File                          | Description             | Status    |
| ----------------------------- | ----------------------- | --------- |
| `src/app/onboarding/page.tsx` | Initial assessment quiz | COMPLETED |
| `src/app/profile/page.tsx`    | User profile page       | COMPLETED |
| `src/app/terminos/page.tsx`   | Terms and conditions    | COMPLETED |
| `docs/ROADMAP.md`             | This document           | COMPLETED |
| `docs/PENDIENTES.md`          | Pending features        | COMPLETED |
| `docs/PLAN.md`                | Implementation plan     | COMPLETED |
| `docs/TERMS.md`               | Terms text              | COMPLETED |

### Modified Files

| File                        | Changes                 | Status    |
| --------------------------- | ----------------------- | --------- |
| `src/lib/training-plan.ts`  | Full improved algorithm | COMPLETED |
| `src/lib/auth.ts`           | Add level logic         | COMPLETED |
| `src/app/register/page.tsx` | Link to terms           | COMPLETED |
| `src/app/profile/page.tsx`  | Extended fields         | COMPLETED |

---

## Success Metrics

- [x] User can finish quiz in < 3 minutes
- [ ] Plan is generated in < 2 seconds
- [ ] Plan is appropriate for level (manual validation)
- [x] User can edit profile and recalculate plan
- [x] No TypeScript errors
- [x] Successful build

---

## Notes

### About Algorithm vs Templates

The approach is 100% algorithmic. Static `training_sessions` templates are no longer used and may be deleted from the database.

### About Plan Validation

Before being considered "completed," each generated plan must be manually validated by at least:

1. A beginner runner (0-3 months)
2. An intermediate runner (6-12 months)
3. An advanced runner (1+ year)
4. For each distance (3K, 5K, 7K, 10K, 21K, 42K)

### About Terms and Conditions

The terms page includes:

- Mandatory medical disclaimer
- Notice of algorithmic nature of plan
- Liability clause
- Data policy link
