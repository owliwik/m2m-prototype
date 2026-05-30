import Link from 'next/link'

type TagProps = {
  label: string
  color?: { bg: string; fg: string }
  href?: string
  className?: string
}

const DEFAULT_COLOR = { bg: '#EEF0F4', fg: '#4A4F5A' }

export default function Tag({
  label,
  color = DEFAULT_COLOR,
  href,
  className,
}: TagProps) {
  const baseStyle = {
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: color.bg,
    color: color.fg,
    padding: '2px 7px',
    borderRadius: 6,
    letterSpacing: '0.04em',
    fontFamily: 'var(--font-noto-sans), sans-serif',
  }

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        style={{
          ...baseStyle,
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'filter 150ms',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.96)')}
        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
      >
        {label}
      </Link>
    )
  }

  return (
    <span className={className} style={baseStyle}>
      {label}
    </span>
  )
}
