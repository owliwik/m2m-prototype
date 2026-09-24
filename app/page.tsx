'use client'

import Link from 'next/link'
import { ambassadors, schoolColors } from './data'

const quotes = [
  {
    text: '我当时最不知道的事，现在写在这里了。',
    name: '张明远',
    school: 'CMU' as const,
    dept: '计算机科学 · 2024届',
  },
  {
    text: '有人问我当年怎么选的，我就在这里认真回答。',
    name: '李晓彤',
    school: 'Duke' as const,
    dept: '经济 · 2023届',
  },
  {
    text: '四中出来的人申请思路很像，聊起来省很多力气。',
    name: '陈思远',
    school: 'Penn' as const,
    dept: 'Wharton 商科 · 2023届',
  },
  {
    text: '我不是来给建议的，是来说说我自己当时的判断。',
    name: '王子轩',
    school: 'Cornell' as const,
    dept: '机械工程 · 2024届',
  },
]

const whyItems = [
  {
    icon: '◎',
    title: '都是四中人',
    body: '校友熟悉学校的课程、活动和申请节奏。很多背景不用从头解释，问题可以直接聊到点上。',
  },
  {
    icon: '◇',
    title: '聊聊亲身经历',
    body: '大使都是自愿来分享的校友。他们会聊自己当时怎么想、怎么选，也愿意回答在校生的问题。',
  },
  {
    icon: '△',
    title: '只对四中开放',
    body: '用学校邮箱验证后才能进入，内容不会对外公开。申请里的纠结，可以在这里说得具体一点。',
  },
]

const steps = [
  { num: '01', title: '先用学校邮箱登录', body: '用 @bhsfic.com 邮箱完成验证，就可以进来了。' },
  { num: '02', title: '先看看大家聊过什么', body: '可以读校友分享的经历，也可以找一位你想聊的校友。' },
  { num: '03', title: '把问题发出来', body: '把想问的写清楚，后面的联系和安排交给我们，不用自己到处找人。' },
]

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#0D0D0D' }}>
      {/* Hero */}
      <section
        style={{
          width: '100%',
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: '96px 24px 80px',
          textAlign: 'center',
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.72)), url('/bhsfic-hero-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 46%',
        }}
      >
        <p
          className="animate-fade-up delay-0"
          style={{
            fontSize: 13,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#C07070',
            marginBottom: 28,
            fontFamily: 'var(--font-noto-sans), sans-serif',
            fontWeight: 500,
          }}
        >
          北京四中 · 校友与在校生
        </p>

        <h1
          className="animate-fade-up delay-100"
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: '#0D0D0D',
            maxWidth: 760,
            margin: '0 auto 28px',
          }}
        >
          申请里拿不准的事，问问走过这条路的四中校友
        </h1>

        <p
          className="animate-fade-up delay-200"
          style={{
            fontSize: 17,
            lineHeight: 1.8,
            color: '#4A4F5A',
            maxWidth: 580,
            margin: '0 auto 40px',
            fontFamily: 'var(--font-noto-sans), sans-serif',
          }}
        >
          在 M2M，你可以看看四中校友怎么走过申请，也可以把自己的问题直接提出来。这里分享亲身经历，也欢迎你来提问。
        </p>

        <div
          className="animate-fade-up delay-300"
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <Link
            href="/ask"
            style={{
              backgroundColor: '#1F4388',
              color: '#FFFFFF',
              padding: '13px 28px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'background-color 150ms',
              display: 'inline-block',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
          >
            用学校邮箱加入
          </Link>
          <Link
            href="/feed"
            style={{
              border: '1px solid #A83131',
              color: '#A83131',
              padding: '13px 28px',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              transition: 'background-color 150ms, color 150ms',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#A83131'
              e.currentTarget.style.color = '#FFFFFF'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#A83131'
            }}
          >
            先看看
          </Link>
        </div>

        <p
          className="animate-fade-up delay-400"
          style={{
            fontSize: 12,
            color: '#8A8F9A',
            letterSpacing: '0.04em',
          }}
        >
          仅限 @bhsfic.com · 不对外公开
        </p>
      </section>

      {/* Stats bar */}
      <div
        style={{
          borderTop: '1px solid #E2E5EA',
          borderBottom: '1px solid #E2E5EA',
          backgroundColor: '#F7F8FA',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}
        >
          {[
            { num: '24', label: '位在校大使' },
            { num: '12', label: '所覆盖院校' },
            { num: '38', label: '篇原创内容' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid #E2E5EA' : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-noto-serif), serif',
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#0D0D0D',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {stat.num}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#8A8F9A',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why M2M */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '88px 24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#0D0D0D',
            marginBottom: 56,
            letterSpacing: '-0.01em',
          }}
        >
          为什么来这里问
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 0,
            borderTop: '1px solid #E2E5EA',
          }}
        >
          {whyItems.map((item, i) => (
            <div
              key={i}
              style={{
                padding: '40px 40px 40px 0',
                borderBottom: '1px solid #E2E5EA',
                paddingRight: i < whyItems.length - 1 ? 48 : 0,
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  color: '#A83131',
                  marginBottom: 20,
                  fontFamily: 'var(--font-noto-serif), serif',
                }}
              >
                {item.icon}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-noto-serif), serif',
                  fontSize: 19,
                  fontWeight: 700,
                  color: '#0D0D0D',
                  marginBottom: 12,
                  letterSpacing: '0.01em',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: '#4A4F5A',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quotes */}
      <section
        style={{
          backgroundColor: '#F7F8FA',
          borderTop: '1px solid #E2E5EA',
          borderBottom: '1px solid #E2E5EA',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '88px 24px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-noto-serif), serif',
              fontSize: 28,
              fontWeight: 700,
              color: '#0D0D0D',
              marginBottom: 56,
              letterSpacing: '-0.01em',
            }}
          >
            听校友自己说
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {quotes.map((q, i) => {
              const colors = schoolColors[q.school]
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E5EA',
                    borderRadius: 10,
                    padding: '28px 28px 28px 24px',
                    transition: 'border-color 150ms, background-color 150ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#C8CDD6'
                    el.style.backgroundColor = '#F7F8FA'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#E2E5EA'
                    el.style.backgroundColor = '#FFFFFF'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-noto-serif), serif',
                      fontSize: 15,
                      lineHeight: 1.85,
                      color: '#0D0D0D',
                      marginBottom: 20,
                    }}
                  >
                    「{q.text}」
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: colors.bg,
                        color: colors.fg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                        flexShrink: 0,
                      }}
                    >
                      {q.name.slice(0, 1)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0D0D0D',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                        }}
                      >
                        {q.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: colors.bg,
                            color: colors.fg,
                            padding: '1px 7px',
                            borderRadius: 6,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {q.school}
                        </span>
                        <span style={{ fontSize: 11, color: '#8A8F9A' }}>{q.dept}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3-step process */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '88px 24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontSize: 28,
            fontWeight: 700,
            color: '#0D0D0D',
            marginBottom: 56,
            letterSpacing: '-0.01em',
          }}
        >
          怎么开始
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 0,
            borderTop: '1px solid #E2E5EA',
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: '40px 40px 40px 0',
                borderBottom: '1px solid #E2E5EA',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-noto-serif), serif',
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#A83131',
                  marginBottom: 20,
                  lineHeight: 1,
                }}
              >
                {step.num}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-noto-serif), serif',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0D0D0D',
                  marginBottom: 12,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.9,
                  color: '#4A4F5A',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          backgroundColor: '#1F4388',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '88px 24px',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-noto-serif), serif',
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: '-0.01em',
            }}
          >
            有拿不准的事，就来问问四中校友
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: '#9BACC8',
              maxWidth: 480,
              margin: '0 auto 40px',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            他们已经走过一遍，愿意和你聊聊当时怎么想、怎么选。
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/ask"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1F4388',
                padding: '13px 28px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'background-color 150ms',
                display: 'inline-block',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0F2F5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              用学校邮箱加入
            </Link>
            <Link
              href="/feed"
              style={{
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#FFFFFF',
                padding: '13px 28px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                transition: 'border-color 150ms',
                display: 'inline-block',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)')
              }
              onMouseLeave={e =>
                (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')
              }
            >
              浏览校友分享
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E5EA',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 12, color: '#8A8F9A', letterSpacing: '0.04em' }}>
          M2M — 北京四中校友升学平台 · 仅供在校生使用
        </p>
      </footer>
    </div>
  )
}
