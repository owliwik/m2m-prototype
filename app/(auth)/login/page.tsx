'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import {
  ErrorLine,
  Field,
  NAVY,
  NAVY_DEEP,
  inputStyle,
  primaryButtonStyle,
  zhAuthError,
} from '../_shared'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}

function LoginPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect')
  const redirectTo = redirect || '/feed'
  const signupHref = `/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)
    if (!email.trim() || !password) {
      setError('请填写邮箱和密码')
      return
    }
    setSubmitting(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (authError) {
      setSubmitting(false)
      setError(zhAuthError(authError.message))
      return
    }
    router.push(redirectTo)
  }

  const canSubmit = email.length > 0 && password.length > 0 && !submitting

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1
        style={{
          fontFamily: 'var(--font-noto-serif), serif',
          fontSize: 28,
          fontWeight: 700,
          color: '#0D0D0D',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
        }}
      >
        登录账号
      </h1>
      <p
        style={{
          fontSize: 14,
          color: '#8A8F9A',
          margin: '0 0 32px',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          lineHeight: 1.6,
        }}
      >
        欢迎回来，用四中学生邮箱继续。
      </p>

      <Field label="学校邮箱">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="yourname@bhsfic.com"
          autoComplete="email"
          style={inputStyle()}
          onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
          onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
        />
      </Field>

      <Field label="密码">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="输入密码"
          autoComplete="current-password"
          style={inputStyle()}
          onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
          onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
        />
      </Field>

      {error && <ErrorLine text={error} />}

      <button
        type="submit"
        disabled={!canSubmit}
        style={primaryButtonStyle(canSubmit)}
        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.backgroundColor = NAVY_DEEP }}
        onMouseLeave={e => { if (canSubmit) e.currentTarget.style.backgroundColor = NAVY }}
      >
        {submitting ? '登录中…' : '登录'}
      </button>

      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#8A8F9A',
          margin: '24px 0 0',
          fontFamily: 'var(--font-noto-sans), sans-serif',
        }}
      >
        还没有账号？{' '}
        <Link
          href={signupHref}
          style={{
            color: NAVY,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          立即注册
        </Link>
      </p>
    </form>
  )
}
