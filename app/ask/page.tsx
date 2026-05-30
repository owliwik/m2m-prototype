'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { useRequireAuth } from '@/app/lib/auth'
import type { Database } from '@/app/lib/database.types'

type SchoolRow = Database['public']['Tables']['schools']['Row']
type AmbassadorRow = Database['public']['Tables']['ambassadors']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type AmbassadorWithRels = AmbassadorRow & { user: UserRow; school: SchoolRow }

type CommPref = '文字回复' | '视频或电话' | '微信'
type Duration = '15分钟' | '30分钟' | '不确定'
type Visibility = 'public' | 'private'
type Identity = 'anonymous' | 'real'

const commPrefs: CommPref[] = ['文字回复', '视频或电话', '微信']
const durations: Duration[] = ['15分钟', '30分钟', '不确定']
const needsDuration = (c: CommPref) => c !== '文字回复'

function schoolColor(s: Pick<SchoolRow, 'color_bg' | 'color_fg'> | null | undefined) {
  return {
    bg: s?.color_bg ?? '#EEF0F4',
    fg: s?.color_fg ?? '#4A4F5A',
  }
}

export default function AskPage() {
  return (
    <Suspense>
      <AskPageInner />
    </Suspense>
  )
}

function AskPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auth gate
  const { user, ready: authReady } = useRequireAuth()
  const userId = user?.id ?? null

  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  // Data
  const [schools, setSchools] = useState<SchoolRow[]>([])
  const [ambassadors, setAmbassadors] = useState<AmbassadorWithRels[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Submission
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1: question
  const [question, setQuestion] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [identity, setIdentity] = useState<Identity>('anonymous')

  // Step 2: target — selectedSchool holds a DB school id
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [selectedAmbassadors, setSelectedAmbassadors] = useState<Set<string>>(new Set())

  // Step 3: communication
  const [commPref, setCommPref] = useState<CommPref>('文字回复')
  const [duration, setDuration] = useState<Duration>('30分钟')

  // Load schools + ambassadors
  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    async function load() {
      const [schoolsRes, ambsRes] = await Promise.all([
        supabase.from('schools').select('*').order('name_zh'),
        supabase
          .from('ambassadors')
          .select('*, user:users!ambassadors_id_fkey(*), school:schools(*)'),
      ])
      if (cancelled) return
      if (schoolsRes.error || ambsRes.error) {
        setLoadError(schoolsRes.error?.message ?? ambsRes.error?.message ?? '加载失败')
        setLoading(false)
        return
      }
      setSchools((schoolsRes.data as unknown as SchoolRow[] | null) ?? [])
      setAmbassadors((ambsRes.data as unknown as AmbassadorWithRels[] | null) ?? [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [authReady])

  // Pre-fill from URL params once data is loaded.
  // Intentionally sets state in an effect because the URL params must be
  // matched against async-fetched ambassadors/schools.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (loading) return
    const schoolParam = searchParams.get('school')
    const ambParam = searchParams.get('ambassador')
    if (ambParam) {
      const found = ambassadors.find(a => a.id === ambParam)
      if (found) {
        setSelectedSchool(found.school_id)
        setSelectedAmbassadors(new Set([found.id]))
        return
      }
    }
    if (schoolParam) {
      const found = schools.find(s => s.id.toLowerCase() === schoolParam.toLowerCase())
      if (found) setSelectedSchool(found.id)
    }
  }, [loading, searchParams, ambassadors, schools])
  /* eslint-enable react-hooks/set-state-in-effect */

  const selectedSchoolObj = selectedSchool
    ? schools.find(s => s.id === selectedSchool) ?? null
    : null

  const filteredAmbassadors = selectedSchool
    ? ambassadors.filter(a => a.school_id === selectedSchool)
    : []

  const questionValid = question.length >= 30
  const step2Valid = selectedSchool !== null && selectedAmbassadors.size > 0

  const selectedAmbNames = ambassadors
    .filter(a => selectedAmbassadors.has(a.id))
    .map(a => a.user.name)

  function toggleAmbassador(id: string) {
    setSelectedAmbassadors(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit() {
    if (submitting) return
    if (!selectedSchool || selectedAmbassadors.size === 0) return
    if (!userId) {
      const search = typeof window !== 'undefined' ? window.location.search : ''
      router.push(`/login?redirect=${encodeURIComponent('/ask' + search)}`)
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setSubmitting(false)
      setSubmitError('会话已过期，请重新登录')
      return
    }

    const ambassadorIds = Array.from(selectedAmbassadors)
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        school_id: selectedSchool,
        question,
        comm_pref: commPref,
        duration: needsDuration(commPref) ? duration : null,
        ambassador_ids: ambassadorIds,
        is_anonymous: identity === 'anonymous',
        visibility,
      }),
    })

    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      setSubmitting(false)
      setSubmitError(payload?.error ?? '提交失败，请稍后重试')
      return
    }

    setSubmitting(false)
    setDone(true)
  }

  // ─── Done screen ───
  if (done) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ marginBottom: 32 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
              <circle cx="36" cy="36" r="35" stroke="#15803D" strokeWidth="2" fill="#F0FDF4" />
              <path d="M22 36L31 45L50 27" stroke="#15803D" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 28, fontWeight: 700, color: '#0D0D0D', marginBottom: 16, letterSpacing: '-0.01em' }}>
            收到了
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#4A4F5A', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 32 }}>
            收到了。我们会先看一遍，确认后转给 {selectedAmbNames.join('、')}。结果会发到你的邮箱。
          </p>
          <button
            onClick={() => { setDone(false); setStep(1); setQuestion(''); setSelectedAmbassadors(new Set()) }}
            style={{ border: '1px solid #1F4388', color: '#1F4388', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', backgroundColor: 'transparent', letterSpacing: '0.02em', fontFamily: 'var(--font-noto-sans), sans-serif', transition: 'background-color 150ms, color 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1F4388'; e.currentTarget.style.color = '#FFFFFF' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1F4388' }}
          >
            再提交一个问题
          </button>
        </div>
      </div>
    )
  }

  // ─── Loading / error ───
  if (loading || !authReady) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: 13, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', letterSpacing: '0.04em' }}>
          加载中…
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#7A2020', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 8 }}>
            加载失败
          </div>
          <div style={{ fontSize: 13, color: '#8C3A3A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
            {loadError}
          </div>
        </div>
      </div>
    )
  }

  // ─── Main form ───
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: 48 }}>
          {(['你想问什么', '你在问谁', '怎么沟通'] as const).map((label, i) => {
            const s = i + 1
            const isActive = step === s
            const isDone = step > s
            const isPending = step < s
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 80 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', border: '2px solid',
                    borderColor: isPending ? '#E2E5EA' : '#1F4388',
                    backgroundColor: isDone ? '#1F4388' : isActive ? '#FFFFFF' : '#EEF0F4',
                    color: isDone ? '#FFFFFF' : isActive ? '#1F4388' : '#B0B5C0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-noto-serif), serif',
                    transition: 'all 200ms', flexShrink: 0,
                  }}>
                    {isDone ? (
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 6.5L5 9.5L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : s}
                  </div>
                  <span style={{
                    marginTop: 8, fontSize: 11, fontFamily: 'var(--font-noto-sans), sans-serif',
                    letterSpacing: '0.04em', textAlign: 'center', whiteSpace: 'nowrap',
                    color: isActive ? '#1F4388' : isDone ? '#4A4F5A' : '#B0B5C0',
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ width: 48, height: 2, marginTop: 15, backgroundColor: step > s ? '#1F4388' : '#E2E5EA', transition: 'background-color 200ms', flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ═══ STEP 1: 你想问什么 ═══ */}
        {step === 1 && (
          <div key="step-1" className="step-enter">
            <h2 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 26, fontWeight: 700, color: '#0D0D0D', marginBottom: 8, letterSpacing: '-0.01em' }}>
              你想问什么？
            </h2>
            <p style={{ fontSize: 14, color: '#8A8F9A', marginBottom: 32, fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.6 }}>
              把你的问题写清楚，大使才能给出有针对性的回答。
            </p>

            {/* Question textarea */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 8, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                问题描述 <span style={{ color: '#A83131' }}>*</span>
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="例如：CMU SCS的申请文书应该侧重技术经历还是个人故事？"
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                  border: '1px solid #E2E5EA', borderRadius: 8, fontSize: 14, lineHeight: 1.7,
                  fontFamily: 'var(--font-noto-sans), sans-serif', color: '#0D0D0D',
                  resize: 'vertical', outline: 'none', transition: 'border-color 150ms',
                  backgroundColor: '#FAFBFC',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <span style={{
                  fontSize: 12, fontFamily: 'var(--font-noto-sans), sans-serif',
                  color: question.length >= 30 ? '#1F4388' : '#B0B5C0',
                  fontWeight: question.length >= 30 ? 500 : 400,
                  transition: 'color 200ms',
                }}>
                  {question.length} / 30
                </span>
              </div>
            </div>

            {/* Visibility */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 10, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                公开设置
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <RadioOption
                  selected={visibility === 'public'}
                  onClick={() => setVisibility('public')}
                  label="公开提问"
                  desc="所有登录用户可见，帮助更多同学"
                />
                <RadioOption
                  selected={visibility === 'private'}
                  onClick={() => setVisibility('private')}
                  label="私下提问"
                  desc="仅大使可见"
                />
              </div>
            </div>

            {/* Identity (only when public) */}
            {visibility === 'public' && (
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 10, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                  署名方式
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <PillOption selected={identity === 'anonymous'} onClick={() => setIdentity('anonymous')} label="匿名" />
                  <PillOption selected={identity === 'real'} onClick={() => setIdentity('real')} label="实名" />
                </div>
              </div>
            )}

            {/* Next */}
            <button
              disabled={!questionValid}
              onClick={() => setStep(2)}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, border: 'none',
                fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif',
                cursor: questionValid ? 'pointer' : 'default',
                backgroundColor: questionValid ? '#1F4388' : '#EEF0F4',
                color: questionValid ? '#FFFFFF' : '#B0B5C0',
                transition: 'background-color 150ms',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { if (questionValid) e.currentTarget.style.backgroundColor = '#183272' }}
              onMouseLeave={e => { if (questionValid) e.currentTarget.style.backgroundColor = '#1F4388' }}
            >
              下一步
            </button>
          </div>
        )}

        {/* ═══ STEP 2: 你在问谁 ═══ */}
        {step === 2 && (
          <div key="step-2" className="step-enter">
            <h2 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 26, fontWeight: 700, color: '#0D0D0D', marginBottom: 8, letterSpacing: '-0.01em' }}>
              你在问谁？
            </h2>

            {/* School identity badge or select fallback */}
            {selectedSchoolObj ? (
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  backgroundColor: schoolColor(selectedSchoolObj).bg,
                  borderRadius: 10, padding: '18px 20px',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                    backgroundColor: schoolColor(selectedSchoolObj).fg,
                    color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-noto-serif), serif',
                    fontSize: 24, fontWeight: 700,
                  }}>
                    {selectedSchoolObj.name_zh[0]}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.3, marginBottom: 3 }}>
                      {selectedSchoolObj.name_zh}
                    </div>
                    <div style={{ fontSize: 13, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                      {selectedSchoolObj.name_en}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 14, color: '#8A8F9A', marginBottom: 24, fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.6 }}>
                  选一所学校，再选择你想咨询的大使。
                </p>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 8, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                    目标院校 <span style={{ color: '#A83131' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedSchool ?? ''}
                      onChange={e => {
                        const val = e.target.value
                        setSelectedSchool(val || null)
                        setSelectedAmbassadors(new Set())
                      }}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E5EA',
                        fontSize: 14, fontFamily: 'var(--font-noto-sans), sans-serif', color: '#B0B5C0',
                        backgroundColor: '#FAFBFC', outline: 'none', appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A8F9A' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">选择学校…</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name_zh}{s.short_name ? `（${s.short_name}）` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Ambassador list */}
            {selectedSchool && (
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 10, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                  选择大使 <span style={{ color: '#A83131' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredAmbassadors.map(amb => {
                    const isSelected = selectedAmbassadors.has(amb.id)
                    const sc = schoolColor(amb.school)
                    const yearLabel = amb.grad_year != null ? `${amb.grad_year}届` : ''
                    const deptYear = [amb.dept, yearLabel].filter(Boolean).join(' · ')
                    return (
                      <div
                        key={amb.id}
                        onClick={() => toggleAmbassador(amb.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', borderRadius: 10,
                          border: `1px solid ${isSelected ? '#1F4388' : '#ECEEF2'}`,
                          backgroundColor: isSelected ? '#F5F8FD' : '#FFFFFF',
                          cursor: 'pointer', transition: 'all 150ms',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#C8CDD6' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#ECEEF2' }}
                      >
                        {/* Checkbox indicator */}
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `2px solid ${isSelected ? '#1F4388' : '#D0D4DC'}`,
                          backgroundColor: isSelected ? '#1F4388' : '#FFFFFF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 150ms',
                        }}>
                          {isSelected && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 3.5L3.5 6L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {/* Avatar */}
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                          backgroundColor: sc.bg, color: sc.fg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-noto-sans), sans-serif',
                        }}>
                          {amb.user.name[0]}
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 2 }}>
                            {amb.user.name}
                            {deptYear && (
                              <span style={{ fontSize: 12, fontWeight: 400, color: '#8A8F9A', marginLeft: 8 }}>
                                {deptYear}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#4A4F5A', fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.5 }}>
                            {amb.bio ?? ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                  fontFamily: 'var(--font-noto-sans), sans-serif', cursor: 'pointer',
                  backgroundColor: 'transparent', color: '#4A4F5A',
                  border: '1px solid #E2E5EA', transition: 'border-color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8CDD6')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E5EA')}
              >
                上一步
              </button>
              <button
                disabled={!step2Valid}
                onClick={() => setStep(3)}
                style={{
                  flex: 2, padding: '12px', borderRadius: 8, border: 'none',
                  fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif',
                  cursor: step2Valid ? 'pointer' : 'default',
                  backgroundColor: step2Valid ? '#1F4388' : '#EEF0F4',
                  color: step2Valid ? '#FFFFFF' : '#B0B5C0',
                  transition: 'background-color 150ms', letterSpacing: '0.02em',
                }}
                onMouseEnter={e => { if (step2Valid) e.currentTarget.style.backgroundColor = '#183272' }}
                onMouseLeave={e => { if (step2Valid) e.currentTarget.style.backgroundColor = '#1F4388' }}
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: 怎么沟通 ═══ */}
        {step === 3 && (
          <div key="step-3" className="step-enter">
            <h2 style={{ fontFamily: 'var(--font-noto-serif), serif', fontSize: 26, fontWeight: 700, color: '#0D0D0D', marginBottom: 8, letterSpacing: '-0.01em' }}>
              怎么沟通？
            </h2>
            <p style={{ fontSize: 14, color: '#8A8F9A', marginBottom: 32, fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.6 }}>
              选择你偏好的沟通方式，大使会根据情况安排。
            </p>

            {/* Communication preference */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 10, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                偏好沟通方式
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {commPrefs.map(c => (
                  <PillOption key={c} selected={commPref === c} onClick={() => setCommPref(c)} label={c} />
                ))}
              </div>
            </div>

            {/* Duration (only for non-text) */}
            {needsDuration(commPref) && (
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0D0D0D', marginBottom: 10, fontFamily: 'var(--font-noto-sans), sans-serif' }}>
                  预计时长
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {durations.map(d => (
                    <PillOption key={d} selected={duration === d} onClick={() => setDuration(d)} label={d} />
                  ))}
                </div>
              </div>
            )}

            {/* Summary card */}
            <div style={{
              backgroundColor: '#F7F8FA', border: '1px solid #ECEEF2', borderRadius: 10,
              padding: '16px 20px', marginBottom: 28,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#B0B5C0', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 10 }}>
                提问摘要
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SummaryRow label="问题" value={question.length > 40 ? question.slice(0, 40) + '…' : question} />
                <SummaryRow label="大使" value={selectedAmbNames.join('、')} />
                <SummaryRow label="学校" value={selectedSchoolObj?.name_zh ?? ''} />
                <SummaryRow label="方式" value={commPref + (needsDuration(commPref) ? ` · ${duration}` : '')} />
              </div>
            </div>

            {/* Error display */}
            {submitError && (
              <div
                style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  border: '1px solid #E8C8C8',
                  borderRadius: 8,
                  backgroundColor: '#FAE8E8',
                  fontSize: 13,
                  color: '#7A2020',
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  lineHeight: 1.5,
                }}
              >
                {submitError}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(2)}
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                  fontFamily: 'var(--font-noto-sans), sans-serif',
                  cursor: submitting ? 'default' : 'pointer',
                  backgroundColor: 'transparent', color: '#4A4F5A',
                  border: '1px solid #E2E5EA', transition: 'border-color 150ms',
                  opacity: submitting ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.borderColor = '#C8CDD6' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.borderColor = '#E2E5EA' }}
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2, padding: '12px', borderRadius: 8, border: 'none',
                  fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-noto-sans), sans-serif',
                  cursor: submitting ? 'default' : 'pointer',
                  backgroundColor: submitting ? '#8A9AC4' : '#1F4388',
                  color: '#FFFFFF',
                  transition: 'background-color 150ms', letterSpacing: '0.02em',
                }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#183272' }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#1F4388' }}
              >
                {submitting ? '提交中…' : '提交问题'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

/* ─── Shared components ─── */

function RadioOption({ selected, onClick, label, desc }: { selected: boolean; onClick: () => void; label: string; desc: string }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
        border: `1px solid ${selected ? '#1F4388' : '#ECEEF2'}`,
        backgroundColor: selected ? '#F5F8FD' : '#FFFFFF',
        transition: 'all 150ms',
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = '#C8CDD6' }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = '#ECEEF2' }}
    >
      {/* Radio circle */}
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        border: `2px solid ${selected ? '#1F4388' : '#D0D4DC'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 150ms',
      }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1F4388' }} />}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  )
}

function PillOption({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
        fontFamily: 'var(--font-noto-sans), sans-serif', cursor: 'pointer',
        border: `1px solid ${selected ? '#1F4388' : '#E2E5EA'}`,
        backgroundColor: selected ? '#E8F0FC' : '#FFFFFF',
        color: selected ? '#1F4388' : '#4A4F5A',
        transition: 'all 150ms',
      }}
    >
      {label}
    </button>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 12, color: '#8A8F9A', fontFamily: 'var(--font-noto-sans), sans-serif', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#0D0D0D', fontFamily: 'var(--font-noto-sans), sans-serif', textAlign: 'right', maxWidth: '70%' }}>
        {value}
      </span>
    </div>
  )
}
