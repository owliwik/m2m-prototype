import { NextRequest, NextResponse } from 'next/server'
import { admin, getAuthedUser } from '@/app/lib/serverSupabase'

const ALLOWED_DOMAIN = '@bhsfic.com'

/**
 * Idempotent profile sync:
 *   - Reads the caller's auth JWT from the Authorization header.
 *   - If a matching public.users row exists, returns success (no-op).
 *   - Otherwise creates one from the auth user's email + user_metadata.name.
 *
 * Called from the signup flow right after verifyOtp() succeeds, and safe
 * to call again on any future login to self-heal an orphaned auth user.
 */
export async function POST(request: NextRequest) {
  const authed = await getAuthedUser(request)
  if (!authed.user) {
    return NextResponse.json({ error: authed.error }, { status: authed.status })
  }
  const user = authed.user

  const email = user.email ?? ''
  // if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
  //   return NextResponse.json(
  //     { error: '仅限 @bhsfic.com 邮箱' },
  //     { status: 403 },
  //   )
  // }

  // Idempotent check
  const { data: existing, error: selErr } = await admin
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 })
  }
  if (existing) {
    return NextResponse.json({ success: true, created: false })
  }

  const meta = (user.user_metadata ?? {}) as { name?: unknown }
  const rawName = typeof meta.name === 'string' ? meta.name.trim() : ''
  const name = rawName || email.split('@')[0] || '匿名用户'

  const { error: insErr } = await admin.from('users').insert({
    id: user.id,
    email,
    name,
    role: 'student',
  })
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, created: true })
}
