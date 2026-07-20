// =============================================================================
// Training Plan - Public API
// =============================================================================
// Barrel re-exports + Supabase-dependent functions.
// All pure algorithm logic lives in ./algorithm.ts.
// =============================================================================

import { supabase } from '@/lib/supabase'
import { generateAlgorithmicPlan } from './algorithm'
import { DISTANCE_CONFIGS } from './constants'
import type { TrainingSession, UserProfile } from './types'

// Re-exports ------------------------------------------------------------------
export type { TrainingSession, WorkoutType, UserProfile, DistanceConfig } from './types'
export { DISTANCE_CONFIGS, WORKOUT_TEMPLATES, TAPER_CURVES, POLARIZED_BIAS, WEEKLY_GROWTH_CAP } from './constants'
export {
  generateAlgorithmicPlan,
  generateDeterministicId,
  estimateMaxHeartRate,
  calculateHeartRateZones,
  calculateRealisticPace,
  estimateTargetRaceTime,
  estimateCaloriesBurned,
  calculateWorkoutDistance,
  calculateWeeklyProgression,
  calculateSessionDuration,
  calculateRealSessionDates,
  buildWeeklyStructure,
  buildSessionWarnings,
  applyBeginnerProtection,
  applyPolarizedDistribution,
  formatPace,
  formatHeartRateZone,
  generateWorkoutDetails
} from './algorithm'

// Public event constants -----------------------------------------------------
export const EVENT_DATE = '2026-05-17T06:00:00'
export const EVENT_DISTANCE = 7
export const EVENT_NAME = 'Carrera Recreativa'

// -----------------------------------------------------------------------------
// Public plan generation
// -----------------------------------------------------------------------------
export async function generateTrainingPlan(
  planId: string,
  raceDistance: number = 7,
  raceDate: string = '2026-05-17',
  startDate?: string,
  profile?: UserProfile,
  userId?: string
): Promise<TrainingSession[]> {
  const config = DISTANCE_CONFIGS[raceDistance] || DISTANCE_CONFIGS[7]

  const userProfile: UserProfile = {
    experience_level: profile?.experience_level || 'beginner',
    current_weekly_km: profile?.current_weekly_km ?? 0,
    available_days_per_week: profile?.available_days_per_week ?? config.sessionsPerWeek,
    minutes_per_session: profile?.minutes_per_session ?? 60,
    has_injuries: profile?.has_injuries ?? false,
    injury_description: profile?.injury_description,
    age: profile?.age,
    sex: profile?.sex,
    weight: profile?.weight,
    resting_heart_rate: profile?.resting_heart_rate,
    max_heart_rate: profile?.max_heart_rate,
    preferred_terrain: profile?.preferred_terrain || 'road',
    goal_type: profile?.goal_type || 'fitness',
    has_treadmill: profile?.has_treadmill ?? false,
    progressive_pace: profile?.progressive_pace ?? true,
    medical_clearance: profile?.medical_clearance ?? false
  }

  const sessionsPerWeek = Math.min(
    userProfile.available_days_per_week,
    config.sessionsPerWeek
  )

  const effectiveStartDate = startDate || (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })()

  const seed = userId || planId || 'default'

  return generateAlgorithmicPlan(
    raceDistance,
    effectiveStartDate,
    raceDate,
    config,
    userProfile,
    sessionsPerWeek,
    seed
  )
}

// -----------------------------------------------------------------------------
// Supabase I/O
// -----------------------------------------------------------------------------
export async function loadUserProgress(userId: string): Promise<Map<string, any>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('session_id, completed, completed_at, rescheduled, rescheduled_to, actual_time, actual_pace, feeling, notes, actual_distance')
    .eq('user_id', userId)

  if (error || !data) return new Map()

  const progressMap = new Map()
  data.forEach((p: any) => {
    progressMap.set(p.session_id, {
      completed: p.completed,
      completedAt: p.completed_at,
      rescheduled: p.rescheduled,
      rescheduledTo: p.rescheduled_to,
      actualTime: p.actual_time,
      actualPace: p.actual_pace,
      feeling: p.feeling,
      notes: p.notes,
      actualDistance: p.actual_distance
    })
  })
  return progressMap
}

export async function saveUserProgress(
  userId: string,
  sessionId: string,
  progress: {
    completed?: boolean
    rescheduled?: boolean
    rescheduledTo?: string
    actualTime?: string
    actualPace?: string
    feeling?: number
    notes?: string
    actualDistance?: number
  }
) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        session_id: sessionId,
        completed: progress.completed || false,
        rescheduled: progress.rescheduled || false,
        rescheduled_to: progress.rescheduledTo || null,
        actual_time: progress.actualTime || null,
        actual_pace: progress.actualPace || null,
        feeling: progress.feeling || null,
        notes: progress.notes || null,
        actual_distance: progress.actualDistance || null,
        completed_at: progress.completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,session_id'
      })

    if (error) {
      console.error('Error saving progress:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    return { success: true, data }
  } catch (err) {
    console.error('Exception saving progress:', err)
    return { success: false, error: err }
  }
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('experience_level, current_weekly_km, available_days_per_week, minutes_per_session, has_injuries, injury_description, age, sex, weight, resting_heart_rate, max_heart_rate, preferred_terrain, goal_type, has_treadmill, progressive_pace, medical_clearance')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    experience_level: data.experience_level,
    current_weekly_km: data.current_weekly_km,
    available_days_per_week: data.available_days_per_week,
    minutes_per_session: data.minutes_per_session,
    has_injuries: data.has_injuries,
    injury_description: data.injury_description,
    age: data.age,
    sex: data.sex,
    weight: data.weight,
    resting_heart_rate: data.resting_heart_rate,
    max_heart_rate: data.max_heart_rate,
    preferred_terrain: data.preferred_terrain,
    goal_type: data.goal_type,
    has_treadmill: data.has_treadmill,
    progressive_pace: data.progressive_pace,
    medical_clearance: data.medical_clearance
  }
}
