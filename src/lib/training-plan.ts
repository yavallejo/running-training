import { supabase } from './supabase'

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
  intensity?: number // 1-10 scale
}

export type WorkoutType = 
  | 'easy'        // Trote conversacional (60-70% HR)
  | 'steady'      // Ritmo moderado (70-80% HR)
  | 'tempo'       // Ritmo incómodo pero mantenible (80-85% HR)
  | 'intervals'   // Velocidad con recuperación (85-95% HR)
  | 'long_run'    // Carrera larga (70-80% HR)
  | 'recovery'    // Caminata/trote muy suave (55-65% HR)
  | 'cross'       // Ejercicios complementarios

export interface UserProfile {
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  current_weekly_km: number
  available_days_per_week: number
  minutes_per_session: number
  has_injuries: boolean
}

export interface DistanceConfig {
  weeks: number
  sessionsPerWeek: number
  label: string
  baseDistance: number // km base para semana 1
  maxLongRun: number  // % de distancia objetivo para carrera larga
  intensityFactor: number // multiplicador de intensidad según nivel
}

// Configuración extendida de distancias
export const DISTANCE_CONFIGS: Record<number, DistanceConfig> = {
  3: { 
    weeks: 4, 
    sessionsPerWeek: 3, 
    label: '3K Principiante',
    baseDistance: 1.5,
    maxLongRun: 0.6,
    intensityFactor: 0.7
  },
  5: { 
    weeks: 6, 
    sessionsPerWeek: 3, 
    label: '5K Principiante',
    baseDistance: 2,
    maxLongRun: 0.6,
    intensityFactor: 0.7
  },
  7: { 
    weeks: 8, 
    sessionsPerWeek: 3, 
    label: '7K Recreativa',
    baseDistance: 2.5,
    maxLongRun: 0.65,
    intensityFactor: 0.75
  },
  10: { 
    weeks: 10, 
    sessionsPerWeek: 4, 
    label: '10K Intermedio',
    baseDistance: 3,
    maxLongRun: 0.7,
    intensityFactor: 0.8
  },
  15: { 
    weeks: 12, 
    sessionsPerWeek: 4, 
    label: '15K Intermedio',
    baseDistance: 4,
    maxLongRun: 0.7,
    intensityFactor: 0.8
  },
  21: { 
    weeks: 14, 
    sessionsPerWeek: 4, 
    label: '21K Medio Maratón',
    baseDistance: 5,
    maxLongRun: 0.75,
    intensityFactor: 0.85
  },
  42: { 
    weeks: 18, 
    sessionsPerWeek: 5, 
    label: '42K Maratón',
    baseDistance: 6,
    maxLongRun: 0.8,
    intensityFactor: 0.9
  },
}

// Templates de workouts según tipo
export const WORKOUT_TEMPLATES: Record<WorkoutType, {
  name: string
  description: string
  intensity: number
  paceMultiplier: number
}> = {
  easy: {
    name: 'Trote Fácil',
    description: 'Trote conversacional, ritmo cómodo',
    intensity: 4,
    paceMultiplier: 1.2
  },
  steady: {
    name: 'Trote Moderado',
    description: 'Ritmo sostenido pero cómodo',
    intensity: 6,
    paceMultiplier: 1.1
  },
  tempo: {
    name: 'Tempo',
    description: 'Ritmo incómodo pero mantenible',
    intensity: 7,
    paceMultiplier: 1.0
  },
  intervals: {
    name: 'Intervalos',
    description: 'Repeticiones rápidas con recuperación',
    intensity: 8,
    paceMultiplier: 0.9
  },
  long_run: {
    name: 'Carrera Larga',
    description: 'La carrera más larga de la semana',
    intensity: 5,
    paceMultiplier: 1.15
  },
  recovery: {
    name: 'Recuperación',
    description: 'Caminata o trote muy suave',
    intensity: 2,
    paceMultiplier: 1.4
  },
  cross: {
    name: 'Cross-Training',
    description: 'Ejercicios complementarios',
    intensity: 5,
    paceMultiplier: 0
  }
}

// Plantillas de semanas según nivel
const WEEKLY_TEMPLATES: Record<string, WorkoutType[]> = {
  beginner: ['easy', 'intervals', 'long_run'],
  intermediate: ['easy', 'steady', 'intervals', 'long_run', 'recovery'],
  advanced: ['recovery', 'easy', 'tempo', 'steady', 'intervals', 'long_run']
}

/**
 * Genera un plan de entrenamiento personalizado
 * Prioriza el algoritmo cuando hay datos de perfil del usuario
 */
export async function generateTrainingPlan(
  planId: string,
  raceDistance: number = 7,
  raceDate: string = "2026-05-17",
  startDate?: string,
  profile?: UserProfile
): Promise<TrainingSession[]> {
  const config = DISTANCE_CONFIGS[raceDistance] || DISTANCE_CONFIGS[7]
  
  // Usar perfil o defaults
  const userProfile: UserProfile = profile || {
    experience_level: 'beginner',
    current_weekly_km: 0,
    available_days_per_week: config.sessionsPerWeek,
    minutes_per_session: 60,
    has_injuries: false
  }

  // Calcular sesiones por semana basado en disponibilidad
  const sessionsPerWeek = Math.min(
    userProfile.available_days_per_week,
    config.sessionsPerWeek
  )

  // Calcular total de sesiones
  const totalSessions = config.weeks * sessionsPerWeek
  
  // Fecha de inicio (por defecto mañana)
  const effectiveStartDate = startDate || (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })()
  
  // PRIORIZAR ALGORITMO cuando hay datos de perfil
  // Solo usar plantillas estáticas si NO hay perfil
  if (profile && profile.experience_level) {
    return generateAlgorithmicPlan(
      raceDistance,
      effectiveStartDate,
      raceDate,
      config,
      userProfile,
      sessionsPerWeek
    )
  }

  // Fallback: intentar cargar plantillas de la base de datos
  const { data: sessionTemplates, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('plan_id', planId)
    .eq('target_distance', raceDistance)
    .order('session_order', { ascending: true })

  if (!error && sessionTemplates && sessionTemplates.length > 0) {
    const sessionDates = calculateSessionDates(effectiveStartDate, raceDate, sessionTemplates.length)
    
    return sessionTemplates.map((s, index) => ({
      id: s.id,
      sessionOrder: s.session_order || index + 1,
      date: sessionDates[index] || s.date,
      dayLabel: s.day_label || `Día ${index + 1}`,
      workout: s.workout,
      workoutType: mapWorkoutType(s.workout),
      details: s.details || '',
      distance: parseFloat(s.distance) || 0,
      targetPace: s.target_pace || '',
      completed: false,
      rescheduled: false,
      rescheduleUsed: false,
      blocked: false,
      weekNumber: Math.floor(index / sessionsPerWeek) + 1
    }))
  }

  // Si no hay plantillas ni perfil, generar plan algorítmico con defaults
  return generateAlgorithmicPlan(
    raceDistance,
    effectiveStartDate,
    raceDate,
    config,
    userProfile,
    sessionsPerWeek
  )
}

/**
 * Genera un plan usando algoritmo
 */
function generateAlgorithmicPlan(
  raceDistance: number,
  startDate: string,
  raceDate: string,
  config: DistanceConfig,
  profile: UserProfile,
  sessionsPerWeek: number
): TrainingSession[] {
  const totalWeeks = config.weeks
  const totalSessions = totalWeeks * sessionsPerWeek
  const sessionDates = calculateSessionDates(startDate, raceDate, totalSessions)
  
  // Obtener plantilla de workouts según nivel
  const workoutTemplate = WEEKLY_TEMPLATES[profile.experience_level] || WEEKLY_TEMPLATES.beginner
  
  // Ajustar plantilla al número de sesiones por semana
  const adjustedTemplate = adjustTemplateToSessions(workoutTemplate, sessionsPerWeek)
  
  const sessions: TrainingSession[] = []
  
  for (let i = 0; i < totalSessions; i++) {
    const weekNum = Math.floor(i / sessionsPerWeek) + 1
    const dayInWeek = i % sessionsPerWeek
    
    // Obtener tipo de workout del template
    const workoutType = adjustedTemplate[dayInWeek % adjustedTemplate.length]
    
    // Calcular distancias y ritmos según progresión
    const progression = calculateProgression(
      weekNum,
      totalWeeks,
      raceDistance,
      profile.experience_level,
      config
    )
    
    const workout = WORKOUT_TEMPLATES[workoutType]
    const distance = calculateWorkoutDistance(workoutType, progression, raceDistance, config)
    const pace = calculateTargetPace(workoutType, profile.experience_level, raceDistance)
    
    sessions.push({
      id: `gen-${i + 1}`,
      sessionOrder: i + 1,
      date: sessionDates[i] || startDate,
      dayLabel: `Semana ${weekNum} - Día ${dayInWeek + 1}`,
      workout: workout.name,
      workoutType: workoutType,
      details: generateWorkoutDetails(workoutType, distance, pace, weekNum),
      distance: Math.round(distance * 10) / 10,
      targetPace: pace,
      completed: false,
      rescheduled: false,
      rescheduleUsed: false,
      blocked: false,
      weekNumber: weekNum,
      intensity: workout.intensity
    })
  }
  
  return sessions
}

/**
 * Ajusta el template de workouts al número de sesiones disponibles
 */
function adjustTemplateToSessions(template: WorkoutType[], sessionsPerWeek: number): WorkoutType[] {
  if (sessionsPerWeek >= template.length) {
    return template
  }
  
  // Priorizar workouts importantes
  const priority: WorkoutType[] = ['easy', 'long_run', 'intervals', 'steady', 'tempo', 'recovery', 'cross']
  const selected: WorkoutType[] = []
  
  // Asegurar que long_run siempre esté incluido
  if (template.includes('long_run')) {
    selected.push('long_run')
  }
  
  // Agregar workouts según prioridad
  for (const workout of priority) {
    if (selected.length >= sessionsPerWeek) break
    if (template.includes(workout) && !selected.includes(workout)) {
      selected.push(workout)
    }
  }
  
  return selected
}

/**
 * Calcula la progresión semanal
 */
function calculateProgression(
  currentWeek: number,
  totalWeeks: number,
  targetDistance: number,
  level: string,
  config: DistanceConfig
): {
  factor: number
  volume: number
  intensity: number
} {
  const weekProgress = currentWeek / totalWeeks
  
  // Factor de volumen (0.6 a 1.0)
  const volumeFactor = 0.6 + (weekProgress * 0.4)
  
  // Factor de intensidad según nivel
  const intensityFactors = {
    beginner: 0.65 + (weekProgress * 0.25),
    intermediate: 0.7 + (weekProgress * 0.25),
    advanced: 0.75 + (weekProgress * 0.2)
  }
  const intensityFactor = intensityFactors[level as keyof typeof intensityFactors] || intensityFactors.beginner
  
  // Semana de descarga (cada 3-4 semanas)
  const isRecoveryWeek = currentWeek % 4 === 0 && currentWeek > 1 && currentWeek < totalWeeks
  const recoveryMultiplier = isRecoveryWeek ? 0.7 : 1.0
  
  return {
    factor: volumeFactor * recoveryMultiplier,
    volume: targetDistance * volumeFactor * recoveryMultiplier,
    intensity: intensityFactor * recoveryMultiplier
  }
}

/**
 * Calcula la distancia para un tipo de workout específico
 */
function calculateWorkoutDistance(
  workoutType: WorkoutType,
  progression: { factor: number; volume: number; intensity: number },
  targetDistance: number,
  config: DistanceConfig
): number {
  const baseDistance = config.baseDistance
  
  switch (workoutType) {
    case 'easy':
      return baseDistance * progression.factor * 0.8
      
    case 'steady':
      return baseDistance * progression.factor * 0.9
      
    case 'tempo':
      return baseDistance * progression.factor * 0.85
      
    case 'intervals':
      // Intervalos: distancia total incluyendo calentamiento y enfriamiento
      return baseDistance * progression.factor * 0.7
      
    case 'long_run':
      // Carrera larga: progresión gradual hasta el % máximo
      const maxLongRun = targetDistance * config.maxLongRun
      const longRunDistance = baseDistance + (maxLongRun - baseDistance) * progression.factor
      return Math.min(longRunDistance, maxLongRun)
      
    case 'recovery':
      return baseDistance * 0.5
      
    case 'cross':
      return 0 // Cross-training no tiene distancia
      
    default:
      return baseDistance * progression.factor
  }
}

/**
 * Calcula el ritmo objetivo según nivel y tipo de workout
 */
function calculateTargetPace(
  workoutType: WorkoutType,
  level: string,
  targetDistance: number
): string {
  // Ritmos base por nivel (min/km) - representados como minutos decimales
  const basePaces = {
    beginner: { easy: 7.5, steady: 6.75, tempo: 6.25, intervals: 5.75, long_run: 7.0, recovery: 8.5 },
    intermediate: { easy: 6.5, steady: 6.0, tempo: 5.5, intervals: 5.0, long_run: 6.25, recovery: 7.5 },
    advanced: { easy: 5.75, steady: 5.25, tempo: 4.75, intervals: 4.25, long_run: 5.5, recovery: 6.75 }
  }
  
  const paces = basePaces[level as keyof typeof basePaces] || basePaces.beginner
  const basePace = paces[workoutType as keyof typeof paces] || paces.easy
  
  // Ajustar según distancia objetivo (más lento para distancias más largas)
  const distanceMultiplier = 1 + (targetDistance - 5) * 0.02
  const adjustedPace = basePace * distanceMultiplier
  
  const minutes = Math.floor(adjustedPace)
  const seconds = Math.round((adjustedPace - minutes) * 60)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`
}

/**
 * Genera detalles del workout
 */
function generateWorkoutDetails(
  workoutType: WorkoutType,
  distance: number,
  pace: string,
  weekNumber: number
): string {
  const details: Record<WorkoutType, string> = {
    easy: `Trote suave y conversacional. Deberías poder hablar sin dificultad.`,
    steady: `Ritmo constante y cómodo. Mantén un pace consistente.`,
    tempo: `Ritmo comfortably hard. Deberías poder decir frases cortas.`,
    intervals: `Series rápidas con recuperación. Ej: 4x400m o 6x200m.`,
    long_run: `La carrera más larga de la semana. Ritmo cómodo.`,
    recovery: `Caminata o trote muy suave. Enfócate en recuperar.`,
    cross: `Actividad complementaria: natación, ciclismo, yoga, etc.`
  }
  
  return details[workoutType] || 'Sesión de entrenamiento.'
}

/**
 * Calcula fechas de sesiones entre inicio y carrera
 */
function calculateSessionDates(startDate: string, raceDate: string, totalSessions: number): string[] {
  const start = new Date(startDate + 'T00:00:00')
  const race = new Date(raceDate + 'T00:00:00')
  
  const diffTime = race.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0 || totalSessions <= 0) return []
  
  // Calcular intervalo entre sesiones (en días)
  const interval = Math.max(1, Math.floor(diffDays / totalSessions))
  
  const dates: string[] = []
  let currentDate = new Date(start)
  
  for (let i = 0; i < totalSessions && currentDate < race; i++) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + interval)
  }
  
  return dates
}

/**
 * Mapea string de workout a WorkoutType
 */
function mapWorkoutType(workout: string): WorkoutType {
  const lower = workout.toLowerCase()
  if (lower.includes('fácil') || lower.includes('easy')) return 'easy'
  if (lower.includes('moderado') || lower.includes('steady')) return 'steady'
  if (lower.includes('tempo')) return 'tempo'
  if (lower.includes('intervalo') || lower.includes('interval')) return 'intervals'
  if (lower.includes('larga') || lower.includes('long')) return 'long_run'
  if (lower.includes('recuperación') || lower.includes('recovery')) return 'recovery'
  if (lower.includes('cross') || lower.includes('complementario')) return 'cross'
  return 'easy'
}

/**
 * Carga el progreso del usuario
 */
export async function loadUserProgress(userId: string): Promise<Map<string, any>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  if (error || !data) return new Map()

  const progressMap = new Map()
  data.forEach(p => {
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

/**
 * Guarda el progreso del usuario
 */
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
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      session_id: sessionId,
      completed: progress.completed,
      rescheduled: progress.rescheduled,
      rescheduled_to: progress.rescheduledTo,
      actual_time: progress.actualTime,
      actual_pace: progress.actualPace,
      feeling: progress.feeling,
      notes: progress.notes,
      actual_distance: progress.actualDistance,
      completed_at: progress.completed ? new Date().toISOString() : null
    }, {
      onConflict: 'user_id,session_id'
    })

  if (error) {
    console.error('Error saving progress:', error)
  }
}

/**
 * Carga el perfil del usuario
 */
export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return {
    experience_level: data.experience_level,
    current_weekly_km: data.current_weekly_km,
    available_days_per_week: data.available_days_per_week,
    minutes_per_session: data.minutes_per_session,
    has_injuries: data.has_injuries
  }
}

// Keep these for backward compatibility
export const EVENT_DATE = "2026-05-17T06:00:00"
export const EVENT_DISTANCE = 7
export const EVENT_NAME = "Carrera Recreativa"