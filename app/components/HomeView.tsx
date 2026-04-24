'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getAvailability, type AvailabilityBlock } from '../../lib/availability'
import { getStudyCoachPlan } from '../../lib/study-coach-storage'
import { getWeekKey } from '../../lib/study-coach'
import { getMyPracticeAttempts, type PracticeAttempt } from '../../lib/practice-attempts'
import { buildWeaknessesByTopic } from '../../lib/weakness-engine'
import { getSubjectColor } from '../../lib/subjects'

type TodayFocusItem = {
  subject: string
  topic: string
  reason: string
  priority: number
}

function formatDate(dateString?: string | null) {
  if (!dateString) return 'Sin fecha'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function orderEvaluations(evaluations: Evaluation[]) {
  return [...evaluations].sort((a, b) => {
    const aTime = new Date(a.start_date).getTime()
    const bTime = new Date(b.start_date).getTime()
    return aTime - bTime
  })
}

function buildTodayFocus(params: {
  evaluations: Evaluation[]
  attempts: PracticeAttempt[]
}) {
  const { evaluations, attempts } = params
   const weaknesses = buildWeaknessesByTopic(
  attempts.map((attempt) => ({
    subject: attempt.subject || 'General',
    topic: attempt.topic || 'General',
    is_correct: attempt.is_correct,
  }))
 )

  const items: TodayFocusItem[] = evaluations.map((evaluation) => {
    const weakness = weaknesses.find(
      (item) =>
        item.subject === evaluation.subject &&
        item.topic === (evaluation.topic || 'General')
    )

    const daysLeft = Math.ceil(
      (new Date(evaluation.start_date).getTime() - Date.now()) / 86400000
    )

    let priority = 0
    const reasons: string[] = []

    if (typeof evaluation.weight_percent === 'number') {
      priority += evaluation.weight_percent / 10
      reasons.push(`peso ${evaluation.weight_percent}%`)
    }

    if (daysLeft <= 3) {
      priority += 8
      reasons.push('evaluación muy cercana')
    } else if (daysLeft <= 7) {
      priority += 5
      reasons.push('evaluación cercana')
    } else if (daysLeft <= 14) {
      priority += 2
      reasons.push('evaluación próxima')
    }

    if (weakness?.weaknessLevel === 'alta') {
      priority += 8
      reasons.push('debilidad alta')
    } else if (weakness?.weaknessLevel === 'media') {
      priority += 4
      reasons.push('debilidad media')
    }

    return {
      subject: evaluation.subject,
      topic: evaluation.topic || 'General',
      reason: reasons.join(' · ') || 'seguimiento general',
      priority,
    }
  })

  return items.sort((a, b) => b.priority - a.priority).slice(0, 5)
}

function groupAvailabilityByDay(blocks: AvailabilityBlock[]) {
  const map = new Map<string, AvailabilityBlock[]>()

  for (const block of blocks) {
    if (!map.has(block.day_of_week)) {
      map.set(block.day_of_week, [])
    }
    map.get(block.day_of_week)!.push(block)
  }

  return [...map.entries()]
}

export default function HomeView() {
  const [userName, setUserName] = useState('usuario uc')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [coachBlocks, setCoachBlocks] = useState<any[]>([])
  const [coachSummary, setCoachSummary] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true)

        const user = await getCurrentUser()
        if (!user) return

        const email = user.email || ''
        const label = email.includes('@') ? email.split('@')[0] : 'usuario uc'
        setUserName(label || 'usuario uc')

        const [evaluationsData, availabilityData, attemptsData, coachPlan] =
          await Promise.all([
            getUserEvaluations(user.id),
            getAvailability(user.id),
            getMyPracticeAttempts(user.id),
            getStudyCoachPlan(user.id, getWeekKey()),
          ])

        setEvaluations(evaluationsData || [])
        setAvailability(availabilityData || [])
        setAttempts(attemptsData || [])
        setCoachBlocks(coachPlan?.blocks || [])
        setCoachSummary(coachPlan?.coach_summary || '')
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  const orderedEvaluations = useMemo(
    () => orderEvaluations(evaluations),
    [evaluations]
  )

  const focusItems = useMemo(
    () =>
      buildTodayFocus({
        evaluations,
        attempts,
      }),
    [evaluations, attempts]
  )

  const weaknesses = useMemo(
    () => buildWeaknessesByTopic(attempts).slice(0, 5),
    [attempts]
  )

  const groupedAvailability = useMemo(
    () => groupAvailabilityByDay(availability),
    [availability]
  )

  return (
    <div style={container}>
      <div style={heroCard}>
        <div>
          <h2 style={title}>Hola, {userName}</h2>
          <p style={subtitle}>
            College Ciencias Sociales · 1° semestre
          </p>
        </div>

        <div style={heroMeta}>
          <div style={heroMetaItem}>
            Evaluaciones: <strong>{evaluations.length}</strong>
          </div>
          <div style={heroMetaItem}>
            Bloques disponibles: <strong>{availability.length}</strong>
          </div>
          <div style={heroMetaItem}>
            Intentos guardados: <strong>{attempts.length}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={card}>Cargando panel...</div>
      ) : (
        <div style={layout}>
          <div style={mainColumn}>
            <div style={card}>
              <h3 style={sectionTitle}>Foco del día</h3>

              {focusItems.length === 0 ? (
                <div style={emptyText}>
                  Aún no hay foco calculado. Agrega evaluaciones o realiza práctica.
                </div>
              ) : (
                <div style={list}>
                  {focusItems.map((item, index) => (
                    <div
                      key={`${item.subject}-${item.topic}-${index}`}
                      style={{
                        ...listItem,
                        borderLeft: `4px solid ${getSubjectColor(item.subject)}`,
                      }}
                    >
                      <div style={listTitle}>
                        {item.subject} · {item.topic}
                      </div>
                      <div style={listMeta}>{item.reason}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={sectionTitle}>Próximas evaluaciones</h3>

              {orderedEvaluations.length === 0 ? (
                <div style={emptyText}>No hay evaluaciones registradas.</div>
              ) : (
                <div style={list}>
                  {orderedEvaluations.slice(0, 8).map((evaluation) => (
                    <div
                      key={evaluation.id}
                      style={{
                        ...listItem,
                        borderLeft: `4px solid ${getSubjectColor(evaluation.subject)}`,
                      }}
                    >
                      <div style={listTitle}>
                        {evaluation.subject} · {evaluation.type} {evaluation.number ?? ''}
                      </div>

                      <div style={listMeta}>
                        {evaluation.topic || 'Sin tema'} · {formatDate(evaluation.start_date)}
                      </div>

                      <div style={listMeta}>
                        Peso: {evaluation.weight_percent ?? 0}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={sectionTitle}>Coach semanal</h3>

              {coachBlocks.length === 0 ? (
                <div style={emptyText}>Aún no hay plan semanal guardado.</div>
              ) : (
                <div style={list}>
                  {coachBlocks.slice(0, 8).map((block, index) => (
                    <div
                      key={`${block.day}-${block.subject}-${index}`}
                      style={{
                        ...listItem,
                        borderLeft: `4px solid ${getSubjectColor(block.subject)}`,
                      }}
                    >
                      <div style={listTitle}>
                        {block.day} · {block.subject}
                      </div>
                      <div style={listMeta}>
                        {block.topic} · {block.minutes} min
                      </div>
                      <div style={listMeta}>{block.reason}</div>
                    </div>
                  ))}
                </div>
              )}

              {coachSummary && (
                <div style={summaryBox}>{coachSummary}</div>
              )}
            </div>
          </div>

          <div style={sideColumn}>
            <div style={card}>
              <h3 style={sectionTitle}>Debilidades detectadas</h3>

              {weaknesses.length === 0 ? (
                <div style={emptyText}>
                  Aún no hay suficientes intentos para detectar debilidades.
                </div>
              ) : (
                <div style={list}>
                  {weaknesses.map((item, index) => (
                    <div
                      key={`${item.subject}-${item.topic}-${index}`}
                      style={{
                        ...listItem,
                        borderLeft: `4px solid ${getSubjectColor(item.subject)}`,
                      }}
                    >
                      <div style={listTitle}>
                        {item.subject} · {item.topic}
                      </div>
                      <div style={listMeta}>
                        Precisión: {item.accuracy}% · Nivel: {item.weaknessLevel}
                      </div>
                      <div style={listMeta}>{item.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={sectionTitle}>Disponibilidad semanal</h3>

              {groupedAvailability.length === 0 ? (
                <div style={emptyText}>No hay bloques de disponibilidad guardados.</div>
              ) : (
                <div style={availabilityList}>
                  {groupedAvailability.map(([day, blocks]) => (
                    <div key={day} style={availabilityDayCard}>
                      <div style={availabilityDayTitle}>{day}</div>

                      {blocks.length === 0 ? (
                        <div style={emptyText}>Sin bloques</div>
                      ) : (
                        blocks.map((block) => (
                          <div key={block.id} style={availabilityBlock}>
                            {block.start_time} - {block.end_time}
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '20px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
}

const heroMeta: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const heroMetaItem: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.06)',
}

const layout: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '18px',
}

const mainColumn: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
}

const sideColumn: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const emptyText: React.CSSProperties = {
  opacity: 0.76,
}

const list: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const listItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const listTitle: React.CSSProperties = {
  fontWeight: 800,
}

const listMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.8,
  lineHeight: 1.45,
}

const summaryBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,0.10)',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.5,
}

const availabilityList: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const availabilityDayCard: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const availabilityDayTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '8px',
}

const availabilityBlock: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '6px',
}