'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'
import { getMyProfile, upsertMyProfile } from '../../lib/profile'
import { sendVerificationCode, verifyCode } from '../../lib/email'

const careers = ['College UC', 'Ingeniería', 'Historia', 'Sociología', 'Psicología', 'Otra']
const CODE_LENGTH = 6
const RESEND_SECONDS = 60

function isValidUCEmail(email: string) {
  return /^[^\s@]+@(uc\.cl|estudiante\.uc\.cl|estudiantes\.uc\.cl)$/.test(
    email.trim().toLowerCase()
  )
}

function extractUsername(email: string) {
  return email.split('@')[0] || ''
}

export default function OnboardingPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [userId, setUserId] = useState('')
  const [googleEmail, setGoogleEmail] = useState('')

  const [institutionalEmail, setInstitutionalEmail] = useState('')
  const [career, setCareer] = useState('College UC')
  const [customCareer, setCustomCareer] = useState('')
  const [year, setYear] = useState('1')

  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  const cleanInstitutionalEmail = institutionalEmail.trim().toLowerCase()
  const username = useMemo(() => extractUsername(cleanInstitutionalEmail), [cleanInstitutionalEmail])
  const isValidEmail = isValidUCEmail(cleanInstitutionalEmail)
  const finalCareer = career === 'Otra' ? customCareer.trim() : career

  const canSave =
    Boolean(userId) &&
    Boolean(username) &&
    Boolean(finalCareer) &&
    Boolean(year) &&
    isValidEmail &&
    isVerified &&
    !saving

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser()

        if (!user) {
          router.replace('/login')
          return
        }

        setUserId(user.id)
        setGoogleEmail(user.email || '')

        const profile = await getMyProfile(user.id)

        if (profile?.is_onboarded) {
          router.replace('/')
          return
        }

        if (profile) {
          setInstitutionalEmail(profile.institutional_email ?? '')
          setCareer(
            profile.career && careers.includes(profile.career)
              ? profile.career
              : profile.career
              ? 'Otra'
              : 'College UC'
          )
          setCustomCareer(
            profile.career && !careers.includes(profile.career) ? profile.career : ''
          )
          setYear(String(profile.year ?? 1))
          setIsVerified(Boolean(profile.institutional_email_verified))
          setCodeSent(Boolean(profile.institutional_email))
        }
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar tu información. Intenta iniciar sesión nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendCountdown])

  function resetVerificationStateOnEmailChange(nextEmail: string) {
    setInstitutionalEmail(nextEmail)
    setIsVerified(false)
    setCodeSent(false)
    setCode('')
    setError('')
    setSuccessMessage('')
    setResendCountdown(0)
  }

  async function handleSendCode() {
    try {
      setError('')
      setSuccessMessage('')

      if (!isValidEmail) {
        setError('Ingresa un correo UC válido: @uc.cl, @estudiante.uc.cl o @estudiantes.uc.cl')
        return
      }

      if (!userId) {
        setError('No se encontró una sesión activa. Vuelve a iniciar sesión.')
        router.replace('/login')
        return
      }

      setSending(true)

      await sendVerificationCode(userId, cleanInstitutionalEmail)

      setCodeSent(true)
      setIsVerified(false)
      setCode('')
      setResendCountdown(RESEND_SECONDS)
      setSuccessMessage('Código enviado. Revisa tu correo institucional UC.')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'No se pudo enviar el código')
    } finally {
      setSending(false)
    }
  }

  async function handleVerifyCode() {
    try {
      setError('')
      setSuccessMessage('')

      if (code.length !== CODE_LENGTH) {
        setError(`El código debe tener ${CODE_LENGTH} dígitos`)
        return
      }

      setVerifying(true)

      const result = await verifyCode(userId, cleanInstitutionalEmail, code.trim())

      if (result?.success) {
        setIsVerified(true)
        setSuccessMessage('Correo institucional verificado correctamente.')
      } else {
        setIsVerified(false)
        setError(result?.message || 'Código inválido o vencido.')
      }
    } catch (err) {
      console.error(err)
      setError('Error verificando el código.')
    } finally {
      setVerifying(false)
    }
  }

  async function handleSave() {
    try {
      setError('')
      setSuccessMessage('')

      if (!canSave) {
        setError('Completa todos los datos y verifica tu correo institucional.')
        return
      }

      setSaving(true)

      await upsertMyProfile({
        id: userId,
        username,
        career: finalCareer,
        year: Number(year),
        institutional_email: cleanInstitutionalEmail,
        institutional_email_verified: true,
        is_onboarded: true,
      })

      router.replace('/')
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar tu perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={mainStyle}>
        <div style={cardStyle}>Cargando perfil...</div>
      </main>
    )
  }

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <div style={pillStyle}>Salvando College UC</div>

        <h1 style={titleStyle}>Completa tu perfil UC</h1>
        <p style={subtitleStyle}>
          Verifica tu correo institucional para activar el banco de preguntas, modo PSU,
          ranking y recomendaciones personalizadas.
        </p>

        <div style={sessionBoxStyle}>
          <strong>Sesión Google:</strong>
          <span>{googleEmail || 'Sin correo detectado'}</span>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {successMessage && <div style={successStyle}>{successMessage}</div>}

        <div style={gridStyle}>
          <label style={labelStyle}>Carrera</label>
          <select value={career} onChange={(e) => setCareer(e.target.value)} style={selectStyle}>
            {careers.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {career === 'Otra' && (
            <>
              <label style={labelStyle}>Escribe tu carrera</label>
              <input
                value={customCareer}
                onChange={(e) => setCustomCareer(e.target.value)}
                style={inputStyle}
                placeholder="Ej: Derecho, Arquitectura..."
              />
            </>
          )}

          <label style={labelStyle}>Año académico</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} style={selectStyle}>
            <option value="1">1° año</option>
            <option value="2">2° año</option>
            <option value="3">3° año</option>
            <option value="4">4° año</option>
            <option value="5">5° año</option>
            <option value="6">6° año</option>
          </select>

          <label style={labelStyle}>Correo institucional UC</label>
          <input
            value={institutionalEmail}
            onChange={(e) => resetVerificationStateOnEmailChange(e.target.value)}
            placeholder="tu.nombre@estudiantes.uc.cl"
            style={{
              ...inputStyle,
              borderColor: cleanInstitutionalEmail
                ? isValidEmail
                  ? 'rgba(34,197,94,.8)'
                  : 'rgba(248,113,113,.8)'
                : 'rgba(255,255,255,.16)',
            }}
          />

          {cleanInstitutionalEmail && (
            <p style={{ ...hintStyle, color: isValidEmail ? '#86efac' : '#fca5a5' }}>
              {isValidEmail ? 'Correo UC válido' : 'Correo UC no válido'}
            </p>
          )}

          <button
            onClick={handleSendCode}
            disabled={sending || !isValidEmail || resendCountdown > 0}
            style={secondaryButtonStyle}
          >
            {sending
              ? 'Enviando...'
              : resendCountdown > 0
              ? `Reenviar en ${resendCountdown}s`
              : codeSent
              ? 'Reenviar código'
              : 'Enviar código'}
          </button>

          {codeSent && (
            <>
              <label style={labelStyle}>Código de verificación</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                inputMode="numeric"
                maxLength={CODE_LENGTH}
                placeholder="123456"
                style={inputStyle}
              />

              <button
                onClick={handleVerifyCode}
                disabled={verifying || code.length !== CODE_LENGTH}
                style={secondaryButtonStyle}
              >
                {verifying ? 'Verificando...' : 'Validar código'}
              </button>
            </>
          )}

          <div style={statusBoxStyle}>
            {isVerified ? '✅ Correo institucional verificado' : '⚠️ Verificación pendiente'}
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              ...primaryButtonStyle,
              opacity: canSave ? 1 : 0.55,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar y entrar'}
          </button>
        </div>
      </div>
    </main>
  )
}

const mainStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(37,99,235,.28), transparent 35%), linear-gradient(180deg,#07111f,#111827)',
  color: 'white',
  display: 'grid',
  placeItems: 'center',
  padding: 20,
  fontFamily: 'Arial, sans-serif',
}

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 720,
  padding: 28,
  borderRadius: 28,
  background: 'rgba(255,255,255,.075)',
  border: '1px solid rgba(255,255,255,.14)',
  boxShadow: '0 24px 70px rgba(0,0,0,.35)',
  backdropFilter: 'blur(18px)',
}

const pillStyle: CSSProperties = {
  display: 'inline-block',
  padding: '8px 14px',
  borderRadius: 999,
  background: 'rgba(59,130,246,.22)',
  color: '#bfdbfe',
  fontWeight: 800,
  marginBottom: 14,
}

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '2rem',
  lineHeight: 1.15,
}

const subtitleStyle: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.6,
  marginBottom: 18,
}

const sessionBoxStyle: CSSProperties = {
  display: 'grid',
  gap: 4,
  padding: 14,
  borderRadius: 16,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.1)',
  marginBottom: 16,
  wordBreak: 'break-word',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const labelStyle: CSSProperties = {
  color: '#e2e8f0',
  fontWeight: 800,
  marginTop: 4,
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.16)',
  background: 'rgba(255,255,255,.08)',
  color: 'white',
  outline: 'none',
  fontSize: 16,
}

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.16)',
  background: 'white',
  color: '#0f172a',
  outline: 'none',
  fontSize: 16,
}

const hintStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
}

const primaryButtonStyle: CSSProperties = {
  width: '100%',
  padding: 15,
  borderRadius: 16,
  border: 'none',
  background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
  color: 'white',
  fontWeight: 900,
  fontSize: 16,
}

const secondaryButtonStyle: CSSProperties = {
  width: '100%',
  padding: 13,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.16)',
  background: 'rgba(255,255,255,.1)',
  color: 'white',
  fontWeight: 800,
}

const statusBoxStyle: CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.12)',
}

const errorStyle: CSSProperties = {
  padding: 13,
  borderRadius: 14,
  background: 'rgba(239,68,68,.16)',
  border: '1px solid rgba(239,68,68,.35)',
  color: '#fecaca',
  marginBottom: 12,
}

const successStyle: CSSProperties = {
  padding: 13,
  borderRadius: 14,
  background: 'rgba(34,197,94,.16)',
  border: '1px solid rgba(34,197,94,.35)',
  color: '#bbf7d0',
  marginBottom: 12,
}