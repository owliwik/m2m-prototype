'use client'

import { useState } from 'react'
import { ambassadors, schoolColors, type Ambassador, type SchoolKey } from '../data'

type CommPref = '文字回复' | '视频通话' | '电话'
type Duration = '15分钟' | '30分钟' | '不确定'

const commPrefs: CommPref[] = ['文字回复', '视频通话', '电话']
const durations: Duration[] = ['15分钟', '30分钟', '不确定']

const defaultAmbassador = ambassadors[0]

const schoolInfo: Record<SchoolKey, { zh: string; en: string; desc: string }> = {
  CMU:      { zh: '卡内基梅隆大学', en: 'Carnegie Mellon University',    desc: '宾夕法尼亚州匹兹堡 · 私立研究型大学' },
  Duke:     { zh: '杜克大学',       en: 'Duke University',               desc: '北卡罗来纳州达勒姆 · 私立研究型大学' },
  Penn:     { zh: '宾夕法尼亚大学', en: 'University of Pennsylvania',    desc: '宾夕法尼亚州费城 · 私立常青藤大学'   },
  Cornell:  { zh: '康奈尔大学',     en: 'Cornell University',            desc: '纽约州伊萨卡 · 私立常青藤大学'       },
  NYU:      { zh: '纽约大学',       en: 'New York University',           desc: '纽约州纽约市 · 私立研究型大学'       },
  Columbia: { zh: '哥伦比亚大学',   en: 'Columbia University in the City of New York', desc: '纽约州纽约市 · 私立常青藤大学' },
}

const schoolOrder: SchoolKey[] = ['CMU', 'Duke', 'Penn', 'Cornell', 'NYU', 'Columbia']

export default function AskPage() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  // Step 1
  const [selectedSchool, setSelectedSchool] = useState(defaultAmbassador.school)
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador>(defaultAmbassador)

  // Step 2
  const [question, setQuestion] = useState('')
  const [commPref, setCommPref] = useState<CommPref>('文字回复')
  const [duration, setDuration] = useState<Duration>('30分钟')

  const [schoolIndex, setSchoolIndex] = useState(0)
  const filteredAmbassadors = ambassadors.filter(a => a.school === selectedSchool)

  // Auth modal
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regCodeSent, setRegCodeSent] = useState(false)
  const [regCode, setRegCode] = useState('')

  function cycleSchool() {
    const nextIndex = (schoolIndex + 1) % schoolOrder.length
    const nextSchool = schoolOrder[nextIndex]
    setSchoolIndex(nextIndex)
    setSelectedSchool(nextSchool)
    const first = ambassadors.find(a => a.school === nextSchool)
    if (first) setSelectedAmbassador(first)
  }

  const questionValid = question.length >= 50

  if (done) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {/* Green checkmark SVG */}
          <div style={{ marginBottom: 32 }}>
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
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-noto-serif), serif',
              fontSize: 28,
              fontWeight: 700,
              color: '#0D0D0D',
              marginBottom: 16,
              letterSpacing: '-0.01em',
            }}
          >
            收到了
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: '#4A4F5A',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              marginBottom: 32,
            }}
          >
            已经收到了。我们会看一遍，然后帮你联系 {selectedAmbassador.name} 安排时间。留意你的邮箱。
          </p>
          <button
            onClick={() => {
              setDone(false)
              setStep(1)
              setQuestion('')
            }}
            style={{
              border: '1px solid #1F4388',
              color: '#1F4388',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              letterSpacing: '0.02em',
              fontFamily: 'var(--font-noto-sans), sans-serif',
              transition: 'background-color 150ms, color 150ms',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = '#1F4388'
              el.style.color = '#FFFFFF'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.backgroundColor = 'transparent'
              el.style.color = '#1F4388'
            }}
          >
            再提交一个问题
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px 24px 80px' }}>
        {/* Step indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginBottom: 48,
          }}
        >
          {(['选择对象', '写问题', '提交'] as const).map((label, i) => {
            const s = i + 1
            const isActive = step === s
            const isDone = step > s
            const isPending = step < s
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* Step column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 72 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: isPending ? '#E2E5EA' : '#1F4388',
                      backgroundColor: isDone ? '#1F4388' : isActive ? '#FFFFFF' : '#EEF0F4',
                      color: isDone ? '#FFFFFF' : isActive ? '#1F4388' : '#B0B5C0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: 'var(--font-noto-serif), serif',
                      transition: 'all 200ms',
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 6.5L5 9.5L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : s}
                  </div>
                  <span
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      fontFamily: 'var(--font-noto-sans), sans-serif',
                      letterSpacing: '0.04em',
                      color: isActive ? '#1F4388' : isDone ? '#4A4F5A' : '#B0B5C0',
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                </div>
                {/* Connector line — vertically centered to circle */}
                {i < 2 && (
                  <div
                    style={{
                      width: 48,
                      height: 2,
                      marginTop: 15,
                      backgroundColor: step > s ? '#1F4388' : '#E2E5EA',
                      transition: 'background-color 200ms',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div key="step-1" className="step-enter">
            <h2
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 26,
                fontWeight: 700,
                color: '#0D0D0D',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}
            >
              你想和谁聊？
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#8A8F9A',
                marginBottom: 32,
                fontFamily: 'var(--font-noto-sans), sans-serif',
                lineHeight: 1.6,
              }}
            >
              选一所你关注的学校，再选一位你想聊的大使。
            </p>

            {/* School card */}
            {(() => {
              const sc = schoolColors[selectedSchool]
              const info = schoolInfo[selectedSchool]
              return (
                <div
                  style={{
                    backgroundColor: '#F7F8FA',
                    border: '1px solid #E2E5EA',
                    borderRadius: 10,
                    marginBottom: 16,
                    overflow: 'hidden',
                  }}
                >
                  {/* Label */}
                  <div style={{ padding: '14px 20px 0' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#8A8F9A',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                      }}
                    >
                      目标院校
                    </span>
                  </div>

                  {/* Content row */}
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 20px' }}>
                    {/* Square logo */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        backgroundColor: sc.bg,
                        color: sc.fg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 700,
                        fontFamily: 'var(--font-noto-serif), serif',
                        flexShrink: 0,
                        border: `1px solid ${sc.fg}22`,
                      }}
                    >
                      {selectedSchool.slice(0, 1)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 500,
                          color: '#0D0D0D',
                          fontFamily: 'var(--font-noto-serif), serif',
                          marginBottom: 3,
                        }}
                      >
                        {info.zh}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#8A8F9A',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                          marginBottom: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {info.en}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#B0B5C0',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                        }}
                      >
                        {info.desc}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #E2E5EA',
                      padding: '10px 20px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      onClick={cycleSchool}
                      style={{
                        fontSize: 13,
                        color: '#A83131',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                        padding: 0,
                        transition: 'color 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
                    >
                      换一所院校
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Ambassador card */}
            {(() => {
              const amb = selectedAmbassador
              const sc = schoolColors[amb.school]
              function cycleAmbassador() {
                const idx = filteredAmbassadors.findIndex(a => a.id === amb.id)
                const next = filteredAmbassadors[(idx + 1) % filteredAmbassadors.length]
                setSelectedAmbassador(next)
              }
              return (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E5EA',
                    borderRadius: 10,
                    marginBottom: 40,
                    overflow: 'hidden',
                  }}
                >
                  {/* Label */}
                  <div style={{ padding: '14px 20px 0' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#8A8F9A',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                      }}
                    >
                      大使
                    </span>
                  </div>

                  {/* Content row */}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 20px' }}>
                    {/* Circular avatar */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: sc.bg,
                        color: sc.fg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                        flexShrink: 0,
                      }}
                    >
                      {amb.name.slice(0, 1)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: '#0D0D0D',
                            fontFamily: 'var(--font-noto-serif), serif',
                          }}
                        >
                          {amb.name}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: sc.bg,
                            color: sc.fg,
                            padding: '1px 7px',
                            borderRadius: 6,
                            letterSpacing: '0.04em',
                            fontFamily: 'var(--font-noto-sans), sans-serif',
                          }}
                        >
                          {amb.school}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#8A8F9A',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                          marginBottom: 4,
                        }}
                      >
                        {amb.dept} · {amb.year}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#4A4F5A',
                          fontFamily: 'var(--font-noto-sans), sans-serif',
                        }}
                      >
                        {amb.bio}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #E2E5EA',
                      padding: '10px 20px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      onClick={cycleAmbassador}
                      style={{
                        fontSize: 13,
                        color: '#A83131',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-noto-sans), sans-serif',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                        padding: 0,
                        transition: 'color 150ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#7A1F1F')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#A83131')}
                    >
                      换一位大使
                    </button>
                  </div>
                </div>
              )
            })()}

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                backgroundColor: '#1F4388',
                color: '#FFFFFF',
                padding: '14px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
            >
              下一步：写下你的问题
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div key="step-2" className="step-enter">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: '1px solid #A83131',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#A83131',
                  fontSize: 13,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  padding: '6px 14px',
                }}
              >
                ← 返回
              </button>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 26,
                fontWeight: 700,
                color: '#0D0D0D',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}
            >
              你想聊什么？
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#8A8F9A',
                marginBottom: 32,
                fontFamily: 'var(--font-noto-sans), sans-serif',
                lineHeight: 1.6,
              }}
            >
              写给 {selectedAmbassador.name}。说得越具体，对方越能给出真正有用的东西。
            </p>

            {/* Textarea */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="例如：我想申请 CMU SCS，目前有两段科研经历但没有实习，文书应该侧重写什么方向？"
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 14,
                    lineHeight: 1.8,
                    fontFamily: 'var(--font-noto-sans), sans-serif',
                    border: '1px solid',
                    borderRadius: 8,
                    borderColor: questionValid ? '#15803D' : '#E2E5EA',
                    backgroundColor: '#FFFFFF',
                    color: '#0D0D0D',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 150ms',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    right: 14,
                    fontSize: 11,
                    color: questionValid ? '#A83131' : '#8A8F9A',
                    fontFamily: 'var(--font-noto-sans), sans-serif',
                    transition: 'color 150ms',
                  }}
                >
                  {question.length} / 50+
                </div>
              </div>
              {!questionValid && question.length > 0 && (
                <p
                  style={{
                    fontSize: 12,
                    color: '#8A8F9A',
                    marginTop: 6,
                    fontFamily: 'var(--font-noto-sans), sans-serif',
                  }}
                >
                  请至少输入 50 个字，让大使更好地理解你的问题（还差 {50 - question.length} 个字）
                </p>
              )}
            </div>

            {/* Communication preference */}
            <div style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0D0D0D',
                  marginBottom: 12,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                回复方式偏好
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {commPrefs.map(pref => (
                  <button
                    key={pref}
                    onClick={() => setCommPref(pref)}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'var(--font-noto-sans), sans-serif',
                      border: '1px solid',
                      borderRadius: 6,
                      borderColor: commPref === pref ? '#1F4388' : '#E2E5EA',
                      backgroundColor: commPref === pref ? '#1F4388' : 'transparent',
                      color: commPref === pref ? '#FFFFFF' : '#4A4F5A',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: 40 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0D0D0D',
                  marginBottom: 12,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                }}
              >
                期望交流时长
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {durations.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily: 'var(--font-noto-sans), sans-serif',
                      border: '1px solid',
                      borderRadius: 6,
                      borderColor: duration === d ? '#1F4388' : '#E2E5EA',
                      backgroundColor: duration === d ? '#1F4388' : 'transparent',
                      color: duration === d ? '#FFFFFF' : '#4A4F5A',
                      cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { if (questionValid) { setStep(3); setShowLoginModal(true) } }}
              disabled={!questionValid}
              style={{
                width: '100%',
                backgroundColor: questionValid ? '#1F4388' : '#EEF0F4',
                color: questionValid ? '#FFFFFF' : '#B0B5C0',
                padding: '14px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                border: 'none',
                cursor: questionValid ? 'pointer' : 'not-allowed',
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => {
                if (questionValid) e.currentTarget.style.backgroundColor = '#183272'
              }}
              onMouseLeave={e => {
                if (questionValid) e.currentTarget.style.backgroundColor = '#1F4388'
              }}
            >
              下一步：验证邮箱
            </button>
          </div>
        )}

        {/* STEP 3 — summary, modal handles auth */}
        {step === 3 && (
          <div key="step-3" className="step-enter">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => { setStep(2); setShowLoginModal(false) }}
                style={{
                  background: 'none',
                  border: '1px solid #A83131',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#A83131',
                  fontSize: 13,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  padding: '6px 14px',
                }}
              >
                ← 返回
              </button>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-noto-serif), serif',
                fontSize: 26,
                fontWeight: 700,
                color: '#0D0D0D',
                marginBottom: 8,
                letterSpacing: '-0.01em',
              }}
            >
              确认提交
            </h2>
            <p
              style={{
                fontSize: 14,
                color: '#8A8F9A',
                marginBottom: 32,
                fontFamily: 'var(--font-noto-sans), sans-serif',
                lineHeight: 1.6,
              }}
            >
              请确认你的提问内容，然后登录或注册以提交。
            </p>

            {/* Summary card */}
            <div
              style={{
                backgroundColor: '#F7F8FA',
                border: '1px solid #E2E5EA',
                borderRadius: 10,
                padding: '20px 24px',
                marginBottom: 24,
              }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {(() => {
                  const sc = schoolColors[selectedSchool]
                  return (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: sc.bg, color: sc.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-noto-sans), sans-serif', flexShrink: 0 }}>
                        {selectedSchool.slice(0, 1)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                        {schoolInfo[selectedSchool].zh}
                      </span>
                    </div>
                  )
                })()}
                <span style={{ fontSize: 13, color: '#B0B5C0', fontFamily: 'var(--font-noto-sans), sans-serif', marginLeft: 8, display: 'flex', alignItems: 'center' }}>·</span>
                {(() => {
                  const sc = schoolColors[selectedAmbassador.school]
                  return (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: sc.bg, color: sc.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-noto-sans), sans-serif', flexShrink: 0 }}>
                        {selectedAmbassador.name.slice(0, 1)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                        {selectedAmbassador.name}
                      </span>
                    </div>
                  )
                })()}
              </div>
              <p style={{ fontSize: 13, color: '#4A4F5A', fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.7, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {question || '（问题内容为空）'}
              </p>
            </div>

            {/* Login CTA */}
            <button
              onClick={() => setShowLoginModal(true)}
              style={{
                width: '100%',
                backgroundColor: '#1F4388',
                color: '#FFFFFF',
                padding: '14px',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                transition: 'background-color 150ms',
                marginBottom: 12,
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#183272' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1F4388' }}
            >
              登录 / 注册以提交问题
            </button>

            <p
              style={{
                fontSize: 11,
                color: '#8A8F9A',
                textAlign: 'center',
                fontFamily: 'var(--font-noto-sans), sans-serif',
                lineHeight: 1.6,
              }}
            >
              需要四中学校邮箱（@bhsfic.com）验证身份
            </p>
          </div>
        )}
      </div>

      {/* Login / Register Modal */}
      {showLoginModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLoginModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13,13,13,0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              width: '100%',
              maxWidth: 380,
              boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 1px 3px rgba(0,0,0,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Wordmark + close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 22px 0' }}>
              <span style={{ fontFamily: 'var(--font-noto-serif), serif', fontWeight: 700, fontSize: 14, color: '#1F4388', letterSpacing: '0.05em' }}>
                M2M
              </span>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8CDD6', fontSize: 20, lineHeight: 1, padding: '2px 4px', display: 'flex', alignItems: 'center', transition: 'color 150ms' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#4A4F5A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#C8CDD6')}
              >
                ×
              </button>
            </div>

            {/* Animated form area — key triggers re-enter animation on mode switch */}
            <div
              key={loginTab}
              className="step-enter"
              style={{ padding: '20px 22px 24px' }}
            >
              {loginTab === 'login' ? (
                <>
                  {/* Login heading */}
                  <h3 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 18, fontWeight: 700, color: '#0D0D0D', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    登录账号
                  </h3>
                  <p style={{ fontSize: 12, color: '#8A8F9A', margin: '0 0 20px', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                    使用四中学生邮箱登录
                  </p>

                  {/* Email */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A4F5A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                      学校邮箱
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="yourname@bhsfic.com"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-noto-sans), sans-serif', border: '1px solid #E2E5EA', borderRadius: 8, color: '#0D0D0D', outline: 'none', transition: 'border-color 150ms', backgroundColor: '#FFFFFF' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#1F4388')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A4F5A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                      密码
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="输入密码"
                      style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-noto-sans), sans-serif', border: '1px solid #E2E5EA', borderRadius: 8, color: '#0D0D0D', outline: 'none', transition: 'border-color 150ms', backgroundColor: '#FFFFFF' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#1F4388')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
                    />
                  </div>

                  {/* Login button */}
                  <button
                    onClick={() => { setShowLoginModal(false); setDone(true) }}
                    style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif', border: 'none', borderRadius: 8, backgroundColor: '#1F4388', color: '#FFFFFF', cursor: 'pointer', transition: 'background-color 150ms', letterSpacing: '0.01em' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
                  >
                    登录
                  </button>

                  {/* Switch to register */}
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8F9A', margin: '16px 0 0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                    还没有账号？{' '}
                    <button
                      onClick={() => { setLoginTab('register'); setRegCodeSent(false); setRegEmail(''); setRegCode('') }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F4388', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      立即注册
                    </button>
                  </p>
                </>
              ) : (
                <>
                  {/* Register heading */}
                  <h3 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 18, fontWeight: 700, color: '#0D0D0D', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                    {regCodeSent ? '输入验证码' : '创建账号'}
                  </h3>
                  <p style={{ fontSize: 12, color: '#8A8F9A', margin: '0 0 20px', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                    {regCodeSent ? `验证码已发送至 ${regEmail}` : '使用四中学生邮箱注册'}
                  </p>

                  {/* Step 1: email only */}
                  {!regCodeSent && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A4F5A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                          学校邮箱
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="yourname@bhsfic.com"
                          style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-noto-sans), sans-serif', border: '1px solid #E2E5EA', borderRadius: 8, color: '#0D0D0D', outline: 'none', transition: 'border-color 150ms', backgroundColor: '#FFFFFF' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#1F4388')}
                          onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
                        />
                        {regEmail.length > 0 && !regEmail.endsWith('@bhsfic.com') && (
                          <p style={{ fontSize: 11, color: '#A83131', margin: '5px 0 0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                            请使用 @bhsfic.com 邮箱
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => { if (regEmail.endsWith('@bhsfic.com')) setRegCodeSent(true) }}
                        style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif', border: 'none', borderRadius: 8, backgroundColor: '#1F4388', color: '#FFFFFF', cursor: 'pointer', transition: 'background-color 150ms', letterSpacing: '0.01em', marginBottom: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
                      >
                        发送验证码
                      </button>
                    </>
                  )}

                  {/* Step 2: readonly email + code input */}
                  {regCodeSent && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A4F5A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                          学校邮箱
                        </label>
                        <input
                          type="email"
                          value={regEmail}
                          readOnly
                          style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-noto-sans), sans-serif', border: '1px solid #E2E5EA', borderRadius: 8, color: '#8A8F9A', outline: 'none', backgroundColor: '#F7F8FA', cursor: 'default' }}
                        />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#4A4F5A', marginBottom: 6, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                          验证码
                        </label>
                        <input
                          type="text"
                          value={regCode}
                          onChange={e => setRegCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="请输入6位验证码"
                          maxLength={6}
                          style={{ width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-noto-sans), sans-serif', border: '1px solid #E2E5EA', borderRadius: 8, color: '#0D0D0D', outline: 'none', letterSpacing: '0.18em', transition: 'border-color 150ms', backgroundColor: '#FFFFFF' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#1F4388')}
                          onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
                        />
                      </div>
                      <button
                        onClick={() => { setShowLoginModal(false); setDone(true) }}
                        style={{ width: '100%', padding: '11px', fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif', border: 'none', borderRadius: 8, backgroundColor: '#1F4388', color: '#FFFFFF', cursor: 'pointer', transition: 'background-color 150ms', letterSpacing: '0.01em' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#183272')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1F4388')}
                      >
                        验证并创建账号
                      </button>
                      <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8F9A', margin: '12px 0 0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                        没收到？{' '}
                        <button
                          onClick={() => setRegCodeSent(false)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F4388', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
                        >
                          重新发送
                        </button>
                      </p>
                    </>
                  )}

                  {/* Switch to login */}
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#8A8F9A', margin: '16px 0 0', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                    已有账号？{' '}
                    <button
                      onClick={() => setLoginTab('login')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1F4388', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
                    >
                      登录
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
