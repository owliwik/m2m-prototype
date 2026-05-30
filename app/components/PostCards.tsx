'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import Tag from './Tag'
import {
  schoolColors,
  contentTypeColors,
  type FeedPost,
  type EssayPost,
  type QAPost,
} from '../data'
import { formatDate, formatViews } from '../lib/utils'

type CardCommon = { showSchoolTag?: boolean }

export function ArticleCard({ post, showSchoolTag = true }: { post: FeedPost } & CardCommon) {
  const schoolColor = schoolColors[post.school]

  return (
    <div
      className="relative"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 10, padding: '18px 20px', transition: 'border-color 150ms', marginBottom: 12 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: schoolColor.bg, color: schoolColor.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0, marginTop: 4, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {post.authorName[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 7, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {showSchoolTag && (
              <Tag
                label={post.school}
                color={schoolColor}
                href={`/schools/${post.school.toLowerCase()}`}
                className="relative z-10"
              />
            )}
            <Tag label={post.contentType} color={contentTypeColors[post.contentType]} />
            {post.pinned && (
              <span style={{ fontSize: 10, letterSpacing: '0.08em', color: '#A83131', fontFamily: 'var(--font-noto-sans), sans-serif', backgroundColor: '#FAEAEA', padding: '2px 7px', borderRadius: 6, border: '1px solid #F0C8C8' }}>
                置顶
              </span>
            )}
          </div>
          <Link
            href={`/feed/${post.id}`}
            className="after:absolute after:inset-0"
            style={{ display: 'block', fontSize: 16, fontWeight: 500, color: '#0D0D0D', lineHeight: 1.4, marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif', textDecoration: 'none' }}
          >
            {post.title}
          </Link>
          <div style={{ fontSize: 13, color: '#4A4F5A', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box' as CSSProperties['display'], WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as CSSProperties['WebkitBoxOrient'], overflow: 'hidden', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {post.summary}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {post.authorName} · {formatDate(post.daysAgo)}
            </span>
            <span style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {formatViews(post.views)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EssayCard({ item, showSchoolTag = true }: { item: EssayPost } & CardCommon) {
  const schoolColor = schoolColors[item.school]

  return (
    <div
      className="relative"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 10, padding: '16px 18px', transition: 'border-color 150ms', marginBottom: 12 }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2' }}
    >
      <div style={{ display: 'flex', gap: 7, marginBottom: 9 }}>
        {showSchoolTag && (
          <Tag
            label={item.school}
            color={schoolColor}
            href={`/schools/${item.school.toLowerCase()}`}
            className="relative z-10"
          />
        )}
        <Tag label={item.contentType} color={contentTypeColors[item.contentType]} />
      </div>
      <Link
        href={`/feed/${item.id}`}
        className="after:absolute after:inset-0"
        style={{ display: 'block', fontSize: 13, lineHeight: 1.65, color: '#4A4F5A', marginBottom: 11, textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif' }}
      >
        <span style={{ display: '-webkit-box' as CSSProperties['display'], WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as CSSProperties['WebkitBoxOrient'], overflow: 'hidden' }}>
          {item.body.replace(/\\n\\n|\n\n/g, ' ')}
        </span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: schoolColor.bg, color: schoolColor.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.authorName[0]}
          </div>
          <span style={{ fontSize: 11, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.authorName} · {formatDate(item.daysAgo)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          <span>{item.comments.length}</span>
          <span>{formatViews(item.views)}</span>
        </div>
      </div>
    </div>
  )
}

export function QACard({ item, showSchoolTag = true }: { item: QAPost } & CardCommon) {
  const schoolColor = schoolColors[item.school]

  return (
    <div
      className="relative"
      style={{ border: '1px solid #ECEEF2', borderRadius: 10, overflow: 'hidden', transition: 'border-color 150ms', marginBottom: 12 }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2')}
    >
      <div style={{ backgroundColor: '#F7F8FA', padding: '14px 18px 12px', borderBottom: '1px solid #ECEEF2' }}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
          {showSchoolTag && (
            <Tag
              label={item.school}
              color={schoolColor}
              href={`/schools/${item.school.toLowerCase()}`}
              className="relative z-10"
            />
          )}
          <Tag label={item.contentType} color={contentTypeColors[item.contentType]} />
        </div>
        <div style={{ fontSize: 11, color: '#8A8F9A', marginBottom: 5, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          匿名同学 · {item.questionYear}
        </div>
        <Link
          href={`/feed/${item.id}`}
          className="after:absolute after:inset-0"
          style={{ display: 'block', fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: '#0D0D0D', textDecoration: 'none', fontFamily: 'var(--font-noto-sans), sans-serif' }}
        >
          <span style={{ display: '-webkit-box' as CSSProperties['display'], WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as CSSProperties['WebkitBoxOrient'], overflow: 'hidden' }}>
            {item.question}
          </span>
        </Link>
      </div>
      <div style={{ backgroundColor: '#FFFFFF', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: schoolColor.bg, color: schoolColor.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.answerAuthorName[0]}
          </div>
          <span style={{ fontSize: 11, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.answerAuthorName} 回答了
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          <span>{item.comments.length}</span>
          <span>{formatViews(item.views)}</span>
        </div>
      </div>
    </div>
  )
}
