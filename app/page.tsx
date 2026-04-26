'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMyProfile } from '@/lib/profile'

export default function HomePage() {
  const router = useRouter()

  const [username, setUsername] = useState('Cargando...')
  const [email, setEmail] = useState('')
  const [career, setCareer] = useState('College Ciencias Sociales')
  const [year, setYear] = useState('1')

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
        return
      }

      const userEmail = data.user.email || ''
      setEmail(userEmail)

      try {
        const profile = await getMyProfile(data.user.id)

        if (profile?.username) {
          setUsername(profile.username)
        } else if (profile?.institutional_email) {
          setUsername(profile.institutional_email.split('@')[0])
        } else if (userEmail) {
          setUsername(userEmail.split('@')[0])
        } else {
          setUsername('Usuario UC')
        }

        if (profile?.career) {
          setCareer(profile.career)
        }

        if (profile?.year) {
          setYear(String(profile.year))
        }
      } catch (error) {
        console.error(error)
        setUsername(userEmail ? userEmail.split('@')[0] : 'Usuario UC')
      }
    }

    loadUser()
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function go(path: string) {
    router.push(path)
  }

  return (
    <main style={main}>
      <section style={headerCard}>
        <div>
          <h1 style={title}>Hola, {username}</h1>
          <p style={subtitle}>
            {career} · {year}° semestre
          </p>
          {email && <p style={emailText}>{email}</p>}
        </div>

        <button onClick={logout} style={logoutBtn}>
          Cerrar sesión
        </button>
      </section>

      <nav style={nav}>
        <button onClick={() => go('/')} style={activeBtn}>🏠 Home</button>
        <button onClick={() => go('/calendario')} style={btn}>📅 Calendario</button>
        <button onClick={() => go('/ensayo')} style={btn}>🧩 Práctica IA</button>
        <button onClick={() => go('/banco')} style={btn}>📚 Banco</button>
        <button onClick={() => go('/riesgo')} style={btn}>⚠️ Riesgo</button>
        <button onClick={() => go('/coach-semanal')} style={btn}>🧠 Coach semanal</button>
        <button onClick={() => go('/ranking')} style={btn}>🏆 Ranking</button>
        <button onClick={() => go('/notas')} style={btn}>📊 Notas</button>
        <button onClick={() => go('/disponibilidad')} style={btn}>⏱️ Disponibilidad</button>
        <button onClick={() => go('/ia')} style={btn}>🤖 IA</button>
      </nav>

      <section style={panel}>
        <div>
          <h2 style={panelTitle}>Panel central de estudio UC</h2>
          <p style={muted}>
            Tu sistema ahora puede priorizar evaluaciones, práctica inteligente, riesgo académico y coach semanal.
          </p>
        </div>

        <div style={statsRow}>
          <div style={statBox}>Evaluaciones: 0</div>
          <div style={statBox}>Intentos: 0</div>
          <div style={statBox}>Riesgo: calculando</div>
        </div>
      </section>

      <section style={grid}>
        <button onClick={() => go('/ensayo')} style={featureCard}>
          <h3>🧩 Práctica inteligente</h3>
          <p>Estudia según la próxima evaluación y su ponderación.</p>
        </button>

        <button onClick={() => go('/riesgo')} style={featureCard}>
          <h3>⚠️ Riesgo académico</h3>
          <p>Detecta urgencias según fechas, peso y cercanía.</p>
        </button>

        <button onClick={() => go('/coach-semanal')} style={featureCard}>
          <h3>🧠 Coach semanal</h3>
          <p>Recibe un plan automático de estudio por semana.</p>
        </button>

        <button onClick={() => go('/banco')} style={featureCard}>
          <h3>📚 Banco de preguntas</h3>
          <p>Revisa preguntas filtradas por tema, ramo y dificultad.</p>
        </button>
      </section>
    </main>
  )
}

const main: CSSProperties = {
  minHeight: '100vh',
  background: '#020617',
  color: 'white',
  padding: 24,
  fontFamily: 'Arial, sans-serif',
}

const headerCard: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 20,
}

const title: CSSProperties = {
  margin: 0,
  fontSize: 28,
}

const subtitle: CSSProperties = {
  margin: '8px 0 0',
  color: '#cbd5e1',
  fontSize: 18,
}

const emailText: CSSProperties = {
  margin: '6px 0 0',
  color: '#94a3b8',
  fontSize: 14,
}

const nav: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 28,
}

const btn: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.14)',
  background: '#111827',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const activeBtn: CSSProperties = {
  ...btn,
  background: '#2563eb',
}

const logoutBtn: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 14,
  border: 'none',
  background: '#4c1d2f',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const panel: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 24,
}

const panelTitle: CSSProperties = {
  margin: 0,
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}

const statsRow: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
}

const statBox: CSSProperties = {
  padding: '14px 16px',
  borderRadius: 14,
  background: '#1e293b',
  fontWeight: 800,
}

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: 16,
}

const featureCard: CSSProperties = {
  textAlign: 'left',
  padding: 22,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  color: 'white',
  cursor: 'pointer',
}