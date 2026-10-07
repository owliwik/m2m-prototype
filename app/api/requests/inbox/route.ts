import { NextRequest, NextResponse } from 'next/server'
import { admin, getAuthedUser } from '@/app/lib/serverSupabase'

export async function GET(req: NextRequest) {
  const authed = await getAuthedUser(req)
  if (!authed.user) return NextResponse.json({ error: authed.error }, { status: authed.status })

  const { data: profile, error: profileError } = await admin
    .from('users').select('role').eq('id', authed.user.id).maybeSingle()
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
  if (profile?.role !== 'ambassador') {
    return NextResponse.json({ error: '需要大使权限' }, { status: 403 })
  }

  const requestId = req.nextUrl.searchParams.get('id')
  let query = admin.from('request_ambassadors').select(`
    status,
    request:requests(
      id, created_at, question, comm_pref, duration, status, visibility, is_anonymous,
      student:users!requests_student_id_fkey(name, email),
      school:schools(name_zh, name_en, color_bg, color_fg)
    )
  `).eq('ambassador_id', authed.user.id)
  if (requestId) query = query.eq('request_id', requestId)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries = (data ?? []).flatMap(row => {
    const r = Array.isArray(row.request) ? row.request[0] : row.request
    if (!r || (r.status !== 'approved' && r.status !== 'done')) return []
    const student = Array.isArray(r.student) ? r.student[0] : r.student
    const school = Array.isArray(r.school) ? r.school[0] : r.school
    return [{
      request_id: r.id,
      assignment_status: row.status,
      request_status: r.status,
      created_at: r.created_at,
      question: r.question,
      comm_pref: r.comm_pref,
      duration: r.duration,
      visibility: r.visibility,
      is_anonymous: r.is_anonymous,
      student: student ?? null,
      school: school ?? null,
    }]
  })
  return NextResponse.json({ entries }, { headers: { 'Cache-Control': 'private, no-store' } })
}
