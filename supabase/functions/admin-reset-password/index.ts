// supabase/functions/admin-reset-password/index.ts
//
// POST /functions/v1/admin-reset-password
// Body: { user_id: string, new_password: string }
//
// Admin-only. Updates the target user's password using the service_role
// admin API (bypasses RLS, no email required).
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

  const { user_id, new_password } = body ?? {}
  if (!user_id || !new_password) {
    return json({ error: 'user_id and new_password are required' }, 400)
  }
  if (String(new_password).length < 6) {
    return json({ error: 'new_password must be at least 6 characters' }, 400)
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    String(user_id),
    { password: String(new_password) },
  )
  if (error) return json({ error: error.message }, 400)

  return json({ ok: true })
})
