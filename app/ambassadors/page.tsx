'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import PageHeader from '../components/PageHeader'
import Tag from '../components/Tag'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import type { Database } from '@/app/lib/database.types'

type SchoolRow = Database['public']['Tables']['schools']['Row'] & {
  // TODO: regenerate app/lib/database.types.ts — DB has added `short_name` but types are stale
  short_name: string
}
type UserRow = Database['public']['Tables']['users']['Row']
type PostPreview = Pick<
  Database['public']['Tables']['posts']['Row'],
  'id' | 'kind' | 'content_type' | 'title' | 'question' | 'body'
>
type AmbassadorJoined = Database['public']['Tables']['ambassadors']['Row'] & {
  user: UserRow & { posts: PostPreview[] }
  school: SchoolRow
}

type Direction = '全部' | '理工' | '商科' | '文社科' | '艺术'
type SortMode = 'active' | 'recent'

const directionMap: Record<Direction, string[]> = {
  '全部': [],
  '理工': ['计算机科学', '机械工程'],
  '商科': ['Wharton 商科'],
  '文社科': ['经济', '社会学'],
  '艺术': ['电影制作'],
}

const contentTypeColors: Record<string, { bg: string; fg: string }> = {
  '文章':    { bg: '#FAE8E8', fg: '#A83131' },
  '申请文书': { bg: '#FAE8E8', fg: '#A83131' },
  '问答':    { bg: '#F5E0E0', fg: '#8C2020' },
  'Tips':   { bg: '#FAEEED', fg: '#993025' },
  '清单':    { bg: '#F7E6E6', fg: '#7A2828' },
  '推荐':    { bg: '#F5E8E8', fg: '#9C3030' },
  '校园生活': { bg: '#FAE8E8', fg: '#A83131' },
  '选校建议': { bg: '#F5E0E0', fg: '#8C2020' },
  '学术':    { bg: '#FAEEED', fg: '#993025' },
  '随笔':    { bg: '#F7E6E6', fg: '#7A2828' },
  '公开问答': { bg: '#F5E8E8', fg: '#9C3030' },
}
const DEFAULT_TYPE_COLOR = { bg: '#EEF0F4', fg: '#4A4F5A' }

function schoolColor(school: Pick<SchoolRow, 'color_bg' | 'color_fg'>) {
  return {
    bg: school.color_bg ?? '#EEF0F4',
    fg: school.color_fg ?? '#4A4F5A',
  }
}

function postDisplayText(post: PostPreview): string {
  if (post.kind === 'article') return post.title ?? ''
  if (post.kind === 'qa') return post.question ?? ''
  if (post.kind === 'note') {
    const body = post.body ?? ''
    return body.length > 40 ? body.slice(0, 40) + '…' : body
  }
  return post.title ?? ''
}

export default function AmbassadorsPage() {
  const { ready: authReady } = useRequireAuth()
  const [schoolSearch, setSchoolSearch] = useState('')
  const [direction, setDirection] = useState<Direction>('全部')
  const [sortMode, setSortMode] = useState<SortMode>('active')
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [ambassadors, setAmbassadors] = useState<AmbassadorJoined[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const [schoolsRes, ambassadorsRes] = await Promise.all([
        supabase.from('schools').select('*'),
        supabase
          .from('ambassadors')
          .select(
            '*, user:users(*, posts!posts_author_id_fkey(id, kind, content_type, title, question, body)), school:schools(*)',
          ),
      ])
      if (cancelled) return
      if (schoolsRes.error || ambassadorsRes.error) {
        setError(schoolsRes.error?.message ?? ambassadorsRes.error?.message ?? '加载失败')
        setLoading(false)
        return
      }
      setSchools((schoolsRes.data as unknown as SchoolRow[] | null) ?? [])
      setAmbassadors((ambassadorsRes.data as unknown as AmbassadorJoined[] | null) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [retryKey, authReady])

  // Aggregate post counts per school (from ambassador posts)
  const schoolContentCounts: Record<string, number> = {}
  for (const a of ambassadors) {
    schoolContentCounts[a.school.id] = (schoolContentCounts[a.school.id] ?? 0) + a.user.posts.length
  }

  // Filter schools by search
  const filteredSchools = schools.filter(s => {
    if (!schoolSearch) return true
    const q = schoolSearch.toLowerCase()
    return (
      s.id.toLowerCase().includes(q) ||
      s.name_zh.includes(schoolSearch) ||
      s.name_en.toLowerCase().includes(q)
    )
  }).slice(0, 8)

  // Filter ambassadors by direction
  const filteredAmbassadors = ambassadors.filter(a => {
    if (direction === '全部') return true
    return directionMap[direction].includes(a.dept ?? '')
  })

  // Sort ambassadors
  const sortedAmbassadors = [...filteredAmbassadors].sort((a, b) => {
    if (sortMode === 'active') return b.user.posts.length - a.user.posts.length
    return 0
  })

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <PageHeader
        eyebrow="M2M 大使目录"
        title="认识我们的在校大使"
      />

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 48px 80px' }}>

        {error && (
          <div
            style={{
              marginTop: 40,
              padding: '20px 24px',
              border: '1px solid #E8C8C8',
              borderRadius: 10,
              backgroundColor: '#FAE8E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#7A2020', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 4 }}>
                加载失败
              </div>
              <div style={{ fontSize: 12, color: '#8C3A3A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                {error}
              </div>
            </div>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'var(--font-noto-sans), sans-serif',
                border: '1px solid #A83131',
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
                color: '#A83131',
                cursor: 'pointer',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F7E6E6')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              重试
            </button>
          </div>
        )}

        {/* ═══ Module 1: School Entry ═══ */}
        <div style={{ paddingTop: 40 }}>
          <h2 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 20, fontWeight: 700, color: '#0D0D0D', marginBottom: 16, letterSpacing: '-0.01em' }}>
            进入学校社区
          </h2>

          {/* Search */}
          <input
            type="text"
            placeholder="搜索学校名称…"
            value={schoolSearch}
            onChange={e => setSchoolSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#F7F8FA',
              border: '1px solid #E2E5EA',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              color: '#0D0D0D',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 16,
              transition: 'border-color 150ms',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
          />

          {/* School cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SchoolEntrySkeleton key={i} />)
              : filteredSchools.map(school => {
                  const ambsForSchool = ambassadors.filter(a => a.school.id === school.id)
                  return (
                    <SchoolEntryCard
                      key={school.id}
                      school={school}
                      contentCount={schoolContentCounts[school.id] ?? 0}
                      ambassadors={ambsForSchool}
                    />
                  )
                })}
          </div>
        </div>

        {/* ═══ Divider ═══ */}
        <div style={{ borderTop: '1px solid #E2E5EA', margin: '48px 0' }} />

        {/* ═══ Module 2: Find Ambassador ═══ */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 20, fontWeight: 700, color: '#0D0D0D', marginBottom: 16, letterSpacing: '-0.01em' }}>
            找到合适的人
          </h2>

          {/* Filter bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}>
            {/* Direction pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['全部', '理工', '商科', '文社科', '艺术'] as Direction[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  style={{
                    padding: '5px 14px',
                    fontSize: 12,
                    fontWeight: direction === d ? 500 : 400,
                    fontFamily: 'var(--font-noto-sans), sans-serif',
                    border: '1px solid',
                    borderRadius: 6,
                    borderColor: direction === d ? '#1F4388' : '#E2E5EA',
                    backgroundColor: direction === d ? '#E8F0FC' : 'transparent',
                    color: direction === d ? '#1F4388' : '#4A4F5A',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    letterSpacing: '0.02em',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif', marginRight: 4 }}>排序</span>
              {([
                { key: 'active' as SortMode, label: '按活跃度' },
                { key: 'recent' as SortMode, label: '按最近更新' },
              ]).map(s => (
                <button
                  key={s.key}
                  onClick={() => setSortMode(s.key)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    fontFamily: 'var(--font-noto-sans), sans-serif',
                    border: 'none',
                    borderRadius: 6,
                    backgroundColor: sortMode === s.key ? '#F7F8FA' : 'transparent',
                    color: sortMode === s.key ? '#0D0D0D' : '#8A8F9A',
                    fontWeight: sortMode === s.key ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all 100ms',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ambassador grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 16 }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <AmbassadorCardSkeleton key={i} />)
              : sortedAmbassadors.map(ambassador => (
                  <AmbassadorCard key={ambassador.id} ambassador={ambassador} />
                ))}
          </div>

          {!loading && sortedAmbassadors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', fontSize: 14 }}>
              没有符合条件的大使
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── School entry card ─── */

function SchoolEntryCard({
  school,
  contentCount,
  ambassadors,
}: {
  school: SchoolRow
  contentCount: number
  ambassadors: AmbassadorJoined[]
}) {
  const colors = schoolColor(school)
  const visibleAmbs = ambassadors.slice(0, 2)
  const overflowCount = ambassadors.length - visibleAmbs.length

  return (
    <Link
      href={`/schools/${school.id.toLowerCase()}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        border: '1px solid #ECEEF2',
        borderRadius: 10,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 150ms, background-color 150ms',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8CDD6'; e.currentTarget.style.backgroundColor = '#FAFBFC' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#ECEEF2'; e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {/* School icon */}
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: colors.fg,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 600,
        flexShrink: 0,
        fontFamily: 'var(--font-noto-sans), sans-serif',
      }}>
        {school.name_zh[0]}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 1 }}>
          {school.name_zh}
        </div>
        <div style={{ fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {contentCount} 篇内容
        </div>
      </div>

      {/* Ambassador avatars */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {visibleAmbs.map((amb, j) => (
          <div
            key={amb.id}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: colors.bg,
              color: colors.fg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              border: '2px solid #FFFFFF',
              marginLeft: j > 0 ? -10 : 0,
              position: 'relative',
              zIndex: j + 1,
            }}
          >
            {amb.user.name[0]}
          </div>
        ))}
        {overflowCount > 0 && (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#EEF0F4',
              color: '#4A4F5A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              border: '2px solid #FFFFFF',
              marginLeft: -10,
              position: 'relative',
              zIndex: visibleAmbs.length + 1,
            }}
          >
            +{overflowCount}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ─── Ambassador card ─── */

function AmbassadorCard({ ambassador }: { ambassador: AmbassadorJoined }) {
  const sc = schoolColor(ambassador.school)
  const previewPosts = ambassador.user.posts.slice(0, 2)

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E5EA',
        borderRadius: 10,
        padding: '28px',
        transition: 'border-color 150ms',
        cursor: 'default',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E2E5EA')}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
        {/* Avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: sc.bg,
            color: sc.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            flexShrink: 0,
          }}
        >
          {ambassador.user.name.slice(0, 1)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + school tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 18,
                fontWeight: 700,
                color: '#0D0D0D',
              }}
            >
              {ambassador.user.name}
            </span>
            <Tag
              label={ambassador.school.short_name}
              color={sc}
              href={`/schools/${ambassador.school.id.toLowerCase()}`}
            />
          </div>

          {/* Dept + year */}
          <div
            style={{
              fontSize: 12,
              color: '#8A8F9A',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              marginBottom: 8,
            }}
          >
            {ambassador.dept ?? ''}
            {ambassador.grad_year != null && ` · ${ambassador.grad_year}届`}
          </div>

          {/* Bio */}
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: '#4A4F5A',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            {ambassador.bio ?? ''}
          </p>
        </div>
      </div>

      {/* Content previews */}
      {previewPosts.length > 0 && (
        <div
          style={{
            borderTop: '1px solid #E2E5EA',
            paddingTop: 16,
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {previewPosts.map(post => {
            const typeLabel = post.content_type ?? post.kind
            const typeColor = (post.content_type && contentTypeColors[post.content_type]) || DEFAULT_TYPE_COLOR
            return (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  textDecoration: 'none',
                  color: '#0D0D0D',
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
                onMouseLeave={e => (e.currentTarget.style.color = '#0D0D0D')}
              >
                <Tag
                  label={typeLabel}
                  color={typeColor}
                  className="shrink-0 mt-px"
                />
                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    fontFamily: 'var(--font-noto-sans), sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'inherit',
                  }}
                >
                  {postDisplayText(post)}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #E2E5EA',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F7F8FA',
          margin: '0 -28px -28px',
          padding: '14px 28px',
          borderRadius: '0 0 10px 10px',
          transition: 'background-color 150ms',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#EEF0F4')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#F7F8FA')}
      >
        <span
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {ambassador.user.posts.length} 篇内容
        </span>
        <Link
          href={`/ask?ambassador=${ambassador.id}`}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#A83131',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            transition: 'color 150ms',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
          onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
        >
          联系 →
        </Link>
      </div>
    </div>
  )
}

/* ─── Skeletons ─── */

const skeletonBlock = (w: number | string, h: number, extra: CSSProperties = {}): CSSProperties => ({
  width: w,
  height: h,
  backgroundColor: '#EEF0F4',
  borderRadius: 4,
  ...extra,
})

function SchoolEntrySkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        border: '1px solid #ECEEF2',
        borderRadius: 10,
      }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#EEF0F4', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={skeletonBlock('70%', 10)} />
        <div style={skeletonBlock('40%', 8)} />
      </div>
      <div style={{ display: 'flex', flexShrink: 0 }}>
        {[0, 1].map(j => (
          <div
            key={j}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#EEF0F4',
              border: '2px solid #FFFFFF',
              marginLeft: j > 0 ? -10 : 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function AmbassadorCardSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E5EA',
        borderRadius: 10,
        padding: '28px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: '#EEF0F4', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={skeletonBlock(100, 14)} />
            <div style={skeletonBlock(44, 14, { borderRadius: 6 })} />
          </div>
          <div style={skeletonBlock(160, 10)} />
          <div style={skeletonBlock('90%', 10)} />
        </div>
      </div>

      {/* Content previews */}
      <div style={{ borderTop: '1px solid #E2E5EA', paddingTop: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={skeletonBlock(40, 14, { borderRadius: 6, flexShrink: 0 })} />
            <div style={skeletonBlock('80%', 10)} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid #E2E5EA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F7F8FA',
          margin: '0 -28px -28px',
          padding: '14px 28px',
          borderRadius: '0 0 10px 10px',
        }}
      >
        <div style={skeletonBlock(70, 10)} />
        <div style={skeletonBlock(50, 12)} />
      </div>
    </div>
  )
}
