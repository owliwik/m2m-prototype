'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Tag from '../../components/Tag'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import { formatDate, formatViews } from '@/app/lib/utils'
import type { Database } from '@/app/lib/database.types'

type SchoolRow = Database['public']['Tables']['schools']['Row'] & {
  // TODO: regenerate app/lib/database.types.ts — DB has `short_name` but types are stale
  short_name: string
}
type UserRow = Database['public']['Tables']['users']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']
type CommentRow = Database['public']['Tables']['comments']['Row']

type CommentWithAuthor = CommentRow & { author: UserRow }
type PostWithRels = PostRow & {
  author: UserRow
  school: SchoolRow
  questioner: UserRow | null
  comments: CommentWithAuthor[]
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

function typeColor(contentType: string | null) {
  if (!contentType) return DEFAULT_TYPE_COLOR
  return contentTypeColors[contentType] ?? DEFAULT_TYPE_COLOR
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - then) / 86_400_000))
}

/* ─── Main page ─── */

export default function PostPage() {
  const { ready: authReady } = useRequireAuth()
  const params = useParams()
  const postId = params.id as string | undefined

  const [post, setPost] = useState<PostWithRels | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    if (!authReady) return
    if (!postId) return
    const id = postId
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      const res = await supabase
        .from('posts')
        .select(
          `*,
           author:users!posts_author_id_fkey(*),
           school:schools(*),
           questioner:users!posts_questioner_id_fkey(*),
           comments(*, author:users!comments_author_id_fkey(*))`,
        )
        .eq('id', id)
        .maybeSingle()
      if (cancelled) return
      if (res.error) {
        setError(res.error.message)
        setLoading(false)
        return
      }
      setPost((res.data as unknown as PostWithRels | null) ?? null)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [postId, retryKey, authReady])

  if (loading) return <PostPageSkeleton />

  if (error) {
    return (
      <PageShell>
        <BackLink />
        <div
          style={{
            marginTop: 40,
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
      </PageShell>
    )
  }

  if (!post) {
    return (
      <PageShell>
        <BackLink />
        <div style={{ textAlign: 'center', padding: '80px 0 40px' }}>
          <h1 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 24, fontWeight: 700, color: '#0D0D0D', marginBottom: 12 }}>
            找不到这篇内容
          </h1>
          <p style={{ fontSize: 14, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            这篇内容可能已被删除、链接有误，或仅限相关用户可见
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <BackLink />
      {post.kind === 'article' && <ArticleView post={post} />}
      {post.kind === 'note' && <NoteView post={post} />}
      {post.kind === 'qa' && <QAView post={post} />}
      <CommentsSection post={post} />
      <BottomFooter />
    </PageShell>
  )
}

/* ─── Shared ─── */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px' }}>
        {children}
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <div style={{ marginBottom: 40 }}>
      <Link
        href="/feed"
        style={{
          fontSize: 14,
          color: '#A83131',
          textDecoration: 'none',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          letterSpacing: '0.01em',
          transition: 'color 150ms',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
        onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
      >
        ← 返回内容
      </Link>
    </div>
  )
}

function BottomFooter() {
  return (
    <>
      <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginTop: 56, marginBottom: 32 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          更多内容
        </span>
        <Link
          href="/feed"
          style={{
            fontSize: 14,
            color: '#A83131',
            textDecoration: 'none',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            fontWeight: 500,
            letterSpacing: '0.01em',
            transition: 'color 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
          onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
        >
          ← 返回内容列表
        </Link>
      </div>
    </>
  )
}

function TopTags({ post }: { post: PostWithRels }) {
  const sc = schoolColor(post.school)
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      <Tag label={post.school.short_name} color={sc} href={`/schools/${post.school.id.toLowerCase()}`} />
      {post.content_type && <Tag label={post.content_type} color={typeColor(post.content_type)} />}
    </div>
  )
}

function AuthorRow({ post }: { post: PostWithRels }) {
  const sc = schoolColor(post.school)
  const daysAgo = daysSince(post.created_at)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: sc.bg,
          color: sc.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 700,
          fontFamily: 'var(--font-noto-sans), sans-serif',
          flexShrink: 0,
        }}
      >
        {post.author.name[0]}
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {post.author.name}
          </span>
          <Tag label={post.school.short_name} color={sc} href={`/schools/${post.school.id.toLowerCase()}`} />
        </div>
        <div style={{ fontSize: 13, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {formatDate(daysAgo)} · {formatViews(post.views)}次浏览
        </div>
      </div>
    </div>
  )
}

function BodyParagraphs({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
  return (
    <div style={{ fontFamily: 'var(--font-noto-sans), sans-serif', fontSize: 17, lineHeight: 1.85, color: '#0D0D0D' }}>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ marginBottom: '1.5em', whiteSpace: 'pre-wrap' }}>
          {p}
        </p>
      ))}
    </div>
  )
}

/* ─── Views per kind ─── */

function ArticleView({ post }: { post: PostWithRels }) {
  return (
    <>
      <TopTags post={post} />
      <h1
        style={{
          fontFamily: 'var(--font-noto-serif), serif',
          fontSize: 38,
          fontWeight: 700,
          lineHeight: 1.25,
          color: '#0D0D0D',
          marginBottom: 20,
          letterSpacing: '-0.01em',
        }}
      >
        {post.title ?? '无标题'}
      </h1>
      {post.summary && (
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: '#4A4F5A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            marginBottom: 28,
          }}
        >
          {post.summary}
        </p>
      )}
      <AuthorRow post={post} />
      <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginBottom: 40 }} />
      {post.body && <BodyParagraphs text={post.body} />}
    </>
  )
}

function NoteView({ post }: { post: PostWithRels }) {
  return (
    <>
      <TopTags post={post} />
      <AuthorRow post={post} />
      <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginBottom: 40 }} />
      {post.body && <BodyParagraphs text={post.body} />}
    </>
  )
}

function QAView({ post }: { post: PostWithRels }) {
  const sc = schoolColor(post.school)
  const daysAgo = daysSince(post.created_at)
  const questionerName = post.is_anonymous ? '匿名同学' : (post.questioner?.name ?? '匿名同学')

  return (
    <>
      <TopTags post={post} />

      {/* Question block */}
      <div
        style={{
          backgroundColor: '#F7F8FA',
          border: '1px solid #ECEEF2',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            marginBottom: 10,
            letterSpacing: '0.02em',
          }}
        >
          {questionerName} 提问 · {formatDate(daysAgo)}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#0D0D0D',
            letterSpacing: '-0.005em',
          }}
        >
          {post.question ?? ''}
        </h1>
      </div>

      {/* Answer block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: sc.bg,
            color: sc.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            flexShrink: 0,
          }}
        >
          {post.author.name[0]}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {post.author.name} 回答
            </span>
            <Tag label={post.school.short_name} color={sc} href={`/schools/${post.school.id.toLowerCase()}`} />
          </div>
          <div style={{ fontSize: 13, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {formatViews(post.views)}次浏览
          </div>
        </div>
      </div>
      {post.answer && <BodyParagraphs text={post.answer} />}
    </>
  )
}

/* ─── Comments ─── */

function CommentsSection({ post }: { post: PostWithRels }) {
  const comments = [...post.comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return (
    <div style={{ marginTop: 56 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#0D0D0D',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: '1px solid #E2E5EA',
        }}
      >
        讨论 ({comments.length})
      </div>
      {comments.length === 0 ? (
        <div style={{ fontSize: 13, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', padding: '12px 0' }}>
          暂无讨论
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment, post }: { comment: CommentWithAuthor; post: PostWithRels }) {
  const isFromAuthor = comment.author_id === post.author_id
  const sc = schoolColor(post.school)
  const avatarBg = isFromAuthor ? sc.bg : '#EEF0F4'
  const avatarFg = isFromAuthor ? sc.fg : '#4A4F5A'
  const daysAgo = daysSince(comment.created_at)
  const isReply = comment.parent_id !== null

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingLeft: isReply ? 40 : 0 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: avatarBg,
          color: avatarFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'var(--font-noto-sans), sans-serif',
          flexShrink: 0,
        }}
      >
        {comment.author.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {comment.author.name}
          </span>
          {isFromAuthor && (
            <Tag label="作者" color={sc} />
          )}
          <span style={{ fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {formatDate(daysAgo)}
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: '#4A4F5A',
            fontFamily: 'var(--font-noto-sans), sans-serif',
            whiteSpace: 'pre-wrap',
          }}
        >
          {comment.body}
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

function PostPageSkeleton() {
  return (
    <PageShell>
      <div className="animate-pulse">
        <div style={skeletonBlock(80, 14, { marginBottom: 40 })} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div style={skeletonBlock(44, 18, { borderRadius: 6 })} />
          <div style={skeletonBlock(64, 18, { borderRadius: 6 })} />
        </div>
        <div style={skeletonBlock('85%', 32, { marginBottom: 16 })} />
        <div style={skeletonBlock('60%', 32, { marginBottom: 28 })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#EEF0F4', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={skeletonBlock(120, 12)} />
            <div style={skeletonBlock(160, 10)} />
          </div>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginBottom: 40 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={skeletonBlock(i === 4 ? '40%' : '100%', 14)} />
          ))}
        </div>
      </div>
    </PageShell>
  )
}
