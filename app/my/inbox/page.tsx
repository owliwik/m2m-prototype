'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import PageHeader from '@/app/components/PageHeader'
import type { Database } from '@/app/lib/database.types'

type SchoolRow = Database['public']['Tables']['schools']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

type InboxEntry = {
  request_id: string
  assignment_status: 'sent' | 'responded' | 'declined'
  request_status: 'pending' | 'approved' | 'rejected' | 'done'
  created_at: string
  question: string
  comm_pref: string | null
  duration: string | null
  visibility: 'public' | 'private'
  is_anonymous: boolean
  student: Pick<UserRow, 'name'> | null
  school: Pick<SchoolRow, 'name_zh' | 'color_bg' | 'color_fg'> | null
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export default function InboxPage() {
  const router = useRouter()
  const { user, ready } = useRequireAuth()

  const [roleChecked, setRoleChecked] = useState(false)
  const [isAmbassador, setIsAmbassador] = useState(false)
  const [entries, setEntries] = useState<InboxEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Ambassador-only gate (admin may also view via direct URL but isn't shown the link)
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
        const ok = data?.role === 'ambassador'
        setIsAmbassador(ok)
        setRoleChecked(true)
        if (!ok) router.replace('/')
      })
    return () => {
      cancelled = true
    }
  }, [ready, user, router])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from('request_ambassadors')
      .select(
        `
        status,
        request:requests(
          id, created_at, question, comm_pref, duration, status, visibility, is_anonymous,
          student:users!requests_student_id_fkey(name),
          school:schools(name_zh, color_bg, color_fg)
        )
        `,
      )
      .eq('ambassador_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError(error.message)
      setLoading(false)
      return
    }

    const rows: InboxEntry[] = (data ?? [])
      .map(row => {
        const r = Array.isArray(row.request) ? row.request[0] : row.request
        if (!r) return null
        const student = Array.isArray(r.student) ? r.student[0] ?? null : r.student
        const school = Array.isArray(r.school) ? r.school[0] ?? null : r.school
        return {
          request_id: r.id,
          assignment_status: row.status as InboxEntry['assignment_status'],
          request_status: r.status as InboxEntry['request_status'],
          created_at: r.created_at,
          question: r.question,
          comm_pref: r.comm_pref,
          duration: r.duration,
          visibility: r.visibility as 'public' | 'private',
          is_anonymous: r.is_anonymous,
          student,
          school,
        }
      })
      .filter((x): x is InboxEntry => !!x)

    setEntries(rows)
    setLoading(false)
  }, [user])

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isAmbassador) return
    load()
  }, [isAmbassador, load])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!ready || !roleChecked) return <CenterMessage text="加载中…" />
  if (!isAmbassador) return <CenterMessage text="正在跳转…" />

  const pending = entries.filter(
    e => e.request_status === 'approved' && e.assignment_status === 'sent',
  )
  const done = entries.filter(
    e =>
      (e.request_status === 'done' && e.assignment_status === 'responded') ||
      (e.request_status === 'done' && e.assignment_status === 'sent'), // taken by another ambassador
  )

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <PageHeader
        eyebrow="AMBASSADOR"
        title="我的收件箱"
        actions={
          <button
            onClick={load}
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

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 48px 80px' }}>
        {loadError && (
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
            {loadError}
          </div>
        )}

        <SectionHeader label="待回复" count={pending.length} />
        {pending.length === 0 ? (
          <EmptyBox text="目前没有待回复的提问。" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
            {pending.map(e => (
              <PendingCard key={e.request_id} e={e} />
            ))}
          </div>
        )}

        <SectionHeader label="已处理" count={done.length} />
        {done.length === 0 ? (
          <EmptyBox text="还没有已处理的提问。" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {done.map(e => (
              <DoneRow key={e.request_id} e={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 14,
        marginTop: 8,
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-noto-serif), serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#0D0D0D',
          margin: 0,
          letterSpacing: '-0.005em',
        }}
      >
        {label}
      </h2>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#8A8F9A',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          letterSpacing: '0.04em',
        }}
      >
        {count}
      </span>
    </div>
  )
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div
      style={{
        border: '1px solid #E2E5EA',
        borderRadius: 10,
        padding: '32px 24px',
        textAlign: 'center',
        color: '#8A8F9A',
        fontSize: 13,
        fontFamily: 'var(--font-noto-sans), sans-serif',
        backgroundColor: '#F7F8FA',
        marginBottom: 40,
      }}
    >
      {text}
    </div>
  )
}

function PendingCard({ e }: { e: InboxEntry }) {
  const studentLabel = e.student?.name ?? '(未知)'
  const preview = e.question.length > 120 ? e.question.slice(0, 120) + '…' : e.question
  const schoolBg = e.school?.color_bg ?? '#EEF0F4'
  const schoolFg = e.school?.color_fg ?? '#4A4F5A'

  return (
    <Link
      href={`/my/inbox/${e.request_id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        border: '1px solid #E2E5EA',
        borderRadius: 10,
        padding: '18px 22px',
        backgroundColor: '#FFFFFF',
        transition: 'border-color 150ms, background-color 150ms',
      }}
      onMouseEnter={e2 => {
        e2.currentTarget.style.borderColor = '#C8CDD6'
        e2.currentTarget.style.backgroundColor = '#FAFBFC'
      }}
      onMouseLeave={e2 => {
        e2.currentTarget.style.borderColor = '#E2E5EA'
        e2.currentTarget.style.backgroundColor = '#FFFFFF'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 9px',
              borderRadius: 6,
              backgroundColor: schoolBg,
              color: schoolFg,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.02em',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            {e.school?.name_zh ?? '(未知学校)'}
          </span>
          <span
            style={{
              fontSize: 12,
              color: '#4A4F5A',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            来自 {studentLabel}
          </span>
          {e.is_anonymous && (
            <span
              style={{
                fontSize: 11,
                color: '#8A8F9A',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              · 希望匿名
            </span>
          )}
          {e.visibility === 'private' && (
            <span
              style={{
                fontSize: 11,
                color: '#8A8F9A',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              · 私下
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {fmtDate(e.created_at)}
        </span>
      </div>

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: '#0D0D0D',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          margin: '0 0 10px',
        }}
      >
        {preview}
      </p>

      <div
        style={{
          fontSize: 12,
          color: '#8A8F9A',
          fontFamily: 'var(--font-noto-sans), sans-serif',
        }}
      >
        {e.comm_pref ?? '文字回复'}
        {e.duration ? ` · ${e.duration}` : ''}
        <span style={{ marginLeft: 12, color: '#1F4388', fontWeight: 500 }}>回复 →</span>
      </div>
    </Link>
  )
}

function DoneRow({ e }: { e: InboxEntry }) {
  const studentLabel = e.student?.name ?? '(未知)'
  const takenByOther = e.assignment_status === 'sent' // request done but not by me
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid #ECEEF2',
        fontFamily: 'var(--font-noto-sans), sans-serif',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: '#0D0D0D',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {e.question}
        </div>
        <div style={{ fontSize: 11, color: '#8A8F9A', marginTop: 2 }}>
          {e.school?.name_zh ?? ''} · {studentLabel} · {fmtDate(e.created_at)}
          {takenByOther && ' · 已由其他大使回复'}
        </div>
      </div>
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
