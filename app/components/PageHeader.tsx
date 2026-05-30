import type { ReactNode } from 'react'

export default function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string
  title: string
  actions?: ReactNode
}) {
  return (
    <div style={{ backgroundColor: '#F7F8FA', borderBottom: '1px solid #E2E5EA' }}>
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '40px 48px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8A8F9A',
              marginBottom: 8,
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif), serif',
              fontSize: 28,
              fontWeight: 700,
              color: '#0D0D0D',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
