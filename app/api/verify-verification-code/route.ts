import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type VerifyRow = {
  success: boolean
  message: string
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    const userId = String(body?.userId ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const code = String(body?.code ?? '').trim()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Falta el userId' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Falta el correo' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Falta el código' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin.rpc(
      'verify_institutional_email_code',
      {
        p_user_id: userId,
        p_email: email,
        p_code: code,
      }
    )

    if (error) {
      console.error('VERIFY RPC ERROR:', error)
      return NextResponse.json(
        {
          success: false,
          message: error.message || 'Error verificando código',
        },
        { status: 500 }
      )
    }

    const row = (data?.[0] ?? null) as VerifyRow | null

    if (!row) {
      return NextResponse.json(
        {
          success: false,
          message: 'La verificación no devolvió respuesta',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(row, {
      status: row.success ? 200 : 400,
    })
  } catch (error) {
    console.error('VERIFY ROUTE ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error interno verificando código',
      },
      { status: 500 }
    )
  }
}