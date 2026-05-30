'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Mode = 'login' | 'register'

const NAVY = '#1F4388'

const BRAND_COPY: Record<Mode, { headline: string; sub: string }> = {
  login: {
    headline: '你想知道的，刚好有人经历过。',
    sub: '四中校友在另一边，愿意回头说说。',
  },
  register: {
    headline: '一封学校邮箱，连接你和经历过这段路的人。',
    sub: '用 @bhsfic.com 邮箱注册，加入只属于四中的对话。',
  },
}

function modeFromPath(pathname: string): Mode {
  return pathname === '/signup' ? 'register' : 'login'
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const mode = modeFromPath(pathname)

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Brand panel — always left, persistent across route changes */}
      <div
        style={{
          width: '50%',
          backgroundColor: NAVY,
          color: '#FFFFFF',
          padding: '64px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '0.08em',
            color: '#FFFFFF',
            textDecoration: 'none',
          }}
        >
          M2M
        </Link>

        <div style={{ maxWidth: 420 }}>
          <div key={`brand-${mode}`} className="brand-text-in">
            <p
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 30,
                lineHeight: 1.45,
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
                letterSpacing: '-0.005em',
              }}
            >
              {BRAND_COPY[mode].headline}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-noto-sans), sans-serif',
                fontSize: 14,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.72)',
                margin: '18px 0 0',
              }}
            >
              {BRAND_COPY[mode].sub}
            </p>
          </div>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-noto-sans), sans-serif',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
            letterSpacing: '0.06em',
          }}
        >
          © 北京四中 M2M
        </p>
      </div>

      {/* Form panel — always right; child page fades in on route change */}
      <div
        style={{
          width: '50%',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px',
        }}
      >
        <div
          key={pathname}
          className="auth-form-fade-in"
          style={{ width: '100%', maxWidth: 380 }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
