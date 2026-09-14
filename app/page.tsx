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
    title: '来自同一个地方',
    body: '这里的每一条内容都来自四中校友。他们了解这所学校的节奏，知道你在哪个位置，说的话不需要打折扣。',
  },
  {
    icon: '◇',
    title: '没有要卖给你的东西',
    body: '大使是自愿在这里分享的校友，不卖课，不卖服务。他们在这里只是因为曾经希望有人告诉过自己这些。',
  },
  {
    icon: '△',
    title: '只在四中内部',
    body: '用学校邮箱验证，内容不对外公开。这里说的话留在自己人之间。',
  },
]

const steps = [
  { num: '01', title: '用学校邮箱进来', body: '用 @bhsfic.com 邮箱验证身份，这是唯一的门槛。' },
  { num: '02', title: '看看校友留下的东西', body: '读他们写的，或者找一个你想直接聊的人。' },
  { num: '03', title: '提交你的问题', body: '我们来协调安排，不需要你自己去找人打招呼。' },
]

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#0D0D0D' }}>
      {/* Hero */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '96px 24px 80px',
          textAlign: 'center',
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
          你想知道的，刚好有人经历过
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
          M2M 是四中自己的地方。校友在这里留下他们真实经历过的，在校生来这里读、来这里问。没有商业利益，没有标准答案，只有同一所学校走出去的人彼此说的话。
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
          为什么选择 M2M？
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
            大使说
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
          如何开始
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
            这里的人曾经和你站在同一个位置
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
            现在他们在另一边，愿意回头说说。
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
              href="/ambassadors"
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
              浏览大使
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
