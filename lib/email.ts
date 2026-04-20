type SendVerificationResponse = {
  success?: boolean
  message?: string
  expires_at?: string
  email_id?: string | null
}

type VerifyCodeResponse = {
  success: boolean
  message: string
}

async function parseJsonSafe(res: Response) {
  const text = await res.text()

  try {
    return text ? JSON.parse(text) : null
  } catch {
    return {
      success: false,
      message: text || 'Respuesta inválida del servidor',
    }
  }
}

export async function sendVerificationCode(userId: string, email: string) {
  const res = await fetch('/api/send-verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      email,
    }),
  })

  const data = (await parseJsonSafe(res)) as SendVerificationResponse | null

  if (!res.ok) {
    throw new Error(data?.message || 'No se pudo enviar el código')
  }

  if (!data?.success) {
    throw new Error(data?.message || 'No se pudo enviar el código')
  }

  return {
    success: true,
    message: data.message || 'Código enviado correctamente',
    expiresAt: data.expires_at ?? null,
    emailId: data.email_id ?? null,
  }
}

export async function verifyCode(
  userId: string,
  email: string,
  code: string
) {
  const res = await fetch('/api/verify-verification-code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      email,
      code,
    }),
  })

  const data = (await parseJsonSafe(res)) as VerifyCodeResponse | null

  if (!res.ok) {
    throw new Error(data?.message || 'Error verificando código')
  }

  if (!data?.success) {
    throw new Error(data?.message || 'Código incorrecto')
  }

  return data
}