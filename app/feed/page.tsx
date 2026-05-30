'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import PageHeader from '../components/PageHeader'
import { ArticleCard, EssayCard, QACard } from '../components/PostCards'
import { SidebarCard, ContentTypeFilter } from '../components/Sidebar'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import type { Database } from '@/app/lib/database.types'
import type {
  FeedPost,
  EssayPost,
  QAPost,
  SchoolKey,
  ContentType,
} from '../data'

const sidebarTypes: ContentType[] = ['申请文书', '校园生活', '学术', '选校建议', '随笔', '公开问答']

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

type SchoolRow = Database['public']['Tables']['schools']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

type PostWithRels = PostRow & {
  author: Pick<UserRow, 'id' | 'name'>
  school: SchoolRow
}

type SchoolWithAmbassadors = SchoolRow & {
  ambassadors: Array<{ id: string; user: { id: string; name: string } }>
}

function schoolColor(school: Pick<SchoolRow, 'color_bg' | 'color_fg'>) {
  return {
    bg: school.color_bg ?? '#EEF0F4',
    fg: school.color_fg ?? '#4A4F5A',
  }
}

// DB schools use lowercase ids; mock SchoolKey uses mixed case (CMU, Duke, NYU, …).
// PostCards still reads schoolColors[post.school] from the mock map, so we must map back.
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

/* ─── Adapters: DB row → mock-shape expected by PostCards ─── */

function toArticleShape(p: PostWithRels): FeedPost {
  return {
    kind: 'article',
    id: p.id,
    title: p.title ?? '',
    summary: p.summary ?? '',
    school: toSchoolKey(p.school.id),
    contentType: (p.content_type ?? '文章') as ContentType,
    authorName: p.author.name,
    views: p.views,
    daysAgo: daysSince(p.created_at),
    pinned: p.pinned,
  }
}

function toEssayShape(p: PostWithRels): EssayPost {
  return {
    kind: 'essay',
    id: p.id,
    school: toSchoolKey(p.school.id),
    contentType: '随笔',
    authorName: p.author.name,
    authorYear: '',
    daysAgo: daysSince(p.created_at),
    views: p.views,
    body: p.body ?? '',
    comments: [],
  }
}

function toQAShape(p: PostWithRels): QAPost {
  return {
    kind: 'qa',
    id: p.id,
    school: toSchoolKey(p.school.id),
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

/* ─── School community module ─── */

function SchoolCommunityModule({
  schools,
  postCounts,
}: {
  schools: SchoolWithAmbassadors[]
  postCounts: Record<string, number>
}) {
  const topSchools = [...schools]
    .sort((a, b) => (postCounts[b.id] ?? 0) - (postCounts[a.id] ?? 0))
    .slice(0, 4)

  return (
    <div style={{ border: '1px solid #ECEEF2', borderRadius: 10, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #ECEEF2' }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          学校社区
        </div>
      </div>

      {/* School items */}
      {topSchools.map((school, i) => {
        const colors = schoolColor(school)
        const allAmbs = school.ambassadors
        const visibleAmbs = allAmbs.slice(0, 2)
        const overflowCount = allAmbs.length - visibleAmbs.length
        return (
          <Link
            key={school.id}
            href={`/schools/${school.id.toLowerCase()}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderBottom: i < topSchools.length - 1 ? '1px solid #ECEEF2' : 'none',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background-color 150ms',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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

            {/* Name + count */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 1 }}>
                {school.name_zh}
              </div>
              <div style={{ fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {postCounts[school.id] ?? 0} 篇内容
              </div>
            </div>

            {/* Ambassador avatars stacked */}
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
      })}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ECEEF2' }}>
        <Link
          href="/ambassadors"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '10px 14px',
            fontSize: 12,
            color: '#8A8F9A',
            textDecoration: 'none',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            transition: 'color 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8A8F9A')}
        >
          查看全部学校 →
        </Link>
      </div>
    </div>
  )
}

/* ─── Main page ─── */

export default function FeedPage() {
  const { ready: authReady } = useRequireAuth()
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)
  const [posts, setPosts] = useState<PostWithRels[]>([])
  const [schools, setSchools] = useState<SchoolWithAmbassadors[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const [postsRes, schoolsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, author:users!posts_author_id_fkey(*), school:schools(*)')
          .eq('visibility', 'public')
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('schools')
          .select('*, ambassadors(id, user:users(id, name))'),
      ])
      if (cancelled) return
      if (postsRes.error || schoolsRes.error) {
        setError(postsRes.error?.message ?? schoolsRes.error?.message ?? '加载失败')
        setLoading(false)
        return
      }
      setPosts((postsRes.data as unknown as PostWithRels[] | null) ?? [])
      setSchools((schoolsRes.data as unknown as SchoolWithAmbassadors[] | null) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [retryKey, authReady])

  // Filter + counts
  const filtered = posts.filter(p => {
    if (selectedType && p.content_type !== selectedType) return false
    return true
  })

  const totalCount = posts.length
  const postCountsBySchool: Record<string, number> = {}
  for (const p of posts) {
    postCountsBySchool[p.school.id] = (postCountsBySchool[p.school.id] ?? 0) + 1
  }
  const typeCounts = Object.fromEntries(
    sidebarTypes.map(t => [t, posts.filter(p => p.content_type === t).length]),
  ) as Record<ContentType, number>

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>

      <PageHeader
        eyebrow="M2M 内容库"
        title="四中校友留下的，四中在校生来看的"
        actions={
          <>
            <Link
              href="/ambassadors"
              style={{ border: '1px solid #A83131', color: '#A83131', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em', transition: 'background-color 150ms, color 150ms', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A83131'; e.currentTarget.style.color = '#FFFFFF' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A83131' }}
            >
              浏览大使
            </Link>
            <Link
              href="/ask"
              style={{ backgroundColor: '#1F4388', color: '#FFFFFF', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.02em', transition: 'background-color 150ms', display: 'inline-block' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
            >
              联系大使
            </Link>
          </>
        }
      />

      {/* Content + Sidebar */}
      <div
        style={{ maxWidth: 1080, margin: '0 auto', padding: '0 48px 80px', display: 'flex', gap: 32, alignItems: 'flex-start' }}
      >
        {/* Left: card grid */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 32 }}>
          {error && (
            <div
              style={{
                marginBottom: 20,
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

          {loading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', fontSize: 14 }}>
              没有符合条件的内容
            </div>
          ) : (
            <div>
              {filtered.map(p => {
                if (p.kind === 'note') return <EssayCard key={p.id} item={toEssayShape(p)} />
                if (p.kind === 'qa') return <QACard key={p.id} item={toQAShape(p)} />
                return <ArticleCard key={p.id} post={toArticleShape(p)} />
              })}
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div style={{ width: 260, flexShrink: 0, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 32 }}>

          {/* Search */}
          <SidebarCard>
            <input
              type="text"
              placeholder="搜索内容..."
              style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E2E5EA', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-noto-sans), sans-serif', color: '#0D0D0D', outline: 'none', boxSizing: 'border-box' }}
            />
          </SidebarCard>

          {/* School community */}
          {loading ? (
            <SchoolCommunitySkeleton />
          ) : (
            <SchoolCommunityModule schools={schools} postCounts={postCountsBySchool} />
          )}

          {/* Content type filter */}
          <ContentTypeFilter
            types={sidebarTypes}
            counts={typeCounts}
            selected={selectedType}
            onSelect={setSelectedType}
            totalCount={totalCount}
            variant="crimson"
          />

        </div>
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
            <div style={skeletonBlock(44, 14, { borderRadius: 6 })} />
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

function SchoolCommunitySkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{ border: '1px solid #ECEEF2', borderRadius: 10, overflow: 'hidden' }}
    >
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #ECEEF2' }}>
        <div style={skeletonBlock(64, 10)} />
      </div>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderBottom: i < 3 ? '1px solid #ECEEF2' : 'none',
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
      ))}
    </div>
  )
}
