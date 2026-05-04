# RunPlan Pro - Pending Features

> Last updated: 2026-05-02
> Status: Completed and Pending Implementations

---

## ✅ Features Implemented (Recent)

### 1. Datepicker for Race Date

**Priority:** HIGH
**Status:** ✅ COMPLETED
**Date:** 2026-05-01

#### Description

Added `react-datepicker` to the onboarding quiz to select race date in a more intuitive way.

#### Changes Made

- [x] Installed `react-datepicker` (already in package.json)
- [x] Imported DatePicker and CSS in onboarding
- [x] Replaced native input with DatePicker
- [x] Configured minDate, locale, and format

#### Files Modified

- `src/app/onboarding/page.tsx`

---

### 2. Edit Profile Link in Plan

**Priority:** HIGH
**Status:** ✅ COMPLETED
**Date:** 2026-05-01

#### Description

Added "Profile" button in the plan header to access the profile page and edit user information.

#### Changes Made

- [x] Added Profile button next to Logout
- [x] User icon with link to /profile
- [x] Responsive on desktop and mobile

#### Files Modified

- `src/components/PlanHeader.tsx`

---

### 3. Dynamic Algorithm over Static Templates

**Priority:** HIGH - CRITICAL
**Status:** ✅ COMPLETED
**Date:** 2026-05-01

#### Description

Refactored `generateTrainingPlan` so that when the user has profile data (completed quiz), the dynamic generation algorithm is used, instead of static templates from Supabase.

#### Original Problem

- The system looked for static templates in `training_sessions` FIRST
- If they existed, it used them and ignored user profile info
- Race date and other quiz data were NOT used

#### Solution Implemented

1. **Priority to algorithm:** If `profile.experience_level` exists, use algorithm
2. **Fallback to templates:** Only if NO profile (user didn't complete quiz)
3. **Dynamic data:** Dates calculated based on user's `raceDate`
4. **Personalization:** Distances, paces, and workout types personalized to profile

#### Files Modified

- `src/lib/training-plan.ts`

#### New Flow

```
[Quiz] → Save profile in user_profiles
              ↓
[Plan Page] → loadUserProfile(userId)
              ↓
        Has profile?
           ↓ YES         ↓ NO
    Use ALGORITHM   Fetch templates
   (dynamic plan)     (fallback)
```

---

### 4. Admin Panel Improvements

**Priority:** HIGH
**Status:** ✅ COMPLETED
**Date:** 2026-05-02

#### Description

Improved admin panel with better user management, delete confirmation modal, and plan synchronization.

#### Changes Made

- [x] Delete confirmation modal (replaces native `confirm()`)
- [x] Edit modal with Plan and Role fields
- [x] Plan sync: changing plan updates `experience_level` in `user_profiles`
- [x] Error handling with user feedback
- [x] Stats calculation with `useMemo` for performance

#### Files Modified

- `src/app/admin/page.tsx`

---

### 5. Security Fixes

**Priority:** CRITICAL
**Status:** ✅ COMPLETED
**Date:** 2026-05-02

#### Description

Removed sensitive files and improved security posture.

#### Changes Made

- [x] Deleted `debug-hash.js` (exposed credentials)
- [x] Deleted `src/app/admin/page.tsx.bak` (weaker auth check)
- [x] Added error logging for debugging

#### Files Deleted

- `debug-hash.js`
- `src/app/admin/page.tsx.bak`

---

### 6. Performance Optimizations

**Priority:** MEDIUM
**Status:** ✅ COMPLETED
**Date:** 2026-05-02

#### Description

Optimized database queries and rendering performance.

#### Changes Made

- [x] `saveProgress` now saves only changed session (was saving ALL sessions)
- [x] `setLoading(false)` moved to `finally` block (was before async completion)
- [x] Stats wrapped in `useMemo` (was recalculating on every render)
- [x] Specific column selection instead of `SELECT *`
- [x] Parallel queries where possible

#### Files Modified

- `src/app/plan/page.tsx`
- `src/app/admin/page.tsx`
- `src/lib/training-plan.ts`

---

### 7. Bug Fixes

**Priority:** HIGH
**Status:** ✅ COMPLETED
**Date:** 2026-05-02

#### Description

Fixed multiple bugs affecting core functionality.

#### Bugs Fixed

- [x] Session ordering: sessions now sort by date AND sessionOrder
- [x] Session IDs: deterministic UUIDs based on userId + index (was random each load)
- [x] Progress persistence: sessions now save/load correctly
- [x] Date calculation: always generates correct number of dates
- [x] Null handling: proper defaults for null profile values
- [x] Km text visibility: changed from `text-secondary` to `text-foreground`

#### Files Modified

- `src/lib/training-plan.ts`
- `src/app/plan/page.tsx`
- `src/components/SessionCard.tsx`

---

### 8. RLS Configuration

**Priority:** HIGH
**Status:** ✅ COMPLETED
**Date:** 2026-05-02

#### Description

Configured Row Level Security for proper data access.

#### Changes Made

- [x] Disabled RLS on `user_progress` (app handles authorization in code)
- [x] Verified RLS policies on `user_profiles`

#### SQL Executed

```sql
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
```

---

## 🔧 Suggested Next Steps

1. **Test full flow:** Signup → Login → Quiz → Verify generated plan
2. **Validate plans:** Ensure generated plans are appropriate for each level
3. **Password recovery:** Configure SMTP in Supabase
4. **Advanced statistics:** Add charting library for progress visualization

---

## Features on Hold

### 1. Profile Avatar

**Priority:** LOW
**Status:** PENDING
**Blocked by:** Storage setup in Supabase

#### Description

Allow users to upload a profile photo to be shown in:

- App header
- Profile page
- Progress statistics

#### Prerequisites

- [ ] Configure storage bucket in Supabase
- [ ] Create access policies (RLS)
- [ ] Implement upload component
- [ ] Handle image resizing
- [ ] Add `avatar_url` field in `users` table

#### Notes

- Use Supabase Storage for image hosting
- Max 5MB per image
- Formats: JPG, PNG, WebP
- Show placeholder avatar if no image

---

### 2. Password Recovery

**Priority:** MEDIUM
**Status:** PENDING
**Blocked by:** Email configuration in Supabase

#### Description

Full password recovery flow:

1. User requests recovery
2. Email with token is sent
3. User enters new password
4. Password is updated

#### Prerequisites

- [ ] Configure SMTP in Supabase
- [ ] Create recovery request page
- [ ] Create new password page
- [ ] Implement token validation logic

---

### 3. Push Notifications

**Priority:** LOW
**Status:** PENDING

#### Description

Send notifications to the user:

- Workout reminders
- Unlocked achievements
- Progress updates

#### Prerequisites

- [ ] Configure Firebase Cloud Messaging or similar
- [ ] Request notification permissions
- [ ] Store device tokens
- [ ] Implement sending logic

---

### 4. Offline Mode

**Priority:** LOW
**Status:** PENDING

#### Description

Allow access to the plan offline:

- Cache training sessions
- Sync on reconnect
- Connection status indicator

#### Prerequisites

- [ ] Implement Service Worker
- [ ] Use IndexedDB for local storage
- [ ] Create sync logic
- [ ] Handle data conflicts

---

### 5. Advanced Statistics

**Priority:** MEDIUM
**Status:** PENDING

#### Description

Additional progress metrics:

- Weekly mileage charts
- Pace evolution
- Period comparisons
- Performance predictions

#### Prerequisites

- [ ] Add charting library (Chart.js, Recharts)
- [ ] Create visualization components
- [ ] Implement statistical calculations
- [ ] Create dedicated statistics page

---

### 6. Device Integrations

**Priority:** LOW
**Status:** PENDING

#### Description

Connect with:

- Garmin Connect
- Apple Health
- Google Fit
- Strava

#### Prerequisites

- [ ] Acquire API credentials
- [ ] Implement OAuth flows
- [ ] Create webhooks for syncing
- [ ] Map data across formats

---

### 7. Real-time Workout Tracking

**Priority:** LOW
**Status:** PENDING

#### Description

During a workout session:

- Integrated stopwatch
- Real-time pace tracking
- Audio feedback
- Route map (GPS)

#### Prerequisites

- [ ] Access device GPS
- [ ] Integrate with Web Audio API
- [ ] Create workout UI
- [ ] Save session data

---

### 8. Social Features

**Priority:** LOW
**Status:** PENDING

#### Description

Social functionalities:

- Share progress on social networks
- Friend leaderboards
- Training groups
- Community events

#### Prerequisites

- [ ] Create friends/follow system
- [ ] Implement leaderboards
- [ ] Create activity feed
- [ ] Integrate social network APIs

---

## Related Files

| Feature       | Files to Modify                                                   |
| ------------- | ----------------------------------------------------------------- |
| Avatar        | `src/lib/supabase.ts`, `src/components/Header.tsx`                |
| Recovery      | `src/app/recover-password/page.tsx`, `src/lib/auth.ts`            |
| Notifications | `src/lib/notifications.ts`, `src/components/NotificationBell.tsx` |
| Offline       | `src/app/sw.js`, `src/lib/offline-storage.ts`                     |
| Statistics    | `src/app/stats/page.tsx`, `src/components/Charts.tsx`             |
| Integrations  | `src/lib/integrations/*.ts`, `src/app/settings/page.tsx`          |
| Real-Time     | `src/app/workout/live/page.tsx`, `src/lib/workout-tracker.ts`     |
| Social        | `src/app/social/page.tsx`, `src/lib/social.ts`                    |

---

## Implementation Notes

### Prioritization

Features are prioritized according to:

1. **User Impact** - How much it improves experience
2. **Complexity** - How long it takes to implement
3. **Dependencies** - What needs to be ready first

### Technical Decisions

- **Storage:** Use Supabase Storage for avatars (simpler than S3)
- **Notifications:** Firebase Cloud Messaging for push (widely supported)
- **Offline:** Service Workers + IndexedDB (web standard)
- **Charts:** Recharts (based on D3, lighter than Chart.js)

### UX Considerations

- All optional features should be able to be turned off
- Offline data should sync seamlessly
- Notifications should be respectful (no spam)
- Social features must be opt-in
