import { supabase } from './supabase'

// Generate deterministic UUID from string
function generateDeterministicId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
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
  intensity?: number // 1-10 scale
  duration?: number // minutes
  heartRateZone?: string
  warning?: string
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
  injury_description?: string
  // New fields
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
  hrZone: string
}> = {
  easy: {
    name: 'Trote Fácil',
    description: 'Trote conversacional, ritmo cómodo',
    intensity: 4,
    paceMultiplier: 1.2,
    hrZone: '60-70%'
  },
  steady: {
    name: 'Trote Moderado',
    description: 'Ritmo sostenido pero cómodo',
    intensity: 6,
    paceMultiplier: 1.1,
    hrZone: '70-80%'
  },
  tempo: {
    name: 'Tempo',
    description: 'Ritmo incómodo pero mantenible',
    intensity: 7,
    paceMultiplier: 1.0,
    hrZone: '80-85%'
  },
  intervals: {
    name: 'Intervalos',
    description: 'Repeticiones rápidas con recuperación',
    intensity: 8,
    paceMultiplier: 0.9,
    hrZone: '85-95%'
  },
  long_run: {
    name: 'Carrera Larga',
    description: 'La carrera más larga de la semana',
    intensity: 5,
    paceMultiplier: 1.15,
    hrZone: '70-80%'
  },
  recovery: {
    name: 'Recuperación',
    description: 'Caminata o trote muy suave',
    intensity: 2,
    paceMultiplier: 1.4,
    hrZone: '55-65%'
  },
  cross: {
    name: 'Cross-Training',
    description: 'Ejercicios complementarios',
    intensity: 5,
    paceMultiplier: 0,
    hrZone: '60-75%'
  }
}

// Plantillas de semanas según nivel
const WEEKLY_TEMPLATES: Record<string, WorkoutType[]> = {
  beginner: ['easy', 'intervals', 'long_run'],
  intermediate: ['easy', 'steady', 'intervals', 'long_run', 'recovery'],
  advanced: ['recovery', 'easy', 'tempo', 'steady', 'intervals', 'long_run']
}

// Ajustes por terreno
const TERRAIN_MULTIPLIERS: Record<string, number> = {
  treadmill: 0.98,  // Cinta = más eficiente
  track: 1.0,       // Pista estándar
  road: 1.02,       // Asfalto ligeramente más difícil
  trail: 1.05,      // Trail = más difícil
  mixed: 1.0        // Mixto = estándar
}

// Intensidad por objetivo
const GOAL_INTENSITY_FACTORS: Record<string, number> = {
  compete: 1.1,      // Más intenso para competir
  fitness: 1.0,      // Estándar
  weight_loss: 0.9   // Menos intenso, más volumen
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
  profile?: UserProfile,
  userId?: string
): Promise<TrainingSession[]> {
  const config = DISTANCE_CONFIGS[raceDistance] || DISTANCE_CONFIGS[7]
  
  // Usar perfil o defaults, asegurando que no haya valores null
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
  
  // Generate deterministic seed for session IDs
  const seed = userId || planId || 'default'
  
  // PRIORIZAR ALGORITMO cuando hay datos de perfil
  // Solo usar plantillas estáticas si NO hay perfil
  if (profile && profile.experience_level) {
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

  // Si no hay plantillas ni perfil, generar plan algorítmico con defaults
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

/**
 * Estima la FC máxima si no fue proporcionada
 */
function estimateMaxHeartRate(age: number, sex?: string): number {
  // Fórmula de Tanaka: 208 - (0.7 × edad)
  const baseMaxHR = 208 - (0.7 * age)
  
  // Ajuste por sexo (estadísticamente mujeres tienen FC ligeramente mayor)
  if (sex === 'female') return Math.round(baseMaxHR + 3)
  return Math.round(baseMaxHR)
}

/**
 * Calcula zonas cardíacas basadas en FC
 */
function calculateHeartRateZones(
  restingHR: number,
  maxHR: number
): Record<string, { min: number; max: number }> {
  // Karvonen: FC objetivo = (FC Máx - FC Reposo) × intensidad + FC Reposo
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

/**
 * Genera un plan usando algoritmo mejorado
 */
function generateAlgorithmicPlan(
  raceDistance: number,
  startDate: string,
  raceDate: string,
  config: DistanceConfig,
  profile: UserProfile,
  sessionsPerWeek: number,
  seed: string = 'default'
): TrainingSession[] {
  // Calculate actual available days and adapt plan to real time window
  const startMs = new Date(startDate + 'T00:00:00').getTime()
  const raceMs = new Date(raceDate + 'T00:00:00').getTime()
  const availableDays = Math.floor((raceMs - startMs) / (1000 * 60 * 60 * 24))

  if (availableDays <= 0) return []

  // Adapt number of weeks to real available time (capped at config.weeks)
  const availableFullWeeks = Math.floor(availableDays / 7)
  const hasUsablePartialWeek = (availableDays % 7) >= Math.ceil(7 / sessionsPerWeek)
  const totalWeeks = Math.min(
    config.weeks,
    Math.max(1, availableFullWeeks + (hasUsablePartialWeek ? 1 : 0))
  )

  // Count sessions that fit using weekly rhythm: session i falls on day floor(i * 7 / sessionsPerWeek)
  // Reserve 2 days before race as a pre-race buffer
  const trainingDays = Math.max(0, availableDays - 2)
  let totalSessions = 0
  for (let i = 0; i < totalWeeks * sessionsPerWeek; i++) {
    if (Math.floor(i * 7 / sessionsPerWeek) <= trainingDays) totalSessions = i + 1
    else break
  }

  if (totalSessions === 0) return []

  const sessionDates = calculateRealSessionDates(startDate, totalSessions, sessionsPerWeek)
  
  // Obtener plantilla de workouts según nivel
  let workoutTemplate = WEEKLY_TEMPLATES[profile.experience_level] || WEEKLY_TEMPLATES.beginner
  
  // Ajustar plantilla por lesiones: sustituir intervals por cross si tiene lesiones
  if (profile.has_injuries) {
    workoutTemplate = workoutTemplate.map(w => w === 'intervals' ? 'cross' : w)
  }
  
  // Ajustar plantilla al número de sesiones por semana
  const adjustedTemplate = adjustTemplateToSessions(workoutTemplate, sessionsPerWeek)
  
  // Calcular FC máxima (estimada si no fue proporcionada)
  const maxHR = profile.max_heart_rate || 
    (profile.age ? estimateMaxHeartRate(profile.age, profile.sex) : 190)
  
  // Calcular zonas cardíacas si tiene FC reposo
  const hrZones = profile.resting_heart_rate 
    ? calculateHeartRateZones(profile.resting_heart_rate, maxHR)
    : null
  
  // Factor de terreno
  const terrainMultiplier = TERRAIN_MULTIPLIERS[profile.preferred_terrain || 'road'] || 1.0
  
  // Factor de objetivo
  const goalFactor = GOAL_INTENSITY_FACTORS[profile.goal_type || 'fitness'] || 1.0
  
  // Factor de lesiones
  const injuryMultiplier = profile.has_injuries ? 0.7 : 1.0
  
  // Volumen inicial basado en km semanales actuales
  const startingVolumeFactor = profile.current_weekly_km > 0 
    ? Math.min(profile.current_weekly_km * 0.3 / config.baseDistance, 1.0)
    : 0.6
  
  // Intervalo de descarga según edad
  const recoveryInterval = (profile.age && profile.age > 60) ? 3 : 4
  
  const sessions: TrainingSession[] = []
  
  for (let i = 0; i < totalSessions; i++) {
    const weekNum = Math.floor(i / sessionsPerWeek) + 1
    const dayInWeek = i % sessionsPerWeek
    
    // Obtener tipo de workout del template
    let workoutType = adjustedTemplate[dayInWeek % adjustedTemplate.length]
    
    // Si tiene lesiones y es intervals, forzar cross
    if (profile.has_injuries && workoutType === 'intervals') {
      workoutType = 'cross'
    }
    
    // Calcular distancias y ritmos según progresión
    const progression = calculateProgression(
      weekNum,
      totalWeeks,
      raceDistance,
      profile.experience_level,
      config,
      startingVolumeFactor,
      injuryMultiplier,
      recoveryInterval
    )
    
    const workout = WORKOUT_TEMPLATES[workoutType]
    
    // Calcular distancia base
    let distance = calculateWorkoutDistance(workoutType, progression, raceDistance, config)
    
    // Aplicar multiplicador de terreno (injuryMultiplier ya está en progression.factor)
    distance = distance * terrainMultiplier
    
    // Calcular ritmo
    let pace = calculateTargetPace(
      workoutType, 
      profile.experience_level, 
      raceDistance, 
      profile.progressive_pace !== false,
      weekNum,
      totalWeeks
    )
    
    // Calcular duración estimada de la sesión
    const duration = calculateSessionDuration(
      workoutType, 
      distance, 
      profile.minutes_per_session || 60
    )
    
    // Generar zona cardíaca si está disponible
    const heartRateZone = hrZones && workoutType !== 'cross'
      ? formatHeartRateZone(hrZones, workoutType)
      : undefined
    
    // Generar warning si tiene lesiones
    const warning = profile.has_injuries 
      ? "⚠️ Plan adaptado por lesión. Consulta a tu médico."
      : undefined
    
    sessions.push({
      id: generateDeterministicId(`${seed}-${i}`),
      sessionOrder: i + 1,
      date: sessionDates[i] || startDate,
      dayLabel: `Semana ${weekNum} - Día ${dayInWeek + 1}`,
      workout: workout.name,
      workoutType: workoutType,
      details: generateWorkoutDetails(workoutType, distance, pace, weekNum, duration),
      distance: Math.round(distance * 10) / 10,
      targetPace: pace,
      completed: false,
      rescheduled: false,
      rescheduleUsed: false,
      blocked: false,
      weekNumber: weekNum,
      intensity: Math.round(workout.intensity * goalFactor),
      duration: duration,
      heartRateZone: heartRateZone,
      warning: warning
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
 * Calcula la progresión semanal con todos los factores
 */
function calculateProgression(
  currentWeek: number,
  totalWeeks: number,
  targetDistance: number,
  level: string,
  config: DistanceConfig,
  startingVolumeFactor: number,
  injuryMultiplier: number,
  recoveryInterval: number
): {
  factor: number
  volume: number
  intensity: number
} {
  const weekProgress = currentWeek / totalWeeks
  
  // Factor de volumen: empieza en startingVolumeFactor y crece a 1.0
  const volumeFactor = startingVolumeFactor + ((1.0 - startingVolumeFactor) * weekProgress)
  
  // Factor de intensidad según nivel
  const intensityFactors = {
    beginner: 0.65 + (weekProgress * 0.25),
    intermediate: 0.7 + (weekProgress * 0.25),
    advanced: 0.75 + (weekProgress * 0.2)
  }
  const intensityFactor = intensityFactors[level as keyof typeof intensityFactors] || intensityFactors.beginner
  
  // Semana de descarga (cada recoveryInterval semanas)
  const isRecoveryWeek = currentWeek % recoveryInterval === 0 && currentWeek > 1 && currentWeek < totalWeeks
  const recoveryMultiplier = isRecoveryWeek ? 0.7 : 1.0
  
  return {
    factor: volumeFactor * recoveryMultiplier * injuryMultiplier,
    volume: targetDistance * volumeFactor * recoveryMultiplier * injuryMultiplier,
    intensity: intensityFactor * recoveryMultiplier * injuryMultiplier
  }
}

/**
 * Calcula la distancia para un tipo de workout como porcentaje de la distancia objetivo.
 * Progresa de start% a peak% según el factor de progresión semanal.
 */
function calculateWorkoutDistance(
  workoutType: WorkoutType,
  progression: { factor: number; volume: number; intensity: number },
  targetDistance: number,
  _config: DistanceConfig
): number {
  // Rangos de distancia como fracción de la distancia de carrera (start → peak)
  const ratios: Record<WorkoutType, { start: number; peak: number }> = {
    easy:      { start: 0.35, peak: 0.60 },
    steady:    { start: 0.40, peak: 0.65 },
    tempo:     { start: 0.30, peak: 0.50 },
    intervals: { start: 0.25, peak: 0.45 },
    long_run:  { start: 0.55, peak: 0.85 },
    recovery:  { start: 0.20, peak: 0.30 },
    cross:     { start: 0,    peak: 0 }
  }

  const ratio = ratios[workoutType]
  if (!ratio || ratio.peak === 0) return 0

  const effectiveRatio = ratio.start + (ratio.peak - ratio.start) * progression.factor
  return targetDistance * effectiveRatio
}

/**
 * Calcula el ritmo objetivo según nivel, distancia, progresión y preferencias
 */
function calculateTargetPace(
  workoutType: WorkoutType,
  level: string,
  targetDistance: number,
  progressive: boolean,
  currentWeek: number,
  totalWeeks: number
): string {
  // Ritmos base por nivel (min/km) - representados como minutos decimales
  const basePaces = {
    beginner: { easy: 7.5, steady: 6.75, tempo: 6.25, intervals: 5.75, long_run: 7.0, recovery: 8.5, cross: 0 },
    intermediate: { easy: 6.5, steady: 6.0, tempo: 5.5, intervals: 5.0, long_run: 6.25, recovery: 7.5, cross: 0 },
    advanced: { easy: 5.75, steady: 5.25, tempo: 4.75, intervals: 4.25, long_run: 5.5, recovery: 6.75, cross: 0 }
  }
  
  const paces = basePaces[level as keyof typeof basePaces] || basePaces.beginner
  const basePace = paces[workoutType as keyof typeof paces] || paces.easy
  
  if (basePace === 0) return '' // Cross-training no tiene ritmo
  
  // Ajustar según distancia objetivo (más lento para distancias más largas)
  const distanceMultiplier = 1 + (targetDistance - 5) * 0.02
  
  // Ajustar según progresión semanal (si progressive = true)
  // Semana 1: ×1.15 (más lento) → Semana final: ×1.0 (más rápido)
  let progressiveMultiplier = 1.0
  if (progressive) {
    const weekProgress = currentWeek / totalWeeks
    progressiveMultiplier = 1 + (1 - weekProgress) * 0.15
  }
  
  const adjustedPace = basePace * distanceMultiplier * progressiveMultiplier
  
  const minutes = Math.floor(adjustedPace)
  const seconds = Math.round((adjustedPace - minutes) * 60)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`
}

/**
 * Calcula la duración estimada de la sesión
 */
function calculateSessionDuration(
  workoutType: WorkoutType,
  distance: number,
  maxDuration: number
): number {
  // Duración base según tipo de workout (minutos)
  const baseDurations: Record<WorkoutType, number> = {
    easy: 35,
    steady: 40,
    tempo: 45,
    intervals: 50,
    long_run: 60,
    recovery: 25,
    cross: 45
  }
  
  const baseDuration = baseDurations[workoutType] || 40
  
  // Ajustar según distancia (asumiendo ~6 min/km promedio para principiante)
  const distanceBasedDuration = distance * 6
  
  // Usar el menor entre base y distancia, pero no exceder maxDuration
  const estimatedDuration = Math.min(
    Math.max(baseDuration, distanceBasedDuration),
    maxDuration
  )
  
  return Math.round(estimatedDuration)
}

/**
 * Formatea la zona cardíaca para mostrar
 */
function formatHeartRateZone(
  hrZones: Record<string, { min: number; max: number }>,
  workoutType: WorkoutType
): string {
  const zone = hrZones[workoutType] || hrZones.easy
  return `${zone.min}-${zone.max} lpm`
}

/**
 * Genera detalles del workout con duración y FC
 */
function generateWorkoutDetails(
  workoutType: WorkoutType,
  distance: number,
  pace: string,
  weekNumber: number,
  duration: number
): string {
  const details: Record<WorkoutType, string> = {
    easy: `Trote suave por ${duration} min. Ritmo conversacional, deberías poder hablar sin dificultad.`,
    steady: `Ritmo constante por ${duration} min. Mantén un pace consistente de ${pace}.`,
    tempo: `Ritmo comfortably hard por ${duration} min. Deberías poder decir frases cortas.`,
    intervals: `Series rápidas por ${duration} min. Ej: 4x400m o 6x200m con recuperación.`,
    long_run: `Carrera larga por ${duration} min. Ritmo cómodo, ${pace}.`,
    recovery: `Caminata o trote muy suave por ${duration} min. Enfócate en recuperar.`,
    cross: `Cross-training por ${duration} min. Natación, ciclismo, yoga, o ejercicios complementarios.`
  }
  
  return details[workoutType] || 'Sesión de entrenamiento.'
}

/**
 * Asigna fechas reales a las sesiones usando ritmo semanal.
 * Sesión i cae en el día floor(i * 7 / sessionsPerWeek) desde el inicio,
 * garantizando exactamente sessionsPerWeek sesiones por semana con descanso entre ellas.
 */
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

/**
 * Carga el progreso del usuario
 */
export async function loadUserProgress(userId: string): Promise<Map<string, any>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('session_id, completed, completed_at, rescheduled, rescheduled_to, actual_time, actual_pace, feeling, notes, actual_distance')
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
  try {
    const { data, error, status, statusText } = await supabase
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

    console.log('Supabase response:', { data, error, status, statusText })

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

/**
 * Carga el perfil del usuario
 */
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

// Keep these for backward compatibility
export const EVENT_DATE = "2026-05-17T06:00:00"
export const EVENT_DISTANCE = 7
export const EVENT_NAME = "Carrera Recreativa"
