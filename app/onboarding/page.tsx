'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'
import { getMyProfile, upsertMyProfile } from '../../lib/profile'
import { sendVerificationCode, verifyCode } from '../../lib/email'

function isValidUCEmail(email: string) {
  return /^[^\s@]+@(uc\.cl|estudiante\.uc\.cl|estudiantes\.uc\.cl)$/.test(
    email.trim().toLowerCase()
  )
}

function extractUsername(email: string) {
  return email.split('@')[0] || ''
}

const careers = [
  'College UC',
  'Ingeniería',
  'Historia',
  'Sociología',
  'Psicología',
  'Otra',
]

const CODE_LENGTH = 6
const RESEND_SECONDS = 60

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

  const username = useMemo(
    () => extractUsername(institutionalEmail.trim().toLowerCase()),
    [institutionalEmail]
  )

  const cleanInstitutionalEmail = institutionalEmail.trim().toLowerCase()
  const isValidEmail = isValidUCEmail(cleanInstitutionalEmail)
  const finalCareer = career === 'Otra' ? customCareer.trim() : career

  const canSave =
    !!userId &&
    !!username &&
    !!finalCareer &&
    !!year &&
    !!cleanInstitutionalEmail &&
    isValidEmail &&
    isVerified &&
    !saving

  const step1Done =
    !!finalCareer && !!year && !!cleanInstitutionalEmail && isValidEmail
  const step2Done = codeSent
  const step3Done = isVerified

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser()

        if (!user) {
          router.push('/')
          return
        }

        setUserId(user.id)
        setGoogleEmail(user.email || '')

        const profile = await getMyProfile(user.id)

        if (profile?.is_onboarded) {
          router.push('/')
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
            profile.career && !careers.includes(profile.career)
              ? profile.career
              : ''
          )
          setYear(String(profile.year ?? 1))
          setIsVerified(Boolean(profile.institutional_email_verified))
          setCodeSent(Boolean(profile.institutional_email))
        }
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar tu información')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = window.setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return prev - 1
      })
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

    if (!cleanInstitutionalEmail) {
      setError('Debes ingresar tu correo institucional')
      return
    }

    if (!isValidEmail) {
      setError(
        'Ingresa un correo UC válido (@uc.cl, @estudiante.uc.cl o @estudiantes.uc.cl)'
      )
      return
    }

    if (!userId) {
      setError('No se encontró el usuario actual')
      return
    }

    setSending(true)

    await sendVerificationCode(userId, cleanInstitutionalEmail)

    setCodeSent(true)
    setIsVerified(false)
    setCode('')
    setResendCountdown(RESEND_SECONDS)
    setSuccessMessage(
      'Te enviamos un código a tu correo institucional. Revísalo e ingrésalo para verificar.'
    )
  } catch (err) {
    console.error(err)
    setError(
      err instanceof Error
        ? err.message
        : 'No se pudo enviar el código de verificación'
    )
  } finally {
    setSending(false)
  }
 }

  async function handleVerifyCode() {
    try {
      setError('')
      setSuccessMessage('')

      if (!code.trim()) {
        setError('Debes ingresar el código')
        return
      }

      if (!cleanInstitutionalEmail) {
        setError('Primero ingresa tu correo institucional')
        return
      }

      setVerifying(true)

      const result = await verifyCode(userId, cleanInstitutionalEmail, code.trim())

      if (result?.success) {
        setIsVerified(true)
        setSuccessMessage('Correo institucional verificado correctamente')
      } else {
        setIsVerified(false)
        setError(result?.message || 'No se pudo verificar el código')
      }
    } catch (err) {
      console.error(err)
      setError('Error verificando el código')
    } finally {
      setVerifying(false)
    }
  }

  async function handleSave() {
    try {
      setError('')
      setSuccessMessage('')

      if (!cleanInstitutionalEmail) {
        setError('Debes ingresar tu correo institucional')
        return
      }

      if (!isValidEmail) {
        setError(
          'Ingresa un correo UC válido (@uc.cl, @estudiante.uc.cl o @estudiantes.uc.cl)'
        )
        return
      }

      if (!username) {
        setError('No se pudo detectar tu usuario UC desde el correo')
        return
      }

      if (!finalCareer) {
        setError('Debes ingresar tu carrera')
        return
      }

      if (!isVerified) {
        setError('Debes verificar tu correo institucional antes de continuar')
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

      router.push('/')
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar tu perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main style={mainStyle}>
        <div style={loadingCardStyle}>Cargando...</div>
      </main>
    )
  }

  return (
    <main style={mainStyle}>
      <style>{`
        @keyframes premiumPop {
          0% { opacity: 0; transform: scale(0.94) translateY(6px); }
          60% { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes premiumGlow {
          0% { box-shadow: 0 0 0 rgba(16,185,129,0); }
          50% { box-shadow: 0 0 26px rgba(16,185,129,0.22); }
          100% { box-shadow: 0 0 0 rgba(16,185,129,0); }
        }
      `}</style>

      <div style={cardStyle}>
        <div style={headerRowStyle}>
          <div>
            <div style={pillStyle}>Bienvenido</div>
            <h1 style={titleStyle}>Ahora completemos tu perfil</h1>
            <p style={subtitleStyle}>
              Esto nos ayudará a personalizar tus ramos, evaluaciones, sesiones
              de estudio y recomendaciones.
            </p>
          </div>

          <div style={googleMiniBoxStyle}>
            <div style={smallLabelStyle}>Sesión Google</div>
            <div style={googleEmailMiniStyle}>{googleEmail || 'Sin correo detectado'}</div>
          </div>
        </div>

        <div style={stepsRowStyle}>
          <Step number="1" label="Datos" active done={step1Done} />
          <div style={stepLineStyle} />
          <Step number="2" label="Código" active={step1Done} done={step2Done} />
          <div style={stepLineStyle} />
          <Step number="3" label="Verificación" active={step2Done} done={step3Done} />
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {successMessage && <div style={successStyle}>{successMessage}</div>}

        <div style={formGridStyle}>
          <section style={sectionCardStyle}>
            <div style={sectionTitleStyle}>1. Datos académicos</div>

            <div>
              <label style={labelStyle}>Tu carrera</label>
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                style={selectStyle}
              >
                {careers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {career === 'Otra' && (
              <div>
                <label style={labelStyle}>¿Cuál es tu carrera?</label>
                <input
                  value={customCareer}
                  onChange={(e) => setCustomCareer(e.target.value)}
                  placeholder="Escribe tu carrera"
                  style={inputStyle}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>¿En qué año estás?</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={selectStyle}
              >
                <option value="1">1° año</option>
                <option value="2">2° año</option>
                <option value="3">3° año</option>
                <option value="4">4° año</option>
                <option value="5">5° año</option>
                <option value="6">6° año</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Tu correo institucional</label>
              <input
                value={institutionalEmail}
                onChange={(e) => resetVerificationStateOnEmailChange(e.target.value)}
                placeholder="ejemplo@estudiantes.uc.cl"
                style={{
                  ...inputStyle,
                  border: isValidEmail
                    ? '1px solid rgba(16,185,129,.55)'
                    : '1px solid rgba(255,255,255,0.12)',
                }}
              />

              {cleanInstitutionalEmail.length > 0 && (
                <p
                  style={{
                    ...hintStyle,
                    color: isValidEmail ? '#86efac' : '#fca5a5',
                  }}
                >
                  {isValidEmail
                    ? '✔ Correo UC válido'
                    : 'Ingresa un correo UC válido'}
                </p>
              )}

              <p style={hintStyle}>
                Debe ser tu correo institucional UC. Puede ser distinto al correo
                con el que entraste con Google.
              </p>
            </div>
          </section>

          <section style={sectionCardStyle}>
            <div style={sectionTitleStyle}>2. Código</div>

            <div style={verificationRowStyle}>
              <div>
                <div style={labelStyle}>Enviar código de verificación</div>
                <p style={hintStyle}>
                  Te enviaremos un código a tu correo institucional para validarlo.
                </p>
              </div>

              <button
                onClick={handleSendCode}
                disabled={sending || resendCountdown > 0 || !isValidEmail}
                style={{
                  ...secondaryButtonStyle,
                  opacity:
                    sending || resendCountdown > 0 || !isValidEmail ? 0.6 : 1,
                  cursor:
                    sending || resendCountdown > 0 || !isValidEmail
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {sending
                  ? 'Enviando...'
                  : resendCountdown > 0
                  ? `Reenviar en ${resendCountdown}s`
                  : 'Enviar código'}
              </button>
            </div>

            {codeSent && (
              <div style={{ marginTop: '10px' }}>
                <label style={labelStyle}>Ingresa el código</label>
                <input
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && code.length === CODE_LENGTH && !verifying) {
                      void handleVerifyCode()
                    }
                  }}
                  inputMode="numeric"
                  maxLength={CODE_LENGTH}
                  placeholder="Código de 6 dígitos"
                  style={inputStyle}
                />

                <div style={codeHelperRowStyle}>
                  <span style={hintStyle}>Código de {CODE_LENGTH} dígitos</span>
                  <span style={hintStyle}>
                    {code.length}/{CODE_LENGTH}
                  </span>
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={verifying || code.length !== CODE_LENGTH}
                  style={{
                    ...secondaryButtonStyle,
                    marginTop: '10px',
                    opacity: verifying || code.length !== CODE_LENGTH ? 0.6 : 1,
                    cursor:
                      verifying || code.length !== CODE_LENGTH
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {verifying ? 'Verificando...' : 'Validar código'}
                </button>
              </div>
            )}
          </section>

          <section style={sectionCardStyle}>
            <div style={sectionTitleStyle}>3. Verificación</div>

            {!isVerified ? (
              <div style={pendingVerificationBoxStyle}>
                <div
                  style={{
                    ...statusBadgeStyle,
                    background: 'rgba(245,158,11,.18)',
                    color: '#fde68a',
                  }}
                >
                  Pendiente
                </div>

                <p style={{ ...hintStyle, marginTop: '10px' }}>
                  Cuando tu correo quede validado, podrás guardar y continuar.
                </p>
              </div>
            ) : (
              <div style={verifiedPremiumBoxStyle}>
                <div style={verifiedIconStyle}>✓</div>
                <div>
                  <div style={verifiedTitleStyle}>Correo verificado</div>
                  <div style={verifiedSubtitleStyle}>
                    Todo listo. Ya puedes continuar.
                  </div>
                </div>
              </div>
            )}
          </section>

          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              ...buttonStyle,
              opacity: canSave ? 1 : 0.65,
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </div>
      </div>
    </main>
  )
}

function Step({
  number,
  label,
  active,
  done,
}: {
  number: string
  label: string
  active?: boolean
  done?: boolean
}) {
  return (
    <div style={stepItemStyle}>
      <div
        style={{
          ...stepCircleBaseStyle,
          background: done
            ? 'linear-gradient(135deg,#10b981,#34d399)'
            : active
            ? 'linear-gradient(135deg,#2563eb,#3b82f6)'
            : 'rgba(255,255,255,.08)',
          color: done ? '#052e16' : 'white',
        }}
      >
        {done ? '✓' : number}
      </div>
      <span style={stepTextStyle}>{label}</span>
    </div>
  )
}

const mainStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 30%), radial-gradient(circle at top right, rgba(96,165,250,.16), transparent 32%), linear-gradient(180deg,#081120,#101a2e)',
  color: 'white',
  display: 'grid',
  placeItems: 'center',
  fontFamily: 'Arial, sans-serif',
  padding: '20px',
}

const loadingCardStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '24px',
  padding: '30px',
  backdropFilter: 'blur(14px)',
}

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: '720px',
  padding: '30px',
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  backdropFilter: 'blur(14px)',
  boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
}

const headerRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const pillStyle: CSSProperties = {
  display: 'inline-block',
  padding: '7px 13px',
  borderRadius: '999px',
  background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
  fontWeight: 800,
  marginBottom: '16px',
  fontSize: '0.92rem',
}

const titleStyle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: '2rem',
  lineHeight: 1.15,
}

const subtitleStyle: CSSProperties = {
  margin: '0 0 18px',
  color: '#c8d2e3',
  lineHeight: 1.6,
  fontSize: '1rem',
  maxWidth: '500px',
}

const googleMiniBoxStyle: CSSProperties = {
  minWidth: '220px',
  padding: '12px 14px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.08)',
}

const smallLabelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.82rem',
  marginBottom: '6px',
}

const googleEmailMiniStyle: CSSProperties = {
  fontWeight: 700,
  color: '#e2e8f0',
  wordBreak: 'break-word',
  fontSize: '0.92rem',
}

const stepsRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '18px',
}

const stepItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

const stepCircleBaseStyle: CSSProperties = {
  width: '30px',
  height: '30px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,.08)',
  display: 'grid',
  placeItems: 'center',
  fontWeight: 800,
  fontSize: '0.85rem',
}

const stepLineStyle: CSSProperties = {
  flex: 1,
  height: '1px',
  background: 'rgba(255,255,255,.12)',
}

const stepTextStyle: CSSProperties = {
  fontSize: '0.88rem',
  color: '#c8d2e3',
  fontWeight: 600,
}

const errorStyle: CSSProperties = {
  marginBottom: '16px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: 'rgba(239,68,68,.16)',
  border: '1px solid rgba(239,68,68,.35)',
  color: '#fff',
}

const successStyle: CSSProperties = {
  marginBottom: '16px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: 'rgba(16,185,129,.16)',
  border: '1px solid rgba(16,185,129,.35)',
  color: '#dcfce7',
}

const formGridStyle: CSSProperties = {
  display: 'grid',
  gap: '14px',
}

const sectionCardStyle: CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.08)',
}

const sectionTitleStyle: CSSProperties = {
  fontWeight: 800,
  fontSize: '1.02rem',
  marginBottom: '14px',
}

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  color: '#c8d2e3',
  fontSize: '0.95rem',
  fontWeight: 600,
}

const hintStyle: CSSProperties = {
  margin: '8px 0 0',
  color: '#94a3b8',
  fontSize: '0.88rem',
  lineHeight: 1.45,
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  outline: 'none',
  fontSize: '0.98rem',
}

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#ffffff',
  color: '#0f172a',
  outline: 'none',
  fontSize: '0.98rem',
}

const verificationRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const pendingVerificationBoxStyle: CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,.04)',
  border: '1px solid rgba(255,255,255,.08)',
}

const statusBadgeStyle: CSSProperties = {
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '0.82rem',
  fontWeight: 700,
  display: 'inline-block',
}

const secondaryButtonStyle: CSSProperties = {
  padding: '11px 14px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,.08)',
  color: 'white',
  border: '1px solid rgba(255,255,255,.12)',
  fontWeight: 700,
}

const buttonStyle: CSSProperties = {
  width: '100%',
  marginTop: '6px',
  padding: '14px 16px',
  borderRadius: '14px',
  background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
  color: 'white',
  border: 'none',
  fontWeight: 800,
  fontSize: '1rem',
}

const codeHelperRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const verifiedPremiumBoxStyle: CSSProperties = {
  padding: '14px 16px',
  borderRadius: '16px',
  background: 'rgba(16,185,129,.12)',
  border: '1px solid rgba(16,185,129,.25)',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  animation: 'premiumPop 280ms ease, premiumGlow 900ms ease',
}

const verifiedIconStyle: CSSProperties = {
  width: '34px',
  height: '34px',
  borderRadius: '999px',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(135deg,#10b981,#34d399)',
  color: '#052e16',
  fontWeight: 900,
  fontSize: '1rem',
  flexShrink: 0,
}

const verifiedTitleStyle: CSSProperties = {
  fontWeight: 800,
  color: '#dcfce7',
  marginBottom: '2px',
}

const verifiedSubtitleStyle: CSSProperties = {
  color: '#bbf7d0',
  fontSize: '0.92rem',
}