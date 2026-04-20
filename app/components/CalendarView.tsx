'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  deleteEvaluation,
  getUserEvaluations,
  type Evaluation,
} from '../../lib/evaluations'
import { getAvailability, type AvailabilityBlock } from '../../lib/availability'
import { buildTodayStudyPlan } from '../../lib/planner-ai'
import { buildFullGradeAnalysis } from '../../lib/grade-engine'
import { getQuestionEngineBySubject } from '../../lib/question-engine'
import EvaluationForm from './EvaluationForm'
import AIStudyChat from './AIStudyChat'

const subjectColors: Record<string, string> = {
  Precálculo: '#3b82f6',
  Historia: '#f59e0b',
  Sociología: '#10b981',
  Psicología: '#ec4899',
  Seminario: '#8b5cf6',
}

type ViewMode = 'week' | 'month'

type EvaluationExtended = Evaluation & {
  grade?: number | null
  weight_percent?: number | null
}

export default function CalendarView() {
  const [userId, setUserId] = useState('')
  const [evaluations, setEvaluations] = useState<EvaluationExtended[]>([])
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [view, setView] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [editing, setEditing] = useState<EvaluationExtended | null>(null)
  const [aiTarget, setAiTarget] = useState<EvaluationExtended | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) return

      setUserId(user.id)

      const [evaluationsData, availabilityData] = await Promise.all([
        getUserEvaluations(user.id),
        getAvailability(user.id),
      ])

      setEvaluations((evaluationsData || []) as EvaluationExtended[])
      setAvailability(availabilityData || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function normalize(date: Date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function isInRange(date: Date, start: string, end: string) {
    const target = normalize(date).getTime()
    const s = normalize(new Date(start)).getTime()
    const e = normalize(new Date(end)).getTime()
    return target >= s && target <= e
  }

  function getWeekDays(baseDate: Date) {
    const start = new Date(baseDate)
    const weekday = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - weekday)

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])

  const monthData = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const offset = (firstDay.getDay() + 6) % 7

    const cells: Date[] = []
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(year, month, i - offset + 1))
    }

    return { year, month, cells }
  }, [selectedDate])

  const active = useMemo(
    () =>
      evaluations.filter((e) =>
        isInRange(new Date(), e.start_date, e.end_date)
      ),
    [evaluations]
  )

  const upcoming = useMemo(
    () =>
      [...evaluations]
        .filter((e) => normalize(new Date(e.start_date)) > normalize(new Date()))
        .sort(
          (a, b) =>
            normalize(new Date(a.start_date)).getTime() -
            normalize(new Date(b.start_date)).getTime()
        ),
    [evaluations]
  )

  const selectedDayEvaluations = useMemo(
    () =>
      evaluations.filter((e) =>
        isInRange(selectedDate, e.start_date, e.end_date)
      ),
    [evaluations, selectedDate]
  )

  const todayPlan = useMemo(
    () => buildTodayStudyPlan(evaluations, availability),
    [evaluations, availability]
  )

  const gradeSummaries = useMemo(
    () => buildSubjectGradeSummaries(evaluations),
    [evaluations]
  )

  const questionEngine = useMemo(
    () =>
      aiTarget
        ? getQuestionEngineBySubject(aiTarget.subject, aiTarget.type)
        : null,
    [aiTarget]
  )

  async function handleDelete(id: string) {
    try {
      await deleteEvaluation(id)
      if (editing?.id === id) setEditing(null)
      if (aiTarget?.id === id) setAiTarget(null)
      await load()
    } catch (error) {
      console.error(error)
    }
  }

  function goPrev() {
    const next = new Date(selectedDate)
    if (view === 'week') next.setDate(next.getDate() - 7)
    else next.setMonth(next.getMonth() - 1)
    setSelectedDate(next)
  }

  function goNext() {
    const next = new Date(selectedDate)
    if (view === 'week') next.setDate(next.getDate() + 7)
    else next.setMonth(next.getMonth() + 1)
    setSelectedDate(next)
  }

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h2 style={title}>Calendar PRO</h2>
          <p style={subtitle}>
            Calendario, planner visual, notas base e IA por ramo en una sola vista.
          </p>
        </div>

        <div style={controls}>
          <button
            onClick={() => setView('week')}
            style={view === 'week' ? activeToggleButton : toggleButton}
          >
            Semana
          </button>
          <button
            onClick={() => setView('month')}
            style={view === 'month' ? activeToggleButton : toggleButton}
          >
            Mes
          </button>
        </div>
      </div>

      <div style={layout}>
        <div style={leftColumn}>
          <div style={calendarCard}>
            <div style={calendarToolbar}>
              <button onClick={goPrev} style={navButton}>
                ←
              </button>

              <div style={calendarTitle}>
                {selectedDate.toLocaleDateString('es-CL', {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>

              <button onClick={goNext} style={navButton}>
                →
              </button>
            </div>

            {view === 'week' ? (
              <div style={weekGrid}>
                {weekDays.map((day) => {
                  const dayEvaluations = evaluations.filter((e) =>
                    isInRange(day, e.start_date, e.end_date)
                  )

                  const isSelected =
                    normalize(day).getTime() === normalize(selectedDate).getTime()

                  return (
                    <div
                      key={day.toISOString()}
                      style={{
                        ...weekDayColumn,
                        ...(isSelected ? selectedDay : {}),
                      }}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div style={weekHeader}>
                        <div style={weekName}>
                          {day.toLocaleDateString('es-CL', { weekday: 'short' })}
                        </div>
                        <div style={weekNumber}>{day.getDate()}</div>
                      </div>

                      <div style={eventsList}>
                        {dayEvaluations.length === 0 && (
                          <div style={emptySmall}>Sin eventos</div>
                        )}

                        {dayEvaluations.map((e) => (
                          <div
                            key={e.id}
                            style={{
                              ...eventChip,
                              background: subjectColors[e.subject] || '#64748b',
                            }}
                          >
                            {e.type} {e.number ?? ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={monthGrid}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={`${d}-${i}`} style={monthHeader}>
                    {d}
                  </div>
                ))}

                {monthData.cells.map((day) => {
                  const dayEvaluations = evaluations.filter((e) =>
                    isInRange(day, e.start_date, e.end_date)
                  )

                  const isCurrentMonth = day.getMonth() === monthData.month
                  const isSelected =
                    normalize(day).getTime() === normalize(selectedDate).getTime()

                  return (
                    <div
                      key={day.toISOString()}
                      style={{
                        ...monthCell,
                        opacity: isCurrentMonth ? 1 : 0.35,
                        ...(isSelected ? selectedDay : {}),
                      }}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div style={monthNumber}>{day.getDate()}</div>

                      <div style={dotsRow}>
                        {dayEvaluations.slice(0, 4).map((e) => (
                          <div
                            key={e.id}
                            style={{
                              ...dot,
                              background: subjectColors[e.subject] || '#64748b',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={plannerCard}>
            <div style={sectionHeader}>
              <h3 style={sectionTitle}>Planner visual de hoy</h3>
              <span style={mutedText}>
                Bloques reales según tu disponibilidad
              </span>
            </div>

            {todayPlan.length === 0 ? (
              <div style={emptyText}>
                No hay bloques planificados para hoy. Revisa tu disponibilidad o tus evaluaciones.
              </div>
            ) : (
              <div style={timeline}>
                {todayPlan.map((session, index) => (
                  <div key={`${session.evaluationId}-${index}`} style={timelineItem}>
                    <div style={timelineTime}>
                      {session.startTime}
                      <div style={timelineLine} />
                      {session.endTime}
                    </div>

                    <div style={timelineContent}>
                      <div
                        style={{
                          ...timelineSubjectBar,
                          background: subjectColors[session.subject] || '#64748b',
                        }}
                      />

                      <div>
                        <div style={timelineTitle}>{session.label}</div>
                        <div style={timelineMeta}>
                          {session.subject} · {session.minutes} min
                        </div>
                        <div style={timelineReason}>{session.reason}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={formCard}>
            <EvaluationForm
              userId={userId}
              initialData={editing}
              onSaved={() => {
                setEditing(null)
                load()
              }}
            />
          </div>
        </div>

        <div style={rightColumn}>
          <div style={sideCard}>
            <h3 style={sideTitle}>⚠️ En curso</h3>

            {loading ? (
              <div style={emptyText}>Cargando...</div>
            ) : active.length === 0 ? (
              <div style={emptyText}>No hay evaluaciones activas.</div>
            ) : (
              active.map((e) => (
                <div key={e.id} style={sideItem}>
                  <div style={sideTop}>
                    <div style={sideItemTitle}>
                      {e.type} {e.number ?? ''} · {e.topic || e.title || 'Sin tema'}
                    </div>
                    <span
                      style={{
                        ...miniTag,
                        background: subjectColors[e.subject] || '#64748b',
                      }}
                    />
                  </div>

                  <div style={sideMeta}>
                    {e.subject} · hasta {e.end_date}
                  </div>

                  <div style={sideActions}>
                    <button style={smallButton} onClick={() => setEditing(e)}>
                      Editar
                    </button>
                    <button style={smallButton} onClick={() => setAiTarget(e)}>
                      IA
                    </button>
                    <button
                      style={dangerButton}
                      onClick={() => handleDelete(e.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={sideCard}>
            <h3 style={sideTitle}>🎯 Próximas</h3>

            {upcoming.length === 0 ? (
              <div style={emptyText}>No hay próximas evaluaciones.</div>
            ) : (
              upcoming.slice(0, 6).map((e) => (
                <div key={e.id} style={sideItem}>
                  <div style={sideTop}>
                    <div style={sideItemTitle}>
                      {e.type} {e.number ?? ''} · {e.topic || e.title || 'Sin tema'}
                    </div>
                    <span
                      style={{
                        ...miniTag,
                        background: subjectColors[e.subject] || '#64748b',
                      }}
                    />
                  </div>

                  <div style={sideMeta}>
                    {e.subject} · abre {e.start_date}
                  </div>

                  <div style={sideActions}>
                    <button style={smallButton} onClick={() => setEditing(e)}>
                      Editar
                    </button>
                    <button style={smallButton} onClick={() => setAiTarget(e)}>
                      IA
                    </button>
                    <button
                      style={dangerButton}
                      onClick={() => handleDelete(e.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={sideCard}>
            <h3 style={sideTitle}>
              {selectedDate.toLocaleDateString('es-CL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>

            {selectedDayEvaluations.length === 0 ? (
              <div style={emptyText}>No hay evaluaciones ese día.</div>
            ) : (
              selectedDayEvaluations.map((e) => (
                <div key={e.id} style={sideItem}>
                  <div style={sideItemTitle}>
                    {e.type} {e.number ?? ''} · {e.topic || e.title || 'Sin tema'}
                  </div>
                  <div style={sideMeta}>
                    {e.subject} · {e.start_date} → {e.end_date}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={sideCard}>
            <div style={sectionHeader}>
              <h3 style={sideTitle}>📊 Cómo vas</h3>
              <span style={mutedText}>Base preparada para notas</span>
            </div>

            {gradeSummaries.length === 0 ? (
              <div style={emptyText}>
                Aún no hay notas registradas. Esta sección ya está lista para calcular promedios por ramo.
              </div>
            ) : (
              gradeSummaries.map((item) => (
                <div key={item.subject} style={gradeItem}>
                  <div style={gradeTop}>
                    <div style={gradeSubject}>{item.subject}</div>
                    <div style={gradeBadge(item.status)}>{item.status}</div>
                  </div>

                  <div style={gradeMeta}>
                    Promedio:{' '}
                    {item.average === null ? 'sin notas' : item.average.toFixed(2)}
                  </div>
                  <div style={gradeMeta}>
                    Hechas: {item.completedCount} · Pendientes: {item.pendingCount}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={sideCard}>
            <div style={sectionHeader}>
              <h3 style={sideTitle}>🧩 Motor de preguntas</h3>
              <span style={mutedText}>Base por ramo</span>
            </div>

            {!aiTarget || !questionEngine ? (
              <div style={emptyText}>
                Selecciona una evaluación con el botón IA para ver la práctica recomendada.
              </div>
            ) : (
              <>
                <div style={questionInfo}>
                  <div style={questionMainMode}>
                    Modo recomendado: {questionEngine.recommendedMode}
                  </div>
                  <div style={questionExplanation}>
                    {questionEngine.explanation}
                  </div>
                </div>

                <div style={questionPromptList}>
                  {questionEngine.prompts.map((prompt) => (
                    <div key={prompt} style={questionPromptChip}>
                      {prompt}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <AIStudyChat
            context={
              aiTarget
                ? {
                    subject: aiTarget.subject,
                    type: aiTarget.type,
                    topic: aiTarget.topic || aiTarget.title || 'tema principal',
                    difficulty: aiTarget.difficulty,
                    start_date: aiTarget.start_date,
                    end_date: aiTarget.end_date,
                    number: aiTarget.number,
                    notes: aiTarget.notes,
                  }
                : null
            }
            title={
              aiTarget
                ? `IA para ${aiTarget.type} ${aiTarget.number ?? ''}`
                : 'IA de estudio'
            }
            compact
          />
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const title: React.CSSProperties = {
  margin: 0,
  fontSize: '1.7rem',
}

const subtitle: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.7,
}

const controls: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
}

const toggleButton: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeToggleButton: React.CSSProperties = {
  ...toggleButton,
  background: '#2563eb',
}

const layout: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.8fr 1fr',
  gap: '18px',
  alignItems: 'start',
}

const leftColumn: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
}

const rightColumn: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
}

const calendarCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const calendarToolbar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '14px',
}

const calendarTitle: React.CSSProperties = {
  fontWeight: 800,
  textTransform: 'capitalize',
}

const navButton: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const weekGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0,1fr))',
  gap: '10px',
}

const weekDayColumn: React.CSSProperties = {
  padding: '12px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  minHeight: '180px',
  cursor: 'pointer',
}

const selectedDay: React.CSSProperties = {
  background: 'rgba(59,130,246,0.15)',
  border: '1px solid rgba(59,130,246,0.45)',
}

const weekHeader: React.CSSProperties = {
  marginBottom: '10px',
}

const weekName: React.CSSProperties = {
  fontSize: '0.82rem',
  opacity: 0.7,
  textTransform: 'capitalize',
}

const weekNumber: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 800,
  marginTop: '2px',
}

const eventsList: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
}

const eventChip: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: 700,
}

const emptySmall: React.CSSProperties = {
  opacity: 0.45,
  fontSize: '0.8rem',
}

const monthGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0,1fr))',
  gap: '8px',
}

const monthHeader: React.CSSProperties = {
  textAlign: 'center',
  opacity: 0.7,
  fontWeight: 700,
  paddingBottom: '4px',
}

const monthCell: React.CSSProperties = {
  minHeight: '82px',
  padding: '8px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  cursor: 'pointer',
}

const monthNumber: React.CSSProperties = {
  fontSize: '0.86rem',
  fontWeight: 700,
}

const dotsRow: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
  marginTop: '8px',
}

const dot: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '999px',
}

const plannerCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const sectionTitle: React.CSSProperties = {
  margin: 0,
}

const mutedText: React.CSSProperties = {
  opacity: 0.7,
  fontSize: '0.88rem',
}

const timeline: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
  marginTop: '14px',
}

const timelineItem: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '96px 1fr',
  gap: '12px',
  alignItems: 'stretch',
}

const timelineTime: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
  fontWeight: 800,
  textAlign: 'center',
}

const timelineLine: React.CSSProperties = {
  width: '2px',
  minHeight: '40px',
  background: 'rgba(255,255,255,0.18)',
  justifySelf: 'center',
}

const timelineContent: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '6px 1fr',
  gap: '10px',
  padding: '12px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const timelineSubjectBar: React.CSSProperties = {
  borderRadius: '999px',
}

const timelineTitle: React.CSSProperties = {
  fontWeight: 800,
}

const timelineMeta: React.CSSProperties = {
  marginTop: '4px',
  opacity: 0.72,
}

const timelineReason: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '0.92rem',
  opacity: 0.88,
}

const formCard: React.CSSProperties = {
  padding: 0,
}

const sideCard: React.CSSProperties = {
  padding: '16px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const sideTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '12px',
}

const emptyText: React.CSSProperties = {
  opacity: 0.7,
}

const sideItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '10px',
}

const sideTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
}

const sideItemTitle: React.CSSProperties = {
  fontWeight: 700,
}

const sideMeta: React.CSSProperties = {
  opacity: 0.7,
  fontSize: '0.9rem',
  marginTop: '6px',
}

const miniTag: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '999px',
  display: 'inline-block',
}

const sideActions: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '10px',
  flexWrap: 'wrap',
}

const smallButton: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}

const dangerButton: React.CSSProperties = {
  ...smallButton,
  background: '#dc2626',
}

const gradeItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '10px',
}

const gradeTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
}

const gradeSubject: React.CSSProperties = {
  fontWeight: 800,
}

function gradeBadge(status: string): React.CSSProperties {
  const background =
    status === 'bien'
      ? 'rgba(16,185,129,0.25)'
      : status === 'medio'
      ? 'rgba(59,130,246,0.25)'
      : status === 'riesgo'
      ? 'rgba(239,68,68,0.25)'
      : 'rgba(100,116,139,0.25)'

  return {
    padding: '6px 10px',
    borderRadius: '999px',
    background,
    fontSize: '0.8rem',
    fontWeight: 800,
    textTransform: 'capitalize',
  }
}

const gradeMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.74,
  fontSize: '0.92rem',
}

const questionInfo: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const questionMainMode: React.CSSProperties = {
  fontWeight: 800,
}

const questionExplanation: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.86,
  lineHeight: 1.5,
}

const questionPromptList: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '12px',
}

const questionPromptChip: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,0.16)',
  border: '1px solid rgba(59,130,246,0.24)',
  fontSize: '0.82rem',
}