// =============================================================================
// Training Plan - Pure Algorithm
// =============================================================================
// All functions here are pure: no side effects, no Supabase, no DOM.
// Importing this file is safe in Node test environments.
//
// Improvements over the original (1.1 - 1.8):
//   1.2  - 10% rule cap on weekly volume growth
//   1.3  - Taper curves per distance (1-3 weeks, progressive)
//   1.4  - Polarized 80/20 distribution enforced by level
//   1.5  - Beginner-first-week protection (no hard sessions week 1)
//   1.6  - Absolute distance cap per session (35% of race distance)
//   1.7  - Stable weekly day-of-week pattern (Mon/Wed/Fri etc.)
//   1.8  - Risk-profile warnings (age > 60, injuries, competitive + older)
// =============================================================================

import type {
  DistanceConfig,
  HeartRateZones,
  TrainingSession,
  UserProfile,
  WeeklyProgression,
  WorkoutType
} from './types'
import {
  EXPERIENCE_PACE_BASELINE,
  GOAL_INTENSITY_MODIFIERS,
  GOAL_PACE_MODIFIERS,
  POLARIZED_BIAS,
  TAPER_CURVES,
  TERRAIN_EFFORT,
  TERRAIN_MULTIPLIERS,
  WEEKLY_DAY_PATTERNS,
  WEEKLY_GROWTH_CAP,
  WORKOUT_TEMPLATES
} from './constants'

// -----------------------------------------------------------------------------
// Deterministic ID generator (kept identical to original for stable progress)
// -----------------------------------------------------------------------------
export function generateDeterministicId(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-${['8', '9', 'a', 'b'][Math.abs(hash) % 4]}${hex.slice(0, 3)}-${hex}${hex.slice(0, 4)}`.slice(0, 36)
}

// -----------------------------------------------------------------------------
// Physiological helpers
// -----------------------------------------------------------------------------
export function estimateMaxHeartRate(age: number, sex?: string): number {
  const baseMaxHR = 208 - (0.7 * age)
  if (sex === 'female') return Math.round(baseMaxHR + 5)
  return Math.round(baseMaxHR)
}

export function calculateHeartRateZones(
  restingHR: number,
  maxHR: number
): HeartRateZones {
  const hrReserve = maxHR - restingHR
  return {
    recovery: {
      min: Math.round(hrReserve * 0.50 + restingHR),
      max: Math.round(hrReserve * 0.60 + restingHR)
    },
    easy: {
      min: Math.round(hrReserve * 0.60 + restingHR),
      max: Math.round(hrReserve * 0.70 + restingHR)
    },
    steady: {
      min: Math.round(hrReserve * 0.70 + restingHR),
      max: Math.round(hrReserve * 0.80 + restingHR)
    },
    tempo: {
      min: Math.round(hrReserve * 0.80 + restingHR),
      max: Math.round(hrReserve * 0.85 + restingHR)
    },
    intervals: {
      min: Math.round(hrReserve * 0.85 + restingHR),
      max: Math.round(hrReserve * 0.95 + restingHR)
    }
  }
}

// -----------------------------------------------------------------------------
// Pace estimation
// -----------------------------------------------------------------------------
export function calculateRealisticPace(
  profile: UserProfile,
  workoutType: WorkoutType,
  raceDistance: number,
  weekNum: number,
  totalWeeks: number
): { pace: number; rhythm: string } {
  const level = profile.experience_level
  const goalType = profile.goal_type || 'fitness'

  const baselinePace = EXPERIENCE_PACE_BASELINE[level]

  let workoutPaceRatio: number
  switch (workoutType) {
    case 'recovery': workoutPaceRatio = 1.25; break
    case 'easy': workoutPaceRatio = 1.15; break
    case 'long_run': workoutPaceRatio = 1.1; break
    case 'steady': workoutPaceRatio = 1.0; break
    case 'tempo': workoutPaceRatio = 0.92; break
    case 'intervals': workoutPaceRatio = 0.85; break
    case 'race': workoutPaceRatio = 0.85; break
    default: workoutPaceRatio = 1.0
  }

  const distancePaceAdjust = 1 + (raceDistance - 7) * 0.008

  let progressiveMultiplier = 1.0
  if (profile.progressive_pace !== false) {
    const progress = weekNum / totalWeeks
    progressiveMultiplier = 1.15 - (progress * 0.15)
  }

  const goalPaceModifier = GOAL_PACE_MODIFIERS[goalType] || 1.0
  const terrainPaceAdjust = TERRAIN_MULTIPLIERS[profile.preferred_terrain || 'road'] || 1.0
  const injurySlowdown = profile.has_injuries ? 1.1 : 1.0

  const effectivePace =
    baselinePace *
    workoutPaceRatio *
    distancePaceAdjust *
    progressiveMultiplier *
    goalPaceModifier *
    terrainPaceAdjust *
    injurySlowdown

  let rhythm: string
  if (effectivePace < 4.5) rhythm = 'Muy rápido'
  else if (effectivePace < 5.0) rhythm = 'Rápido'
  else if (effectivePace < 5.5) rhythm = 'Tempo'
  else if (effectivePace < 6.0) rhythm = 'Moderado'
  else if (effectivePace < 6.5) rhythm = 'Conversacional'
  else if (effectivePace < 7.5) rhythm = 'Cómodo'
  else rhythm = 'Recuperación'

  return { pace: effectivePace, rhythm }
}

// -----------------------------------------------------------------------------
// Target race time
// -----------------------------------------------------------------------------
export function estimateTargetRaceTime(
  profile: UserProfile,
  raceDistance: number
): string {
  const level = profile.experience_level
  const goalType = profile.goal_type || 'fitness'

  let basePace = EXPERIENCE_PACE_BASELINE[level]
  const terrainPace = TERRAIN_MULTIPLIERS[profile.preferred_terrain || 'road'] || 1.0
  basePace *= terrainPace

  if (goalType === 'compete') basePace *= 0.95
  else if (goalType === 'weight_loss') basePace *= 1.05

  const totalMinutes = basePace * raceDistance
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}`
  return `${minutes} min`
}

// -----------------------------------------------------------------------------
// Calories (per-km model, scaled by body weight and terrain)
// -----------------------------------------------------------------------------
// Per-km calories assume a 70kg runner. Harder workouts burn more per km.
// This is independent of the duration-of-the-session calculation above, so
// it produces sane comparisons (intervals > easy at the same distance).
const KCAL_PER_KM_AT_70KG: Record<WorkoutType, number> = {
  recovery: 50,
  easy: 60,
  long_run: 70,
  steady: 70,
  cross: 50,
  tempo: 80,
  intervals: 90,
  race: 90
}

export function estimateCaloriesBurned(
  distance: number,
  weight: number | undefined,
  workoutType: WorkoutType,
  terrain: string
): number {
  const bodyWeight = weight || 70
  const terrainEffort = TERRAIN_EFFORT[terrain] || 1.0
  const perKm = KCAL_PER_KM_AT_70KG[workoutType] || 60
  return Math.round(perKm * distance * (bodyWeight / 70) * terrainEffort)
}

// -----------------------------------------------------------------------------
// Formatters
// -----------------------------------------------------------------------------
export function formatPace(paceMinutes: number): string {
  const minutes = Math.floor(paceMinutes)
  const seconds = Math.round((paceMinutes - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`
}

export function formatHeartRateZone(
  hrZones: HeartRateZones,
  workoutType: WorkoutType
): string {
  // Map any workout type to its corresponding zone. long_run uses steady,
  // recovery uses recovery, cross and race don't have a zone (caller skips).
  const zoneKey: keyof HeartRateZones =
    workoutType === 'long_run' ? 'steady' :
    workoutType === 'recovery' ? 'recovery' :
    workoutType === 'cross' || workoutType === 'race' ? 'easy' :
    workoutType
  const zone = hrZones[zoneKey] || hrZones.easy
  return `${zone.min}-${zone.max} lpm`
}

// -----------------------------------------------------------------------------
// Weekly structure (which workout types a given week contains)
// -----------------------------------------------------------------------------
export function buildWeeklyStructure(
  level: 'beginner' | 'intermediate' | 'advanced',
  sessionsPerWeek: number,
  goalType?: string,
  _hasInjuries?: boolean
): WorkoutType[] {
  const goal = goalType || 'fitness'

  // Every weekly structure must include a long_run, regardless of level.
  // (The 5-day advanced structure was missing it before; this guarantees it.)

  if (sessionsPerWeek === 2) {
    if (goal === 'weight_loss') return ['recovery', 'long_run']
    if (level === 'beginner') return ['easy', 'long_run']
    if (level === 'intermediate') return ['easy', 'long_run']
    return ['steady', 'long_run']
  }

  if (sessionsPerWeek === 3) {
    if (goal === 'weight_loss') return ['recovery', 'easy', 'long_run']
    if (level === 'beginner') return ['easy', 'intervals', 'long_run']
    if (level === 'intermediate') return ['easy', 'steady', 'long_run']
    return ['easy', 'tempo', 'long_run']
  }

  if (sessionsPerWeek === 4) {
    if (goal === 'weight_loss') return ['recovery', 'easy', 'steady', 'long_run']
    if (goal === 'compete') return ['easy', 'intervals', 'tempo', 'long_run']
    if (level === 'beginner') return ['easy', 'steady', 'intervals', 'long_run']
    if (level === 'intermediate') return ['easy', 'steady', 'intervals', 'long_run']
    return ['easy', 'tempo', 'steady', 'long_run']
  }

  if (sessionsPerWeek >= 5) {
    if (goal === 'compete') return ['recovery', 'easy', 'intervals', 'tempo', 'long_run'] as WorkoutType[]
    if (level === 'advanced') return ['recovery', 'easy', 'tempo', 'steady', 'long_run'] as WorkoutType[]
    if (goal === 'weight_loss') return ['recovery', 'easy', 'easy', 'steady', 'long_run'] as WorkoutType[]
    return ['easy', 'steady', 'intervals', 'tempo', 'long_run'] as WorkoutType[]
  }

  return ['easy', 'long_run'].slice(0, sessionsPerWeek) as WorkoutType[]
}

// -----------------------------------------------------------------------------
// Beginner first-week protection (improvement 1.5)
// -----------------------------------------------------------------------------
// Forces week 1 of any beginner plan to be easy + easy + long_run
// regardless of the structure template. Hard sessions are introduced from week 2.
export function applyBeginnerProtection(
  structure: WorkoutType[],
  level: 'beginner' | 'intermediate' | 'advanced',
  weekNum: number
): WorkoutType[] {
  if (level !== 'beginner' || weekNum !== 1) return structure

  // Replace any hard session in week 1 with easy (or recovery if no easy present)
  const hasEasy = structure.includes('easy')
  return structure.map(w => {
    if (WORKOUT_TEMPLATES[w].isHard) {
      return hasEasy ? 'easy' : 'recovery'
    }
    return w
  })
}

// -----------------------------------------------------------------------------
// Polarized 80/20 distribution (improvement 1.4)
// -----------------------------------------------------------------------------
// Enforces that hard sessions (tempo, intervals, race) are at most
// (1 - POLARIZED_BIAS[level]) share of the structure. Excess hard sessions
// are demoted to steady.
export function applyPolarizedDistribution(
  structure: WorkoutType[],
  level: 'beginner' | 'intermediate' | 'advanced'
): WorkoutType[] {
  const easyShare = POLARIZED_BIAS[level] ?? 0.8
  const hardCap = Math.floor(structure.length * (1 - easyShare))

  let hardCount = 0
  return structure.map(w => {
    if (!WORKOUT_TEMPLATES[w].isHard) return w
    if (hardCount < hardCap) {
      hardCount++
      return w
    }
    // Demote to steady (intensity 6, not hard-flagged)
    return 'steady'
  })
}

// -----------------------------------------------------------------------------
// Weekly progression (improvements 1.2 - 10% rule + 1.3 - taper curve)
// -----------------------------------------------------------------------------
// prevNaturalFactor is the *natural* (pre-deload, pre-taper) factor of the
// previous week. The 10% rule is applied to the natural growth so that
// deload→rebound jumps are bounded too.
export function calculateWeeklyProgression(
  currentWeek: number,
  totalWeeks: number,
  buildUpWeeks: number,
  startingVolumeFactor: number,
  injuryMultiplier: number,
  recoveryInterval: number,
  prevNaturalFactor: number | null = null,
  raceDistance: number = 7
): WeeklyProgression {
  const isBuildUp = currentWeek <= buildUpWeeks
  const isTaper = currentWeek >= totalWeeks - (TAPER_CURVES[raceDistance]?.length ?? 1)

  const buildUpProgress = isBuildUp ? currentWeek / buildUpWeeks : 1.0
  const effectiveBuildUp = isBuildUp ? Math.pow(buildUpProgress, 1.5) : 1.0

  let naturalFactor = startingVolumeFactor + ((1.0 - startingVolumeFactor) * effectiveBuildUp)

  // Improvement 1.2: 10% rule cap on natural growth. We can never grow more
  // than 10% from the previous week's natural factor, so a deload→rebound
  // jump (e.g. 60%→66%) is still bounded even though the deload itself
  // is an intentional drop.
  if (prevNaturalFactor !== null && prevNaturalFactor > 0) {
    const ceiling = prevNaturalFactor * (1 + WEEKLY_GROWTH_CAP)
    naturalFactor = Math.min(naturalFactor, ceiling)
  }

  const isRecoveryWeek =
    currentWeek % recoveryInterval === 0 &&
    currentWeek > 1 &&
    currentWeek < totalWeeks - 1
  const isDeload = isRecoveryWeek ? 0.6 : 1.0

  // Improvement 1.3: progressive taper curve per distance.
  // taperStep is 0 for race week, 1 for the week before, etc.
  let isTaperWeek = false
  let taperStep = 0
  let taperMultiplier = 1.0
  if (isTaper) {
    const taperCurve = TAPER_CURVES[raceDistance] || TAPER_CURVES[7]
    taperStep = totalWeeks - currentWeek
    if (taperStep >= 0 && taperStep < taperCurve.length) {
      taperMultiplier = taperCurve[taperStep]
      isTaperWeek = true
    }
  }

  const finalFactor = naturalFactor * isDeload * injuryMultiplier * taperMultiplier

  return {
    factor: finalFactor,
    volume: finalFactor,
    intensity: isDeload * (isTaperWeek ? taperMultiplier : 1) * injuryMultiplier,
    isRecoveryWeek,
    isTaperWeek,
    taperStep,
    naturalFactor
  }
}

// -----------------------------------------------------------------------------
// Workout distance (improvement 1.6 - absolute cap at 35% of race distance)
// -----------------------------------------------------------------------------
const MAX_NON_LONG_DISTANCE_RATIO = 0.35

export function calculateWorkoutDistance(
  workoutType: WorkoutType,
  progression: WeeklyProgression,
  raceDistance: number,
  config: DistanceConfig,
  weekNum: number,
  totalWeeks: number
): number {
  const isRaceWeek = weekNum === totalWeeks - 1

  if (isRaceWeek && workoutType === 'long_run') {
    return raceDistance * 0.3
  }

  let distance = 0
  switch (workoutType) {
    case 'long_run': {
      const longRunRatio = config.longRunRatio
      const startRatio = longRunRatio * 0.6
      const peakRatio = Math.min(config.maxLongRunRatio, longRunRatio * 1.5)
      const ratio = startRatio + (peakRatio - startRatio) * progression.factor
      distance = raceDistance * ratio
      break
    }
    case 'easy':
    case 'steady': {
      const ratio = 0.15 + (0.25 - 0.15) * progression.factor
      distance = raceDistance * ratio
      break
    }
    case 'tempo': {
      const ratio = 0.12 + (0.2 - 0.12) * progression.factor
      distance = raceDistance * ratio
      break
    }
    case 'intervals': {
      const ratio = 0.08 + (0.12 - 0.08) * progression.factor
      distance = Math.max(1.5, raceDistance * ratio)
      break
    }
    case 'recovery':
      distance = raceDistance * 0.08
      break
    case 'cross':
      distance = 0
      break
    case 'race':
      distance = raceDistance
      break
    default:
      distance = raceDistance * 0.15
  }

  // Improvement 1.6: hard ceiling at 35% of race distance for any
  // non-long_run, non-race session. This prevents, e.g., a 5K plan
  // from prescribing a 2km tempo block on a beginner.
  // Intervals are exempt: they have their own 1.5km floor, and the
  // floor must take precedence over the cap to guarantee a meaningful
  // interval workout even on short race plans.
  if (workoutType !== 'long_run' && workoutType !== 'race' && workoutType !== 'intervals') {
    const ceiling = raceDistance * MAX_NON_LONG_DISTANCE_RATIO
    distance = Math.min(distance, ceiling)
  }

  return distance
}

// -----------------------------------------------------------------------------
// Session duration
// -----------------------------------------------------------------------------
export function calculateSessionDuration(
  workoutType: WorkoutType,
  distance: number,
  maxDuration: number,
  goalType?: string
): number {
  const baseDuration = WORKOUT_TEMPLATES[workoutType].baseDuration

  const pacePerKm =
    workoutType === 'intervals' ? 4.5 :
    workoutType === 'tempo' ? 5.0 :
    workoutType === 'steady' ? 5.5 :
    workoutType === 'easy' ? 6.5 :
    workoutType === 'long_run' ? 6.0 : 6.0

  const distanceDuration = distance * pacePerKm

  let adjustedMax = maxDuration
  if (goalType === 'weight_loss') {
    adjustedMax = Math.min(maxDuration * 1.2, 90)
  }
  if (workoutType === 'long_run') {
    // Long runs are the cornerstone of any plan: never schedule them
    // shorter than 90 min, even for very short race distances.
    adjustedMax = Math.max(adjustedMax, 90)
  }

  // Floor: long_run is always at least 90 min.
  if (workoutType === 'long_run') {
    return Math.max(90, Math.round(Math.min(Math.max(baseDuration, distanceDuration), adjustedMax)))
  }
  return Math.round(Math.min(Math.max(baseDuration, distanceDuration), adjustedMax))
}

// -----------------------------------------------------------------------------
// Workout details (Spanish text for each session type)
// -----------------------------------------------------------------------------
export function generateWorkoutDetails(
  workoutType: WorkoutType,
  duration: number,
  pace: number,
  raceDistance: number,
  level: string,
  rhythm: string
): string {
  const paceStr = formatPace(pace)

  switch (workoutType) {
    case 'easy':
      return `Trote suave ${duration} min. Ritmo ${rhythm}, deberías poder mantener una conversación.`

    case 'steady':
      return `Trote constante ${duration} min. Ritmo ${rhythm} (~${paceStr}), desafiante pero controlable.`

    case 'tempo': {
      const examples =
        raceDistance >= 21 ? '3x3km o 2x5km' :
        raceDistance >= 10 ? '4x1.5km o 2x3km' :
        '5x800m o 3x1.2km'
      return `Tempo ${duration} min. Ritmo ${rhythm} (~${paceStr}). Ej: ${examples}.`
    }
    case 'intervals': {
      const restRatio = level === 'advanced' ? '1:1' : '1:2'
      const examples =
        raceDistance >= 21 ? '6-8x800m' :
        raceDistance >= 10 ? '6-8x600m o 4x1km' :
        '6x400m o 8x200m'
      return `Intervalos ${duration} min. Ritmo rápido (~${paceStr}). Ej: ${examples}. Rec: ${restRatio}.`
    }
    case 'long_run':
      return `Carrera larga ${duration} min. Ritmo ${rhythm} (~${paceStr}). Aumenta gradualmente.`

    case 'recovery':
      return `Recuperación activa ${duration} min. Trote muy suave o caminata. No te apresures.`

    case 'cross':
      return `Cross-training ${duration} min. Natación, bicicleta, yoga o fuerza. Complementa tu carrera.`

    case 'race':
      return `Simulacro! Ritmo objetivo ~${paceStr}. Practica tu estrategia de carrera.`

    default:
      return `Entrenamiento ${duration} min. Ritmo ${rhythm}.`
  }
}

// -----------------------------------------------------------------------------
// Risk-profile warnings (improvement 1.8)
// -----------------------------------------------------------------------------
export function buildSessionWarnings(
  workoutType: WorkoutType,
  profile: UserProfile,
  hasInjuries: boolean
): string | undefined {
  const warnings: string[] = []

  if (hasInjuries) {
    if (workoutType === 'intervals') {
      warnings.push('⚠️ Sesión de intervals reemplazada por cross-training por tu lesión.')
    } else if (workoutType === 'tempo') {
      warnings.push('⚠️ Tempo exigente: escuchá a tu cuerpo y bajá la intensidad si sentís molestias.')
    }
  }

  if (profile.age !== undefined && profile.age > 60 && profile.goal_type === 'compete') {
    warnings.push('⚠️ Plan exigente para tu edad. Recomendamos consulta con deportólogo.')
  }

  if (profile.age !== undefined && profile.age > 65 && workoutType === 'intervals') {
    warnings.push('⚠️ Intervalos de alta intensidad a esta edad: asegurate de tener autorización médica.')
  }

  return warnings.length > 0 ? warnings.join(' ') : undefined
}

// -----------------------------------------------------------------------------
// Real session dates (improvement 1.7 - stable day-of-week pattern)
// -----------------------------------------------------------------------------
// Session 0 lands on `startDate`. Each subsequent session is the next day
// in the configured weekly pattern, wrapping around weekly.
//
// Example: 3-day pattern [1, 3, 5] (Mon/Wed/Fri) starting on Wed →
// sessions on Wed, Fri, Mon+7, Wed+7, Fri+7, ...
export function calculateRealSessionDates(
  startDate: string,
  totalSessions: number,
  sessionsPerWeek: number
): string[] {
  const pattern = WEEKLY_DAY_PATTERNS[sessionsPerWeek] ||
    WEEKLY_DAY_PATTERNS[Math.min(6, Math.max(2, sessionsPerWeek))]
  const start = new Date(startDate + 'T00:00:00')
  const startDay = start.getDay()

  // Helper: find the next pattern day-of-week strictly after currentDay,
  // wrapping to pattern[0] of the following week.
  const nextPatternDay = (currentDay: number): number => {
    for (const d of pattern) {
      if (d > currentDay) return d
    }
    return pattern[0]
  }

  const dates: string[] = []
  let current = new Date(start)
  let currentDay = startDay

  dates.push(current.toISOString().split('T')[0])

  for (let i = 1; i < totalSessions; i++) {
    const targetDay = nextPatternDay(currentDay)
    let daysToAdd = (targetDay - currentDay + 7) % 7
    if (daysToAdd === 0) daysToAdd = 7
    current = new Date(current)
    current.setDate(current.getDate() + daysToAdd)
    currentDay = current.getDay()
    dates.push(current.toISOString().split('T')[0])
  }

  return dates
}

// -----------------------------------------------------------------------------
// Full plan generator (the public entry point used by training-plan.ts)
// -----------------------------------------------------------------------------
export function generateAlgorithmicPlan(
  raceDistance: number,
  startDate: string,
  raceDate: string,
  config: DistanceConfig,
  profile: UserProfile,
  sessionsPerWeek: number,
  seed: string = 'default'
): TrainingSession[] {
  const startMs = new Date(startDate + 'T00:00:00').getTime()
  const raceMs = new Date(raceDate + 'T00:00:00').getTime()
  const availableDays = Math.floor((raceMs - startMs) / (1000 * 60 * 60 * 24))

  if (availableDays <= 0) return []

  const availableFullWeeks = Math.floor(availableDays / 7)
  const hasUsablePartialWeek = (availableDays % 7) >= Math.ceil(7 / sessionsPerWeek)
  const totalWeeks = Math.min(
    config.weeks,
    Math.max(1, availableFullWeeks + (hasUsablePartialWeek ? 1 : 0))
  )

  const trainingDays = Math.max(0, availableDays - 2)
  let totalSessions = 0
  for (let i = 0; i < totalWeeks * sessionsPerWeek; i++) {
    if (Math.floor((i * 7) / sessionsPerWeek) <= trainingDays) totalSessions = i + 1
    else break
  }

  if (totalSessions === 0) return []

  const sessionDates = calculateRealSessionDates(startDate, totalSessions, sessionsPerWeek)

  const maxHR = profile.max_heart_rate ||
    (profile.age ? estimateMaxHeartRate(profile.age, profile.sex) : 190)

  const hrZones = profile.resting_heart_rate
    ? calculateHeartRateZones(profile.resting_heart_rate, maxHR)
    : null

  const terrain = profile.preferred_terrain || 'road'
  const terrainMultiplier = TERRAIN_MULTIPLIERS[terrain] || 1.0
  const goalIntensityMod = GOAL_INTENSITY_MODIFIERS[profile.goal_type || 'fitness'] || 1.0
  const injuryMultiplier = profile.has_injuries ? 0.7 : 1.0

  const runnerVolume = profile.current_weekly_km > 0 ? profile.current_weekly_km : config.baseWeeklyVolume
  const targetVolume = config.peakWeeklyVolume
  const volumeRatio = runnerVolume / targetVolume

  let startingVolumeFactor: number
  if (volumeRatio >= 0.7) {
    startingVolumeFactor = 0.65 + (volumeRatio * 0.35)
  } else if (volumeRatio >= 0.4) {
    startingVolumeFactor = 0.45 + (volumeRatio * 0.5)
  } else {
    startingVolumeFactor = 0.3 + (volumeRatio * 0.5)
  }
  startingVolumeFactor = Math.min(startingVolumeFactor, 0.95)

  const buildUpWeeks = Math.max(2, Math.floor(totalWeeks * 0.25))

  let recoveryInterval = 4
  if (profile.has_injuries) recoveryInterval = 3
  if (profile.current_weekly_km > 40) recoveryInterval = 3
  if (profile.age && profile.age > 65 && profile.has_injuries) recoveryInterval = 2

  const raceWeek = totalWeeks
  const targetRaceTime = estimateTargetRaceTime(profile, raceDistance)

  const sessions: TrainingSession[] = []
  let prevNaturalFactor: number | null = null
  let lastProcessedWeek = 0

  for (let i = 0; i < totalSessions; i++) {
    const weekNum = Math.floor(i / sessionsPerWeek) + 1
    const dayIndex = i % sessionsPerWeek

    // The 10% rule applies at the WEEK level: only update the previous
    // natural factor when we move to a new week. Otherwise we'd cap three
    // times per week and end up with 33% growth in a single week.
    const isNewWeek = weekNum !== lastProcessedWeek

    let structure = buildWeeklyStructure(
      profile.experience_level,
      sessionsPerWeek,
      profile.goal_type,
      profile.has_injuries
    )

    // Improvement 1.5: beginner week 1 protection
    structure = applyBeginnerProtection(structure, profile.experience_level, weekNum)
    // Improvement 1.4: polarized 80/20
    structure = applyPolarizedDistribution(structure, profile.experience_level)

    let workoutType = structure[dayIndex] || 'easy'

    if (weekNum === raceWeek && dayIndex === 0) {
      workoutType = 'race'
    }

    if (profile.has_injuries && workoutType === 'intervals') {
      workoutType = 'cross'
    }

    const progression = calculateWeeklyProgression(
      weekNum,
      totalWeeks,
      buildUpWeeks,
      startingVolumeFactor,
      injuryMultiplier,
      recoveryInterval,
      prevNaturalFactor,
      raceDistance
    )

    if (isNewWeek) {
      prevNaturalFactor = progression.naturalFactor
      lastProcessedWeek = weekNum
    }

    const { pace, rhythm } = calculateRealisticPace(
      profile,
      workoutType,
      raceDistance,
      weekNum,
      totalWeeks
    )

    const rawDistance = calculateWorkoutDistance(
      workoutType,
      progression,
      raceDistance,
      config,
      weekNum,
      totalWeeks
    )

    // Race session distance is not terrain-adjusted: the user runs the
    // exact race distance, regardless of where they train.
    const terrainAdjustedDistance = workoutType === 'race'
      ? rawDistance
      : rawDistance * terrainMultiplier

    const duration = calculateSessionDuration(
      workoutType,
      terrainAdjustedDistance,
      profile.minutes_per_session || 60,
      profile.goal_type
    )

    const heartRateZone = hrZones && workoutType !== 'cross' && workoutType !== 'race'
      ? formatHeartRateZone(hrZones, workoutType)
      : undefined

    const calories = estimateCaloriesBurned(terrainAdjustedDistance, profile.weight, workoutType, terrain)

    const details = generateWorkoutDetails(
      workoutType,
      duration,
      pace,
      raceDistance,
      profile.experience_level,
      rhythm
    )

    const intensity = Math.round(
      WORKOUT_TEMPLATES[workoutType].intensity * goalIntensityMod * injuryMultiplier
    )

    const warning = buildSessionWarnings(workoutType, profile, profile.has_injuries)

    sessions.push({
      id: generateDeterministicId(`${seed}-${i}`),
      sessionOrder: i + 1,
      date: sessionDates[i] || startDate,
      dayLabel: `Semana ${weekNum} - Día ${dayIndex + 1}`,
      workout: WORKOUT_TEMPLATES[workoutType].name,
      workoutType: workoutType,
      details,
      distance: Math.round(terrainAdjustedDistance * 10) / 10,
      targetPace: formatPace(pace),
      completed: false,
      rescheduled: false,
      rescheduleUsed: false,
      blocked: false,
      weekNumber: weekNum,
      intensity,
      duration,
      heartRateZone,
      warning: warning || (profile.has_injuries ? '⚠️ Plan adaptado por lesión. Consulta a tu médico.' : undefined),
      targetTime: workoutType === 'race' ? targetRaceTime : undefined,
      caloriesEstimate: calories,
      isRecoveryWeek: progression.isRecoveryWeek,
      isTaperWeek: progression.isTaperWeek,
      naturalFactor: progression.naturalFactor
    })
  }

  return sessions
}
