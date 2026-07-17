import { supabase } from './supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// =============================================================================
// Auth module — Supabase Auth edition
// =============================================================================
// Migration notes:
//   - Replaces the old custom SHA-256 password hash flow with Supabase Auth
//     (bcrypt managed server-side, JWT issued by Supabase).
//   - `getSession()` is synchronous: it reads the localStorage cache that we
//     populate after each sign-in and on auth state changes. Use
//     `getSessionAsync()` for the authoritative server-side check.
//   - The source of truth is the Supabase auth session. localStorage is a
//     performance cache for instant UI render.
// =============================================================================

const SESSION_KEY = "running_session"
const SESSION_DURATION = 24 * 60 * 60 * 1000

export interface AppSession {
  authenticated: boolean
  userId: string
  email: string
  username: string
  role: 'user' | 'admin'
  planId: string | null
  planName: string | null
  planLevel: string | null
  raceDistance: number
  raceDate: string | null
  raceName: string | null
  startDate: string | null
  expiresAt: number
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getDefaultRaceDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 56)
  return d.toISOString().split('T')[0]
}

function tomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

async function loadPublicUserRow(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      username,
      role,
      plan_id,
      race_distance,
      race_date,
      race_name,
      start_date,
      plans:plan_id ( id, name, level )
    `)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('loadPublicUserRow error:', error)
    return null
  }
  return data
}

function buildAppSession(authUser: SupabaseUser, row: any): AppSession {
  return {
    authenticated: true,
    userId: authUser.id,
    email: authUser.email ?? '',
    username: row?.username ?? (authUser.email?.split('@')[0] ?? ''),
    role: (row?.role as 'user' | 'admin') ?? 'user',
    planId: row?.plan_id ?? null,
    planName: row?.plans?.name ?? null,
    planLevel: row?.plans?.level ?? null,
    raceDistance: row?.race_distance ?? 7,
    raceDate: row?.race_date ?? getDefaultRaceDate(),
    raceName: row?.race_name ?? 'Carrera Recreativa',
    startDate: row?.start_date ?? tomorrowDate(),
    expiresAt: Date.now() + SESSION_DURATION,
  }
}

function persistSession(s: AppSession | null) {
  if (typeof window === 'undefined') return
  if (!s) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(s))
}

function readCachedSession(): AppSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s: AppSession = JSON.parse(raw)
    if (!s.authenticated || s.expiresAt < Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return s
  } catch {
    return null
  }
}

// -----------------------------------------------------------------------------
// Auth API
// -----------------------------------------------------------------------------

export async function signIn(
  email: string,
  password: string
): Promise<{ success: boolean; session?: AppSession; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })
    if (error || !data.user) {
      return { success: false, error: error?.message ?? 'Credenciales incorrectas' }
    }

    const row = await loadPublicUserRow(data.user.id)
    if (!row) {
      await supabase.auth.signOut()
      return {
        success: false,
        error: 'Cuenta sin perfil público. Contactá al administrador.',
      }
    }

    const session = buildAppSession(data.user, row)
    persistSession(session)
    return { success: true, session }
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Error de conexión' }
  }
}

export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> {
  try {
    // Use the configured production URL for email confirmation links so they
    // always point to the live site, even if the signup request happens to be
    // triggered from a local/dev origin.
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : undefined)
    const redirectTo = siteUrl
      ? `${siteUrl.replace(/\/$/, '')}/auth/confirm?next=/iniciar-sesion`
      : undefined

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: { username: username.toLowerCase().trim() },
        emailRedirectTo: redirectTo,
      },
    })
    if (error) return { success: false, error: error.message }

    if (!data.session || !data.user) {
      return {
        success: true,
        needsConfirmation: true,
        error: 'Te enviamos un email de confirmación. Revisá tu bandeja (y spam) y hacé clic en el link para activar tu cuenta.',
      }
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Error al crear la cuenta' }
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  persistSession(null)
}

/**
 * Backwards-compatible alias used throughout the app. Sync wrapper that
 * clears the local cache immediately and signs out of Supabase in the
 * background. UI can navigate without awaiting.
 */
export function clearSession(): void {
  persistSession(null)
  void supabase.auth.signOut()
}

// -----------------------------------------------------------------------------
// Session retrieval
// -----------------------------------------------------------------------------

/** Synchronous accessor — reads localStorage cache. */
export function getSession(): AppSession | null {
  return readCachedSession()
}

/** Authoritative session check — refreshes from Supabase + public.users. */
export async function getSessionAsync(): Promise<AppSession | null> {
  if (typeof window === 'undefined') return null

  const { data } = await supabase.auth.getSession()
  if (!data.session?.user) {
    persistSession(null)
    return null
  }

  const row = await loadPublicUserRow(data.session.user.id)
  if (!row) return null

  const session = buildAppSession(data.session.user, row)
  persistSession(session)
  return session
}

/** Refresh the cached session from authoritative sources. */
export async function refreshSession(): Promise<AppSession | null> {
  return getSessionAsync()
}

/** Initialize the auth listener. Call once in the root layout. */
export function initAuthListener() {
  if (typeof window === 'undefined') return
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      persistSession(null)
      return
    }
    const row = await loadPublicUserRow(session.user.id)
    if (!row) return
    persistSession(buildAppSession(session.user, row))
  })
}
