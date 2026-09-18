import type { CSSProperties, ReactNode } from 'react'

export const NAVY = '#1F4388'
export const NAVY_DEEP = '#183272'
export const STEP_NAVY = '#1e3a6e'
export const CRIMSON = '#A83131'

export function emailLooksValid(email: string) {
  const at = email.indexOf('@')
  return at > 0
  // return at > 0 && email.toLowerCase().endsWith('@bhsfic.com')
}

export function zhAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return '邮箱或密码错误'
  if (m.includes('email not confirmed')) return '邮箱尚未验证'
  if (m.includes('user not found')) return '用户不存在'
  return msg
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: '#4A4F5A',
          marginBottom: 6,
          fontFamily: 'var(--font-noto-sans), sans-serif',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export function ErrorLine({ text }: { text: string }) {
  return (
    <p
      style={{
        marginTop: 4,
        marginBottom: 8,
        fontSize: 12,
        color: CRIMSON,
        fontFamily: 'var(--font-noto-sans), sans-serif',
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      }}
    >
      {text}
    </p>
  )
}

export function inputStyle(error: boolean = false): CSSProperties {
  return {
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    fontFamily: 'var(--font-noto-sans), sans-serif',
    border: '1px solid',
    borderColor: error ? CRIMSON : '#E2E5EA',
    borderRadius: 8,
    color: '#0D0D0D',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 150ms',
    boxSizing: 'border-box',
  }
}

export function primaryButtonStyle(enabled: boolean): CSSProperties {
  return {
    width: '100%',
    padding: '12px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'var(--font-noto-sans), sans-serif',
    border: 'none',
    borderRadius: 8,
    backgroundColor: enabled ? NAVY : '#EEF0F4',
    color: enabled ? '#FFFFFF' : '#B0B5C0',
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'background-color 150ms',
    letterSpacing: '0.02em',
    marginTop: 6,
  }
}

export function backLinkStyle(): CSSProperties {
  return {
    background: 'none',
    border: 'none',
    padding: 0,
    color: '#4A4F5A',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'var(--font-noto-sans), sans-serif',
    marginBottom: 16,
    transition: 'color 150ms',
  }
}
