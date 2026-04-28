import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase admin no configurado')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.user_id || !body?.subject || !body?.type) {
      return NextResponse.json(
        { success: false, message: 'Falta user_id, subject o type' },
        { status: 400 }
      )
    }

    const payload = {
      user_id: body.user_id,
      subject: String(body.subject).trim(),
      type: String(body.type).trim(),
      number: body.number ?? null,
      topic: body.topic ?? null,
      title: body.title ?? null,
      start_date: body.start_date ?? body.date ?? null,
      end_date: body.end_date ?? body.start_date ?? body.date ?? null,
      difficulty: body.difficulty ?? 'media',
      notes: body.notes ?? null,
      weight_percent:
        body.weight_percent === undefined || body.weight_percent === null
          ? null
          : Number(body.weight_percent),
      grade:
        body.grade === undefined || body.grade === null
          ? null
          : Number(body.grade),
    }

    const { data, error } = await getSupabaseAdmin()
      .from('evaluations')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error('EVALUATION API CREATE ERROR:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error guardando evaluación',
      },
      { status: 500 }
    )
  }
}
