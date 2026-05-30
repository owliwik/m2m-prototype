'use client'

import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import {
  CRIMSON,
  ErrorLine,
  Field,
  NAVY,
  NAVY_DEEP,
  STEP_NAVY,
  backLinkStyle,
  emailLooksValid,
  inputStyle,
  primaryButtonStyle,
  zhAuthError,
} from '../_shared'

type RegisterStep = 1 | 2 | 3
type StepDirection = 'forward' | 'backward'
type PasswordStrength = 'low' | 'medium' | 'high'

function scorePassword(pw: string): PasswordStrength {
  if (pw.length === 0) return 'low'
  let score = 0
  if (pw.length >= 8) score += 1
  if (pw.length >= 12) score += 1
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1
  if (/\d/.test(pw)) score += 1
  if (/[^A-Za-z0-9]/.test(pw)) score += 1
  if (score <= 1) return 'low'
  if (score <= 3) return 'medium'
  return 'high'
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  )
}

function SignupPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect')
  const redirectTo = redirect || '/feed'
  const loginHref = `/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`

  const [step, setStep] = useState<RegisterStep>(1)
  const [stepDir, setStepDir] = useState<StepDirection>('forward')
  const [done, setDone] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [password2Touched, setPassword2Touched] = useState(false)
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const codeRefs = useRef<Array<HTMLInputElement | null>>([])
  const [resendCountdown, setResendCountdown] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Resend countdown tick (1Hz)
  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = window.setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [resendCountdown])

  function goToStep(next: RegisterStep) {
    setStepDir(next > step ? 'forward' : 'backward')
    setStep(next)
    setError(null)
  }

  // Step 2 → 3: call signUp to create the auth user and trigger the OTP email.
  async function handleSendCode(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    if (!cleanName || !cleanEmail || !password) {
      setError('请填写所有字段')
      return
    }
    if (!emailLooksValid(cleanEmail)) {
      setError('请使用 @bhsfic.com 邮箱')
      return
    }
    if (password !== password2) {
      setError('两次密码不一致')
      return
    }

    setSubmitting(true)
    const { error: signUpErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name: cleanName } },
    })
    if (signUpErr) {
      setSubmitting(false)
      setError(zhAuthError(signUpErr.message))
      return
    }

    setSubmitting(false)
    setCode(['', '', '', '', '', ''])
    setResendCountdown(60)
    goToStep(3)
    window.setTimeout(() => codeRefs.current[0]?.focus(), 300)
  }

  // Step 3: verify the OTP, then sync the public.users profile row.
  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    const token = code.join('')
    if (token.length !== 6) {
      setError('请输入完整的 6 位验证码')
      return
    }

    setSubmitting(true)
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: 'signup',
    })
    if (verifyErr) {
      setSubmitting(false)
      setError(zhAuthError(verifyErr.message))
      return
    }

    // Now signed in — fetch the session for the profile sync call.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSubmitting(false)
      setError('会话获取失败，请重试')
      return
    }

    try {
      const res = await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setSubmitting(false)
        setError(data.error ?? '资料同步失败')
        return
      }
    } catch (err) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : '网络错误')
      return
    }

    setSubmitting(false)
    setDone(true)
  }

  async function handleResend() {
    if (resendCountdown > 0 || submitting) return
    setError(null)
    setSubmitting(true)
    const { error: resendErr } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    })
    setSubmitting(false)
    if (resendErr) {
      setError(zhAuthError(resendErr.message))
      return
    }
    setCode(['', '', '', '', '', ''])
    setResendCountdown(60)
    codeRefs.current[0]?.focus()
  }

  function setCodeAt(idx: number, raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 0) {
      const next = [...code]
      next[idx] = ''
      setCode(next)
      return
    }
    if (digits.length === 1) {
      const next = [...code]
      next[idx] = digits
      setCode(next)
      if (idx < 5) codeRefs.current[idx + 1]?.focus()
      return
    }
    // Paste: distribute digits across the cells starting at idx
    const next = [...code]
    let i = idx
    for (const ch of digits) {
      if (i > 5) break
      next[i] = ch
      i += 1
    }
    setCode(next)
    const focusIdx = Math.min(idx + digits.length, 5)
    codeRefs.current[focusIdx]?.focus()
  }

  function onCodeKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && code[idx] === '' && idx > 0) {
      e.preventDefault()
      const next = [...code]
      next[idx - 1] = ''
      setCode(next)
      codeRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault()
      codeRefs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < 5) {
      e.preventDefault()
      codeRefs.current[idx + 1]?.focus()
    }
  }

  const emailInvalid = emailTouched && email.length > 0 && !emailLooksValid(email)
  const step1Valid = name.trim().length > 0 && emailLooksValid(email)
  const step2Valid = password.length > 0 && password === password2 && !submitting
  const step3Valid = code.every(d => d.length === 1) && !submitting
  const strength = scorePassword(password)

  if (done) {
    return <RegisterSuccess name={name} onContinue={() => router.push(redirectTo)} />
  }

  const stepAnimClass = stepDir === 'forward' ? 'login-step-forward' : 'login-step-backward'

  return (
    <div>
      <StepIndicator current={step} />

      {step === 1 && (
        <div key="reg-step-1" className={stepAnimClass}>
          <h1 style={titleStyle}>创建你的账号</h1>
          <p style={subStyle}>用学校邮箱，开始与四中校友对话</p>

          <Field label="姓名">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="你的真实姓名"
              autoComplete="name"
              style={inputStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
            />
          </Field>

          <Field label="学校邮箱">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={e => {
                setEmailTouched(true)
                if (!emailInvalid) e.currentTarget.style.borderColor = '#E2E5EA'
              }}
              onFocus={e => {
                if (!emailInvalid) e.currentTarget.style.borderColor = NAVY
              }}
              placeholder="yourname@bhsfic.com"
              autoComplete="email"
              style={inputStyle(emailInvalid)}
            />
            {emailInvalid && (
              <p
                style={{
                  fontSize: 12,
                  color: CRIMSON,
                  margin: '6px 0 0',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                请使用 @bhsfic.com 邮箱
              </p>
            )}
          </Field>

          <button
            type="button"
            onClick={() => { if (step1Valid) goToStep(2) }}
            disabled={!step1Valid}
            style={primaryButtonStyle(step1Valid)}
            onMouseEnter={e => { if (step1Valid) e.currentTarget.style.backgroundColor = NAVY_DEEP }}
            onMouseLeave={e => { if (step1Valid) e.currentTarget.style.backgroundColor = NAVY }}
          >
            继续 →
          </button>
        </div>
      )}

      {step === 2 && (
        <form key="reg-step-2" className={stepAnimClass} onSubmit={handleSendCode} noValidate>
          <button
            type="button"
            onClick={() => goToStep(1)}
            disabled={submitting}
            style={backLinkStyle()}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.color = '#0D0D0D' }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.color = '#4A4F5A' }}
          >
            ← 返回
          </button>

          <h1 style={titleStyle}>设置密码</h1>
          <p style={subStyle}>
            之后会发一个验证码到{' '}
            <strong style={{ color: '#0D0D0D', fontWeight: 600 }}>{email.trim() || '你的邮箱'}</strong>
            {' '}确认这个账号是你的。
          </p>

          <Field label="密码">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少 8 位"
              autoComplete="new-password"
              style={inputStyle()}
              onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
            />
            <StrengthBar strength={strength} hasInput={password.length > 0} />
          </Field>

          <Field label="确认密码">
            <input
              type="password"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              onBlur={e => {
                setPassword2Touched(true)
                const mismatch = password2.length > 0 && password !== password2
                if (!mismatch) e.currentTarget.style.borderColor = '#E2E5EA'
              }}
              onFocus={e => {
                const mismatch = password2Touched && password2.length > 0 && password !== password2
                if (!mismatch) e.currentTarget.style.borderColor = NAVY
              }}
              placeholder="再次输入密码"
              autoComplete="new-password"
              style={inputStyle(
                password2Touched && password2.length > 0 && password !== password2,
              )}
            />
            {password2Touched && password2.length > 0 && password !== password2 && (
              <p
                style={{
                  fontSize: 12,
                  color: CRIMSON,
                  margin: '6px 0 0',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                两次密码不一致
              </p>
            )}
          </Field>

          {error && <ErrorLine text={error} />}

          <button
            type="submit"
            disabled={!step2Valid}
            style={primaryButtonStyle(step2Valid)}
            onMouseEnter={e => { if (step2Valid) e.currentTarget.style.backgroundColor = NAVY_DEEP }}
            onMouseLeave={e => { if (step2Valid) e.currentTarget.style.backgroundColor = NAVY }}
          >
            {submitting ? '发送中…' : '发送验证码 →'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form key="reg-step-3" className={stepAnimClass} onSubmit={handleVerify} noValidate>
          <button
            type="button"
            onClick={() => goToStep(2)}
            disabled={submitting}
            style={backLinkStyle()}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.color = '#0D0D0D' }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.color = '#4A4F5A' }}
          >
            ← 返回
          </button>

          <h1 style={titleStyle}>查收验证码</h1>
          <p style={subStyle}>
            验证码已发送至{' '}
            <strong style={{ color: '#0D0D0D', fontWeight: 600 }}>{email.trim()}</strong>
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { codeRefs.current[idx] = el }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={digit}
                onChange={e => setCodeAt(idx, e.target.value)}
                onKeyDown={e => onCodeKeyDown(idx, e)}
                onPaste={e => {
                  e.preventDefault()
                  const pasted = e.clipboardData.getData('text')
                  setCodeAt(idx, pasted)
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = NAVY
                  e.currentTarget.select()
                }}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
                maxLength={1}
                style={{
                  width: 44,
                  height: 52,
                  textAlign: 'center',
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#0D0D0D',
                  border: '1px solid #E2E5EA',
                  borderRadius: 8,
                  outline: 'none',
                  fontFamily: 'var(--font-noto-serif), serif',
                  backgroundColor: '#FFFFFF',
                  transition: 'border-color 150ms',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <p
            style={{
              fontSize: 12,
              color: '#8A8F9A',
              margin: '0 0 32px',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            没有收到？{' '}
            {resendCountdown > 0 ? (
              <span style={{ color: '#B0B5C0' }}>
                重新发送 ({resendCountdown}s)
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={submitting}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: NAVY,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: submitting ? 'default' : 'pointer',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                }}
              >
                重新发送
              </button>
            )}
          </p>

          {error && <ErrorLine text={error} />}

          <button
            type="submit"
            disabled={!step3Valid}
            style={primaryButtonStyle(step3Valid)}
            onMouseEnter={e => { if (step3Valid) e.currentTarget.style.backgroundColor = NAVY_DEEP }}
            onMouseLeave={e => { if (step3Valid) e.currentTarget.style.backgroundColor = NAVY }}
          >
            {submitting ? '验证中…' : '完成注册'}
          </button>
        </form>
      )}

      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#8A8F9A',
          margin: '24px 0 0',
          fontFamily: 'var(--font-noto-sans), sans-serif',
        }}
      >
        已有账号？{' '}
        <Link
          href={loginHref}
          style={{
            color: NAVY,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          直接登录
        </Link>
      </p>
    </div>
  )
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-noto-serif), serif',
  fontSize: 28,
  fontWeight: 700,
  color: '#0D0D0D',
  margin: '0 0 8px',
  letterSpacing: '-0.01em',
}

const subStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#8A8F9A',
  margin: '0 0 32px',
  fontFamily: 'var(--font-noto-sans), sans-serif',
  lineHeight: 1.6,
}

function RegisterSuccess({
  name,
  onContinue,
}: {
  name: string
  onContinue: () => void
}) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 28 }}>
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ margin: '0 auto', display: 'block' }}
        >
          <circle cx="36" cy="36" r="35" stroke="#15803D" strokeWidth="2" fill="#F0FDF4" />
          <path
            d="M22 36L31 45L50 27"
            stroke="#15803D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-noto-serif), serif',
          fontSize: 28,
          fontWeight: 700,
          color: '#0D0D0D',
          margin: '0 0 14px',
          letterSpacing: '-0.01em',
        }}
      >
        注册成功
      </h1>
      <p
        style={{
          fontSize: 14,
          color: '#4A4F5A',
          margin: '0 0 32px',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          lineHeight: 1.7,
        }}
      >
        欢迎加入 M2M，{name || '同学'}
      </p>
      <button
        onClick={onContinue}
        style={primaryButtonStyle(true)}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = NAVY_DEEP)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = NAVY)}
      >
        进入 M2M →
      </button>
    </div>
  )
}

function StepIndicator({ current }: { current: RegisterStep }) {
  const steps: RegisterStep[] = [1, 2, 3]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 36,
      }}
    >
      {steps.map((s, i) => {
        const filled = current >= s
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: filled ? STEP_NAVY : '#D6D9DF',
                transition: 'background-color 200ms',
              }}
            />
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 36,
                  height: 2,
                  backgroundColor: current > s ? STEP_NAVY : '#D6D9DF',
                  transition: 'background-color 200ms',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StrengthBar({
  strength,
  hasInput,
}: {
  strength: PasswordStrength
  hasInput: boolean
}) {
  const segments: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
  const reachedIdx =
    !hasInput ? -1 : strength === 'low' ? 0 : strength === 'medium' ? 1 : 2
  const labelMap = { low: '低', medium: '中', high: '高' } as const
  const colorMap = { low: '#D04A4A', medium: '#D4A12B', high: '#2E8B57' } as const

  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {segments.map((seg, i) => (
          <div
            key={seg}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor:
                hasInput && i <= reachedIdx ? colorMap[strength] : '#EEF0F4',
              transition: 'background-color 200ms',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: 11,
          color: hasInput ? colorMap[strength] : '#B0B5C0',
          fontFamily: 'var(--font-noto-sans), sans-serif',
          minWidth: 14,
          textAlign: 'right',
          fontWeight: 600,
          transition: 'color 200ms',
        }}
      >
        {hasInput ? labelMap[strength] : ''}
      </span>
    </div>
  )
}
