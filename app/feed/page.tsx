'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  feedPosts,
  ambassadors,
  schoolColors,
  contentTypeColors,
  allSchools,
  type SchoolKey,
  type ContentType,
} from '../data'

const contentTypes: ContentType[] = ['申请文书', '校园生活', '选校建议', '学术']

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

function getAuthorInitial(name: string): string {
  return name.slice(0, 1)
}

export default function FeedPage() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolKey | null>(null)
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)

  const filtered = feedPosts.filter(post => {
    if (selectedSchool && post.school !== selectedSchool) return false
    if (selectedType && post.contentType !== selectedType) return false
    return true
  })

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Compact hero header */}
      <div
        style={{
          backgroundColor: '#F7F8FA',
          borderBottom: '1px solid #E2E5EA',
          padding: '32px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#8A8F9A',
                marginBottom: 8,
                fontFamily: 'var(--font-noto-sans), sans-serif',
              }}
            >
              M2M 内容库
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 28,
                fontWeight: 700,
                color: '#0D0D0D',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              四中校友留下的，四中在校生来看的
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <Link
              href="/ambassadors"
              style={{
                border: '1px solid #A83131',
                color: '#A83131',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'border-color 150ms, background-color 150ms, color 150ms',
                display: 'inline-block',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#A83131'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#A83131'
              }}
            >
              浏览大使
            </Link>
            <Link
              href="/ask"
              style={{
                backgroundColor: '#1F4388',
                color: '#FFFFFF',
                padding: '9px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'background-color 150ms',
                display: 'inline-block',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
            >
              联系大使
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div
        style={{
          position: 'sticky',
          top: 57,
          zIndex: 40,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E5EA',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            overflowX: 'auto',
            height: 52,
          }}
        >
          {/* School pills */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <FilterPill
              label="全部学校"
              active={selectedSchool === null}
              onClick={() => setSelectedSchool(null)}
            />
            {allSchools.map(school => (
              <FilterPill
                key={school}
                label={school}
                active={selectedSchool === school}
                onClick={() => setSelectedSchool(selectedSchool === school ? null : school)}
                schoolColors={schoolColors[school]}
              />
            ))}
          </div>

          <div
            style={{
              width: 1,
              height: 20,
              backgroundColor: '#E2E5EA',
              flexShrink: 0,
            }}
          />

          {/* Type pills */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <FilterPill
              label="全部类型"
              active={selectedType === null}
              onClick={() => setSelectedType(null)}
              variant="type"
            />
            {contentTypes.map(type => (
              <FilterPill
                key={type}
                label={type}
                active={selectedType === type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                variant="type"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: '#8A8F9A',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              fontSize: 14,
            }}
          >
            没有符合条件的内容
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((post, i) => {
              const schoolColor = schoolColors[post.school]
              const typeColor = contentTypeColors[post.contentType]
              const ambassador = ambassadors.find(a => a.name === post.authorName)
              const authorColor = ambassador ? schoolColors[ambassador.school] : schoolColor

              return (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E5EA',
                    borderRadius: 10,
                    padding: '28px 24px',
                    display: 'flex',
                    gap: 24,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'background-color 150ms, border-color 150ms',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = '#F7F8FA'
                    el.style.borderColor = '#C8CDD6'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.backgroundColor = '#FFFFFF'
                    el.style.borderColor = '#E2E5EA'
                  }}
                >
                  {/* Pinned indicator */}
                  {post.pinned && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 16,
                        fontSize: 11,
                        letterSpacing: '0.08em',
                        color: '#A83131',
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                        backgroundColor: '#FAEAEA',
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #F0C8C8',
                      }}
                    >
                      置顶
                    </div>
                  )}

                  {/* Author avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: authorColor.bg,
                      color: authorColor.fg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'var(--font-noto-sans), sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    {getAuthorInitial(post.authorName)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Badges row */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: schoolColor.bg,
                          color: schoolColor.fg,
                          padding: '2px 8px',
                          borderRadius: 6,
                          letterSpacing: '0.04em',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                        }}
                      >
                        {post.school}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: typeColor.bg,
                          color: typeColor.fg,
                          padding: '2px 8px',
                          borderRadius: 6,
                          letterSpacing: '0.04em',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                        }}
                      >
                        {post.contentType}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      style={{
                        fontFamily: 'var(--font-noto-serif), serif',
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#0D0D0D',
                        lineHeight: 1.4,
                        marginBottom: 8,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      <Link
                        href={`/feed/${post.id}`}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {post.title}
                      </Link>
                    </h2>

                    {/* Meta row */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 16,
                        alignItems: 'center',
                        fontSize: 12,
                        color: '#8A8F9A',
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                      }}
                    >
                      <span>{post.authorName}</span>
                      <span>·</span>
                      <span>{formatViews(post.views)} 阅读</span>
                      <span>·</span>
                      <span>{formatDate(post.daysAgo)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
  schoolColors: sc,
  variant,
}: {
  label: string
  active: boolean
  onClick: () => void
  schoolColors?: { bg: string; fg: string }
  variant?: 'type'
}) {
  const activeBg = sc ? sc.bg : variant === 'type' ? '#A83131' : '#1F4388'
  const activeFg = sc ? sc.fg : '#FFFFFF'
  const activeBorder = sc ? sc.bg : variant === 'type' ? '#A83131' : '#1F4388'

  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'var(--font-noto-sans), sans-serif',
        letterSpacing: '0.03em',
        border: '1px solid',
        borderRadius: 6,
        borderColor: active ? activeBorder : '#E2E5EA',
        backgroundColor: active ? activeBg : 'transparent',
        color: active ? activeFg : '#8A8F9A',
        cursor: 'pointer',
        transition: 'all 150ms',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
