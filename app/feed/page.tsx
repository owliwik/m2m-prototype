'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  allFeedItems,
  schoolColors,
  contentTypeColors,
  allSchools,
  type SchoolKey,
  type ContentType,
  type FeedPost,
  type EssayPost,
  type QAPost,
} from '../data'

const sidebarTypes: ContentType[] = ['申请文书', '校园生活', '学术', '选校建议', '随笔', '公开问答']

function formatViews(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function formatDate(daysAgo: number): string {
  if (daysAgo === 0) return '今天'
  if (daysAgo < 7) return `${daysAgo}天前`
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)}周前`
  return `${Math.floor(daysAgo / 30)}个月前`
}

function SchoolTag({ school }: { school: SchoolKey }) {
  const c = schoolColors[school]
  return (
    <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: c.bg, color: c.fg, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
      {school}
    </span>
  )
}

function TypeTag({ contentType }: { contentType: ContentType }) {
  const c = contentTypeColors[contentType]
  return (
    <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: c.bg, color: c.fg, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
      {contentType}
    </span>
  )
}

/* ─── Article card ─── */

function ArticleCard({ post }: { post: FeedPost }) {
  const schoolColor = schoolColors[post.school]
  const typeColor = contentTypeColors[post.contentType]

  return (
    <Link href={`/post/${post.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 12 }}>
      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 10, padding: '16px 18px', transition: 'border-color 150ms', position: 'relative' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2' }}
      >
        {post.pinned && (
          <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 10, letterSpacing: '0.08em', color: '#A83131', fontFamily: 'var(--font-noto-sans), sans-serif', backgroundColor: '#FAEAEA', padding: '2px 7px', borderRadius: 6, border: '1px solid #F0C8C8' }}>
            置顶
          </div>
        )}
        <div style={{ display: 'flex', gap: 7, marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: schoolColor.bg, color: schoolColor.fg, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {post.school}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: typeColor.bg, color: typeColor.fg, padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {post.contentType}
          </span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: '#0D0D0D', lineHeight: 1.45, marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {post.title}
        </div>
        <div style={{ fontSize: 12, color: '#4A4F5A', lineHeight: 1.6, marginBottom: 11, display: '-webkit-box' as React.CSSProperties['display'], WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'], overflow: 'hidden', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {post.summary}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: schoolColor.bg, color: schoolColor.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {post.authorName[0]}
            </div>
            <span style={{ fontSize: 11, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              {post.authorName} · {formatDate(post.daysAgo)}
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {formatViews(post.views)}
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ─── Essay card ─── */

function EssayCard({ item }: { item: EssayPost }) {
  const schoolColor = schoolColors[item.school]

  return (
    <Link href={`/post/${item.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 12 }}>
      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 10, padding: '16px 18px', transition: 'border-color 150ms' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2' }}
      >
        <div style={{ display: 'flex', gap: 7, marginBottom: 9 }}>
          <SchoolTag school={item.school} />
          <TypeTag contentType={item.contentType} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.65, color: '#4A4F5A', marginBottom: 11, display: '-webkit-box' as React.CSSProperties['display'], WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'], overflow: 'hidden', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
          {item.body.replace(/\n\n/g, ' ')}
        </div>
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
    </Link>
  )
}

/* ─── QA card ─── */

function QACard({ item }: { item: QAPost }) {
  const schoolColor = schoolColors[item.school]

  return (
    <Link href={`/post/${item.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 12 }}>
      <div
        style={{ border: '1px solid #ECEEF2', borderRadius: 10, overflow: 'hidden', transition: 'border-color 150ms' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2')}
      >
        <div style={{ backgroundColor: '#F7F8FA', padding: '14px 18px 12px', borderBottom: '1px solid #ECEEF2' }}>
          <div style={{ display: 'flex', gap: 7, marginBottom: 7 }}>
            <SchoolTag school={item.school} />
            <TypeTag contentType={item.contentType} />
          </div>
          <div style={{ fontSize: 11, color: '#8A8F9A', marginBottom: 5, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            匿名同学 · {item.questionYear}
          </div>
          <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, color: '#0D0D0D', display: '-webkit-box' as React.CSSProperties['display'], WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'], overflow: 'hidden', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {item.question}
          </div>
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
    </Link>
  )
}

/* ─── Sidebar ─── */

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 10, padding: 14 }}>
      {children}
    </div>
  )
}

function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8F9A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
      {children}
    </div>
  )
}

function FilterRow({ label, count, active, onClick, variant = 'navy' }: { label: string; count: number; active: boolean; onClick: () => void; variant?: 'navy' | 'crimson' }) {
  const activeBg = variant === 'crimson' ? '#FAE8E8' : '#E8F0FC'
  const activeColor = variant === 'crimson' ? '#A83131' : '#1F4388'
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '6px 8px',
        borderRadius: 6,
        border: 'none',
        backgroundColor: active ? activeBg : 'transparent',
        color: active ? activeColor : '#4A4F5A',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
        fontSize: 12,
        fontFamily: 'var(--font-noto-sans), sans-serif',
        textAlign: 'left',
        transition: 'background-color 100ms',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#F7F8FA' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
    >
      <span>{label}</span>
      <span style={{ fontSize: 11, color: active ? activeColor : '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', opacity: 0.7 }}>
        {count}
      </span>
    </button>
  )
}

/* ─── Main page ─── */

export default function FeedPage() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolKey | null>(null)
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)

  const filtered = allFeedItems.filter(item => {
    if (selectedSchool && item.school !== selectedSchool) return false
    if (selectedType && item.contentType !== selectedType) return false
    return true
  })

  // Count totals for sidebar
  const totalCount = allFeedItems.length
  const schoolCounts = Object.fromEntries(
    allSchools.map(s => [s, allFeedItems.filter(i => i.school === s).length])
  ) as Record<SchoolKey, number>
  const typeCounts = Object.fromEntries(
    sidebarTypes.map(t => [t, allFeedItems.filter(i => i.contentType === t).length])
  ) as Record<ContentType, number>

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ backgroundColor: '#F7F8FA', borderBottom: '1px solid #E2E5EA' }}>
        <div
          style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 48px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}
        >
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8F9A', marginBottom: 7, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
              M2M 内容库
            </p>
            <h1 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 26, fontWeight: 700, color: '#0D0D0D', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              四中校友留下的，四中在校生来看的
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
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
          </div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div
        style={{ maxWidth: 1080, margin: '0 auto', padding: '0 48px 80px', display: 'flex', gap: 32, alignItems: 'flex-start' }}
      >
        {/* Left: card grid */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: 32 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', fontSize: 14 }}>
              没有符合条件的内容
            </div>
          ) : (
            <div>
              {filtered.map(item => {
                if (item.kind === 'essay') return <EssayCard key={item.id} item={item} />
                if (item.kind === 'qa') return <QACard key={item.id} item={item} />
                return <ArticleCard key={item.id} post={item} />
              })}
            </div>
          )}
        </div>

        {/* Right: sidebar */}
        <div style={{ width: 196, flexShrink: 0, position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 32 }}>

          {/* Search */}
          <SidebarCard>
            <input
              type="text"
              placeholder="搜索内容..."
              style={{ width: '100%', backgroundColor: '#F7F8FA', border: '1px solid #E2E5EA', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font-noto-sans), sans-serif', color: '#0D0D0D', outline: 'none', boxSizing: 'border-box' }}
            />
          </SidebarCard>

          {/* School filter */}
          <SidebarCard>
            <SidebarSectionTitle>学校</SidebarSectionTitle>
            <FilterRow
              label="全部"
              count={totalCount}
              active={selectedSchool === null}
              onClick={() => setSelectedSchool(null)}
            />
            {allSchools.map(school => (
              <FilterRow
                key={school}
                label={school}
                count={schoolCounts[school]}
                active={selectedSchool === school}
                onClick={() => setSelectedSchool(selectedSchool === school ? null : school)}
              />
            ))}
          </SidebarCard>

          {/* Content type filter */}
          <SidebarCard>
            <SidebarSectionTitle>内容类型</SidebarSectionTitle>
            <FilterRow
              label="全部"
              count={totalCount}
              active={selectedType === null}
              onClick={() => setSelectedType(null)}
              variant="crimson"
            />
            {sidebarTypes.map(type => (
              <FilterRow
                key={type}
                label={type}
                count={typeCounts[type] ?? 0}
                active={selectedType === type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                variant="crimson"
              />
            ))}
          </SidebarCard>

        </div>
      </div>
    </div>
  )
}
