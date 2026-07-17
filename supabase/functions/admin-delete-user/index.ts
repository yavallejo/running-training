// supabase/functions/admin-delete-user/index.ts
//
// POST /functions/v1/admin-delete-user
// Body: { user_id: string, hard?: boolean }
//
// Admin-only.
//   - hard = false (default): soft-delete. Sets is_active = false on
//     public.users and the user cannot sign in.
//   - hard = true: deletes the public.users, public.user_profiles,
//     public.user_progress, public.user_plans rows, and the auth.users
//     row (cascading to auth.identities automatically).
//
// Requires:
//   - Caller must be authenticated AND have role = 'admin' in public.users.
//   - SUPABASE_SERVICE_ROLE_KEY env var.

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

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  if (!jwt) return { error: 'Missing Authorization header', status: 401 }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  const { data: callerData, error: callerErr } = await supabaseAdmin.auth.getUser(jwt)
  if (callerErr || !callerData.user) return { error: 'Invalid token', status: 401 }

  const { data: callerRow } = await supabaseAdmin
    .from('users')
    .select('role, is_active')
    .eq('id', callerData.user.id)
    .maybeSingle()

  if (!callerRow || callerRow.role !== 'admin' || callerRow.is_active === false) {
    return { error: 'Forbidden: admin role required', status: 403 }
  }
  return { supabaseAdmin }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  const guard = await requireAdmin(req)
  if ('error' in guard) return json({ error: guard.error }, guard.status)
  const { supabaseAdmin } = guard

  let body: any
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  const user_id = String(body?.user_id ?? '')
  const hard    = Boolean(body?.hard)

  if (!user_id) return json({ error: 'user_id is required' }, 400)

  if (hard) {
    // Delete owned data first, then the auth user (which also removes
    // auth.identities via FK CASCADE on Supabase).
    await supabaseAdmin.from('user_achievements').delete().eq('user_id', user_id)
    await supabaseAdmin.from('race_results').delete().eq('user_id', user_id)
    await supabaseAdmin.from('user_progress').delete().eq('user_id', user_id)
    await supabaseAdmin.from('user_plans').delete().eq('user_id', user_id)
    await supabaseAdmin.from('user_profiles').delete().eq('id', user_id)
    await supabaseAdmin.from('users').delete().eq('id', user_id)

    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(user_id)
    if (authErr) return json({ error: authErr.message }, 400)

    return json({ ok: true, hard: true })
  }

  // Soft delete: just flip is_active.
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_active: false })
    .eq('id', user_id)
  if (error) return json({ error: error.message }, 400)

  return json({ ok: true, hard: false })
})
