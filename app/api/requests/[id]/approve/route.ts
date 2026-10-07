import { NextRequest, NextResponse } from 'next/server'
import { admin, requireAdmin } from '@/app/lib/serverSupabase'
import { sendEmail, escapeHtml } from '@/app/lib/email'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: requestId } = await ctx.params

  const gate = await requireAdmin(req)
  if (!gate.user) {
    return NextResponse.json({ error: gate.error }, { status: gate.status })
  }

  // Load the request + linked rows we need for the email
  const { data: request, error: reqErr } = await admin
    .from('requests')
    .select(
      `
      id, question, status, comm_pref, duration, visibility, is_anonymous,
      student:users!requests_student_id_fkey(name, email),
      school:schools(name_zh)
      `,
    )
    .eq('id', requestId)
    .maybeSingle()

  if (reqErr) {
    return NextResponse.json({ error: reqErr.message }, { status: 500 })
  }
  if (!request) {
    return NextResponse.json({ error: '请求不存在' }, { status: 404 })
  }
  const body: { resend?: unknown; ambassador_ids?: unknown } = request.status === 'approved'
    ? await req.json().catch(() => ({}))
    : {}
  const resend = request.status === 'approved' && body?.resend === true
  if (request.status !== 'pending' && !resend) {
    return NextResponse.json(
      { error: `当前状态 ${request.status}，无法重复审核` },
      { status: 409 },
    )
  }

  if (!resend) {
    const { data: updated, error: updErr } = await admin
      .from('requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }
    if (!updated) {
      return NextResponse.json({ error: '此问题已被审核' }, { status: 409 })
    }
  }

  // Look up assigned ambassadors' emails
  const { data: assignments, error: asgErr } = await admin
    .from('request_ambassadors')
    .select(
      `
      ambassador_id,
      ambassador:ambassadors(
        user:users!ambassadors_id_fkey(name, email)
      )
      `,
    )
    .eq('request_id', requestId)

  if (asgErr) {
    console.error('[approve] failed to load assignments:', asgErr.message)
    return NextResponse.json({
      ok: true,
      email: { sent: 0, failed: 1, failedIds: [] },
    })
  }

  const requestedIds: string[] | null = resend && Array.isArray(body.ambassador_ids)
    ? body.ambassador_ids.filter((id: unknown): id is string => typeof id === 'string')
    : null
  if (requestedIds && requestedIds.some(id => !assignments?.some(a => a.ambassador_id === id))) {
    return NextResponse.json({ error: '重发对象未被指定回答此问题' }, { status: 400 })
  }
  const targets = requestedIds
    ? (assignments ?? []).filter(a => requestedIds.includes(a.ambassador_id))
    : (assignments ?? [])
  const email = await notifyAmbassadors(request, targets, req.nextUrl.origin)

  return NextResponse.json({ ok: true, email })
}

type RequestRow = {
  id: string
  question: string
  comm_pref: string | null
  duration: string | null
  is_anonymous: boolean
  student: { name: string; email: string } | { name: string; email: string }[] | null
  school: { name_zh: string } | { name_zh: string }[] | null
}

type Assignment = {
  ambassador_id: string
  ambassador:
    | { user: { name: string; email: string } | { name: string; email: string }[] | null }
    | { user: { name: string; email: string } | { name: string; email: string }[] | null }[]
    | null
}

function pickOne<T>(v: T | T[] | null): T | null {
  if (Array.isArray(v)) return v[0] ?? null
  return v
}

async function notifyAmbassadors(
  request: RequestRow,
  assignments: Assignment[],
  origin: string,
): Promise<{ sent: number; failed: number; failedIds: string[] }> {
  if (assignments.length === 0) {
    console.warn('[notifyAmbassadors] no ambassador emails for request', request.id)
    return { sent: 0, failed: 1, failedIds: [] }
  }

  const student = pickOne(request.student)
  const school = pickOne(request.school)
  const studentName = student?.name ?? '一位同学'
  const studentLabel = request.is_anonymous
    ? `${studentName}（希望公开匿名）`
    : studentName
  const schoolLabel = school?.name_zh ?? ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin
  const answerLink = `${baseUrl}/my/inbox/${request.id}`

  const results = await Promise.all(assignments.map(async assignment => {
    const amb = pickOne(assignment.ambassador)
    const r = pickOne(amb?.user ?? null)
    if (!r?.email) {
      console.error('[notifyAmbassadors] no email for ambassador', assignment.ambassador_id)
      return { id: assignment.ambassador_id, ok: false }
    }
    const html = `
      <div style="font-family:system-ui,-apple-system,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#0D0D0D;">
        <p style="font-size:16px;font-weight:600;margin:0 0 16px;">${escapeHtml(r.name)}，你好</p>
        <p style="margin:0 0 16px;">${escapeHtml(studentLabel)}向你提了一个关于 ${escapeHtml(schoolLabel)} 的问题：</p>
        <blockquote style="margin:0 0 20px;padding:12px 16px;background:#F7F8FA;border-left:3px solid #1F4388;color:#0D0D0D;">
          ${escapeHtml(request.question)}
        </blockquote>
        ${request.comm_pref ? `<p style="margin:0 0 8px;"><strong>偏好沟通方式：</strong>${escapeHtml(request.comm_pref)}${request.duration ? ` · ${escapeHtml(request.duration)}` : ''}</p>` : ''}
        <p style="margin:20px 0 0;">
          <a href="${answerLink}" style="display:inline-block;padding:10px 20px;background:#1F4388;color:#FFFFFF;border-radius:8px;text-decoration:none;font-weight:500;">查看并回复</a>
        </p>
        <p style="margin:24px 0 0;font-size:12px;color:#8A8F9A;">请点击上方链接，登录网站后回复问题。</p>
      </div>
    `
    const result = await sendEmail({
      to: r.email,
      subject: `[M2M] 有同学向你提问 — ${schoolLabel}`,
      html,
    })
    if (!result.ok) {
      console.error(`[notifyAmbassadors] send to ${r.email} failed:`, result.error)
    }
    return { id: assignment.ambassador_id, ok: result.ok }
  }))
  const failedIds = results.filter(result => !result.ok).map(result => result.id)
  return { sent: assignments.length - failedIds.length, failed: failedIds.length, failedIds }
}
