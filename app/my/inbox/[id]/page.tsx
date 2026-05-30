'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import type { Database } from '@/app/lib/database.types'

type SchoolRow = Database['public']['Tables']['schools']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

type RequestDetail = {
  id: string
  created_at: string
  question: string
  comm_pref: string | null
  duration: string | null
  visibility: 'public' | 'private'
  is_anonymous: boolean
  status: 'pending' | 'approved' | 'rejected' | 'done'
  assignment_status: 'sent' | 'responded' | 'declined'
  student: Pick<UserRow, 'name' | 'email'> | null
  school: Pick<SchoolRow, 'name_zh' | 'name_en' | 'color_bg' | 'color_fg'> | null
}

export default function InboxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: requestId } = use(params)
  const router = useRouter()
  const { user, ready } = useRequireAuth()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [detail, setDetail] = useState<RequestDetail | null>(null)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!ready || !user) return
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('request_ambassadors')
        .select(
          `
          status,
          request:requests(
            id, created_at, question, comm_pref, duration, status, visibility, is_anonymous,
            student:users!requests_student_id_fkey(name, email),
            school:schools(name_zh, name_en, color_bg, color_fg)
          )
          `,
        )
        .eq('request_id', requestId)
        .eq('ambassador_id', user!.id)
        .maybeSingle()

      if (cancelled) return
      if (error) {
        setLoadError(error.message)
        setLoading(false)
        return
      }
      if (!data) {
        setLoadError('此提问不存在或未指派给你')
        setLoading(false)
        return
      }
      const r = Array.isArray(data.request) ? data.request[0] : data.request
      if (!r) {
        setLoadError('数据缺失')
        setLoading(false)
        return
      }
      const student = Array.isArray(r.student) ? r.student[0] ?? null : r.student
      const school = Array.isArray(r.school) ? r.school[0] ?? null : r.school
      setDetail({
        id: r.id,
        created_at: r.created_at,
        question: r.question,
        comm_pref: r.comm_pref,
        duration: r.duration,
        visibility: r.visibility as 'public' | 'private',
        is_anonymous: r.is_anonymous,
        status: r.status as RequestDetail['status'],
        assignment_status: data.status as RequestDetail['assignment_status'],
        student,
        school,
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [ready, user, requestId])

  async function handleSubmit() {
    if (submitting || !detail) return
    if (answer.trim().length < 20) {
      setSubmitError('回答至少 20 字')
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setSubmitting(false)
      setSubmitError('会话已过期，请重新登录')
      return
    }

    const res = await fetch(`/api/requests/${detail.id}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answer: answer.trim() }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      setSubmitting(false)
      setSubmitError(payload?.error ?? '提交失败')
      return
    }
    router.push('/my/inbox')
  }

  if (!ready || loading) return <CenterMessage text="加载中…" />
  if (loadError) return <CenterMessage text={loadError} />
  if (!detail) return <CenterMessage text="数据缺失" />

  // Already answered or otherwise no longer answerable
  const canAnswer = detail.status === 'approved' && detail.assignment_status === 'sent'

  const studentLabel = detail.student?.name ?? '(未知)'
  const studentEmail = detail.student?.email ?? null
  const schoolBg = detail.school?.color_bg ?? '#EEF0F4'
  const schoolFg = detail.school?.color_fg ?? '#4A4F5A'

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Back link */}
        <Link
          href="/my/inbox"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: '#4A4F5A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            textDecoration: 'none',
            marginBottom: 24,
            transition: 'color 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4A4F5A')}
        >
          ← 返回收件箱
        </Link>

        {/* School + meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              borderRadius: 6,
              backgroundColor: schoolBg,
              color: schoolFg,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.02em',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            {detail.school?.name_zh ?? '(未知)'}
          </div>
          <span
            style={{
              fontSize: 13,
              color: '#4A4F5A',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            来自 {studentLabel}
            {studentEmail && (
              <span style={{ color: '#8A8F9A', marginLeft: 6 }}>
                ({studentEmail})
              </span>
            )}
          </span>
          {detail.is_anonymous && (
            <span
              style={{
                fontSize: 12,
                color: '#8A8F9A',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              · 希望公开匿名
            </span>
          )}
          {detail.visibility === 'private' && (
            <span
              style={{
                fontSize: 12,
                color: '#A83131',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                letterSpacing: '0.02em',
              }}
            >
              · 私下提问
            </span>
          )}
        </div>

        {/* Question */}
        <h1
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#0D0D0D',
            lineHeight: 1.5,
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          问题
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.85,
            color: '#0D0D0D',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            whiteSpace: 'pre-wrap',
            margin: '0 0 32px',
            padding: '16px 20px',
            backgroundColor: '#F7F8FA',
            borderLeft: '3px solid #1F4388',
            borderRadius: 8,
          }}
        >
          {detail.question}
        </p>

        {/* Comm pref */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '6px 24px',
            marginBottom: 36,
            paddingBottom: 24,
            borderBottom: '1px solid #E2E5EA',
          }}
        >
          <Meta label="偏好沟通" value={detail.comm_pref ?? '文字回复'} sub={detail.duration ?? undefined} />
          <Meta
            label="公开设置"
            value={detail.visibility === 'public' ? '公开' : '私下'}
            sub={
              detail.visibility === 'public'
                ? '回复后发布到内容页'
                : '回复仅同学与你可见'
            }
          />
          <Meta label="提交时间" value={new Date(detail.created_at).toLocaleString('zh-CN')} />
        </div>

        {/* Already-handled banner */}
        {!canAnswer && (
          <div
            style={{
              padding: '16px 20px',
              border: '1px solid #E2E5EA',
              borderRadius: 10,
              backgroundColor: '#F7F8FA',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              color: '#4A4F5A',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            {detail.assignment_status === 'responded'
              ? '你已经回复过这个提问。'
              : detail.status === 'done'
                ? '此提问已被其他大使回复。'
                : detail.status === 'rejected'
                  ? '此提问已被管理员拒绝。'
                  : '此提问尚未通过管理员审核。'}
          </div>
        )}

        {/* Answer form */}
        {canAnswer && (
          <>
            <h2
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 18,
                fontWeight: 700,
                color: '#0D0D0D',
                margin: '0 0 12px',
                letterSpacing: '-0.005em',
              }}
            >
              你的回复
            </h2>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="写下你的回答。可以从个人经历出发，给出具体建议。"
              rows={10}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 16px',
                border: '1px solid #E2E5EA',
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.8,
                fontFamily: 'var(--font-noto-sans), sans-serif',
                color: '#0D0D0D',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 150ms',
                backgroundColor: '#FAFBFC',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 6,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  color: answer.trim().length >= 20 ? '#1F4388' : '#B0B5C0',
                  fontWeight: answer.trim().length >= 20 ? 500 : 400,
                }}
              >
                {answer.trim().length} / 20
              </span>
            </div>

            {submitError && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  border: '1px solid #E8C8C8',
                  borderRadius: 8,
                  backgroundColor: '#FAE8E8',
                  fontSize: 13,
                  color: '#7A2020',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Link
                href="/my/inbox"
                style={{
                  padding: '10px 22px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  color: '#4A4F5A',
                  border: '1px solid #E2E5EA',
                  textDecoration: 'none',
                  transition: 'border-color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
              >
                取消
              </Link>
              <button
                onClick={handleSubmit}
                disabled={submitting || answer.trim().length < 20}
                style={{
                  padding: '10px 28px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  cursor:
                    submitting || answer.trim().length < 20 ? 'default' : 'pointer',
                  backgroundColor:
                    submitting || answer.trim().length < 20 ? '#EEF0F4' : '#1F4388',
                  color: submitting || answer.trim().length < 20 ? '#B0B5C0' : '#FFFFFF',
                  transition: 'background-color 150ms',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={e => {
                  if (!submitting && answer.trim().length >= 20)
                    e.currentTarget.style.backgroundColor = '#183272'
                }}
                onMouseLeave={e => {
                  if (!submitting && answer.trim().length >= 20)
                    e.currentTarget.style.backgroundColor = '#1F4388'
                }}
              >
                {submitting ? '提交中…' : '发布回复'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Meta({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#B0B5C0',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: '#0D0D0D',
          fontFamily: 'var(--font-noto-sans), sans-serif',
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

function CenterMessage({ text }: { text: string }) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: '#8A8F9A',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        {text}
      </div>
    </div>
  )
}
