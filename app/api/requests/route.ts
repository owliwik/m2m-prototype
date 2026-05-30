import { NextRequest, NextResponse } from 'next/server'
import { admin, getAuthedUser } from '@/app/lib/serverSupabase'
import { sendEmail, escapeHtml } from '@/app/lib/email'

const VISIBILITIES = new Set(['public', 'private'])

type Payload = {
  school_id?: unknown
  question?: unknown
  comm_pref?: unknown
  duration?: unknown
  ambassador_ids?: unknown
  is_anonymous?: unknown
  visibility?: unknown
}

export async function POST(req: NextRequest) {
  const authed = await getAuthedUser(req)
  if (!authed.user) {
    return NextResponse.json({ error: authed.error }, { status: authed.status })
  }
  const userId = authed.user.id

  let body: Payload
  try {
    body = (await req.json()) as Payload
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  const question = typeof body.question === 'string' ? body.question.trim() : ''
  const schoolId = typeof body.school_id === 'string' ? body.school_id : ''
  const commPref = typeof body.comm_pref === 'string' ? body.comm_pref : null
  const duration = typeof body.duration === 'string' ? body.duration : null
  const ambassadorIds = Array.isArray(body.ambassador_ids)
    ? body.ambassador_ids.filter((x): x is string => typeof x === 'string')
    : []
  const isAnonymous = body.is_anonymous === true
  const visibility =
    typeof body.visibility === 'string' && VISIBILITIES.has(body.visibility)
      ? (body.visibility as 'public' | 'private')
      : 'public'

  if (question.length < 30) {
    return NextResponse.json({ error: '问题至少 30 字' }, { status: 400 })
  }
  if (!schoolId) {
    return NextResponse.json({ error: '缺少 school_id' }, { status: 400 })
  }
  if (ambassadorIds.length === 0) {
    return NextResponse.json({ error: '至少选一位大使' }, { status: 400 })
  }

  // Insert request
  const { data: requestRow, error: reqErr } = await admin
    .from('requests')
    .insert({
      student_id: userId,
      school_id: schoolId,
      question,
      comm_pref: commPref,
      duration,
      preferred_ambassador_id: ambassadorIds[0],
      is_anonymous: isAnonymous,
      visibility,
    })
    .select('id, created_at')
    .single()

  if (reqErr || !requestRow) {
    return NextResponse.json(
      { error: reqErr?.message ?? '提交失败' },
      { status: 500 },
    )
  }

  // Insert assignments
  const assignments = ambassadorIds.map(amb => ({
    request_id: requestRow.id,
    ambassador_id: amb,
    status: 'sent' as const,
  }))
  const { error: raErr } = await admin.from('request_ambassadors').insert(assignments)
  if (raErr) {
    return NextResponse.json({ error: raErr.message }, { status: 500 })
  }

  // Fire admin notification email (best-effort)
  notifyAdmins(requestRow.id, userId, question, schoolId, ambassadorIds, isAnonymous).catch(
    err => console.error('[notifyAdmins] failed:', err),
  )

  return NextResponse.json({ id: requestRow.id })
}

/**
 * Look up all admins + the student/school/ambassador labels, then email each
 * admin a summary with a link to /admin. Errors are logged, not thrown.
 */
async function notifyAdmins(
  requestId: string,
  studentId: string,
  question: string,
  schoolId: string,
  ambassadorIds: string[],
  isAnonymous: boolean,
) {
  const [adminsRes, studentRes, schoolRes, ambsRes] = await Promise.all([
    admin.from('users').select('email, name').eq('role', 'admin'),
    admin.from('users').select('name, email').eq('id', studentId).maybeSingle(),
    admin.from('schools').select('name_zh').eq('id', schoolId).maybeSingle(),
    admin
      .from('ambassadors')
      .select('user:users!ambassadors_id_fkey(name)')
      .in('id', ambassadorIds),
  ])

  const adminEmails = (adminsRes.data ?? [])
    .map(a => a.email)
    .filter((e): e is string => !!e)
  if (adminEmails.length === 0) {
    console.warn('[notifyAdmins] no admin users found')
    return
  }

  const studentName = studentRes.data?.name ?? '(unknown)'
  const studentLabel = isAnonymous
    ? `${studentName}（希望公开匿名）`
    : studentName
  const schoolLabel = schoolRes.data?.name_zh ?? schoolId
  const ambNames = (ambsRes.data ?? [])
    .map(a => {
      const u = a.user as { name?: string } | { name?: string }[] | null
      if (Array.isArray(u)) return u[0]?.name
      return u?.name
    })
    .filter((n): n is string => !!n)
    .join('、')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/admin`

  const html = `
    <div style="font-family:system-ui,-apple-system,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#0D0D0D;">
      <p style="font-size:16px;font-weight:600;margin:0 0 16px;">新的提问待审核</p>
      <p style="margin:0 0 8px;"><strong>学生：</strong>${escapeHtml(studentLabel)}</p>
      <p style="margin:0 0 8px;"><strong>学校：</strong>${escapeHtml(schoolLabel)}</p>
      <p style="margin:0 0 8px;"><strong>大使：</strong>${escapeHtml(ambNames)}</p>
      <p style="margin:16px 0 4px;"><strong>问题：</strong></p>
      <blockquote style="margin:0 0 20px;padding:12px 16px;background:#F7F8FA;border-left:3px solid #1F4388;color:#0D0D0D;">
        ${escapeHtml(question)}
      </blockquote>
      <p style="margin:20px 0 0;">
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#1F4388;color:#FFFFFF;border-radius:8px;text-decoration:none;font-weight:500;">前往审核</a>
      </p>
      <p style="margin:24px 0 0;font-size:12px;color:#8A8F9A;">请求 ID: ${escapeHtml(requestId)}</p>
    </div>
  `

  for (const to of adminEmails) {
    const result = await sendEmail({
      to,
      subject: `[M2M] 新提问待审核 — ${schoolLabel}`,
      html,
    })
    if (!result.ok) {
      console.error(`[notifyAdmins] send to ${to} failed:`, result.error)
    }
  }
}
