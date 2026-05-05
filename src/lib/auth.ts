import { supabase } from './supabase'

const SESSION_KEY = "running_session"
const SESSION_DURATION = 24 * 60 * 60 * 1000

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  if (typeof window === "undefined") return ""
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Validar credenciales contra Supabase
export async function validateCredentials(username: string, password: string): Promise<{ success: boolean; user?: any }> {
  if (typeof window === "undefined") return { success: false }

  try {
    const passwordHash = await hashPassword(password)

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        password_hash,
        plan_id,
        race_distance,
        race_date,
        race_name,
        start_date,
        role,
        plans:plan_id (
          id,
          name,
          level
        )
      `)
      .eq('username', username.toLowerCase())
      .single()

    if (error || !data) {
      return { success: false }
    }

    // Verificar hash manualmente
    if (data.password_hash !== passwordHash) {
      return { success: false }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error('Auth validation error:', error)
    return { success: false }
  }
}

// Crear sesión local
export function createSession(user: any): void {
  if (typeof window === "undefined") return
  
  // Calculate start date (day after registration or user's start_date)
  const startDate = user.start_date || (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })()
  
  const session = {
    authenticated: true,
    userId: user.id,
    username: user.username,
    planId: user.plan_id,
    planLevel: user.plans?.level,
    planName: user.plans?.name,
    raceDistance: user.race_distance || 7,
    raceDate: user.race_date || getDefaultRaceDate(),
    raceName: user.race_name || 'Carrera Recreativa',
    startDate: startDate,
    role: user.role || 'user',
    expiresAt: Date.now() + SESSION_DURATION
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// Get default race date (8 weeks from now)
function getDefaultRaceDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 56) // 8 weeks
  return date.toISOString().split('T')[0]
}

interface Session {
  authenticated: boolean
  userId: string
  username: string
  planId: string
  planLevel: string
  planName: string
  raceDistance: number
  raceDate: string
  raceName: string
  startDate: string
  role: 'user' | 'admin'
  expiresAt: number
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null

  try {
    const session: Session = JSON.parse(stored)
    if (session.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}

// Crear usuario (para uso admin o registro)
export async function createUser(
  username: string,
  password: string,
  planLevel: 'beginner' | 'intermediate' | 'pro',
  raceDistance: number = 7,
  raceDate?: string,
  raceName: string = 'Carrera Recreativa',
  role: 'user' | 'admin' = 'user',
  startDate?: string,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordHash = await hashPassword(password)

    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('level', planLevel)
      .single()

    if (!plan) return { success: false, error: 'Plan no encontrado' }

    // Calculate dates
    const effectiveStartDate = startDate || (() => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })()
    
    const effectiveRaceDate = raceDate || (() => {
      const date = new Date()
      date.setDate(date.getDate() + 56) // 8 weeks default
      return date.toISOString().split('T')[0]
    })()

    const { error } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase(),
        email: email?.toLowerCase() || null,
        password_hash: passwordHash,
        plan_id: plan.id,
        race_distance: raceDistance,
        race_date: effectiveRaceDate,
        race_name: raceName,
        start_date: effectiveStartDate,
        role: role
      })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Register user (public registration — race details configured during onboarding)
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordHash = await hashPassword(password)

    const { data: plan } = await supabase
      .from('plans')
      .select('id')
      .eq('level', 'beginner')
      .single()

    if (!plan) return { success: false, error: 'Plan no encontrado' }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Default values — overwritten by onboarding once user configures their plan
    const defaultRaceDate = getDefaultRaceDate()

    const { error } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        plan_id: plan.id,
        race_distance: 7,
        race_date: defaultRaceDate,
        race_name: 'Mi Carrera',
        start_date: startDateStr,
        role: 'user'
      })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}