'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import PageHeader from '@/app/components/PageHeader'
import type { Database } from '@/app/lib/database.types'

type SchoolRow = Database['public']['Tables']['schools']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

type PendingRequest = {
  id: string
  created_at: string
  question: string
  comm_pref: string | null
  duration: string | null
  visibility: 'public' | 'private'
  is_anonymous: boolean
  student: Pick<UserRow, 'name' | 'email'> | null
  school: Pick<SchoolRow, 'name_zh' | 'color_bg' | 'color_fg'> | null
  ambassadors: { name: string }[]
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day} ${h}:${min}`
}

export default function AdminPage() {
  const router = useRouter()
  const { user, ready } = useRequireAuth()

  const [roleChecked, setRoleChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Per-row UI state — keyed by request id
  const [busy, setBusy] = useState<Record<string, 'approve' | 'reject' | null>>({})
  const [rowError, setRowError] = useState<Record<string, string | null>>({})

  // Role check
  useEffect(() => {
    if (!ready || !user) return
    let cancelled = false
    supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const ok = data?.role === 'admin'
        setIsAdmin(ok)
        setRoleChecked(true)
        if (!ok) router.replace('/')
      })
    return () => {
      cancelled = true
    }
  }, [ready, user, router])

  const loadPending = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('requests')
      .select(
        `
        id, created_at, question, comm_pref, duration, visibility, is_anonymous,
        student:users!requests_student_id_fkey(name, email),
        school:schools(name_zh, color_bg, color_fg),
        request_ambassadors(
          ambassador:ambassadors(
            user:users!ambassadors_id_fkey(name)
          )
        )
        `,
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError(error.message)
      setLoading(false)
      return
    }

    const rows: PendingRequest[] = (data ?? []).map(r => {
      const student = Array.isArray(r.student) ? r.student[0] ?? null : r.student
      const school = Array.isArray(r.school) ? r.school[0] ?? null : r.school
      const ambassadors = (r.request_ambassadors ?? [])
        .map(ra => {
          const amb = Array.isArray(ra.ambassador) ? ra.ambassador[0] : ra.ambassador
          const u = amb && (Array.isArray(amb.user) ? amb.user[0] : amb.user)
          return u?.name ? { name: u.name } : null
        })
        .filter((x): x is { name: string } => !!x)
      return {
        id: r.id,
        created_at: r.created_at,
        question: r.question,
        comm_pref: r.comm_pref,
        duration: r.duration,
        visibility: r.visibility,
        is_anonymous: r.is_anonymous,
        student,
        school,
        ambassadors,
      }
    })

    setRequests(rows)
    setLoading(false)
  }, [])

  // Trigger initial load once the role check confirms admin. The fetch
  // updates state asynchronously, which the lint rule flags but is the
  // intended pattern here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isAdmin) return
    loadPending()
  }, [isAdmin, loadPending])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function act(id: string, kind: 'approve' | 'reject') {
    setBusy(b => ({ ...b, [id]: kind }))
    setRowError(e => ({ ...e, [id]: null }))

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setBusy(b => ({ ...b, [id]: null }))
      setRowError(e => ({ ...e, [id]: '会话已过期' }))
      return
    }

    const res = await fetch(`/api/requests/${id}/${kind}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
      setBusy(b => ({ ...b, [id]: null }))
      setRowError(e => ({ ...e, [id]: payload?.error ?? '操作失败' }))
      return
    }

    setRequests(rs => rs.filter(r => r.id !== id))
    setBusy(b => ({ ...b, [id]: null }))
  }

  // Loading gates
  if (!ready || !roleChecked) {
    return <CenterMessage text="加载中…" />
  }
  if (!isAdmin) {
    return <CenterMessage text="正在跳转…" />
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <PageHeader
        eyebrow="ADMIN"
        title="待审核提问"
        actions={
          <button
            onClick={loadPending}
            disabled={loading}
            style={{
              border: '1px solid #E2E5EA',
              backgroundColor: '#FFFFFF',
              color: '#4A4F5A',
              padding: '8px 18px',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              cursor: loading ? 'default' : 'pointer',
              transition: 'border-color 150ms',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = '#C8CDD6' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.borderColor = '#E2E5EA' }}
          >
            {loading ? '刷新中…' : '刷新'}
          </button>
        }
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 48px 80px' }}>
        {loadError && (
          <ErrorBox text={loadError} />
        )}

        {!loadError && !loading && requests.length === 0 && (
          <div
            style={{
              border: '1px solid #E2E5EA',
              borderRadius: 10,
              padding: '48px 24px',
              textAlign: 'center',
              color: '#8A8F9A',
              fontSize: 14,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              backgroundColor: '#F7F8FA',
            }}
          >
            目前没有待审核的提问。
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(r => (
            <RequestCard
              key={r.id}
              r={r}
              busyKind={busy[r.id] ?? null}
              error={rowError[r.id] ?? null}
              onApprove={() => act(r.id, 'approve')}
              onReject={() => act(r.id, 'reject')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function RequestCard({
  r,
  busyKind,
  error,
  onApprove,
  onReject,
}: {
  r: PendingRequest
  busyKind: 'approve' | 'reject' | null
  error: string | null
  onApprove: () => void
  onReject: () => void
}) {
  const studentLabel = r.student?.name ?? '(未知)'
  const studentEmail = r.student?.email ?? null
  const ambNames = r.ambassadors.map(a => a.name).join('、') || '(无)'
  const schoolBg = r.school?.color_bg ?? '#EEF0F4'
  const schoolFg = r.school?.color_fg ?? '#4A4F5A'

  return (
    <div
      style={{
        border: '1px solid #E2E5EA',
        borderRadius: 10,
        padding: '20px 24px',
        backgroundColor: '#FFFFFF',
        transition: 'border-color 150ms',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
    >
      {/* Top row: school chip + meta */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 6,
            backgroundColor: schoolBg,
            color: schoolFg,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {r.school?.name_zh ?? '(未知学校)'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {fmtDate(r.created_at)}
        </div>
      </div>

      {/* Question */}
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: '#0D0D0D',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          margin: '0 0 14px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {r.question}
      </p>

      {/* Meta grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '6px 24px',
          marginBottom: 16,
        }}
      >
        <MetaRow
          label="提问者"
          value={studentLabel}
          sub={studentEmail ?? undefined}
          annotation={r.is_anonymous ? '希望公开匿名' : undefined}
        />
        <MetaRow label="指定大使" value={ambNames} />
        <MetaRow
          label="沟通方式"
          value={r.comm_pref ?? '(未指定)'}
          sub={r.duration ?? undefined}
        />
        <MetaRow label="公开设置" value={r.visibility === 'public' ? '公开' : '私下'} />
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: '10px 14px',
            border: '1px solid #E8C8C8',
            borderRadius: 8,
            backgroundColor: '#FAE8E8',
            fontSize: 13,
            color: '#7A2020',
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={onReject}
          disabled={busyKind !== null}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: '1px solid #E2E5EA',
            backgroundColor: '#FFFFFF',
            color: '#A83131',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            cursor: busyKind ? 'default' : 'pointer',
            opacity: busyKind && busyKind !== 'reject' ? 0.5 : 1,
            transition: 'border-color 150ms, background-color 150ms',
          }}
          onMouseEnter={e => {
            if (busyKind) return
            e.currentTarget.style.borderColor = '#C8CDD6'
            e.currentTarget.style.backgroundColor = '#FAE8E8'
          }}
          onMouseLeave={e => {
            if (busyKind) return
            e.currentTarget.style.borderColor = '#E2E5EA'
            e.currentTarget.style.backgroundColor = '#FFFFFF'
          }}
        >
          {busyKind === 'reject' ? '处理中…' : '拒绝'}
        </button>
        <button
          onClick={onApprove}
          disabled={busyKind !== null}
          style={{
            padding: '8px 22px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: busyKind === 'approve' ? '#8A9AC4' : '#1F4388',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            cursor: busyKind ? 'default' : 'pointer',
            opacity: busyKind && busyKind !== 'approve' ? 0.5 : 1,
            transition: 'background-color 150ms',
          }}
          onMouseEnter={e => { if (!busyKind) e.currentTarget.style.backgroundColor = '#183272' }}
          onMouseLeave={e => { if (!busyKind) e.currentTarget.style.backgroundColor = '#1F4388' }}
        >
          {busyKind === 'approve' ? '处理中…' : '通过 → 发给大使'}
        </button>
      </div>
    </div>
  )
}

function MetaRow({
  label,
  value,
  sub,
  annotation,
}: {
  label: string
  value: string
  sub?: string
  annotation?: string
}) {
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
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: '#0D0D0D',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
        {annotation && (
          <span
            style={{
              fontSize: 11,
              color: '#8A8F9A',
              marginLeft: 6,
              letterSpacing: '0.02em',
            }}
          >
            · {annotation}
          </span>
        )}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            marginTop: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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

function ErrorBox({ text }: { text: string }) {
  return (
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
      {text}
    </div>
  )
}
