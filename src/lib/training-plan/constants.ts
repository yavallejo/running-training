// =============================================================================
// Training Plan - Constants
// =============================================================================
// All configuration tables live here. Tweak these to tune the algorithm.
// =============================================================================

import type { DistanceConfig, WorkoutType } from './types'

// -----------------------------------------------------------------------------
// Distance configurations
// -----------------------------------------------------------------------------
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
  }
}

// -----------------------------------------------------------------------------
// Workout templates
// -----------------------------------------------------------------------------
export const WORKOUT_TEMPLATES: Record<WorkoutType, {
  name: string
  description: string
  intensity: number
  baseDuration: number
  hrZone: string
  isHard: boolean
}> = {
  easy: {
    name: 'Trote Fácil',
    description: 'Trote conversacional, ritmo cómodo',
    intensity: 4,
    baseDuration: 30,
    hrZone: '60-70%',
    isHard: false
  },
  steady: {
    name: 'Trote Moderado',
    description: 'Ritmo sostenido pero cómodo',
    intensity: 6,
    baseDuration: 40,
    hrZone: '70-80%',
    isHard: false
  },
  tempo: {
    name: 'Tempo',
    description: 'Ritmo incómodo pero mantenible',
    intensity: 7,
    baseDuration: 35,
    hrZone: '80-85%',
    isHard: true
  },
  intervals: {
    name: 'Intervalos',
    description: 'Repeticiones rápidas con recuperación activa',
    intensity: 8,
    baseDuration: 40,
    hrZone: '85-95%',
    isHard: true
  },
  long_run: {
    name: 'Carrera Larga',
    description: 'La carrera más larga de la semana',
    intensity: 5,
    baseDuration: 75,
    hrZone: '70-80%',
    isHard: false
  },
  recovery: {
    name: 'Recuperación',
    description: 'Caminata o trote muy suave',
    intensity: 2,
    baseDuration: 20,
    hrZone: '55-65%',
    isHard: false
  },
  cross: {
    name: 'Cross-Training',
    description: 'Ejercicios complementarios',
    intensity: 5,
    baseDuration: 45,
    hrZone: '60-75%',
    isHard: false
  },
  race: {
    name: 'Simulacro',
    description: 'Carrera a ritmo objetivo',
    intensity: 9,
    baseDuration: 30,
    hrZone: '85-95%',
    isHard: true
  }
}

// -----------------------------------------------------------------------------
// Multipliers and modifiers
// -----------------------------------------------------------------------------
export const TERRAIN_MULTIPLIERS: Record<string, number> = {
  treadmill: 0.98,
  track: 1.0,
  road: 1.02,
  trail: 1.08,
  mixed: 1.0
}

export const TERRAIN_EFFORT: Record<string, number> = {
  treadmill: 0.95,
  track: 1.0,
  road: 1.05,
  trail: 1.15,
  mixed: 1.0
}

export const GOAL_INTENSITY_MODIFIERS: Record<string, number> = {
  compete: 1.1,
  fitness: 1.0,
  weight_loss: 0.85
}

export const GOAL_PACE_MODIFIERS: Record<string, number> = {
  compete: 0.95,
  fitness: 1.0,
  weight_loss: 1.1
}

export const EXPERIENCE_PACE_BASELINE: Record<string, number> = {
  beginner: 6.5,
  intermediate: 5.5,
  advanced: 4.75
}

// Polarized training: share of easy/recovery vs hard sessions per level.
// 0.9 means 90% of sessions are easy/recovery (i.e. 10% hard).
// Beginners are more conservative; advanced runners can do 25% hard.
export const POLARIZED_BIAS: Record<string, number> = {
  beginner: 0.9,
  intermediate: 0.8,
  advanced: 0.75
}

// 10% rule cap: weekly volume (factor) cannot grow more than this per week.
export const WEEKLY_GROWTH_CAP = 0.10

// Taper curves per distance category.
// taper[0] = multiplier on race week, taper[1] = week before, etc.
// A multiplier of 0.4 means the session is 40% of full volume.
export const TAPER_CURVES: Record<number, number[]> = {
  3: [0.6],
  5: [0.6],
  7: [0.6, 0.75],
  10: [0.6, 0.75],
  15: [0.5, 0.7],
  21: [0.45, 0.65, 0.8],
  42: [0.4, 0.6, 0.75]
}

// Preferred day-of-week offsets (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
// We pick the closest day >= startDate and then add the offset index.
export const WEEKLY_DAY_PATTERNS: Record<number, number[]> = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 6],
  5: [1, 2, 3, 4, 6],
  6: [1, 2, 3, 4, 5, 6]
}
