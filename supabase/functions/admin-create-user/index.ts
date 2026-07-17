// supabase/functions/admin-create-user/index.ts
//
// POST /functions/v1/admin-create-user
// Body: {
//   email: string,
//   password: string,
//   username: string,
//   plan_level: 'beginner' | 'intermediate' | 'pro',
//   race_distance: number,
//   race_date: string,         // YYYY-MM-DD
//   race_name?: string,
//   start_date?: string,       // YYYY-MM-DD
//   role?: 'user' | 'admin'
// }
//
// Creates a new auth.users row (with email + bcrypt password) and a matching
// public.users row with the requested plan. The new user receives a
// "set your password" flow via Supabase's recovery email if you instead
// pass `send_invite: true` (omitted here for brevity — wire it up to
// supabase.auth.admin.generateLink if you want it).
//
// Requires:
//   - Caller must be authenticated AND have role = 'admin' in public.users.
//   - SUPABASE_SERVICE_ROLE_KEY env var (auto-injected by Supabase).
//
// On success returns: { id, email, username }
// On error returns:    { error: string }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  // 1) Verify the caller is an authenticated admin.
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  if (!jwt) return json({ error: 'Missing Authorization header' }, 401)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  const { data: callerData, error: callerErr } = await supabaseAdmin.auth.getUser(jwt)
  if (callerErr || !callerData.user) return json({ error: 'Invalid token' }, 401)

  const { data: callerRow, error: callerRoleErr } = await supabaseAdmin
    .from('users')
    .select('role, is_active')
    .eq('id', callerData.user.id)
    .maybeSingle()
  if (callerRoleErr) return json({ error: callerRoleErr.message }, 500)
  if (!callerRow || callerRow.role !== 'admin' || callerRow.is_active === false) {
    return json({ error: 'Forbidden: admin role required' }, 403)
  }

  // 2) Parse + validate body.
  let body: any
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const {
    email,
    password,
    username,
    plan_level,
    race_distance,
    race_date,
    race_name,
    start_date,
    role,
  } = body ?? {}

  if (!email || !password || !username || !plan_level || !race_date) {
    return json({ error: 'email, password, username, plan_level, race_date are required' }, 400)
  }
  if (password.length < 6) return json({ error: 'Password must be at least 6 characters' }, 400)
  if (!['beginner', 'intermediate', 'pro'].includes(plan_level)) {
    return json({ error: 'plan_level must be beginner | intermediate | pro' }, 400)
  }
  if (role && !['user', 'admin'].includes(role)) {
    return json({ error: 'role must be user | admin' }, 400)
  }

  // 3) Resolve the plan.
  const { data: plan, error: planErr } = await supabaseAdmin
    .from('plans')
    .select('id')
    .eq('level', plan_level)
    .maybeSingle()
  if (planErr) return json({ error: planErr.message }, 500)
  if (!plan)  return json({ error: `Plan "${plan_level}" not found` }, 400)

  // 4) Create the auth user. This fires the handle_new_auth_user trigger,
  //    which creates a public.users row with DEFAULT values (beginner plan,
  //    default race). We'll then UPDATE that row to apply the requested
  //    plan/race data and (optionally) flip role to admin.
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: String(email).toLowerCase().trim(),
    password: String(password),
    email_confirm: true,
    user_metadata: { username: String(username).toLowerCase().trim() },
  })
  if (createErr || !created.user) {
    return json({ error: createErr?.message ?? 'Failed to create auth user' }, 400)
  }
  const newId = created.user.id

  // 5) Update public.users with the requested plan + race.
  const { error: updateErr } = await supabaseAdmin
    .from('users')
    .update({
      plan_id: plan.id,
      race_distance: Number(race_distance) || 7,
      race_date,
      race_name: race_name ?? 'Mi Carrera',
      start_date: start_date ?? null,
      role: role ?? 'user',
    })
    .eq('id', newId)

  if (updateErr) {
    // Best-effort cleanup: remove the auth user so we don't leave a half-created account.
    await supabaseAdmin.auth.admin.deleteUser(newId)
    return json({ error: updateErr.message }, 500)
  }

  // 6) Also update the user_plans row created by the trigger so the history
  //    section reflects the assigned plan correctly.
  const { error: planUpdateErr } = await supabaseAdmin
    .from('user_plans')
    .update({
      plan_id: plan.id,
      plan_name: plan_level,
      plan_level: plan_level,
      race_distance: Number(race_distance) || 7,
      race_date,
      race_name: race_name ?? 'Mi Carrera',
      start_date: start_date ?? null,
      is_active: true,
    })
    .eq('user_id', newId)

  if (planUpdateErr) {
    // Non-fatal: the user can still use the app, but log it for review.
    console.error('Failed to update user_plans:', planUpdateErr)
  }

  return json({ id: newId, email, username })
})
