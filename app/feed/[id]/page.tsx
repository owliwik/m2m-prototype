'use client'

import Link from 'next/link'
import { schoolColors, contentTypeColors } from '../../data'

export default function ArticlePage() {
  const schoolColor = schoolColors['CMU']
  const typeColor = contentTypeColors['申请文书']

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        {/* Back link */}
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/feed"
            style={{
              fontSize: 14,
              color: '#A83131',
              textDecoration: 'none',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              letterSpacing: '0.01em',
              transition: 'color 150ms',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
          >
            ← 返回内容
          </Link>
        </div>

        {/* Top metadata badges */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: schoolColor.bg,
              color: schoolColor.fg,
              padding: '3px 10px',
              borderRadius: 6,
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            CMU
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: typeColor.bg,
              color: typeColor.fg,
              padding: '3px 10px',
              borderRadius: 6,
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            申请文书
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-noto-serif), serif',
            fontSize: 38,
            fontWeight: 700,
            lineHeight: 1.25,
            color: '#0D0D0D',
            marginBottom: 28,
            letterSpacing: '-0.01em',
          }}
        >
          从四中到CMU SCS：我的文书到底写了什么
        </h1>

        {/* Author row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: schoolColor.bg,
              color: schoolColor.fg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'var(--font-noto-sans), sans-serif',
              flexShrink: 0,
            }}
          >
            张
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 2,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#0D0D0D',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                张明远
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: schoolColor.bg,
                  color: schoolColor.fg,
                  padding: '1px 7px',
                  borderRadius: 6,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                CMU
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#8A8F9A',
                fontFamily: 'var(--font-noto-sans), sans-serif',
              }}
            >
              3天前 · 1,200次浏览
            </div>
          </div>
        </div>

        {/* Thin rule */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #E2E5EA',
            marginBottom: 40,
          }}
        />

        {/* Article body */}
        <div
          style={{
            fontFamily: 'var(--font-noto-sans), sans-serif',
            fontSize: 17,
            lineHeight: 1.85,
            color: '#0D0D0D',
          }}
        >
          <p style={{ marginBottom: '1.5em' }}>
            这篇文章是我在拿到CMU SCS录取通知后写的。整个申请季历时将近一年，期间我反复修改文书，模拟面试，熬过了无数个不确定的夜晚。现在回过头来看，有些事情我很庆幸当时做了，也有些事情让我至今懊悔。
          </p>

          <p style={{ marginBottom: '1.5em' }}>
            我最开始在写Common App主文书的时候，陷入了一个很常见的误区：试图把自己包装成一个"全面发展的精英学生"。我列了一堆课外活动，写了标准化成绩，强调自己的领导力。结果文书读起来像一份简历，而不像一个真实的人在说话。后来在一次和学长的交流中，他直接告诉我：'你在四中做过什么不重要，你为什么做才重要。' 这句话让我重新理解了文书的本质。
          </p>

          <p style={{ marginBottom: '1.5em' }}>
            CMU SCS的申请其实比很多人想象的更看重人，而不只是代码。我的主文书最终写的是我从小在外婆家翻到一本破旧的《数学趣题》，到后来在信息竞赛备赛中发现自己真正热爱的不是竞赛成绩，而是用程序解决真实问题的那种满足感。这条线索贯穿了我整个申请季，也是我认为CMU最终决定要我的关键原因之一。
          </p>

          <p style={{ marginBottom: '1.5em' }}>
            关于选校策略：如果你正在纠结CMU和其他顶级CS项目，我的建议是认真看一下每个项目的培养方向。CMU的SCS非常工业化，毕业生去大厂的比例极高，学术研究氛围相对弱一些。如果你的目标是PhD或研究型职业，Cornell或普林斯顿可能更适合你。但如果你想快速进入工业界，CMU几乎是不二之选——学校和大厂的pipeline极其成熟。
          </p>
        </div>

        {/* Bottom rule and footer */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #E2E5EA',
            marginTop: 56,
            marginBottom: 32,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#0D0D0D',
              fontFamily: 'var(--font-noto-sans), sans-serif',
            }}
          >
            更多内容
          </span>
          <Link
            href="/feed"
            style={{
              fontSize: 14,
              color: '#A83131',
              textDecoration: 'none',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              fontWeight: 500,
              letterSpacing: '0.01em',
              transition: 'color 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
          >
            ← 返回内容列表
          </Link>
        </div>
      </div>
    </div>
  )
}
