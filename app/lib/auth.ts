'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/app/lib/supabase'

/**
 * Auth gate for protected client pages.
 *
 * - On mount, fetches the current session.
 * - If no user, redirects to /login?redirect=<current path + query>.
 * - Subscribes to onAuthStateChange so a sign-out elsewhere also bumps the
 *   user back to /login.
 * - Returns { user, ready } — `ready` is true once we know auth state and
 *   the user is allowed to stay. Pages should render their loading UI
 *   until `ready` is true.
 */
export function useRequireAuth(): { user: User | null; ready: boolean } {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    function redirectToLogin() {
      const path =
        typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/'
      router.replace(`/login?redirect=${encodeURIComponent(path)}`)
    }

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return
      if (!data.user) {
        redirectToLogin()
        return
      }
      setUser(data.user)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (!session?.user) {
        setReady(false)
        setUser(null)
        redirectToLogin()
        return
      }
      setUser(session.user)
      setReady(true)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [router])

  return { user, ready }
}
