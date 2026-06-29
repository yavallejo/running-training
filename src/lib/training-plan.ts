import { supabase } from './supabase'

function generateDeterministicId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-${['8','9','a','b'][Math.abs(hash) % 4]}${hex.slice(0, 3)}-${hex}${hex.slice(0, 4)}`.slice(0, 36);
}

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

export const DISTANCE_CONFIGS: Record<number, DistanceConfig> = {
  3: {
    weeks: 4,
    sessionsPerWeek: 3,
    label: '3K Principiante',
    baseWeeklyVolume: 4,
    peakWeeklyVolume: 10,
    maxLongRunRatio: 0.5,
    intensityFactor: 0.7,
    longRunRatio: 0.4
  },
  5: {
    weeks: 6,
    sessionsPerWeek: 3,
    label: '5K Principiante',
    baseWeeklyVolume: 5,
    peakWeeklyVolume: 15,
    maxLongRunRatio: 0.5,
    intensityFactor: 0.7,
    longRunRatio: 0.35
  },
  7: {
    weeks: 8,
    sessionsPerWeek: 3,
    label: '7K Recreativa',
    baseWeeklyVolume: 8,
    peakWeeklyVolume: 22,
    maxLongRunRatio: 0.55,
    intensityFactor: 0.75,
    longRunRatio: 0.32
  },
  10: {
    weeks: 10,
    sessionsPerWeek: 4,
    label: '10K Intermedio',
    baseWeeklyVolume: 12,
    peakWeeklyVolume: 35,
    maxLongRunRatio: 0.6,
    intensityFactor: 0.8,
    longRunRatio: 0.3
  },
  15: {
    weeks: 12,
    sessionsPerWeek: 4,
    label: '15K Intermedio',
    baseWeeklyVolume: 16,
    peakWeeklyVolume: 45,
    maxLongRunRatio: 0.65,
    intensityFactor: 0.8,
    longRunRatio: 0.28
  },
  21: {
    weeks: 14,
    sessionsPerWeek: 4,
    label: '21K Medio Maratón',
    baseWeeklyVolume: 20,
    peakWeeklyVolume: 55,
    maxLongRunRatio: 0.7,
    intensityFactor: 0.85,
    longRunRatio: 0.25
  },
  42: {
    weeks: 18,
    sessionsPerWeek: 5,
    label: '42K Maratón',
    baseWeeklyVolume: 25,
    peakWeeklyVolume: 65,
    maxLongRunRatio: 0.75,
    intensityFactor: 0.9,
    longRunRatio: 0.22
  },
}

export const WORKOUT_TEMPLATES: Record<WorkoutType, {
  name: string
  description: string
  intensity: number
  baseDuration: number
  hrZone: string
}> = {
  easy: {
    name: 'Trote Fácil',
    description: 'Trote conversacional, ritmo cómodo',
    intensity: 4,
    baseDuration: 30,
    hrZone: '60-70%'
  },
  steady: {
    name: 'Trote Moderado',
    description: 'Ritmo sostenido pero cómodo',
    intensity: 6,
    baseDuration: 40,
    hrZone: '70-80%'
  },
  tempo: {
    name: 'Tempo',
    description: 'Ritmo incómodo pero mantenible',
    intensity: 7,
    baseDuration: 35,
    hrZone: '80-85%'
  },
  intervals: {
    name: 'Intervalos',
    description: 'Repeticiones rápidas con recuperación activa',
    intensity: 8,
    baseDuration: 40,
    hrZone: '85-95%'
  },
  long_run: {
    name: 'Carrera Larga',
    description: 'La carrera más larga de la semana',
    intensity: 5,
    baseDuration: 75,
    hrZone: '70-80%'
  },
  recovery: {
    name: 'Recuperación',
    description: 'Caminata o trote muy suave',
    intensity: 2,
    baseDuration: 20,
    hrZone: '55-65%'
  },
  cross: {
    name: 'Cross-Training',
    description: 'Ejercicios complementarios',
    intensity: 5,
    baseDuration: 45,
    hrZone: '60-75%'
  },
  race: {
    name: 'Simulacro',
    description: 'Carrera a ritmo objetivo',
    intensity: 9,
    baseDuration: 30,
    hrZone: '85-95%'
  }
}

const TERRAIN_MULTIPLIERS: Record<string, number> = {
  treadmill: 0.98,
  track: 1.0,
  road: 1.02,
  trail: 1.08,
  mixed: 1.0
}

const TERRAIN_EFFORT: Record<string, number> = {
  treadmill: 0.95,
  track: 1.0,
  road: 1.05,
  trail: 1.15,
  mixed: 1.0
}

const GOAL_INTENSITY_MODIFIERS: Record<string, number> = {
  compete: 1.1,
  fitness: 1.0,
  weight_loss: 0.85
}

const GOAL_PACE_MODIFIERS: Record<string, number> = {
  compete: 0.95,
  fitness: 1.0,
  weight_loss: 1.1
}

const EXPERIENCE_PACE_BASELINE: Record<string, number> = {
  beginner: 6.5,
  intermediate: 5.5,
  advanced: 4.75
}

export async function generateTrainingPlan(
  planId: string,
  raceDistance: number = 7,
  raceDate: string = "2026-05-17",
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

function estimateMaxHeartRate(age: number, sex?: string): number {
  const baseMaxHR = 208 - (0.7 * age)
  if (sex === 'female') return Math.round(baseMaxHR + 5)
  return Math.round(baseMaxHR)
}

function calculateHeartRateZones(
  restingHR: number,
  maxHR: number
): Record<string, { min: number; max: number }> {
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

function calculateRealisticPace(
  profile: UserProfile,
  workoutType: WorkoutType,
  raceDistance: number,
  weekNum: number,
  totalWeeks: number,
  config: DistanceConfig
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

  let distancePaceAdjust = 1 + (raceDistance - 7) * 0.008

  let progressiveMultiplier = 1.0
  if (profile.progressive_pace !== false) {
    const progress = weekNum / totalWeeks
    progressiveMultiplier = 1.15 - (progress * 0.15)
  }

  const goalPaceModifier = GOAL_PACE_MODIFIERS[goalType] || 1.0

  const terrainPaceAdjust = TERRAIN_MULTIPLIERS[profile.preferred_terrain || 'road'] || 1.0

  const injurySlowdown = profile.has_injuries ? 1.1 : 1.0

  const effectivePace = baselinePace * workoutPaceRatio * distancePaceAdjust * progressiveMultiplier * goalPaceModifier * terrainPaceAdjust * injurySlowdown

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

function estimateTargetRaceTime(
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

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`
  }
  return `${minutes} min`
}

function estimateCaloriesBurned(
  distance: number,
  weight: number | undefined,
  workoutType: WorkoutType,
  terrain: string
): number {
  const metValues: Record<WorkoutType, number> = {
    easy: 7.5,
    steady: 8.5,
    tempo: 9.5,
    intervals: 11,
    long_run: 9,
    recovery: 5,
    cross: 6,
    race: 10.5
  }

  const met = metValues[workoutType] || 7
  const bodyWeight = weight || 70
  const terrainEffort = TERRAIN_EFFORT[terrain] || 1.0
  const duration = distance > 0 ? distance / (met * 0.06) : 30

  return Math.round(met * bodyWeight * (duration / 60) * terrainEffort)
}

function generateAlgorithmicPlan(
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
    if (Math.floor(i * 7 / sessionsPerWeek) <= trainingDays) totalSessions = i + 1
    else break
  }

  if (totalSessions === 0) return []

  const sessionDates = calculateRealSessionDates(startDate, totalSessions, sessionsPerWeek)

  const weeklyStructure = buildWeeklyStructure(
    profile.experience_level,
    sessionsPerWeek,
    profile.goal_type,
    profile.has_injuries,
    totalWeeks
  )

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

  const raceWeek = totalWeeks - 1
  const preRaceWeek = totalWeeks - 2

  const targetRaceTime = estimateTargetRaceTime(profile, raceDistance)

  const sessions: TrainingSession[] = []

  for (let i = 0; i < totalSessions; i++) {
    const weekNum = Math.floor(i / sessionsPerWeek) + 1
    const dayIndex = i % sessionsPerWeek

    let workoutType = weeklyStructure[dayIndex]

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
      recoveryInterval
    )

    const { pace, rhythm } = calculateRealisticPace(
      profile,
      workoutType,
      raceDistance,
      weekNum,
      totalWeeks,
      config
    )

    const distance = calculateWorkoutDistance(
      workoutType,
      progression,
      raceDistance,
      config,
      weekNum,
      totalWeeks
    )

    const terrainAdjustedDistance = distance * terrainMultiplier

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
      terrainAdjustedDistance,
      pace,
      weekNum,
      duration,
      raceDistance,
      profile.experience_level,
      progression,
      rhythm
    )

    const intensity = Math.round(
      WORKOUT_TEMPLATES[workoutType].intensity * goalIntensityMod * injuryMultiplier
    )

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
      warning: profile.has_injuries ? "⚠️ Plan adaptado por lesión. Consulta a tu médico." : undefined,
      targetTime: workoutType === 'race' ? targetRaceTime : undefined,
      caloriesEstimate: calories
    })
  }

  return sessions
}

function buildWeeklyStructure(
  level: string,
  sessionsPerWeek: number,
  goalType?: string,
  hasInjuries?: boolean,
  totalWeeks?: number
): WorkoutType[] {
  const goal = goalType || 'fitness'

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
    return ['recovery', 'easy', 'tempo', 'steady', 'intervals', 'long_run'].slice(0, 3).map((w, i) => {
      if (i === 0) return 'recovery'
      if (i === 1) return 'easy'
      return 'long_run'
    })
  }

  if (sessionsPerWeek === 4) {
    if (goal === 'weight_loss') return ['recovery', 'easy', 'steady', 'long_run']
    if (goal === 'compete') return ['easy', 'intervals', 'tempo', 'long_run']
    if (level === 'beginner') return ['easy', 'steady', 'intervals', 'long_run']
    if (level === 'intermediate') return ['easy', 'steady', 'intervals', 'long_run']
    return ['recovery', 'easy', 'tempo', 'steady', 'intervals', 'long_run'].slice(0, 4).map((w, i) => {
      const order = ['recovery', 'easy', 'steady', 'intervals', 'tempo', 'long_run']
      return order[i] as WorkoutType
    })
  }

  if (sessionsPerWeek >= 5) {
    if (goal === 'compete') return ['recovery', 'easy', 'intervals', 'tempo', 'long_run'] as WorkoutType[]
    if (level === 'advanced') return ['recovery', 'easy', 'tempo', 'steady', 'intervals'].slice(0, sessionsPerWeek) as WorkoutType[]
    if (goal === 'weight_loss') return ['recovery', 'easy', 'easy', 'steady', 'long_run'].slice(0, sessionsPerWeek) as WorkoutType[]
    return ['easy', 'steady', 'intervals', 'tempo', 'long_run'] as WorkoutType[]
  }

  return ['easy', 'long_run'].slice(0, sessionsPerWeek) as WorkoutType[]
}

function calculateWeeklyProgression(
  currentWeek: number,
  totalWeeks: number,
  buildUpWeeks: number,
  startingVolumeFactor: number,
  injuryMultiplier: number,
  recoveryInterval: number
): {
  factor: number
  volume: number
  intensity: number
  isRecoveryWeek: boolean
} {
  const isBuildUp = currentWeek <= buildUpWeeks
  const isTaper = currentWeek >= totalWeeks - 1

  const buildUpProgress = isBuildUp ? currentWeek / buildUpWeeks : 1.0
  const effectiveBuildUp = isBuildUp
    ? Math.pow(buildUpProgress, 1.5)
    : 1.0

  const weekProgress = currentWeek / totalWeeks
  const volumeFactor = startingVolumeFactor + ((1.0 - startingVolumeFactor) * effectiveBuildUp)

  const intensityLevels = {
    beginner: { start: 0.6, peak: 0.85 },
    intermediate: { start: 0.65, peak: 0.9 },
    advanced: { start: 0.7, peak: 0.95 }
  }

  const isRecoveryWeek = currentWeek % recoveryInterval === 0 && currentWeek > 1 && currentWeek < totalWeeks - 1
  const isDeload = isRecoveryWeek ? 0.6 : 1.0
  const isTaperFactor = isTaper ? 0.9 : 1.0

  return {
    factor: volumeFactor * isDeload * injuryMultiplier,
    volume: volumeFactor * isDeload * injuryMultiplier,
    intensity: isDeload * isTaperFactor * injuryMultiplier,
    isRecoveryWeek
  }
}

function calculateWorkoutDistance(
  workoutType: WorkoutType,
  progression: { factor: number; volume: number },
  raceDistance: number,
  config: DistanceConfig,
  weekNum: number,
  totalWeeks: number
): number {
  const isRaceWeek = weekNum === totalWeeks - 1

  if (isRaceWeek && workoutType === 'long_run') {
    return raceDistance * 0.3
  }

  switch (workoutType) {
    case 'long_run': {
      const longRunRatio = config.longRunRatio
      const startRatio = longRunRatio * 0.6
      const peakRatio = Math.min(config.maxLongRunRatio, longRunRatio * 1.5)
      const ratio = startRatio + (peakRatio - startRatio) * progression.factor
      return raceDistance * ratio
    }

    case 'easy':
    case 'steady': {
      const ratio = 0.15 + (0.25 - 0.15) * progression.factor
      return raceDistance * ratio
    }

    case 'tempo': {
      const ratio = 0.12 + (0.2 - 0.12) * progression.factor
      return raceDistance * ratio
    }

    case 'intervals': {
      const ratio = 0.08 + (0.12 - 0.08) * progression.factor
      return Math.max(1.5, raceDistance * ratio)
    }

    case 'recovery':
      return raceDistance * 0.08

    case 'cross':
      return 0

    case 'race':
      return raceDistance

    default:
      return raceDistance * 0.15
  }
}

function calculateSessionDuration(
  workoutType: WorkoutType,
  distance: number,
  maxDuration: number,
  goalType?: string
): number {
  const baseDuration = WORKOUT_TEMPLATES[workoutType].baseDuration

  const pacePerKm = workoutType === 'intervals' ? 4.5 :
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
    adjustedMax = Math.max(adjustedMax, 90)
  }

  return Math.round(Math.min(Math.max(baseDuration, distanceDuration), adjustedMax))
}

function formatPace(paceMinutes: number): string {
  const minutes = Math.floor(paceMinutes)
  const seconds = Math.round((paceMinutes - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`
}

function formatHeartRateZone(
  hrZones: Record<string, { min: number; max: number }>,
  workoutType: WorkoutType
): string {
  const zone = hrZones[workoutType] || hrZones.easy
  return `${zone.min}-${zone.max} lpm`
}

function generateWorkoutDetails(
  workoutType: WorkoutType,
  distance: number,
  pace: number,
  weekNum: number,
  duration: number,
  raceDistance: number,
  level: string,
  progression: { factor: number },
  rhythm: string
): string {
  const paceStr = formatPace(pace)

  switch (workoutType) {
    case 'easy':
      return `Trote suave ${duration} min. Ritmo ${rhythm}, deberías poder mantener una conversación.`

    case 'steady':
      return `Trote constante ${duration} min. Ritmo ${rhythm} (~${paceStr}), desafiante pero controlable.`

    case 'tempo': {
      const examples = raceDistance >= 21
        ? '3x3km o 2x5km'
        : raceDistance >= 10
          ? '4x1.5km o 2x3km'
          : '5x800m o 3x1.2km'
      return `Tempo ${duration} min. Ritmo ${rhythm} (~${paceStr}). Ej: ${examples}.`
    }

    case 'intervals': {
      const restRatio = level === 'advanced' ? '1:1' : '1:2'
      const examples = raceDistance >= 21
        ? '6-8x800m'
        : raceDistance >= 10
          ? '6-8x600m o 4x1km'
          : '6x400m o 8x200m'
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

function calculateRealSessionDates(
  startDate: string,
  totalSessions: number,
  sessionsPerWeek: number
): string[] {
  const start = new Date(startDate + 'T00:00:00')
  const dates: string[] = []

  for (let i = 0; i < totalSessions; i++) {
    const dayOffset = Math.floor(i * 7 / sessionsPerWeek)
    const date = new Date(start)
    date.setDate(date.getDate() + dayOffset)
    dates.push(date.toISOString().split('T')[0])
  }

  return dates
}

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

export const EVENT_DATE = "2026-05-17T06:00:00"
export const EVENT_DISTANCE = 7
export const EVENT_NAME = "Carrera Recreativa"
