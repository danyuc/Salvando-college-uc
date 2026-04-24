import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

type CreateCodeRow = {
  success: boolean
  code: string
  expires_at: string
  message: string
}

function getResend() {
  const key = process.env.RESEND_API_KEY

  if (!key) {
    throw new Error('RESEND_API_KEY no configurada')
  }

  return new Resend(key)
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase no configurado correctamente')
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function getFromEmail() {
  const from = process.env.RESEND_FROM_EMAIL

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL no configurado')
  }

  return from
}

function isValidUCEmail(email: string) {
  return /^[^\s@]+@(uc\.cl|estudiante\.uc\.cl|estudiantes\.uc\.cl)$/.test(
    email.trim().toLowerCase()
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    const userId = String(body?.userId ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Falta el userId' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Debes ingresar un correo institucional' },
        { status: 400 }
      )
    }

    if (!isValidUCEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Ingresa un correo UC válido (@uc.cl, @estudiante.uc.cl o @estudiantes.uc.cl)',
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: codeData, error: codeError } = await supabaseAdmin.rpc(
      'create_email_verification_code',
      {
        p_user_id: userId,
        p_email: email,
      }
    )

    if (codeError) {
      console.error('SEND RPC ERROR:', codeError)

      return NextResponse.json(
        {
          success: false,
          message: 'No se pudo generar el código',
        },
        { status: 500 }
      )
    }

    const row = (codeData?.[0] ?? null) as CreateCodeRow | null

    if (!row?.success || !row.code) {
      return NextResponse.json(
        {
          success: false,
          message: row?.message || 'La generación del código falló',
        },
        { status: 500 }
      )
    }

    const resend = getResend()
    const from = getFromEmail()

    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject: 'Tu código de verificación UC',
      html: `
        <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:24px;">
          <div style="max-width:560px; margin:0 auto; background:white; border-radius:16px; padding:32px; border:1px solid #e2e8f0;">
            <div style="display:inline-block; padding:6px 12px; border-radius:999px; background:#2563eb; color:white; font-weight:700; font-size:12px; margin-bottom:16px;">
              Salvando College UC
            </div>

            <h1 style="margin:0 0 12px; font-size:24px; color:#0f172a;">
              Verifica tu correo institucional
            </h1>

            <p style="margin:0 0 18px; color:#334155; line-height:1.6;">
              Usa este código para confirmar tu correo institucional en la app.
            </p>

            <div style="margin:20px 0; padding:18px; border-radius:14px; background:#eff6ff; border:1px solid #bfdbfe; text-align:center;">
              <div style="font-size:32px; letter-spacing:8px; font-weight:800; color:#1d4ed8;">
                ${row.code}
              </div>
            </div>

            <p style="margin:0; color:#475569; line-height:1.6;">
              Este código expira pronto. Si no solicitaste esta verificación, puedes ignorar este correo.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('RESEND ERROR:', error)

      return NextResponse.json(
        {
          success: false,
          message: 'No se pudo enviar el correo',
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado correctamente',
      expires_at: row.expires_at,
      email_id: data?.id ?? null,
    })
  } catch (error) {
    console.error('SEND ROUTE ERROR:', error)

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error interno enviando código',
      },
      { status: 500 }
    )
  }
}