'use client'

import type { ReactNode } from 'react'

type Variant = 'navy' | 'crimson'

export function SidebarCard({ children }: { children: ReactNode }) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: 10, padding: 14 }}>
      {children}
    </div>
  )
}

export function SidebarSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8F9A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
      {children}
    </div>
  )
}

export function FilterRow({
  label,
  count,
  active,
  onClick,
  variant = 'navy',
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  variant?: Variant
}) {
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

export function ContentTypeFilter<T extends string>({
  types,
  counts,
  selected,
  onSelect,
  totalCount,
  hideZero = false,
  variant = 'navy',
}: {
  types: readonly T[]
  counts: Record<T, number>
  selected: T | null
  onSelect: (type: T | null) => void
  totalCount: number
  hideZero?: boolean
  variant?: Variant
}) {
  return (
    <SidebarCard>
      <SidebarSectionTitle>内容类型</SidebarSectionTitle>
      <FilterRow
        label="全部"
        count={totalCount}
        active={selected === null}
        onClick={() => onSelect(null)}
        variant={variant}
      />
      {types.map(type => {
        const count = counts[type] ?? 0
        if (hideZero && count === 0) return null
        return (
          <FilterRow
            key={type}
            label={type}
            count={count}
            active={selected === type}
            onClick={() => onSelect(selected === type ? null : type)}
            variant={variant}
          />
        )
      })}
    </SidebarCard>
  )
}
