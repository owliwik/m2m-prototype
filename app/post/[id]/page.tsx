'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  allFeedItems,
  schoolColors,
  contentTypeColors,
  type SchoolKey,
  type ContentType,
  type EssayPost,
  type QAPost,
  type Comment,
} from '../../data'

function formatDate(daysAgo: number): string {
  if (daysAgo === 0) return '今天'
  if (daysAgo < 7) return `${daysAgo}天前`
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}周前`
  return `${Math.floor(daysAgo / 30)}个月前`
}

function SchoolTag({ school }: { school: SchoolKey }) {
  const c = schoolColors[school]
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.fg,
        padding: '2px 9px',
        borderRadius: 6,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-noto-sans), sans-serif',
      }}
    >
      {school}
    </span>
  )
}

function TypeTag({ contentType }: { contentType: ContentType }) {
  const c = contentTypeColors[contentType]
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.fg,
        padding: '2px 9px',
        borderRadius: 6,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-noto-sans), sans-serif',
      }}
    >
      {contentType}
    </span>
  )
}

function CommentItem({ comment }: { comment: Comment }) {
  const isAmbassador = comment.isAmbassador && comment.ambassadorSchool
  const sc = isAmbassador ? schoolColors[comment.ambassadorSchool!] : null
  const avatarBg = sc ? sc.bg : '#EEF0F4'
  const avatarFg = sc ? sc.fg : '#4A4F5A'

  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 18, alignItems: 'flex-start' }}>
      {isAmbassador && (
        <div
          style={{
            width: 3,
            backgroundColor: sc!.fg,
            borderRadius: 2,
            flexShrink: 0,
            marginRight: 10,
            alignSelf: 'stretch',
            minHeight: 28,
          }}
        />
      )}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: avatarBg,
          color: avatarFg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          marginRight: 10,
          fontFamily: 'var(--font-noto-sans), sans-serif',
        }}
      >
        {comment.authorName[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {comment.authorName}
          </span>
          {isAmbassador && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                backgroundColor: sc!.bg,
                color: sc!.fg,
                padding: '1px 5px',
                borderRadius: 4,
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-noto-sans), sans-serif',
              }}
            >
              大使
            </span>
          )}
          <span style={{ fontSize: 11, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            · {comment.authorYear} · {formatDate(comment.daysAgo)}
          </span>
        </div>
        <div style={{ fontSize: 14, color: '#0D0D0D', lineHeight: 1.65, marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {comment.content}
        </div>
        <button
          style={{ fontSize: 12, color: '#B0B5C0', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-noto-sans), sans-serif', transition: 'color 150ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#8A8F9A')}
          onMouseLeave={e => (e.currentTarget.style.color = '#B0B5C0')}
        >
          回复
        </button>
      </div>
    </div>
  )
}

function CommentFooter({ comments, hintText }: { comments: Comment[]; hintText: string }) {
  const [value, setValue] = useState('')
  return (
    <div style={{ marginTop: 40 }}>
      <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginBottom: 28 }} />
      <div style={{ fontSize: 13, fontWeight: 500, color: '#4A4F5A', marginBottom: 18, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
        {comments.length} 条追问
      </div>
      {comments.map(c => <CommentItem key={c.id} comment={c} />)}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 12, color: '#8A8F9A', marginBottom: 10, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {hintText}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            rows={3}
            placeholder="用学校邮箱登录后可以追问"
            style={{
              flex: 1,
              borderRadius: 8,
              border: '1px solid #E2E5EA',
              backgroundColor: '#F7F8FA',
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              resize: 'none',
              color: '#0D0D0D',
              outline: 'none',
              lineHeight: 1.55,
            }}
          />
          <button
            onClick={() => setValue('')}
            style={{
              backgroundColor: '#1F4388',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '0 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              height: 40,
              flexShrink: 0,
              transition: 'background-color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Essay detail ─── */

function EssayDetail({ item }: { item: EssayPost }) {
  const schoolColor = schoolColors[item.school]
  const paragraphs = item.body.split('\n\n')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 80px' }}>
      <div style={{ marginBottom: 40 }}>
        <Link
          href="/feed"
          style={{ fontSize: 14, color: '#8A8F9A', textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif', transition: 'color 150ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8A8F9A')}
        >
          ← 返回内容
        </Link>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <SchoolTag school={item.school} />
        <TypeTag contentType={item.contentType} />
      </div>

      {/* Author block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: schoolColor.bg,
            color: schoolColor.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {item.authorName[0]}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 2 }}>
            {item.authorName}
          </div>
          <div style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.authorYear} · {formatDate(item.daysAgo)}
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginBottom: 32 }} />

      {/* Body */}
      <div style={{ fontSize: 16, lineHeight: 1.85, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: 0, marginBottom: i < paragraphs.length - 1 ? '1.5em' : 0 }}>
            {para}
          </p>
        ))}
      </div>

      <CommentFooter comments={item.comments} hintText="有想追问的？直接写下来" />
    </div>
  )
}

/* ─── QA detail ─── */

function QADetail({ item }: { item: QAPost }) {
  const schoolColor = schoolColors[item.school]
  const paragraphs = item.answer.split('\n\n')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px 80px' }}>
      <div style={{ marginBottom: 40 }}>
        <Link
          href="/feed"
          style={{ fontSize: 14, color: '#8A8F9A', textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif', transition: 'color 150ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8A8F9A')}
        >
          ← 返回内容
        </Link>
      </div>

      {/* Question area — gray box */}
      <div
        style={{
          backgroundColor: '#F7F8FA',
          border: '1px solid #E2E5EA',
          borderRadius: 10,
          padding: '20px 22px',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8A8F9A',
            marginBottom: 10,
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          同学提问 · 已公开
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 500,
            lineHeight: 1.55,
            color: '#0D0D0D',
            marginBottom: 12,
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {item.question}
        </div>
        <div style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          匿名同学 · {item.questionYear} · {formatDate(item.questionDaysAgo)}
        </div>
      </div>

      {/* Answerer info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: schoolColor.bg,
            color: schoolColor.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          {item.answerAuthorName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {item.answerAuthorName}
            </span>
            <SchoolTag school={item.school} />
          </div>
          <div style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.answerAuthorYear} · {formatDate(item.daysAgo)}
          </div>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #E2E5EA', marginBottom: 28 }} />

      {/* Answer body */}
      <div style={{ fontSize: 16, lineHeight: 1.85, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: 0, marginBottom: i < paragraphs.length - 1 ? '1.5em' : 0 }}>
            {para}
          </p>
        ))}
      </div>

      <CommentFooter comments={item.comments} hintText="还有想问的？" />
    </div>
  )
}

/* ─── Page entry ─── */

export default function PostPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const item = id ? allFeedItems.find(i => i.id === id) : undefined

  // Redirect article posts to the existing /feed/[id] detail page
  useEffect(() => {
    if (item?.kind === 'article') {
      router.replace(`/feed/${item.id}`)
    }
  }, [item, router])

  if (!item) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8A8F9A',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          fontSize: 14,
        }}
      >
        找不到该内容
      </div>
    )
  }

  if (item.kind === 'article') return null // redirecting

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {item.kind === 'essay' ? (
        <EssayDetail item={item} />
      ) : (
        <QADetail item={item} />
      )}
    </div>
  )
}
