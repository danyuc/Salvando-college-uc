'use client'

import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    })
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#081120',
      color: 'white',
      padding: 24,
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: 28,
        borderRadius: 24,
        background: 'rgba(255,255,255,.07)',
        border: '1px solid rgba(255,255,255,.12)',
      }}>
        <h1>Salvando College UC</h1>
        <p style={{ color: '#c8d2e3' }}>
          Inicia sesión para acceder al banco de preguntas y al modo PSU.
        </p>

        <button
          onClick={loginWithGoogle}
          style={{
            width: '100%',
            marginTop: 20,
            padding: 14,
            borderRadius: 14,
            border: 'none',
            background: 'white',
            color: '#0f172a',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Continuar con Google
        </button>
      </div>
    </main>
  )
}