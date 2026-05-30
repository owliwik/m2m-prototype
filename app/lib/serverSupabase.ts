import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import type { Database } from '@/app/lib/database.types'

export const admin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export function bearerToken(req: NextRequest): string | null {
  const h = req.headers.get('authorization')
  if (!h) return null
  const m = /^Bearer\s+(.+)$/i.exec(h)
  return m ? m[1] : null
}

/**
 * Validate a JWT and return the auth.users record.
 * Returns { user: null, error: '...' } on any failure so callers can early-return.
 */
export async function getAuthedUser(req: NextRequest) {
  const token = bearerToken(req)
  if (!token) return { user: null, error: '未登录' as const, status: 401 }

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) {
    return { user: null, error: '会话无效' as const, status: 401 }
  }
  return { user: data.user, error: null, status: 200 }
}

/**
 * Same as getAuthedUser but additionally enforces role='admin' in public.users.
 * Returns the auth user and the public profile row.
 */
export async function requireAdmin(req: NextRequest) {
  const authed = await getAuthedUser(req)
  if (!authed.user) return { ...authed, profile: null }

  const { data: profile, error: profErr } = await admin
    .from('users')
    .select('id, name, email, role')
    .eq('id', authed.user.id)
    .maybeSingle()

  if (profErr) {
    return { user: null, profile: null, error: profErr.message, status: 500 as const }
  }
  if (!profile || profile.role !== 'admin') {
    return { user: null, profile: null, error: '需要管理员权限' as const, status: 403 }
  }
  return { user: authed.user, profile, error: null, status: 200 }
}
