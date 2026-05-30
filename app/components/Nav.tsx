'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/app/lib/supabase'

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const isLanding = pathname === '/'
  const hideNav = pathname === '/login' || pathname === '/signup'

  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAmbassador, setIsAmbassador] = useState(false)

  useEffect(() => {
    if (hideNav) return

    let cancelled = false

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      setUser(data.user ?? null)
      setAuthReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [hideNav])

  // Check role whenever user changes. The role lives in a separate
  // DB row, so we must fetch it async; setState in the effect is the
  // intended pattern.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      setIsAmbassador(false)
      return
    }
    let cancelled = false
    supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setIsAdmin(data?.role === 'admin')
        setIsAmbassador(data?.role === 'ambassador')
      })
    return () => {
      cancelled = true
    }
  }, [user])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (hideNav) return null

  const displayName =
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    ''

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
            {isAmbassador && (
              <NavLink href="/my/inbox" label="收件箱" active={pathname === '/my/inbox' || pathname.startsWith('/my/inbox/')} />
            )}
            {isAdmin && (
              <NavLink href="/admin" label="审核" active={pathname === '/admin' || pathname.startsWith('/admin/')} />
            )}
          </nav>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minHeight: 36 }}>
          {!authReady ? null : user ? (
            <>
              {!isLanding && (
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
                  提问
                </Link>
              )}
              <span
                style={{
                  fontSize: 13,
                  color: '#4A4F5A',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  letterSpacing: '0.01em',
                  maxWidth: 140,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={displayName}
              >
                {displayName}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  fontSize: 13,
                  color: '#8A8F9A',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  letterSpacing: '0.01em',
                  padding: 0,
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#A83131')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8A8F9A')}
              >
                退出
              </button>
            </>
          ) : isLanding ? (
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
                href="/login"
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
              href="/login"
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
