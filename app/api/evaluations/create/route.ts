import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const payload = {
      user_id: body.user_id,
      subject: String(body.subject || '').trim(),

      type: String(body.type || '').toLowerCase(),
      title: body.title || null,
      topic: body.topic || null,

      // 🔥 CONTROL FIX
      weight_percent:
        body.type === 'control'
          ? Number(body.weight_percent || 1) // cada control 1%
          : Number(body.weight_percent || 0),

      grade: body.grade ? Number(body.grade) : null,

      start_date: body.start_date || null,
      end_date: body.end_date || body.start_date || null,
    }

    console.log("📦 PAYLOAD FINAL:", payload)

    const { data, error } = await supabase
      .from('evaluations')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error("❌ SUPABASE:", error)
      return NextResponse.json({ success: false, message: error.message })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : 'error'
    })
  }
}
