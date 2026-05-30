import nodemailer from 'nodemailer'

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT ?? 465)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const fromAddress = process.env.EMAIL_FROM ?? user ?? ''
const fromName = process.env.EMAIL_FROM_NAME ?? 'M2M'

// Port 465 uses implicit TLS; 587 uses STARTTLS (secure: false + requireTLS: true).
const transporter =
  host && user && pass
    ? nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
    : null

export type SendResult = { ok: true; id: string } | { ok: false; error: string }

/**
 * Best-effort transactional email send via 263 enterprise SMTP.
 * Returns a result object instead of throwing — callers log on failure
 * and let the user-facing flow continue.
 *
 * The `from` address must match the authenticated SMTP user; 263 rejects
 * sends with a mismatched from. That's enforced by defaulting fromAddress
 * to SMTP_USER.
 */
export async function sendEmail(opts: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}): Promise<SendResult> {
  if (!transporter) {
    return { ok: false, error: 'SMTP 未配置 (SMTP_HOST / SMTP_USER / SMTP_PASS)' }
  }
  const toList = Array.isArray(opts.to) ? opts.to : [opts.to]
  if (toList.length === 0) {
    return { ok: false, error: '没有收件人' }
  }
  try {
    const info = await transporter.sendMail({
      from: { name: fromName, address: fromAddress },
      to: toList,
      replyTo: opts.replyTo ?? fromAddress,
      subject: opts.subject,
      html: opts.html,
      text: htmlToText(opts.html),
    })
    return { ok: true, id: info.messageId }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/** Minimal HTML escape — required when interpolating user content into the email templates. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Rough plain-text fallback for the multipart/alternative body.
// Including a text part materially improves spam scores; quality matters less.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h\d|li|blockquote|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
