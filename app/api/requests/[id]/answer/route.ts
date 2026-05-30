import { NextRequest, NextResponse } from 'next/server'
import { admin, getAuthedUser } from '@/app/lib/serverSupabase'
import { sendEmail, escapeHtml } from '@/app/lib/email'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: requestId } = await ctx.params

  const authed = await getAuthedUser(req)
  if (!authed.user) {
    return NextResponse.json({ error: authed.error }, { status: authed.status })
  }
  const ambassadorId = authed.user.id

  let body: { answer?: unknown }
  try {
    body = (await req.json()) as { answer?: unknown }
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }
  const answer = typeof body.answer === 'string' ? body.answer.trim() : ''
  if (answer.length < 20) {
    return NextResponse.json({ error: '回答至少 20 字' }, { status: 400 })
  }

  // Confirm this user is actually assigned to this request
  const { data: assignment, error: asgErr } = await admin
    .from('request_ambassadors')
    .select('id, status')
    .eq('request_id', requestId)
    .eq('ambassador_id', ambassadorId)
    .maybeSingle()
  if (asgErr) {
    return NextResponse.json({ error: asgErr.message }, { status: 500 })
  }
  if (!assignment) {
    return NextResponse.json({ error: '你未被指定回答此问题' }, { status: 403 })
  }

  // Atomically claim the request. The WHERE clause includes status='approved' so
  // a second ambassador racing on the same request gets 0 rows affected and aborts
  // before any post is created.
  const { data: claimed, error: claimErr } = await admin
    .from('requests')
    .update({ status: 'done' })
    .eq('id', requestId)
    .eq('status', 'approved')
    .select(
      `
      id, question, school_id, student_id, is_anonymous, visibility,
      student:users!requests_student_id_fkey(name, email),
      school:schools(name_zh)
      `,
    )
    .maybeSingle()

  if (claimErr) {
    return NextResponse.json({ error: claimErr.message }, { status: 500 })
  }
  if (!claimed) {
    return NextResponse.json(
      { error: '此问题已被其他大使回答或状态已变更' },
      { status: 409 },
    )
  }

  // Insert the post (questioner_id stored regardless of anonymity flag — the flag
  // controls display only; we may still need it for "my answered" pages).
  const { data: post, error: postErr } = await admin
    .from('posts')
    .insert({
      kind: 'qa',
      author_id: ambassadorId,
      questioner_id: claimed.student_id,
      school_id: claimed.school_id,
      question: claimed.question,
      answer,
      is_anonymous: claimed.is_anonymous,
      visibility: claimed.visibility,
    })
    .select('id')
    .single()

  if (postErr || !post) {
    // Best effort: roll requests back to approved so the ambassador can retry.
    await admin
      .from('requests')
      .update({ status: 'approved' })
      .eq('id', requestId)
    return NextResponse.json(
      { error: postErr?.message ?? '创建回答失败' },
      { status: 500 },
    )
  }

  // Mark the responding ambassador's assignment row
  await admin
    .from('request_ambassadors')
    .update({ status: 'responded' })
    .eq('id', assignment.id)

  // Notify student (best-effort)
  notifyStudent(claimed, post.id, answer).catch(err =>
    console.error('[notifyStudent] failed:', err),
  )

  return NextResponse.json({ ok: true, post_id: post.id })
}

type ClaimedRequest = {
  id: string
  question: string
  visibility: 'public' | 'private'
  is_anonymous: boolean
  student: { name: string; email: string } | { name: string; email: string }[] | null
  school: { name_zh: string } | { name_zh: string }[] | null
}

function pickOne<T>(v: T | T[] | null): T | null {
  if (Array.isArray(v)) return v[0] ?? null
  return v
}

async function notifyStudent(req: ClaimedRequest, postId: string, answer: string) {
  const student = pickOne(req.student)
  if (!student?.email) {
    console.warn('[notifyStudent] no student email for request', req.id)
    return
  }
  const school = pickOne(req.school)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/feed/${postId}`
  const preview = answer.length > 300 ? answer.slice(0, 300) + '…' : answer

  const html = `
    <div style="font-family:system-ui,-apple-system,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#0D0D0D;">
      <p style="font-size:16px;font-weight:600;margin:0 0 16px;">${escapeHtml(student.name)}，你好</p>
      <p style="margin:0 0 16px;">你之前关于 ${escapeHtml(school?.name_zh ?? '')} 的提问已经收到回复：</p>
      <p style="margin:0 0 4px;"><strong>你的问题：</strong></p>
      <blockquote style="margin:0 0 16px;padding:12px 16px;background:#F7F8FA;border-left:3px solid #1F4388;color:#0D0D0D;">
        ${escapeHtml(req.question)}
      </blockquote>
      <p style="margin:0 0 4px;"><strong>回复（节选）：</strong></p>
      <blockquote style="margin:0 0 20px;padding:12px 16px;background:#F7F8FA;border-left:3px solid #A83131;color:#0D0D0D;white-space:pre-wrap;">
        ${escapeHtml(preview)}
      </blockquote>
      <p style="margin:20px 0 0;">
        <a href="${link}" style="display:inline-block;padding:10px 22px;background:#1F4388;color:#FFFFFF;border-radius:8px;text-decoration:none;font-weight:500;">查看完整回复</a>
      </p>
      ${req.visibility === 'private' ? '<p style="margin:24px 0 0;font-size:12px;color:#8A8F9A;">此问答为私下提问，仅你与大使可见。</p>' : ''}
    </div>
  `

  const result = await sendEmail({
    to: student.email,
    subject: `[M2M] 你的提问有新回复 — ${school?.name_zh ?? ''}`,
    html,
  })
  if (!result.ok) {
    console.error(`[notifyStudent] send to ${student.email} failed:`, result.error)
  }
}
