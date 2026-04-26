'use client'

import { useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loginWithGoogle() {
    try {
      setLoading(true)
      setError('')

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/onboarding`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error(err)
      setError('No se pudo iniciar sesión con Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={mainStyle}>
      <section style={cardStyle}>
        <div style={pillStyle}>Salvando College UC</div>

        <h1 style={titleStyle}>Inicia sesión</h1>

        <p style={subtitleStyle}>
          Accede al banco de preguntas, modo PSU, ranking y herramientas de estudio.
        </p>

        {error && <div style={errorStyle}>{error}</div>}

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Conectando...' : 'Continuar con Google'}
        </button>

        <p style={hintStyle}>
          Después de iniciar sesión, verificaremos tu correo institucional UC.
        </p>
      </section>
    </main>
  )
}

const mainStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background:
    'radial-gradient(circle at top left, rgba(37,99,235,.25), transparent 34%), linear-gradient(180deg,#07111f,#111827)',
  color: 'white',
  padding: 20,
  fontFamily: 'Arial, sans-serif',
}

const cardStyle: CSSProperties = {
  width: '100%',
  maxWidth: 430,
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
  fontSize: '2.1rem',
  lineHeight: 1.1,
}

const subtitleStyle: CSSProperties = {
  marginTop: 12,
  color: '#cbd5e1',
  lineHeight: 1.6,
}

const buttonStyle: CSSProperties = {
  width: '100%',
  marginTop: 20,
  padding: 15,
  borderRadius: 16,
  border: 'none',
  background: 'white',
  color: '#0f172a',
  fontWeight: 900,
  fontSize: 16,
}

const hintStyle: CSSProperties = {
  marginTop: 14,
  color: '#94a3b8',
  fontSize: 14,
  lineHeight: 1.5,
}

const errorStyle: CSSProperties = {
  marginTop: 14,
  padding: 13,
  borderRadius: 14,
  background: 'rgba(239,68,68,.16)',
  border: '1px solid rgba(239,68,68,.35)',
  color: '#fecaca',
}