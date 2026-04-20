'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getMyProfile } from '../../lib/profile'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getAvailability, type AvailabilityBlock } from '../../lib/availability'
import { buildTodayFocus, rankEvaluations } from '../../lib/study-ai'
import { buildTodayStudyPlan, type StudySessionPlan } from '../../lib/planner-ai'
import {
  createStudySession,
  getStudySessionsByDate,
  type StudySession,
} from '../../lib/study-sessions'
import { adaptTodayPlan } from '../../lib/planner-adaptive'
import AIStudyChat from './AIStudyChat'

const subjectColors: Record<string, string> = {
  'Precálculo': '#3b82f6',
  'Historia': '#f59e0b',
  'Sociología': '#10b981',
  'Psicología': '#ec4899',
  'Seminario': '#8b5cf6',
}

function todayIso() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function HomeView() {
  const [username, setUsername] = useState('...')
  const [career, setCareer] = useState('')
  const [year, setYear] = useState<number | string>(1)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  async function loadAll() {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) return

      setUserId(user.id)

      const profile = await getMyProfile(user.id)
      if (profile) {
        setUsername(profile.username || 'usuario')
        setCareer(profile.career || '')
        setYear(profile.year || 1)
      }

      const [evaluationsData, availabilityData, sessionsData] = await Promise.all([
        getUserEvaluations(user.id),
        getAvailability(user.id),
        getStudySessionsByDate(user.id, todayIso()),
      ])

      setEvaluations(evaluationsData || [])
      setAvailability(availabilityData || [])
      setStudySessions(sessionsData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const ranked = useMemo(() => rankEvaluations(evaluations), [evaluations])
  const focus = useMemo(() => buildTodayFocus(evaluations), [evaluations])

  const basePlan = useMemo(
    () => buildTodayStudyPlan(evaluations, availability),
    [evaluations, availability]
  )

  const adaptivePlanResult = useMemo(
    () => adaptTodayPlan(basePlan, studySessions),
    [basePlan, studySessions]
  )

  const adaptivePlan = adaptivePlanResult.plan

  const availableToday = availability.filter((block) => {
    const today = new Date()
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1
    return block.day_of_week === dayIndex
  })

  async function markSession(plan: StudySessionPlan, status: 'done' | 'skipped') {
    if (!userId) return

    try {
      await createStudySession({
        user_id: userId,
        evaluation_id: plan.evaluationId,
        session_date: todayIso(),
        planned_start: plan.startTime,
        planned_end: plan.endTime,
        planned_minutes: plan.minutes,
        actual_minutes: status === 'done' ? plan.minutes : 0,
        status,
        notes: status === 'done' ? 'Bloque completado' : 'Bloque omitido',
      })

      await loadAll()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div style={cardStyle}>Cargando Home…</div>
  }

  return (
    <div style={containerStyle}>
      <div style={bannerStyle}>
        <div style={bannerTitleStyle}>Salvando College UC</div>
        <div style={bannerSubtitleStyle}>
          Tu sistema para organizar, estudiar y sobrevivir la U
        </div>
      </div>

      <div style={headerCardStyle}>
        <h1 style={headerTitleStyle}>Hola {username} 👋</h1>
        <p style={headerSubtitleStyle}>
          {career} · {year}° año
        </p>
      </div>

      {focus.top ? (
        <div style={heroCardStyle}>
          <div style={heroEyebrowStyle}>Tu foco principal</div>
          <h2 style={heroTitleStyle}>
            {focus.top.evaluation.type} {focus.top.evaluation.number ?? ''} ·{' '}
            {focus.top.evaluation.topic || focus.top.evaluation.title || 'Sin tema'}
          </h2>

          <div style={heroMetaRowStyle}>
            <span
              style={{
                ...subjectPillStyle,
                background:
                  subjectColors[focus.top.evaluation.subject] || '#64748b',
              }}
            >
              {focus.top.evaluation.subject}
            </span>

            <span style={mutedTextStyle}>
              Preparación: {focus.top.preparation}
            </span>

            <span style={mutedTextStyle}>
              Prioridad: {focus.top.score}
            </span>
          </div>

          <div style={heroNoteStyle}>{focus.top.recommendation}</div>
        </div>
      ) : (
        <div style={cardStyle}>
          Aún no tienes evaluaciones. Crea una en Calendario para empezar.
        </div>
      )}

      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statLabelStyle}>En curso</div>
          <div style={statValueStyle}>
            {ranked.filter((item) => item.status === 'en-curso').length}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Próximas</div>
          <div style={statValueStyle}>
            {ranked.filter((item) => item.status === 'proxima').length}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Carga</div>
          <div style={statValueStyle}>{focus.load}</div>
        </div>
      </div>

      <div style={twoColsStyle}>
        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Qué estudiar hoy</h3>

          {availableToday.length === 0 ? (
            <div style={emptyTextStyle}>
              Hoy no tienes bloques de disponibilidad configurados. Ve a Disponibilidad y agrega tus horarios.
            </div>
          ) : adaptivePlan.length === 0 ? (
            <div style={emptyTextStyle}>
              Hoy no hay un plan generado. Puede ser que no tengas evaluaciones activas o próximas.
            </div>
          ) : (
            <>
              <div style={adaptiveMessageBoxStyle}>
                {adaptivePlanResult.message}
              </div>

              {adaptivePlan.map((session: StudySessionPlan, index) => (
                <div key={`${session.evaluationId}-${index}`} style={planItemStyle}>
                  <div style={planTopStyle}>
                    <div style={planTimeStyle}>
                      {session.startTime} → {session.endTime}
                    </div>
                    <div style={planMinutesStyle}>{session.minutes} min</div>
                  </div>

                  <div style={planTitleStyle}>{session.label}</div>
                  <div style={planMetaStyle}>{session.subject}</div>
                  <div style={planReasonStyle}>{session.reason}</div>

                  <div style={planActionsStyle}>
                    <button
                      style={doneButtonStyle}
                      onClick={() => markSession(session, 'done')}
                    >
                      ✔ Lo estudié
                    </button>

                    <button
                      style={skipButtonStyle}
                      onClick={() => markSession(session, 'skipped')}
                    >
                      ✕ No lo estudié
                    </button>
                  </div>
                </div>
              ))}

              <div style={explanationBoxStyle}>
                <div style={explanationTitleStyle}>¿Cómo funciona este plan?</div>
                <div style={explanationTextStyle}>
                  La app usa tus evaluaciones, tu avance, la dificultad y tus bloques horarios reales.
                  Si completas o saltas una sesión, la IA adapta el orden del plan y cambia la prioridad
                  de lo pendiente para el resto del día.
                </div>
              </div>
            </>
          )}
        </div>

        <div style={cardStyle}>
          <h3 style={sectionTitleStyle}>Urgente</h3>

          {ranked.slice(0, 4).map((item) => (
            <div key={item.evaluation.id} style={listItemStyle}>
              <div style={listTopStyle}>
                <div style={listTitleStyle}>
                  {item.evaluation.type} {item.evaluation.number ?? ''} ·{' '}
                  {item.evaluation.topic || item.evaluation.title || 'Sin tema'}
                </div>
                <div style={statusBadge(item.preparation)}>
                  {item.preparation}
                </div>
              </div>

              <div style={listMetaStyle}>
                {item.evaluation.subject} ·{' '}
                {item.status === 'en-curso'
                  ? `cierra en ${item.daysToEnd} día(s)`
                  : `abre en ${item.daysToStart} día(s)`}
              </div>
            </div>
          ))}

          {ranked.length === 0 && (
            <div style={emptyTextStyle}>No hay evaluaciones aún.</div>
          )}
        </div>
      </div>

      <AIStudyChat
        context={
          focus.top
            ? {
                subject: focus.top.evaluation.subject,
                type: focus.top.evaluation.type,
                topic:
                  focus.top.evaluation.topic ||
                  focus.top.evaluation.title ||
                  'tema principal',
                difficulty: focus.top.evaluation.difficulty,
                start_date: focus.top.evaluation.start_date,
                end_date: focus.top.evaluation.end_date,
                number: focus.top.evaluation.number,
                notes: focus.top.evaluation.notes,
              }
            : null
        }
        title="IA académica"
      />
    </div>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'grid',
  gap: '20px',
  padding: '20px',
  minHeight: '100vh',
  background:
    'radial-gradient(circle at 10% 10%, rgba(59,130,246,.25), transparent 30%), radial-gradient(circle at 90% 20%, rgba(16,185,129,.2), transparent 30%), linear-gradient(180deg, #020617, #0f172a)',
  color: 'white',
}

const bannerStyle: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'linear-gradient(135deg,#2563eb,#10b981)',
  boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
}

const bannerTitleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 900,
}

const bannerSubtitleStyle: React.CSSProperties = {
  marginTop: '4px',
  opacity: 0.9,
}

const headerCardStyle: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const headerTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.8rem',
}

const headerSubtitleStyle: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.7,
}

const heroCardStyle: React.CSSProperties = {
  padding: '24px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, rgba(37,99,235,.30), rgba(16,185,129,.18))',
  border: '1px solid rgba(255,255,255,0.10)',
}

const heroEyebrowStyle: React.CSSProperties = {
  opacity: 0.7,
  marginBottom: '8px',
  fontWeight: 700,
}

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.7rem',
}

const heroMetaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '12px',
}

const subjectPillStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '999px',
  fontSize: '0.8rem',
  fontWeight: 800,
}

const mutedTextStyle: React.CSSProperties = {
  opacity: 0.8,
  alignSelf: 'center',
}

const heroNoteStyle: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(0,0,0,0.18)',
}

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '12px',
}

const statCardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const statLabelStyle: React.CSSProperties = {
  opacity: 0.7,
  marginBottom: '8px',
}

const statValueStyle: React.CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: 900,
}

const twoColsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr',
  gap: '20px',
}

const cardStyle: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
}

const emptyTextStyle: React.CSSProperties = {
  opacity: 0.7,
}

const adaptiveMessageBoxStyle: React.CSSProperties = {
  marginBottom: '12px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,0.14)',
  border: '1px solid rgba(59,130,246,0.22)',
}

const planItemStyle: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '12px',
}

const planTopStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
}

const planTimeStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '0.95rem',
}

const planMinutesStyle: React.CSSProperties = {
  opacity: 0.75,
  fontSize: '0.88rem',
}

const planTitleStyle: React.CSSProperties = {
  marginTop: '8px',
  fontWeight: 800,
}

const planMetaStyle: React.CSSProperties = {
  marginTop: '4px',
  opacity: 0.75,
}

const planReasonStyle: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '0.92rem',
  opacity: 0.88,
}

const planActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '12px',
  flexWrap: 'wrap',
}

const doneButtonStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: 'none',
  background: '#10b981',
  color: 'white',
  cursor: 'pointer',
}

const skipButtonStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: 'none',
  background: '#ef4444',
  color: 'white',
  cursor: 'pointer',
}

const explanationBoxStyle: React.CSSProperties = {
  marginTop: '14px',
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(59,130,246,0.12)',
  border: '1px solid rgba(59,130,246,0.24)',
}

const explanationTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '6px',
}

const explanationTextStyle: React.CSSProperties = {
  opacity: 0.9,
  lineHeight: 1.55,
}

const listItemStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '10px',
}

const listTopStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
}

const listTitleStyle: React.CSSProperties = {
  fontWeight: 700,
}

const listMetaStyle: React.CSSProperties = {
  opacity: 0.75,
  fontSize: '0.92rem',
  marginTop: '6px',
}

function statusBadge(preparation: string): React.CSSProperties {
  const color =
    preparation === 'critico'
      ? 'rgba(239,68,68,0.25)'
      : preparation === 'bajo'
      ? 'rgba(245,158,11,0.25)'
      : preparation === 'medio'
      ? 'rgba(59,130,246,0.25)'
      : 'rgba(16,185,129,0.25)'

  return {
    padding: '6px 10px',
    borderRadius: '999px',
    background: color,
    fontSize: '0.8rem',
    fontWeight: 800,
    textTransform: 'capitalize',
  }
}