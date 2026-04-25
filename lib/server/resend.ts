import { Resend } from 'resend'

let resendInstance: Resend | null = null

export function getResend() {
  if (resendInstance) return resendInstance

  const key = process.env.RESEND_API_KEY

  if (!key) {
    throw new Error('RESEND_API_KEY no configurada')
  }

  resendInstance = new Resend(key)

  return resendInstance
}

export function getFromEmail() {
  const from = process.env.RESEND_FROM_EMAIL

  if (!from) {
    throw new Error('RESEND_FROM_EMAIL no configurado')
  }

  return from
}