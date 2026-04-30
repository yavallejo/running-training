import { supabase } from './supabase'

export interface TrainingSession {
  id: string
  sessionOrder: number
  date: string
  originalDate?: string
  dayLabel: string
  workout: string
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
}

export async function generateTrainingPlan(
  planId: string,
  raceDistance: number = 7,
  raceDate: string = "2026-05-17"
): Promise<TrainingSession[]> {
  const { data: sessions, error } = await supabase
    .from('training_sessions')
    .select('*')
    .eq('plan_id', planId)
    .eq('target_distance', raceDistance)
    .order('session_order', { ascending: true })

  if (error || !sessions) {
    console.error('Error loading training sessions:', error)
    return []
  }

  const raceDateObj = new Date(raceDate + 'T00:00:00')

  return sessions.map(s => {
    let sessionDate = s.date
    if (s.days_before_race !== null) {
      const calcDate = new Date(raceDateObj)
      calcDate.setDate(calcDate.getDate() - s.days_before_race)
      sessionDate = calcDate.toISOString().split('T')[0]
    }

    return {
      id: s.id,
      sessionOrder: s.session_order || 0,
      date: sessionDate,
      dayLabel: s.day_label || '',
      workout: s.workout,
      details: s.details || '',
      distance: parseFloat(s.distance) || 0,
      targetPace: s.target_pace || '',
      completed: false,
      rescheduled: false,
      rescheduleUsed: false,
      blocked: false
    }
  })
}

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

export const EVENT_DATE = "2026-05-17T06:00:00"
export const EVENT_DISTANCE = 7
export const EVENT_NAME = "Carrera Recreativa"