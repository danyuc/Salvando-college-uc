import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type VerifyCodeRow = {
  success: boolean
  message?: string | null
}

type ApiResponse = {
  success: boolean
  message: string
  verified?: boolean
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function cleanCode(value: unknown) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 6)
}

function cleanUserId(value: unknown) {
  return String(value ?? '').trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)

    const userId = cleanUserId(body?.userId)
    const code = cleanCode(body?.code)

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Falta el userId',
        },
        { status: 400 }
      )
    }

    if (!code || code.length !== 6) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Debes ingresar un código válido de 6 dígitos',
        },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin.rpc(
      'verify_email_verification_code',
      {
        p_user_id: userId,
        p_code: code,
      }
    )

    if (error) {
      console.error('VERIFY RPC ERROR:', error)

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'No se pudo verificar el código',
        },
        { status: 500 }
      )
    }

    const row = Array.isArray(data)
      ? (data[0] as VerifyCodeRow | undefined)
      : (data as VerifyCodeRow | null)

    if (!row) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Respuesta inválida del servidor',
        },
        { status: 500 }
      )
    }

    if (!row.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: row.message || 'Código incorrecto o expirado',
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      verified: true,
      message: row.message || 'Correo verificado correctamente',
    })
  } catch (error) {
    console.error('VERIFY ROUTE ERROR:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Error interno verificando el código',
      },
      { status: 500 }
    )
  }
}