'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()
  const isLanding = pathname === '/'

  return (
    <header
      style={{
        borderBottom: '1px solid #E2E5EA',
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '0 24px',
          height: 57,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontWeight: 700,
            fontSize: 18,
            color: '#1F4388',
            textDecoration: 'none',
            letterSpacing: '0.03em',
            flexShrink: 0,
          }}
        >
          M2M
        </Link>

        {/* Middle nav — inner pages only */}
        {!isLanding && (
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <NavLink href="/feed" label="内容" active={pathname === '/feed' || pathname.startsWith('/feed/')} />
            <NavLink href="/ambassadors" label="大使" active={pathname === '/ambassadors'} />
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isLanding ? (
            <>
              <Link
                href="/feed"
                style={{
                  fontSize: 14,
                  color: '#0D0D0D',
                  textDecoration: 'none',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#1F4388')}
                onMouseLeave={e => (e.currentTarget.style.color = '#0D0D0D')}
              >
                浏览内容
              </Link>
              <Link
                href="/ask"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: '#1F4388',
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
              >
                加入 M2M
              </Link>
            </>
          ) : (
            <Link
              href="/ask"
              style={{
                fontSize: 14,
                fontWeight: 500,
                backgroundColor: '#1F4388',
                color: '#FFFFFF',
                padding: '8px 18px',
                borderRadius: 8,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 14,
        fontWeight: 500,
        color: active ? '#1F4388' : '#0D0D0D',
        textDecoration: 'none',
        letterSpacing: '0.01em',
        borderBottom: active ? '2px solid #1F4388' : '2px solid transparent',
        paddingBottom: 2,
        transition: 'color 150ms, border-color 150ms',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.color = '#1F4388'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.color = '#0D0D0D'
      }}
    >
      {label}
    </Link>
  )
}
