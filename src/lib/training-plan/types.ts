// =============================================================================
// Training Plan - Type Definitions
// =============================================================================
// Pure types, no runtime dependencies. Safe to import from anywhere.
// =============================================================================

export interface TrainingSession {
  id: string
  sessionOrder: number
  date: string
  originalDate?: string
  dayLabel: string
  workout: string
  workoutType: WorkoutType
  details: string
  distance: number
  targetPace: string
  completed: boolean
  rescheduled: boolean
  rescheduleUsed: boolean
  rescheduledTo?: string
  blocked: boolean
  actualTime?: string
  actualPace?: string
  feeling?: number
  notes?: string
  actualDistance?: number
  weekNumber?: number
  intensity?: number
  duration?: number
  heartRateZone?: string
  warning?: string
  targetTime?: string
  caloriesEstimate?: number
  isRecoveryWeek?: boolean
  isTaperWeek?: boolean
  naturalFactor?: number
}

export type WorkoutType =
  | 'easy'
  | 'steady'
  | 'tempo'
  | 'intervals'
  | 'long_run'
  | 'recovery'
  | 'cross'
  | 'race'

export interface UserProfile {
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  current_weekly_km: number
  available_days_per_week: number
  minutes_per_session: number
  has_injuries: boolean
  injury_description?: string
  age?: number
  sex?: 'male' | 'female' | 'other'
  weight?: number
  resting_heart_rate?: number
  max_heart_rate?: number
  preferred_terrain?: 'road' | 'track' | 'trail' | 'treadmill' | 'mixed'
  goal_type?: 'compete' | 'fitness' | 'weight_loss'
  has_treadmill?: boolean
  progressive_pace?: boolean
  medical_clearance?: boolean
}

export interface DistanceConfig {
  weeks: number
  sessionsPerWeek: number
  label: string
  baseWeeklyVolume: number
  peakWeeklyVolume: number
  maxLongRunRatio: number
  intensityFactor: number
  longRunRatio: number
}

export interface WeeklyProgression {
  factor: number
  volume: number
  intensity: number
  isRecoveryWeek: boolean
  isTaperWeek: boolean
  taperStep: number
  naturalFactor: number
}

export interface HeartRateZones {
  recovery: { min: number; max: number }
  easy: { min: number; max: number }
  steady: { min: number; max: number }
  tempo: { min: number; max: number }
  intervals: { min: number; max: number }
}
