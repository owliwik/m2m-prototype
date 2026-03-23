'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ambassadors,
  schoolColors,
  contentTypeColors,
  allSchools,
  type SchoolKey,
} from '../data'

export default function AmbassadorsPage() {
  const [selectedSchool, setSelectedSchool] = useState<SchoolKey | null>(null)

  const filtered = selectedSchool
    ? ambassadors.filter(a => a.school === selectedSchool)
    : ambassadors

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Page header */}
      <div
        style={{
          backgroundColor: '#F7F8FA',
          borderBottom: '1px solid #E2E5EA',
          padding: '40px 24px',
        }}
      >
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
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
            M2M 大使目录
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif), serif',
              fontSize: 28,
              fontWeight: 700,
              color: '#0D0D0D',
              letterSpacing: '-0.01em',
            }}
          >
            认识我们的在校大使
          </h1>
        </div>
      </div>

      {/* Filter bar */}
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
            gap: 8,
            alignItems: 'center',
            height: 52,
            overflowX: 'auto',
          }}
        >
          <SchoolPill
            label="全部院校"
            active={selectedSchool === null}
            onClick={() => setSelectedSchool(null)}
          />
          {allSchools.map(school => (
            <SchoolPill
              key={school}
              label={school}
              active={selectedSchool === school}
              colors={schoolColors[school]}
              onClick={() => setSelectedSchool(selectedSchool === school ? null : school)}
            />
          ))}
        </div>
      </div>

      {/* Ambassador grid */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map(ambassador => {
            const sc = schoolColors[ambassador.school]
            return (
              <AmbassadorCard key={ambassador.id} ambassador={ambassador} schoolColor={sc} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AmbassadorCard({
  ambassador,
  schoolColor,
}: {
  ambassador: (typeof ambassadors)[0]
  schoolColor: { bg: string; fg: string }
}) {
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
            backgroundColor: schoolColor.bg,
            color: schoolColor.fg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            flexShrink: 0,
          }}
        >
          {ambassador.name.slice(0, 1)}
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
              {ambassador.name}
            </span>
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
              {ambassador.school}
            </span>
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
            {ambassador.dept} · {ambassador.year}
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
            {ambassador.bio}
          </p>
        </div>
      </div>

      {/* Content previews */}
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
        {ambassador.contents.map((content, i) => {
          const typeColor = contentTypeColors[content.type]
          return (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: typeColor.bg,
                  color: typeColor.fg,
                  padding: '2px 7px',
                  borderRadius: 6,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {content.type}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: '#0D0D0D',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {content.title}
              </span>
            </div>
          )
        })}
      </div>

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
          {ambassador.postCount} 篇内容
        </span>
        <Link
          href="/ask"
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

function SchoolPill({
  label,
  active,
  colors,
  onClick,
}: {
  label: string
  active: boolean
  colors?: { bg: string; fg: string }
  onClick: () => void
}) {
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
        borderColor: active ? '#1F4388' : '#E2E5EA',
        backgroundColor: active ? (colors ? colors.bg : '#1F4388') : 'transparent',
        color: active ? (colors ? colors.fg : '#FFFFFF') : '#8A8F9A',
        cursor: 'pointer',
        transition: 'all 150ms',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}
