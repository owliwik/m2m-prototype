import { NextRequest, NextResponse } from 'next/server'
import { admin, getAuthedUser } from '@/app/lib/serverSupabase'

export async function GET(req: NextRequest) {
  const authed = await getAuthedUser(req)
  if (!authed.user) return NextResponse.json({ error: authed.error }, { status: authed.status })

  const { data, error } = await admin.from('requests')
    .select('id, created_at, question, is_anonymous, school:schools(name_zh), student:users!requests_student_id_fkey(name)')
    .eq('status', 'approved')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const questions = (data ?? []).map(r => {
    const student = Array.isArray(r.student) ? r.student[0] : r.student
    const school = Array.isArray(r.school) ? r.school[0] : r.school
    return {
      id: r.id,
      created_at: r.created_at,
      question: r.question,
      student_name: r.is_anonymous ? '匿名同学' : (student?.name ?? '一位同学'),
      school_name: school?.name_zh ?? '学校',
    }
  })
  return NextResponse.json({ questions }, { headers: { 'Cache-Control': 'private, no-store' } })
}
