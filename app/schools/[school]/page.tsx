'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArticleCard, EssayCard, QACard } from '../../components/PostCards'
import { ContentTypeFilter } from '../../components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import type { Database } from '@/app/lib/database.types'
import type {
  FeedPost,
  EssayPost,
  QAPost,
  SchoolKey,
  ContentType,
} from '../../data'

type SchoolRow = Database['public']['Tables']['schools']['Row'] & {
  // TODO: regenerate app/lib/database.types.ts — DB has `short_name` but types are stale
  short_name: string
}
type UserRow = Database['public']['Tables']['users']['Row']
type AmbassadorRow = Database['public']['Tables']['ambassadors']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']

type AmbassadorWithUser = AmbassadorRow & { user: UserRow }
type PostWithAuthor = PostRow & { author: UserRow }

// PostCards still reads the mock schoolColors map; map DB id → mock SchoolKey.
const schoolIdToKey: Record<string, SchoolKey> = {
  cmu: 'CMU',
  duke: 'Duke',
  penn: 'Penn',
  cornell: 'Cornell',
  nyu: 'NYU',
  columbia: 'Columbia',
}

function toSchoolKey(id: string): SchoolKey {
  return schoolIdToKey[id.toLowerCase()] ?? ('CMU' as SchoolKey)
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - then) / 86_400_000))
}

function toArticleShape(p: PostWithAuthor, key: SchoolKey): FeedPost {
  return {
    kind: 'article',
    id: p.id,
    title: p.title ?? '',
    summary: p.summary ?? '',
    school: key,
    contentType: (p.content_type ?? '文章') as ContentType,
    authorName: p.author.name,
    views: p.views,
    daysAgo: daysSince(p.created_at),
    pinned: p.pinned,
  }
}

function toEssayShape(p: PostWithAuthor, key: SchoolKey): EssayPost {
  return {
    kind: 'essay',
    id: p.id,
    school: key,
    contentType: '随笔',
    authorName: p.author.name,
    authorYear: '',
    daysAgo: daysSince(p.created_at),
    views: p.views,
    body: p.body ?? '',
    comments: [],
  }
}

function toQAShape(p: PostWithAuthor, key: SchoolKey): QAPost {
  return {
    kind: 'qa',
    id: p.id,
    school: key,
    contentType: '公开问答',
    daysAgo: daysSince(p.created_at),
    views: p.views,
    question: p.question ?? '',
    questionYear: '',
    questionDaysAgo: 0,
    answerAuthorName: p.author.name,
    answerAuthorYear: '',
    answer: p.answer ?? '',
    comments: [],
  }
}

/* ─── Main page ─── */

export default function SchoolPage() {
  const { ready: authReady } = useRequireAuth()
  const params = useParams()
  const schoolSlug = ((params.school as string | undefined) ?? '').toLowerCase()

  const [selectedType, setSelectedType] = useState<ContentType | null>(null)
  const [school, setSchool] = useState<SchoolRow | null>(null)
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithUser[]>([])
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!authReady) return
    if (!schoolSlug) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const [schoolRes, ambsRes, postsRes] = await Promise.all([
        supabase.from('schools').select('*').eq('id', schoolSlug).maybeSingle(),
        supabase
          .from('ambassadors')
          .select('*, user:users!ambassadors_id_fkey(*)')
          .eq('school_id', schoolSlug),
        supabase
          .from('posts')
          .select('*, author:users!posts_author_id_fkey(*)')
          .eq('school_id', schoolSlug)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false }),
      ])
      if (cancelled) return
      if (schoolRes.error || ambsRes.error || postsRes.error) {
        setError(
          schoolRes.error?.message ??
            ambsRes.error?.message ??
            postsRes.error?.message ??
            '加载失败',
        )
        setLoading(false)
        return
      }
      setSchool((schoolRes.data as unknown as SchoolRow | null) ?? null)
      setAmbassadors((ambsRes.data as unknown as AmbassadorWithUser[] | null) ?? [])
      setPosts((postsRes.data as unknown as PostWithAuthor[] | null) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [schoolSlug, retryKey, authReady])

  if (loading) return <SchoolPageSkeleton />

  if (error) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 48px' }}>
          <div
            style={{
              padding: '24px 28px',
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
              <div style={{ fontSize: 15, fontWeight: 600, color: '#7A2020', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 6 }}>
                加载失败
              </div>
              <div style={{ fontSize: 12, color: '#8C3A3A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                {error}
              </div>
            </div>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              style={{
                padding: '8px 20px',
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
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '120px 48px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 24, fontWeight: 700, color: '#0D0D0D', marginBottom: 12 }}>
            找不到这所学校
          </h1>
          <p style={{ fontSize: 14, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 24 }}>
            我们还没有 &ldquo;{schoolSlug}&rdquo; 的校友社区
          </p>
          <Link
            href="/ambassadors"
            style={{ fontSize: 13, color: '#1F4388', textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif' }}
          >
            浏览所有大使 →
          </Link>
        </div>
      </div>
    )
  }

  const bannerBg = school.color_fg ?? '#1F4388'
  const avatarBg = school.color_bg ?? '#EEF0F4'
  const avatarFg = school.color_fg ?? '#4A4F5A'
  const schoolKey = toSchoolKey(school.id)

  const filtered = selectedType
    ? posts.filter(p => p.content_type === selectedType)
    : posts

  // Derive available content types from fetched posts
  const availableTypes = Array.from(
    new Set(posts.map(p => p.content_type).filter((t): t is string => !!t)),
  ) as ContentType[]
  const typeCounts = Object.fromEntries(
    availableTypes.map(t => [t, posts.filter(p => p.content_type === t).length]),
  ) as Record<ContentType, number>

  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>

      {/* ═══ Banner ═══ */}
      <div style={{ backgroundColor: bannerBg }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 48px 0' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <Link
              href="/feed"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif', transition: 'color 150ms' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              内容库
            </Link>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {school.short_name}
            </span>
          </div>

          {/* Main header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* School icon */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
                fontFamily: 'var(--font-noto-serif), serif',
                flexShrink: 0,
              }}>
                {school.name_zh[0]}
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 26, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: 3 }}>
                  {school.name_zh}
                </h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-noto-sans), sans-serif', letterSpacing: '0.02em' }}>
                  {school.name_en}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, paddingTop: 8 }}>
              <button
                style={{
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#FFFFFF',
                  backgroundColor: 'transparent',
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  transition: 'background-color 150ms, border-color 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
              >
                + 订阅
              </button>
              <Link
                href={`/ask?school=${school.id}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: bannerBg,
                  padding: '7px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  letterSpacing: '0.02em',
                  transition: 'opacity 150ms',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                直接提问
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', marginTop: 28, borderTop: '1px solid rgba(255,255,255,0.12)', padding: '16px 0' }}>
            {[
              { value: ambassadors.length, label: '位在校大使' },
              { value: posts.length, label: '篇内容' },
              { value: totalViews, label: '次阅读' },
            ].map((stat, i, arr) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.12)' : 'none',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-noto-serif), serif', letterSpacing: '-0.02em' }}>
                  {stat.value >= 1000 ? (stat.value / 1000).toFixed(1) + 'k' : stat.value}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-noto-sans), sans-serif', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Page body ═══ */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 48px 80px' }}>

        {/* Ambassador section */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 16 }}>
            在校大使
          </div>
          {ambassadors.length === 0 ? (
            <div style={{ fontSize: 13, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              暂无大使
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', alignItems: 'stretch' }}>
              {ambassadors.slice(0, 3).map(amb => (
                <div
                  key={amb.id}
                  style={{
                    width: 280,
                    flexShrink: 0,
                    border: '1px solid #ECEEF2',
                    borderRadius: 12,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'border-color 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#ECEEF2')}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    backgroundColor: avatarBg, color: avatarFg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-noto-sans), sans-serif',
                    marginBottom: 14,
                  }}>
                    {amb.user.name[0]}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 3 }}>
                    {amb.user.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 10 }}>
                    {amb.dept ?? ''}
                    {amb.grad_year != null && ` · ${amb.grad_year}届`}
                  </div>
                  <div style={{ fontSize: 12, color: '#4A4F5A', lineHeight: 1.6, fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 18 }}>
                    {amb.bio ?? ''}
                  </div>
                  <Link
                    href={`/ask?ambassador=${amb.id}`}
                    style={{
                      marginTop: 'auto',
                      display: 'inline-block',
                      padding: '6px 16px',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#4A4F5A',
                      border: '1px solid #E2E5EA',
                      borderRadius: 8,
                      backgroundColor: 'transparent',
                      textDecoration: 'none',
                      letterSpacing: '0.02em',
                      fontFamily: 'var(--font-noto-sans), sans-serif',
                      transition: 'border-color 150ms, background-color 150ms, color 150ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#C8CDD6'
                      e.currentTarget.style.backgroundColor = '#F7F8FA'
                      e.currentTarget.style.color = '#0D0D0D'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E2E5EA'
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#4A4F5A'
                    }}
                  >
                    联系这位大使
                  </Link>
                </div>
              ))}
            </div>
          )}
          {ambassadors.length > 3 && (
            <div style={{ marginTop: 12 }}>
              <Link
                href="/ambassadors"
                style={{ fontSize: 12, color: '#8A8F9A', textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif', transition: 'color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8F9A')}
              >
                查看全部大使 →
              </Link>
            </div>
          )}
        </div>

        {/* Content section */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Left: content cards */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 16 }}>
              全部内容
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', fontSize: 14 }}>
                没有符合条件的内容
              </div>
            ) : (
              <div>
                {filtered.map(p => {
                  if (p.kind === 'note') return <EssayCard key={p.id} item={toEssayShape(p, schoolKey)} showSchoolTag={false} />
                  if (p.kind === 'qa') return <QACard key={p.id} item={toQAShape(p, schoolKey)} showSchoolTag={false} />
                  return <ArticleCard key={p.id} post={toArticleShape(p, schoolKey)} showSchoolTag={false} />
                })}
              </div>
            )}
          </div>

          {/* Right: filter sidebar */}
          <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 24 }}>
            <div aria-hidden style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 16, visibility: 'hidden', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              &nbsp;
            </div>
            {availableTypes.length > 0 && (
              <ContentTypeFilter
                types={availableTypes}
                counts={typeCounts}
                selected={selectedType}
                onSelect={setSelectedType}
                totalCount={posts.length}
                variant="crimson"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton ─── */

const skeletonBlock = (w: number | string, h: number, extra: CSSProperties = {}): CSSProperties => ({
  width: w,
  height: h,
  backgroundColor: '#EEF0F4',
  borderRadius: 4,
  ...extra,
})

function SchoolPageSkeleton() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Banner */}
      <div style={{ backgroundColor: '#2D3644' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '36px 48px 0' }} className="animate-pulse">
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            <div style={{ width: 40, height: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
            <div style={{ width: 50, height: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 180, height: 22, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
              <div style={{ width: 220, height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.12)', padding: '16px 0' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, borderRight: i < 2 ? '1px solid rgba(255,255,255,0.12)' : 'none' }}>
                <div style={{ width: 36, height: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
                <div style={{ width: 60, height: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '28px 48px 80px' }}>
        {/* Ambassadors */}
        <div style={{ marginBottom: 40 }}>
          <div style={skeletonBlock(72, 14, { marginBottom: 16 })} />
          <div style={{ display: 'flex', gap: 12 }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  width: 280,
                  flexShrink: 0,
                  border: '1px solid #ECEEF2',
                  borderRadius: 12,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#EEF0F4', marginBottom: 4 }} />
                <div style={skeletonBlock(88, 14)} />
                <div style={skeletonBlock(120, 10)} />
                <div style={skeletonBlock('90%', 10)} />
                <div style={skeletonBlock('75%', 10)} />
                <div style={skeletonBlock(110, 26, { borderRadius: 8, marginTop: 10 })} />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={skeletonBlock(72, 14, { marginBottom: 16 })} />
            {[0, 1, 2].map(i => <PostCardSkeleton key={i} />)}
          </div>
          <div style={{ width: 220, flexShrink: 0 }}>
            <div aria-hidden style={{ height: 30, marginBottom: 16 }} />
            <div
              className="animate-pulse"
              style={{ border: '1px solid #ECEEF2', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <div style={skeletonBlock(56, 10, { marginBottom: 4 })} />
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={skeletonBlock(70, 10)} />
                  <div style={skeletonBlock(18, 10)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostCardSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECEEF2',
        borderRadius: 10,
        padding: '18px 20px',
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#EEF0F4', flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={skeletonBlock(56, 14, { borderRadius: 6 })} />
          </div>
          <div style={skeletonBlock('80%', 14)} />
          <div style={skeletonBlock('95%', 10)} />
          <div style={skeletonBlock('70%', 10)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={skeletonBlock(120, 10)} />
            <div style={skeletonBlock(40, 10)} />
          </div>
        </div>
      </div>
    </div>
  )
}
