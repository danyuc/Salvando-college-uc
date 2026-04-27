import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase admin no configurado')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.user_id || !body?.subject) {
      return NextResponse.json(
        { success: false, message: 'Falta user_id o subject' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const payload = {
      user_id: body.user_id,
      subject: body.subject,
      completed: body.completed ?? true,
      score: Number(body.score ?? body.score_percent ?? 0),
      score_percent: Number(body.score_percent ?? body.score ?? 0),
      correct_answers: Number(body.correct_answers ?? 0),
      total_questions: Number(body.total_questions ?? 0),
      weak_topics: body.weak_topics ?? [],
      strong_topics: body.strong_topics ?? [],
      diagnostic_result: body.diagnostic_result ?? null,
      stage: body.stage ?? 'completed',
      completed_at: body.completed_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from('subject_diagnostics')
      .upsert(payload, { onConflict: 'user_id,subject' })
      .select('*')
      .single()

    if (error) {
      console.error('DIAGNOSTIC API UPSERT ERROR:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('DIAGNOSTIC API ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error guardando diagnóstico',
      },
      { status: 500 }
    )
  }
}
