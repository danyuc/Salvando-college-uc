'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMyProfile } from '@/lib/profile'

type Evaluation = {
  id?: string
  subject: string
  title: string
  type: string
  date: string
  weight: number
  contents?: string | null
  start_time?: string | null
  end_time?: string | null
}

function daysUntil(date?: string | null) {
  if (!date) return 999
  const today = new Date()
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function riskLevel(e: Evaluation) {
  const days = daysUntil(e.date)
  const weight = Number(e.weight || 0)

  if (days < 0) return 'pasada'
  if (days <= 3 && weight >= 0.15) return 'alto'
  if (days <= 10 && weight >= 0.15) return 'medio'
  if (days <= 14) return 'medio'
  return 'bajo'
}

function formatDate(date?: string | null) {
  if (!date) return 'Sin fecha'
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function HomeView() {
  const router = useRouter()

  const [username, setUsername] = useState('Cargando...')
  const [email, setEmail] = useState('')
  const [career, setCareer] = useState('College Ciencias Sociales')
  const [year, setYear] = useState('1')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.replace('/login')
          return
        }

        const userEmail = data.user.email || ''
        setEmail(userEmail)

        const profile = await getMyProfile(data.user.id)

        setUsername(
          profile?.username ||
            profile?.institutional_email?.split('@')[0] ||
            userEmail.split('@')[0] ||
            'Usuario UC'
        )

        if (profile?.career) setCareer(profile.career)
        if (profile?.year) setYear(String(profile.year))

        const { data: evals, error } = await supabase
          .from('evaluations')
          .select('*')
          .order('date', { ascending: true })

        if (error) console.error(error)
        setEvaluations((evals || []) as Evaluation[])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  const upcoming = useMemo(
    () => evaluations.filter((e) => daysUntil(e.date) >= 0).slice(0, 6),
    [evaluations]
  )

  const focus = useMemo(() => {
    return [...upcoming].sort((a, b) => {
      const scoreA = (Number(a.weight) || 0) * 100 - daysUntil(a.date)
      const scoreB = (Number(b.weight) || 0) * 100 - daysUntil(b.date)
      return scoreB - scoreA
    })[0]
  }, [upcoming])

  const urgentCount = upcoming.filter((e) => riskLevel(e) === 'alto').length

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function go(path: string) {
    router.push(path)
  }

  if (loading) {
    return <main style={main}>Cargando dashboard...</main>
  }

  return (
    <main style={main}>
      <section style={hero}>
        <div>
          <p style={pill}>Salvando College UC</p>
          <h1 style={title}>Hola, {username}</h1>
          <p style={subtitle}>{career} · {year}° semestre</p>
          {email && <p style={emailText}>{email}</p>}
        </div>

        <button onClick={logout} style={logoutBtn}>Cerrar sesión</button>
      </section>

      <nav style={nav}>
        <button style={activeBtn} onClick={() => go('/')}>🏠 Home</button>
        <button style={btn} onClick={() => go('/ensayo')}>🧩 Práctica IA</button>
        <button style={btn} onClick={() => go('/banco')}>📚 Banco</button>
        <button style={btn} onClick={() => go('/riesgo')}>⚠️ Riesgo</button>
        <button style={btn} onClick={() => go('/coach-semanal')}>🧠 Coach semanal</button>
        <button style={btn} onClick={() => go('/ranking')}>🏆 Ranking</button>
      </nav>

      <section style={panel}>
        <div>
          <h2 style={panelTitle}>Panel central de estudio UC</h2>
          <p style={muted}>
            Evaluaciones reales, foco del día, práctica inteligente y riesgo académico.
          </p>
        </div>

        <div style={stats}>
          <div style={stat}>Evaluaciones: {evaluations.length}</div>
          <div style={stat}>Próximas: {upcoming.length}</div>
          <div style={stat}>Urgentes: {urgentCount}</div>
        </div>
      </section>

      <section style={grid}>
        <article style={card}>
          <h3>🔥 Foco del día</h3>
          {focus ? (
            <>
              <h2>{focus.subject} · {focus.title}</h2>
              <p style={muted}>{formatDate(focus.date)} · faltan {daysUntil(focus.date)} día(s)</p>
              <p style={muted}>Ponderación: {(Number(focus.weight) * 100).toFixed(1)}%</p>
              <p style={muted}>{focus.contents}</p>
              <button style={primaryBtn} onClick={() => go('/ensayo')}>
                Practicar este foco
              </button>
            </>
          ) : (
            <p style={muted}>No hay evaluaciones próximas registradas.</p>
          )}
        </article>

        <article style={card}>
          <h3>⚠️ Riesgo académico</h3>
          {upcoming.slice(0, 4).map((e) => (
            <div key={e.id || e.title} style={mini}>
              <strong>{e.subject} · {e.title}</strong>
              <p style={muted}>{formatDate(e.date)} · riesgo {riskLevel(e)}</p>
            </div>
          ))}
        </article>

        <article style={wideCard}>
          <h3>📅 Próximas evaluaciones</h3>
          {upcoming.length === 0 ? (
            <p style={muted}>No hay evaluaciones registradas.</p>
          ) : (
            upcoming.map((e) => (
              <div key={e.id || `${e.subject}-${e.title}`} style={evalCard}>
                <div>
                  <strong>{e.subject} · {e.title}</strong>
                  <p style={muted}>{e.contents}</p>
                </div>
                <div style={dateBox}>
                  <strong>{formatDate(e.date)}</strong>
                  <span>{(Number(e.weight) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))
          )}
        </article>

        <article style={card}>
          <h3>🧠 Coach semanal</h3>
          {focus ? (
            <p style={muted}>
              Esta semana prioriza {focus.subject}: {focus.title}. Parte por leer el temario,
              luego haz práctica y termina corrigiendo errores.
            </p>
          ) : (
            <p style={muted}>Sin foco semanal por ahora.</p>
          )}
          <button style={primaryBtn} onClick={() => go('/coach-semanal')}>
            Abrir coach
          </button>
        </article>
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

const hero: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  padding: 28,
  borderRadius: 28,
  background: 'linear-gradient(135deg,#0f172a,#111827)',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 20,
}

const pill: CSSProperties = {
  display: 'inline-block',
  padding: '7px 12px',
  borderRadius: 999,
  background: '#2563eb',
  fontWeight: 900,
}

const title: CSSProperties = { margin: '14px 0 0', fontSize: 34 }
const subtitle: CSSProperties = { color: '#cbd5e1', fontSize: 18 }
const emailText: CSSProperties = { color: '#94a3b8', fontSize: 14 }

const nav: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginBottom: 24,
}

const btn: CSSProperties = {
  padding: '13px 16px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.14)',
  background: '#111827',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const activeBtn: CSSProperties = { ...btn, background: '#2563eb' }

const logoutBtn: CSSProperties = {
  ...btn,
  background: '#4c1d2f',
  border: 'none',
}

const panel: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 16,
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 24,
}

const panelTitle: CSSProperties = { margin: 0 }

const stats: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
}

const stat: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 14,
  background: '#1e293b',
  fontWeight: 900,
}

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 18,
}

const card: CSSProperties = {
  padding: 22,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
}

const wideCard: CSSProperties = {
  ...card,
  gridColumn: '1 / -1',
}

const mini: CSSProperties = {
  padding: 14,
  borderRadius: 14,
  background: '#111827',
  marginTop: 10,
}

const evalCard: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  padding: 16,
  borderRadius: 16,
  background: '#111827',
  marginTop: 12,
}

const dateBox: CSSProperties = {
  minWidth: 150,
  display: 'grid',
  gap: 6,
  color: '#bfdbfe',
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}

const primaryBtn: CSSProperties = {
  marginTop: 12,
  padding: '12px 15px',
  borderRadius: 14,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}