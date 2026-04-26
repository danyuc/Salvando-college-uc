'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMyProfile } from '@/lib/profile'

type Evaluation = {
  id?: string
  subject?: string | null
  title?: string | null
  type?: string | null
  date?: string | null
  weight?: number | null
  contents?: string | null
  start_time?: string | null
  end_time?: string | null
}

function getDaysLeft(date?: string | null) {
  if (!date) return null

  const target = new Date(`${date}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function formatDate(date?: string | null) {
  if (!date) return 'Sin fecha'

  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return parsed.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getRisk(evaluation: Evaluation) {
  const days = getDaysLeft(evaluation.date)
  const weight = Number(evaluation.weight || 0)

  if (days === null) return 'sin datos'
  if (days < 0) return 'pasada'
  if (days <= 3 && weight >= 0.15) return 'alto'
  if (days <= 10 && weight >= 0.15) return 'medio'
  if (days <= 14) return 'medio'
  return 'bajo'
}

function riskStyle(risk: string): CSSProperties {
  const bg =
    risk === 'alto'
      ? 'rgba(239,68,68,.22)'
      : risk === 'medio'
        ? 'rgba(245,158,11,.22)'
        : risk === 'bajo'
          ? 'rgba(34,197,94,.18)'
          : 'rgba(148,163,184,.16)'

  const color =
    risk === 'alto'
      ? '#fecaca'
      : risk === 'medio'
        ? '#fde68a'
        : risk === 'bajo'
          ? '#bbf7d0'
          : '#cbd5e1'

  return {
    padding: '7px 11px',
    borderRadius: 999,
    background: bg,
    color,
    fontWeight: 900,
    fontSize: 13,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  }
}

function subjectColor(subject?: string | null) {
  const s = (subject || '').toUpperCase()

  if (s.includes('MAT')) return '#22c55e'
  if (s.includes('PSI')) return '#ec4899'
  if (s.includes('SOL') || s.includes('SOC')) return '#6366f1'
  if (s.includes('IHI') || s.includes('HIS')) return '#f59e0b'
  if (s.includes('CLG') || s.includes('SEM')) return '#a855f7'

  return '#3b82f6'
}

export default function HomeView() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('Cargando...')
  const [email, setEmail] = useState('')
  const [career, setCareer] = useState('College UC')
  const [year, setYear] = useState('1')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])

  useEffect(() => {
    async function loadDashboard() {
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
          .not('date', 'is', null)
          .not('title', 'is', null)
          .not('subject', 'is', null)
          .order('date', { ascending: true })

        if (error) throw error

        setEvaluations((evals || []) as Evaluation[])
      } catch (error) {
        console.error('HOME ERROR:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const validEvaluations = useMemo(() => {
    return evaluations
      .filter((e) => e.title && e.subject && e.date)
      .filter((e) => getDaysLeft(e.date) !== null)
      .sort((a, b) => {
        const da = getDaysLeft(a.date) ?? 9999
        const db = getDaysLeft(b.date) ?? 9999
        return da - db
      })
  }, [evaluations])

  const upcoming = useMemo(() => {
    return validEvaluations.filter((e) => (getDaysLeft(e.date) ?? -1) >= 0)
  }, [validEvaluations])

  const focus = useMemo(() => {
    return [...upcoming].sort((a, b) => {
      const daysA = Math.max(getDaysLeft(a.date) ?? 999, 0)
      const daysB = Math.max(getDaysLeft(b.date) ?? 999, 0)

      const scoreA = Number(a.weight || 0) * 120 - daysA
      const scoreB = Number(b.weight || 0) * 120 - daysB

      return scoreB - scoreA
    })[0]
  }, [upcoming])

  const urgentCount = upcoming.filter((e) => getRisk(e) === 'alto').length

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function go(path: string) {
    router.push(path)
  }

  if (loading) {
    return (
      <main style={main}>
        <section style={loadingCard}>Cargando dashboard académico...</section>
      </main>
    )
  }

  return (
    <main style={main}>
      <section style={hero}>
        <div>
          <div style={brand}>Salvando College UC</div>
          <h1 style={heroTitle}>Hola, {username}</h1>
          <p style={heroSubtitle}>
            {career} · {year}° semestre
          </p>
          {email && <p style={emailText}>{email}</p>}
        </div>

        <button onClick={logout} style={logoutButton}>
          Cerrar sesión
        </button>
      </section>

       <nav style={nav}>
         <button onClick={() => go('/')} style={activeNav}>🏠 Home</button>
         <button onClick={() => go('/calendario')} style={navBtn}>📅 Calendario</button>
         <button onClick={() => go('/ia')} style={navBtn}>🧠 IA</button>
         <button onClick={() => go('/notas')} style={navBtn}>📊 Notas</button>
         <button onClick={() => go('/disponibilidad')} style={navBtn}>⏱️ Disponibilidad</button>
         <button onClick={() => go('/ensayo')} style={navBtn}>🧩 Práctica</button>
         <button onClick={() => go('/banco')} style={navBtn}>📚 Banco</button>
         <button onClick={() => go('/pizarra')} style={navBtn}>✍️ Pizarra</button>
         <button onClick={() => go('/ranking')} style={navBtn}>🏆 Ranking</button>
         <button onClick={() => go('/debilidades')} style={navBtn}>🎯 Debilidades</button>
         <button onClick={() => go('/coach-semanal')} style={navBtn}>🧠 Coach</button>
         <button onClick={() => go('/texto-pdf')} style={navBtn}>📄 Texto / PDF</button>
        </nav>

      <section style={summaryCard}>
        <div>
          <h2 style={sectionTitle}>Panel académico inteligente</h2>
          <p style={muted}>
            Fechas reales, ponderaciones, temarios detallados y prioridad de estudio.
          </p>
        </div>

        <div style={statsGrid}>
          <div style={statBox}>
            <span>Evaluaciones</span>
            <strong>{validEvaluations.length}</strong>
          </div>
          <div style={statBox}>
            <span>Próximas</span>
            <strong>{upcoming.length}</strong>
          </div>
          <div style={statBox}>
            <span>Urgentes</span>
            <strong>{urgentCount}</strong>
          </div>
        </div>
      </section>

      <section style={contentGrid}>
        <article style={focusCard}>
          <div style={cardTop}>
            <h3 style={cardTitle}>🔥 Foco del día</h3>
            {focus && <span style={riskStyle(getRisk(focus))}>{getRisk(focus)}</span>}
          </div>

          {focus ? (
            <>
              <h2 style={focusTitle}>
                {focus.subject} · {focus.title}
              </h2>

              <p style={muted}>
                📅 {formatDate(focus.date)} · faltan {getDaysLeft(focus.date)} día(s)
              </p>

              <p style={muted}>
                📊 Ponderación: {(Number(focus.weight || 0) * 100).toFixed(1)}%
              </p>

              {focus.start_time && (
                <p style={muted}>
                  🕒 {focus.start_time}
                  {focus.end_time ? ` a ${focus.end_time}` : ''}
                </p>
              )}

              {focus.contents && <p style={contentsText}>{focus.contents}</p>}

              <button onClick={() => go('/ensayo')} style={primaryButton}>
                Practicar ahora
              </button>
            </>
          ) : (
            <p style={muted}>No hay evaluaciones próximas con fecha válida.</p>
          )}
        </article>

        <article style={card}>
          <h3 style={cardTitle}>⚠️ Riesgo académico</h3>

          {upcoming.length === 0 ? (
            <p style={muted}>Sin evaluaciones próximas.</p>
          ) : (
            upcoming.slice(0, 4).map((e) => (
              <div
                key={e.id || `${e.subject}-${e.title}`}
                style={{
                  ...miniCard,
                  borderLeft: `4px solid ${subjectColor(e.subject)}`,
                }}
              >
                <div style={miniHeader}>
                  <strong>
                    {e.subject} · {e.title}
                  </strong>
                  <span style={riskStyle(getRisk(e))}>{getRisk(e)}</span>
                </div>
                <p style={muted}>
                  {formatDate(e.date)} · {(Number(e.weight || 0) * 100).toFixed(1)}%
                </p>
              </div>
            ))
          )}
        </article>

        <article style={wideCard}>
          <h3 style={cardTitle}>📅 Próximas evaluaciones</h3>

          {upcoming.length === 0 ? (
            <p style={muted}>No hay evaluaciones próximas cargadas.</p>
          ) : (
            upcoming.slice(0, 8).map((e) => (
              <div
                key={e.id || `${e.subject}-${e.title}`}
                style={{
                  ...evaluationRow,
                  borderLeft: `5px solid ${subjectColor(e.subject)}`,
                }}
              >
                <div>
                  <strong style={evaluationTitle}>
                    {e.subject} · {e.title}
                  </strong>
                  <p style={muted}>{e.contents || 'Sin temario detallado.'}</p>
                </div>

                <div style={dateBox}>
                  <strong>{formatDate(e.date)}</strong>
                  <span>{getDaysLeft(e.date)} día(s)</span>
                  <span>{(Number(e.weight || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))
          )}
        </article>

        <article style={card}>
          <h3 style={cardTitle}>🧠 Coach semanal</h3>

          {focus ? (
            <>
              <p style={muted}>
                Esta semana prioriza <strong>{focus.subject}</strong>. Comienza con el
                temario, luego práctica activa y termina revisando errores.
              </p>
              <button onClick={() => go('/coach-semanal')} style={primaryButton}>
                Abrir coach
              </button>
            </>
          ) : (
            <p style={muted}>Sin foco semanal por ahora.</p>
          )}
        </article>
      </section>
    </main>
  )
}

const main: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(37,99,235,.20), transparent 28%), linear-gradient(180deg,#020617,#070b18)',
  color: 'white',
  padding: 24,
  fontFamily: 'Arial, sans-serif',
}

const loadingCard: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
}

const hero: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 20,
  flexWrap: 'wrap',
  padding: 30,
  borderRadius: 30,
  background:
    'linear-gradient(135deg, rgba(15,23,42,.96), rgba(30,41,59,.84))',
  border: '1px solid rgba(255,255,255,.14)',
  boxShadow: '0 24px 80px rgba(0,0,0,.35)',
  marginBottom: 20,
}

const brand: CSSProperties = {
  display: 'inline-block',
  padding: '8px 14px',
  borderRadius: 999,
  background: '#2563eb',
  fontWeight: 900,
  marginBottom: 14,
}

const heroTitle: CSSProperties = {
  margin: 0,
  fontSize: 40,
  letterSpacing: '-0.04em',
}

const heroSubtitle: CSSProperties = {
  margin: '10px 0 0',
  color: '#cbd5e1',
  fontSize: 18,
}

const emailText: CSSProperties = {
  margin: '6px 0 0',
  color: '#94a3b8',
  fontSize: 14,
}

const logoutButton: CSSProperties = {
  padding: '16px 20px',
  borderRadius: 18,
  border: 'none',
  background: '#4c1d2f',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const nav: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 24,
}

const navBtn: CSSProperties = {
  padding: '14px 18px',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,.14)',
  background: '#111827',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const activeNav: CSSProperties = {
  ...navBtn,
  background: '#2563eb',
}

const summaryCard: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  flexWrap: 'wrap',
  padding: 24,
  borderRadius: 26,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 24,
}

const sectionTitle: CSSProperties = {
  margin: 0,
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.55,
}

const statsGrid: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
}

const statBox: CSSProperties = {
  minWidth: 115,
  padding: '14px 16px',
  borderRadius: 18,
  background: '#1e293b',
  display: 'grid',
  gap: 4,
}

const contentGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 18,
}

const card: CSSProperties = {
  padding: 22,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
}

const focusCard: CSSProperties = {
  ...card,
  background:
    'linear-gradient(145deg, rgba(15,23,42,.96), rgba(30,41,59,.88))',
}

const wideCard: CSSProperties = {
  ...card,
  gridColumn: '1 / -1',
}

const cardTop: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  flexWrap: 'wrap',
}

const cardTitle: CSSProperties = {
  margin: 0,
}

const focusTitle: CSSProperties = {
  fontSize: 24,
  marginBottom: 8,
}

const contentsText: CSSProperties = {
  color: '#e2e8f0',
  lineHeight: 1.6,
  marginTop: 14,
}

const primaryButton: CSSProperties = {
  marginTop: 14,
  padding: '13px 16px',
  borderRadius: 16,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const miniCard: CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 16,
  background: '#111827',
}

const miniHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
}

const evaluationRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 18,
  flexWrap: 'wrap',
  padding: 16,
  borderRadius: 18,
  background: '#111827',
  marginTop: 12,
}

const evaluationTitle: CSSProperties = {
  fontSize: 17,
}

const dateBox: CSSProperties = {
  minWidth: 155,
  display: 'grid',
  gap: 6,
  color: '#bfdbfe',
}