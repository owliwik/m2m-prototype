import { NextRequest, NextResponse } from 'next/server'
import { admin, requireAdmin } from '@/app/lib/serverSupabase'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: requestId } = await ctx.params

  const gate = await requireAdmin(req)
  if (!gate.user) {
    return NextResponse.json({ error: gate.error }, { status: gate.status })
  }

  const { data: existing, error: selErr } = await admin
    .from('requests')
    .select('status')
    .eq('id', requestId)
    .maybeSingle()

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: '请求不存在' }, { status: 404 })
  }
  if (existing.status !== 'pending') {
    return NextResponse.json(
      { error: `当前状态 ${existing.status}，无法重复审核` },
      { status: 409 },
    )
  }

  const { error: updErr } = await admin
    .from('requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
