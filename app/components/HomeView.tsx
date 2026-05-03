'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getMyProfile } from '@/lib/profile'
import { getUserEvaluations } from '@/lib/evaluations'
import {
  getUpcomingEvaluations,
  getFocusEvaluation,
  formatEvaluationDate,
  getEvaluationDate,
  getEvaluationTitle,
  getEvaluationWeight,
  getEvaluationRisk,
} from '@/lib/academic/evaluation-utils'

type Evaluation = {
  id?: string
  subject?: string | null
  title?: string | null
  topic?: string | null
  type?: string | null
  date?: string | null
  start_date?: string | null
  end_date?: string | null
  weight?: number | null
  weight_percent?: number | null
  contents?: string | null
  notes?: string | null
  days_left?: number | null
  normalized_weight?: number
  normalized_title?: string
  risk_level?: string
  includes_units?: string[] | null
  includes_topics?: string[] | null
  includes_authors?: string[] | null
  format?: string | null
  num_questions?: number | null
  study_tips?: string[] | null
  recommended_hours?: number | null
  difficulty_level?: string | null
}

type Profile = {
  username?: string | null
  institutional_email?: string | null
  career?: string | null
  year?: number | string | null
}

type StudyStep = {
  title: string
  detail: string
  duration: string
  tone: 'blue' | 'green' | 'amber' | 'purple'
}

function getSubjectDisplayName(subject?: string | null) {
  const map: Record<string, string> = {
    SOL500: '¿Qué es la Sociología?',
    MAT1000: 'Matemática',
    PSI1101: 'Psicología',
    IHI0204: 'Taller de fuentes I',
  }

  return subject ? map[subject] ?? subject : 'Sin ramo'
}

function subjectColor(subject?: string | null) {
  const s = (subject || '').toLowerCase()

  if (s.includes('sol500') || s.includes('socio')) return '#6366f1'
  if (s.includes('pre') || s.includes('mat')) return '#22c55e'
  if (s.includes('psico')) return '#ec4899'
  if (s.includes('hist') || s.includes('ihi')) return '#f59e0b'
  if (s.includes('seminario')) return '#a855f7'

  return '#3b82f6'
}

function riskLabel(risk?: string | null) {
  if (risk === 'alto') return 'Alto'
  if (risk === 'medio') return 'Medio'
  if (risk === 'bajo') return 'Bajo'
  if (risk === 'pasada') return 'Pasada'
  return 'Sin datos'
}

function riskBadgeStyle(risk?: string | null): CSSProperties {
  const base: CSSProperties = {
    padding: '7px 11px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  }

  if (risk === 'alto') {
    return {
      ...base,
      background: 'rgba(239,68,68,.18)',
      color: '#fecaca',
      border: '1px solid rgba(239,68,68,.35)',
    }
  }

  if (risk === 'medio') {
    return {
      ...base,
      background: 'rgba(245,158,11,.18)',
      color: '#fde68a',
      border: '1px solid rgba(245,158,11,.35)',
    }
  }

  if (risk === 'bajo') {
    return {
      ...base,
      background: 'rgba(34,197,94,.16)',
      color: '#bbf7d0',
      border: '1px solid rgba(34,197,94,.30)',
    }
  }

  return {
    ...base,
    background: 'rgba(148,163,184,.14)',
    color: '#cbd5e1',
    border: '1px solid rgba(148,163,184,.25)',
  }
}

function daysText(days?: number | null) {
  if (days === null || days === undefined) return 'Sin fecha'
  if (days < 0) return 'Ya pasó'
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  return `Faltan ${days} días`
}

function showList(items?: string[] | null, fallback = 'Sin información cargada') {
  if (!items || items.length === 0) return fallback
  return items.join(' · ')
}

function isExamClose(evaluation?: Evaluation | null) {
  const days = evaluation?.days_left
  return typeof days === 'number' && days >= 0 && days <= 5
}

function readinessLabel(evaluation?: Evaluation | null) {
  if (!evaluation) return 'Sin evaluación'
  const risk = getEvaluationRisk(evaluation)

  if (risk === 'alto') return 'Preparación urgente'
  if (risk === 'medio') return 'Preparación activa'
  if (risk === 'bajo') return 'Preparación estable'

  return 'Sin datos suficientes'
}

function buildSubjectSummary(evaluations: Evaluation[]) {
  const map = new Map<string, Evaluation[]>()

  for (const ev of evaluations) {
    const subject = ev.subject || 'General'
    if (!map.has(subject)) map.set(subject, [])
    map.get(subject)!.push(ev)
  }

  return [...map.entries()]
    .map(([subject, items]) => {
      const urgent = items.filter((e) => getEvaluationRisk(e) === 'alto').length
      const totalWeight = items.reduce(
        (sum, e) => sum + Number(e.normalized_weight || getEvaluationWeight(e) || 0),
        0
      )

      return {
        subject,
        total: items.length,
        urgent,
        next: items[0],
        totalWeight,
        color: subjectColor(subject),
      }
    })
    .sort((a, b) => {
      if (b.urgent !== a.urgent) return b.urgent - a.urgent
      return b.totalWeight - a.totalWeight
    })
}

function buildStudyPlan(evaluation?: Evaluation | null): StudyStep[] {
  if (!evaluation) {
    return [
      {
        title: 'Agrega una evaluación',
        detail: 'Carga una fecha para activar el plan automático.',
        duration: '2 min',
        tone: 'blue',
      },
    ]
  }

  const topic = evaluation.includes_topics?.[0] || evaluation.topic || 'contenido principal'
  const author = evaluation.includes_authors?.[0] || 'autor principal'
  const close = isExamClose(evaluation)

  if (close) {
    return [
      {
        title: 'Diagnóstico rápido',
        detail: `Responde preguntas de ${topic} para detectar debilidades.`,
        duration: '10 min',
        tone: 'amber',
      },
      {
        title: 'Práctica dirigida',
        detail: `Entrena autores clave: ${showList(evaluation.includes_authors, author)}.`,
        duration: '20 min',
        tone: 'blue',
      },
      {
        title: 'Respuesta de desarrollo',
        detail: 'Escribe una respuesta corta como si fuera prueba real.',
        duration: '12 min',
        tone: 'purple',
      },
      {
        title: 'Revisión final',
        detail: 'Repasa errores y conceptos que se repiten.',
        duration: '8 min',
        tone: 'green',
      },
    ]
  }

  return [
    {
      title: 'Activación inicial',
      detail: `Revisa qué entra: ${showList(evaluation.includes_units, 'unidades cargadas')}.`,
      duration: '8 min',
      tone: 'blue',
    },
    {
      title: 'Bloque de preguntas',
      detail: `Practica ${topic} con dificultad progresiva.`,
      duration: '18 min',
      tone: 'green',
    },
    {
      title: 'Mini pausa inteligente',
      detail: 'Cierra el bloque, respira y continúa con el siguiente paso.',
      duration: '3 min',
      tone: 'amber',
    },
  ]
}

function toneStyle(tone: StudyStep['tone']): CSSProperties {
  if (tone === 'green') return { background: 'rgba(34,197,94,.14)', border: '1px solid rgba(34,197,94,.25)' }
  if (tone === 'amber') return { background: 'rgba(245,158,11,.14)', border: '1px solid rgba(245,158,11,.25)' }
  if (tone === 'purple') return { background: 'rgba(168,85,247,.14)', border: '1px solid rgba(168,85,247,.25)' }
  return { background: 'rgba(37,99,235,.14)', border: '1px solid rgba(37,99,235,.25)' }
}

export default function HomeView() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadHome() {
      try {
        setLoading(true)
        setError('')

        const { data } = await supabase.auth.getUser()

        if (!data.user) {
          router.replace('/login')
          return
        }

        setEmail(data.user.email || '')

        const [profileData, evaluationData] = await Promise.all([
          getMyProfile(data.user.id),
          getUserEvaluations(data.user.id),
        ])

        setProfile(profileData || null)
        setEvaluations((evaluationData || []) as Evaluation[])
      } catch (err) {
        console.error('HOME LOAD ERROR:', err)
        setError('No se pudo cargar el panel académico.')
      } finally {
        setLoading(false)
      }
    }

    loadHome()
  }, [router])

  const username =
    profile?.username ||
    profile?.institutional_email?.split('@')[0] ||
    email.split('@')[0] ||
    'Usuario UC'

  const career = profile?.career || 'College UC'
  const year = profile?.year ? `${profile.year}° semestre` : 'Semestre activo'

  const upcoming = useMemo(() => getUpcomingEvaluations(evaluations), [evaluations])
  const focus = useMemo(() => getFocusEvaluation(evaluations), [evaluations])
  const studyPlan = useMemo(() => buildStudyPlan(focus), [focus])

  const urgentCount = upcoming.filter((e) => getEvaluationRisk(e) === 'alto').length
  const mediumCount = upcoming.filter((e) => getEvaluationRisk(e) === 'medio').length
  const totalWeight = upcoming.reduce((sum, e) => sum + getEvaluationWeight(e), 0)

  const subjectSummary = useMemo(() => buildSubjectSummary(upcoming), [upcoming])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function go(path: string) {
    router.push(path)
  }

   function practiceEvaluation(evaluation?: Evaluation | null, mode?: string) {
  if (mode === 'diagnostico') {
    if (evaluation?.id) {
      router.push(`/diagnostico?evaluationId=${evaluation.id}`)
      return
    }

    router.push('/diagnostico')
    return
  }

  if (evaluation?.id) {
    const suffix = mode ? `&mode=${mode}` : ''
    router.push(`/practica?evaluationId=${evaluation.id}${suffix}`)
    return
  }

  router.push('/practica')
}

  if (loading) {
    
  
  
  
return (
      <main style={main}>
        <section style={loadingCard}>Cargando panel UC...</section>
      </main>
    )
  }

  
  
  
  
return (
    <main style={main}>
      <section style={hero}>
        <div style={heroContent}>
          <div style={premiumPill}>Salvando College UC</div>

          <h1 style={heroTitle}>Hola, {username}</h1>

          <p style={heroSubtitle}>
            {career} · {year}
          </p>

          {email && <p style={emailText}>{email}</p>}

          <div style={heroActions}>
            <button onClick={() => practiceEvaluation(focus)} style={primaryButton}>
              Practicar foco
            </button>

            <button onClick={() => practiceEvaluation(focus, 'diagnostico')} style={secondaryButton}>
              Diagnóstico
            </button>

            <button onClick={() => go('/calendario')} style={secondaryButton}>
              Calendario
            </button>
          </div>
        </div>

        <div style={heroPanel}>
          <div style={heroPanelLabel}>Estado académico</div>
          <div style={heroPanelValue}>
            {urgentCount > 0
              ? 'Prioridad alta'
              : upcoming.length > 0
                ? 'En seguimiento'
                : 'Sin fechas'}
          </div>
          <div style={heroPanelHint}>
            {focus
              ? `${getSubjectDisplayName(focus.subject)} · ${readinessLabel(focus)}`
              : 'Agrega evaluaciones para activar predicción, coach y foco diario.'}
          </div>
        </div>

        <button onClick={logout} style={logoutButton}>
          Cerrar sesión
        </button>
      </section>

      {error && <section style={errorBox}>{error}</section>}

      {isExamClose(focus) && (
        <section style={examModeBanner}>
          <div>
            <strong>🚨 Modo examen cercano activado</strong>
            <p style={muted}>
              La app prioriza diagnóstico, práctica dirigida y simulación porque la evaluación está próxima.
            </p>
          </div>

          <button onClick={() => practiceEvaluation(focus, 'simulacion')} style={primaryButton}>
            Simular prueba
          </button>
        </section>
      )}

      <section style={statsGrid}>
        <StatCard label="Evaluaciones próximas" value={upcoming.length} detail="con fecha válida" />
        <StatCard label="Urgentes" value={urgentCount} detail="riesgo alto" />
        <StatCard label="Riesgo medio" value={mediumCount} detail="requieren seguimiento" />
        <StatCard label="Peso total próximo" value={`${totalWeight.toFixed(1)}%`} detail="ponderación acumulada" />
      </section>

      <section style={contentGrid}>
        <article style={focusCard}>
          <div style={cardHeader}>
            <div>
              <h2 style={cardTitle}>🔥 Foco del día</h2>
              <p style={muted}>Prioridad calculada por fecha, peso, riesgo y cercanía.</p>
            </div>

            {focus && (
              <span style={riskBadgeStyle(getEvaluationRisk(focus))}>
                {riskLabel(getEvaluationRisk(focus))}
              </span>
            )}
          </div>

          {focus ? (
            <div style={focusBody}>
              <div style={{ ...subjectStripe, background: subjectColor(focus.subject) }} />

              <div>
                <p style={subjectCode}>{focus.subject}</p>

                <h3 style={focusTitle}>
                  {getSubjectDisplayName(focus.subject)} · {getEvaluationTitle(focus)}
                </h3>

                <p style={muted}>
                  📅 {formatEvaluationDate(getEvaluationDate(focus))} · {daysText(focus.days_left)}
                </p>

                <p style={muted}>
                  📊 Ponderación: {getEvaluationWeight(focus).toFixed(1)}%
                </p>

                <EvaluationScope evaluation={focus} />

                <div style={buttonRow}>
                  <button onClick={() => practiceEvaluation(focus)} style={primaryButton}>
                    Practicar este foco
                  </button>

                  <button onClick={() => practiceEvaluation(focus, 'diagnostico')} style={secondaryButton}>
                    Diagnóstico de prueba
                  </button>

                  <button onClick={() => practiceEvaluation(focus, 'simulacion')} style={ghostButton}>
                    Simular prueba
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Sin foco por ahora"
              text="Agrega una evaluación futura en Calendario para activar el foco del día."
              action="Agregar evaluación"
              onClick={() => go('/calendario')}
            />
          )}
        </article>

        <article style={card}>
          <h2 style={cardTitle}>🧠 Plan recomendado de hoy</h2>
          <p style={muted}>
            Bloques cortos de estudio organizados sin que tengas que planificar manualmente.
          </p>

          <div style={planList}>
            {studyPlan.map((step, index) => (
              <div key={`${step.title}-${index}`} style={{ ...planItem, ...toneStyle(step.tone) }}>
                <div style={planNumber}>{index + 1}</div>
                <div>
                  <strong>{step.title}</strong>
                  <p style={smallMuted}>{step.detail}</p>
                  <span style={durationPill}>{step.duration}</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => practiceEvaluation(focus)} style={primaryButton}>
            Iniciar sesión inteligente
          </button>
        </article>

        <article style={card}>
          <div style={cardHeader}>
            <h2 style={cardTitle}>⚠️ Riesgo por ramo</h2>
          </div>

          {subjectSummary.length === 0 ? (
            <p style={muted}>Sin ramos próximos para analizar.</p>
          ) : (
            <div style={list}>
              {subjectSummary.slice(0, 5).map((item) => (
                <div key={item.subject} style={subjectItem}>
                  <div style={{ ...subjectDot, background: item.color }} />

                  <div style={{ flex: 1 }}>
                    <strong>{getSubjectDisplayName(item.subject)}</strong>
                    <p style={smallMuted}>
                      {item.subject} · {item.total} evaluación(es) · {item.urgent} urgente(s)
                    </p>
                  </div>

                  <span style={riskBadgeStyle(item.urgent > 0 ? 'alto' : 'medio')}>
                    {item.urgent > 0 ? 'Alto' : 'Medio'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article style={wideCard}>
          <div style={cardHeader}>
            <div>
              <h2 style={cardTitle}>📅 Próximas evaluaciones</h2>
              <p style={muted}>Calendario académico ordenado por cercanía.</p>
            </div>

            <button onClick={() => go('/calendario')} style={secondaryButton}>
              Gestionar
            </button>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState
              title="No hay evaluaciones próximas"
              text="Cuando agregues fechas, aparecerán aquí, en riesgo, coach y calendario."
              action="Abrir calendario"
              onClick={() => go('/calendario')}
            />
          ) : (
            <div style={evaluationList}>
              {upcoming.slice(0, 8).map((e) => (
                <div
                  key={e.id || `${e.subject}-${getEvaluationTitle(e)}`}
                  style={{
                    ...evaluationCard,
                    borderLeft: `5px solid ${subjectColor(e.subject)}`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={evaluationTop}>
                      <div>
                        <strong style={evaluationTitle}>
                          {getSubjectDisplayName(e.subject)} · {getEvaluationTitle(e)}
                        </strong>

                        <p style={subjectCode}>{e.subject}</p>
                      </div>

                      <span style={riskBadgeStyle(getEvaluationRisk(e))}>
                        {riskLabel(getEvaluationRisk(e))}
                      </span>
                    </div>

                    <p style={muted}>
                      {e.type || 'Evaluación'} · {formatEvaluationDate(getEvaluationDate(e))}
                    </p>

                    <EvaluationScope evaluation={e} compact />
                  </div>

                  <div style={dateBox}>
                    <strong>{daysText(e.days_left)}</strong>
                    <span>{getEvaluationWeight(e).toFixed(1)}%</span>

                    <button onClick={() => practiceEvaluation(e)} style={miniButton}>
                      Practicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article style={card}>
          <h2 style={cardTitle}>🎯 Acciones rápidas</h2>

          <div style={quickActions}>
            <button onClick={() => practiceEvaluation(focus, 'diagnostico')} style={quickButton}>
              Diagnóstico
            </button>

            <button onClick={() => practiceEvaluation(focus, 'simulacion')} style={quickButton}>
              Simulación
            </button>

            <button onClick={() => go('/debilidades')} style={quickButton}>
              Debilidades
            </button>

            <button onClick={() => go('/banco')} style={quickButton}>
              Banco UC
            </button>

            <button onClick={() => go('/coach-semanal')} style={quickButton}>
              Coach
            </button>
          </div>
        </article>

        <article style={card}>
          <h2 style={cardTitle}>📌 Si tienes poco tiempo</h2>
          <p style={muted}>
            Haz una ronda corta: diagnóstico, 5 preguntas del foco y una revisión de errores.
          </p>

          <button onClick={() => practiceEvaluation(focus, 'rapido')} style={primaryButton}>
            Empezar ronda corta
          </button>
        </article>

        <article style={card}>
          <h2 style={cardTitle}>📚 Banco UC</h2>
          <p style={muted}>
            Banco conectado a práctica, diagnóstico, autores y evaluaciones reales.
          </p>

          <button onClick={() => go('/banco')} style={secondaryButton}>
            Abrir banco
          </button>
        </article>
      </section>
    </main>
  )
}

function EvaluationScope({
  evaluation,
  compact = false,
}: {
  evaluation: Evaluation
  compact?: boolean
}) {
  const hasAny =
    Boolean(evaluation.includes_units?.length) ||
    Boolean(evaluation.includes_topics?.length) ||
    Boolean(evaluation.includes_authors?.length) ||
    Boolean(evaluation.format) ||
    Boolean(evaluation.num_questions) ||
    Boolean(evaluation.difficulty_level)

  if (!hasAny && compact) return null

  
  
  
  
return (
    <div style={compact ? scopeCompact : scopeBox}>
      {!compact && <strong style={scopeTitle}>Qué incluye la prueba</strong>}

      <p style={scopeText}>
        <strong>Unidades:</strong> {showList(evaluation.includes_units)}
      </p>

      <p style={scopeText}>
        <strong>Temas:</strong> {showList(evaluation.includes_topics)}
      </p>

      <p style={scopeText}>
        <strong>Autores:</strong> {showList(evaluation.includes_authors)}
      </p>

      {!compact && (
        <>
          <p style={scopeText}>
            <strong>Formato:</strong> {evaluation.format || 'Sin formato cargado'}
          </p>

          <p style={scopeText}>
            <strong>Preguntas:</strong> {evaluation.num_questions ?? 'Sin dato'} ·{' '}
            <strong>Dificultad:</strong> {evaluation.difficulty_level || 'Sin dato'}
          </p>

          {evaluation.study_tips?.length ? (
            <div style={tipsBox}>
              <strong>Tips de estudio:</strong>
              <ul style={tipsList}>
                {evaluation.study_tips.slice(0, 4).map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail: string
}) {
  
  
  
  
return (
    <div style={statCard}>
      <span style={statLabel}>{label}</span>
      <strong style={statValue}>{value}</strong>
      <span style={statDetail}>{detail}</span>
    </div>
  )
}

function EmptyState({
  title,
  text,
  action,
  onClick,
}: {
  title: string
  text: string
  action: string
  onClick: () => void
}) {
  
  
  
  
return (
    <div style={emptyState}>
      <strong>{title}</strong>
      <p style={muted}>{text}</p>
      <button onClick={onClick} style={secondaryButton}>
        {action}
      </button>
    </div>
  )
}

const main: CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  color: 'white',
  background:
    'radial-gradient(circle at top left, rgba(37,99,235,.20), transparent 28%), radial-gradient(circle at top right, rgba(168,85,247,.12), transparent 30%), linear-gradient(180deg,#020617,#070b18)',
  fontFamily: 'Arial, sans-serif',
}

const loadingCard: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
}

const hero: CSSProperties = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1.4fr .8fr auto',
  gap: 20,
  alignItems: 'center',
  padding: 30,
  borderRadius: 30,
  background:
    'linear-gradient(135deg, rgba(15,23,42,.98), rgba(30,41,59,.88))',
  border: '1px solid rgba(255,255,255,.14)',
  boxShadow: '0 24px 80px rgba(0,0,0,.35)',
  marginBottom: 20,
}

const heroContent: CSSProperties = {
  display: 'grid',
  gap: 8,
}

const premiumPill: CSSProperties = {
  width: 'fit-content',
  padding: '8px 14px',
  borderRadius: 999,
  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  fontWeight: 900,
  marginBottom: 8,
}

const heroTitle: CSSProperties = {
  margin: 0,
  fontSize: 42,
  letterSpacing: '-0.04em',
}

const heroSubtitle: CSSProperties = {
  margin: 0,
  color: '#cbd5e1',
  fontSize: 18,
}

const emailText: CSSProperties = {
  margin: 0,
  color: '#94a3b8',
  fontSize: 14,
}

const heroActions: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 14,
}

const heroPanel: CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.10)',
}

const heroPanelLabel: CSSProperties = {
  color: '#93c5fd',
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
}

const heroPanelValue: CSSProperties = {
  fontSize: 26,
  fontWeight: 900,
  marginBottom: 8,
}

const heroPanelHint: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.45,
  fontSize: 14,
}

const logoutButton: CSSProperties = {
  padding: '14px 16px',
  borderRadius: 16,
  border: 'none',
  background: '#4c1d2f',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const examModeBanner: CSSProperties = {
  padding: 20,
  borderRadius: 22,
  marginBottom: 20,
  background: 'linear-gradient(135deg, rgba(239,68,68,.20), rgba(245,158,11,.14))',
  border: '1px solid rgba(248,113,113,.25)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  alignItems: 'center',
}

const statsGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 14,
  marginBottom: 20,
}

const statCard: CSSProperties = {
  padding: 18,
  borderRadius: 20,
  background: 'rgba(15,23,42,.92)',
  border: '1px solid rgba(255,255,255,.12)',
}

const statLabel: CSSProperties = {
  color: '#94a3b8',
  fontSize: 13,
  fontWeight: 800,
}

const statValue: CSSProperties = {
  display: 'block',
  fontSize: 30,
  marginTop: 8,
  marginBottom: 4,
}

const statDetail: CSSProperties = {
  color: '#cbd5e1',
  fontSize: 13,
}

const contentGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
  gap: 18,
}

const card: CSSProperties = {
  padding: 22,
  borderRadius: 24,
  background: 'rgba(15,23,42,.94)',
  border: '1px solid rgba(255,255,255,.12)',
}

const focusCard: CSSProperties = {
  ...card,
  background:
    'linear-gradient(145deg, rgba(15,23,42,.98), rgba(30,41,59,.92))',
}

const wideCard: CSSProperties = {
  ...card,
  gridColumn: '1 / -1',
}

const cardHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 14,
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  marginBottom: 16,
}

const cardTitle: CSSProperties = {
  margin: 0,
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.55,
}

const smallMuted: CSSProperties = {
  color: '#94a3b8',
  lineHeight: 1.45,
  margin: '6px 0 0',
  fontSize: 14,
}

const subjectCode: CSSProperties = {
  margin: '0 0 5px',
  color: '#93c5fd',
  fontSize: 13,
  fontWeight: 900,
}

const focusBody: CSSProperties = {
  position: 'relative',
  display: 'flex',
  gap: 16,
}

const subjectStripe: CSSProperties = {
  width: 6,
  borderRadius: 999,
  flexShrink: 0,
}

const focusTitle: CSSProperties = {
  margin: '0 0 8px',
  fontSize: 24,
}

const buttonRow: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
}

const primaryButton: CSSProperties = {
  marginTop: 12,
  padding: '13px 16px',
  borderRadius: 16,
  border: 'none',
  background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const secondaryButton: CSSProperties = {
  marginTop: 12,
  padding: '13px 16px',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,.14)',
  background: 'rgba(255,255,255,.07)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const ghostButton: CSSProperties = {
  ...secondaryButton,
}

const miniButton: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const list: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const subjectItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 14,
  borderRadius: 16,
  background: '#111827',
}

const subjectDot: CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 999,
  flexShrink: 0,
}

const evaluationList: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const evaluationCard: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 18,
  flexWrap: 'wrap',
  padding: 16,
  borderRadius: 18,
  background: '#111827',
}

const evaluationTop: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
}

const evaluationTitle: CSSProperties = {
  fontSize: 17,
}

const dateBox: CSSProperties = {
  minWidth: 150,
  display: 'grid',
  gap: 6,
  color: '#bfdbfe',
  alignContent: 'start',
}

const scopeBox: CSSProperties = {
  marginTop: 14,
  marginBottom: 14,
  padding: 14,
  borderRadius: 16,
  background: 'rgba(255,255,255,.055)',
  border: '1px solid rgba(255,255,255,.09)',
}

const scopeCompact: CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  background: 'rgba(255,255,255,.045)',
  border: '1px solid rgba(255,255,255,.07)',
}

const scopeTitle: CSSProperties = {
  display: 'block',
  marginBottom: 8,
}

const scopeText: CSSProperties = {
  margin: '6px 0',
  color: '#cbd5e1',
  lineHeight: 1.45,
  fontSize: 14,
}

const tipsBox: CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: 'rgba(37,99,235,.12)',
  border: '1px solid rgba(37,99,235,.20)',
}

const tipsList: CSSProperties = {
  margin: '8px 0 0',
  paddingLeft: 18,
  color: '#dbeafe',
  lineHeight: 1.45,
}

const planList: CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 14,
}

const planItem: CSSProperties = {
  display: 'flex',
  gap: 12,
  padding: 13,
  borderRadius: 16,
}

const planNumber: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: 'grid',
  placeItems: 'center',
  background: 'rgba(255,255,255,.12)',
  fontWeight: 900,
  flexShrink: 0,
}

const durationPill: CSSProperties = {
  display: 'inline-block',
  marginTop: 8,
  padding: '5px 8px',
  borderRadius: 999,
  background: 'rgba(255,255,255,.10)',
  color: '#e2e8f0',
  fontSize: 12,
  fontWeight: 900,
}

const quickActions: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 10,
  marginTop: 14,
}

const quickButton: CSSProperties = {
  padding: 13,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.12)',
  background: '#111827',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const emptyState: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: '#111827',
  border: '1px solid rgba(255,255,255,.08)',
}

const errorBox: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  marginBottom: 18,
  background: 'rgba(239,68,68,.16)',
  border: '1px solid rgba(239,68,68,.35)',
  color: '#fecaca',
}