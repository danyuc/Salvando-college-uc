'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getAvailability, type AvailabilityBlock } from '../../lib/availability'
import { getMyPracticeAttempts, type PracticeAttempt } from '../../lib/practice-attempts'
import { getStudyCoachPlan } from '../../lib/study-coach-storage'
import { getWeekKey } from '../../lib/study-coach'
import { buildWeaknessesByTopic } from '../../lib/weakness-engine'
import { getSubjectColor } from '../../lib/subjects'

type TodayFocusItem = {
  subject: string
  topic: string
  reason: string
  priority: number
}

function safeDate(value?: string | null): number {
  if (!value) return 0
  const time = safeDate(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function formatDate(value?: string | null) {
  const time = safeDate(value)
  if (!time) return 'Sin fecha'

  return safeDate(time).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function daysUntil(value?: string | null) {
  const time = safeDate(value)
  if (!time) return 999
  return Math.ceil((time - Date.now()) / 86400000)
}

function orderEvaluations(evaluations: Evaluation[]) {
  return [...evaluations].sort((a, b) => {
    const aTime = safeDate(a.start_date ?? a.end_date)
    const bTime = safeDate(b.start_date ?? b.end_date)

    if (!aTime && !bTime) return 0
    if (!aTime) return 1
    if (!bTime) return -1

    return aTime - bTime
  })
}

function normalizeAttempts(attempts: PracticeAttempt[]) {
  return attempts.map((attempt) => ({
    subject: attempt.subject || 'General',
    topic: attempt.topic || 'General',
    is_correct: Boolean(attempt.is_correct),
  }))
}

function buildTodayFocus(params: {
  evaluations: Evaluation[]
  attempts: PracticeAttempt[]
}) {
  const { evaluations, attempts } = params
  const weaknesses = buildWeaknessesByTopic(normalizeAttempts(attempts))

  const items: TodayFocusItem[] = evaluations.map((evaluation) => {
    const subject = evaluation.subject || 'General'
    const topic = evaluation.topic || 'General'

    const weakness = weaknesses.find(
      (item) => item.subject === subject && item.topic === topic
    )

    const daysLeft = daysUntil(evaluation.start_date ?? evaluation.end_date)

    let priority = 0
    const reasons: string[] = []

    const weight =
      typeof evaluation.weight_percent === 'number'
        ? evaluation.weight_percent
        : 0

    if (weight > 0) {
      priority += weight / 10
      reasons.push(`peso ${weight}%`)
    }

    if (daysLeft <= 2) {
      priority += 10
      reasons.push('urgente')
    } else if (daysLeft <= 7) {
      priority += 6
      reasons.push('cercana')
    } else if (daysLeft <= 14) {
      priority += 3
      reasons.push('próxima')
    }

    if (weakness?.weaknessLevel === 'alta') {
      priority += 8
      reasons.push('debilidad alta')
    } else if (weakness?.weaknessLevel === 'media') {
      priority += 4
      reasons.push('debilidad media')
    }

    return {
      subject,
      topic,
      reason: reasons.join(' · ') || 'seguimiento general',
      priority,
    }
  })

  return items.sort((a, b) => b.priority - a.priority).slice(0, 5)
}

function groupAvailabilityByDay(blocks: AvailabilityBlock[]) {
  const map = new Map<string, AvailabilityBlock[]>()

  for (const block of blocks) {
    const day = block.day_of_week || 'Sin día'

    if (!map.has(day)) {
      map.set(day, [])
    }

    map.get(day)!.push(block)
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
        setUserName(email.includes('@') ? email.split('@')[0] : 'usuario uc')

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
        console.error('HOME LOAD ERROR:', error)
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
    () => buildTodayFocus({ evaluations, attempts }),
    [evaluations, attempts]
  )

  const weaknesses = useMemo(
    () => buildWeaknessesByTopic(normalizeAttempts(attempts)).slice(0, 5),
    [attempts]
  )

  const groupedAvailability = useMemo(
    () => groupAvailabilityByDay(availability),
    [availability]
  )

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>Cargando panel...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <div>
          <h2 style={title}>Hola, {userName}</h2>
          <p style={subtitle}>Panel central de estudio UC</p>
        </div>

        <div style={heroMeta}>
          <div style={heroMetaItem}>
            Evaluaciones: <strong>{evaluations.length}</strong>
          </div>
          <div style={heroMetaItem}>
            Disponibilidad: <strong>{availability.length}</strong>
          </div>
          <div style={heroMetaItem}>
            Intentos: <strong>{attempts.length}</strong>
          </div>
        </div>
      </div>

      <div style={layout}>
        <div style={mainColumn}>
          <div style={card}>
            <h3 style={sectionTitle}>🔥 Foco del día</h3>

            {focusItems.length === 0 ? (
              <div style={emptyText}>
                Agrega evaluaciones o realiza práctica para calcular tu foco.
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
            <h3 style={sectionTitle}>📅 Próximas evaluaciones</h3>

            {orderedEvaluations.length === 0 ? (
              <div style={emptyText}>No hay evaluaciones registradas.</div>
            ) : (
              <div style={list}>
                {orderedEvaluations.slice(0, 8).map((evaluation) => (
                  <div
                    key={evaluation.id}
                    style={{
                      ...listItem,
                      borderLeft: `4px solid ${getSubjectColor(
                        evaluation.subject || 'General'
                      )}`,
                    }}
                  >
                    <div style={listTitle}>
                      {evaluation.subject || 'General'} ·{' '}
                      {evaluation.type || 'Evaluación'}{' '}
                      {evaluation.number ?? ''}
                    </div>

                    <div style={listMeta}>
                      {evaluation.topic || 'Sin tema'} ·{' '}
                      {formatDate(evaluation.start_date ?? evaluation.end_date)}
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
            <h3 style={sectionTitle}>🧠 Coach semanal</h3>

            {coachBlocks.length === 0 ? (
              <div style={emptyText}>Aún no hay plan semanal guardado.</div>
            ) : (
              <div style={list}>
                {coachBlocks.slice(0, 8).map((block, index) => (
                  <div
                    key={`${block.day}-${block.subject}-${index}`}
                    style={{
                      ...listItem,
                      borderLeft: `4px solid ${getSubjectColor(
                        block.subject || 'General'
                      )}`,
                    }}
                  >
                    <div style={listTitle}>
                      {block.day || 'Día'} · {block.subject || 'General'}
                    </div>
                    <div style={listMeta}>
                      {block.topic || 'General'} · {block.minutes || 0} min
                    </div>
                    <div style={listMeta}>{block.reason || 'Plan de estudio'}</div>
                  </div>
                ))}
              </div>
            )}

            {coachSummary && <div style={summaryBox}>{coachSummary}</div>}
          </div>
        </div>

        <div style={sideColumn}>
          <div style={card}>
            <h3 style={sectionTitle}>⚠️ Debilidades detectadas</h3>

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
                      Precisión: {item.accuracy}% · Nivel:{' '}
                      {item.weaknessLevel}
                    </div>
                    <div style={listMeta}>{item.recommendation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>⏰ Disponibilidad semanal</h3>

            {groupedAvailability.length === 0 ? (
              <div style={emptyText}>
                No hay bloques de disponibilidad guardados.
              </div>
            ) : (
              <div style={availabilityList}>
                {groupedAvailability.map(([day, blocks]) => (
                  <div key={day} style={availabilityDayCard}>
                    <div style={availabilityDayTitle}>{day}</div>

                    {blocks.map((block) => (
                      <div key={block.id} style={availabilityBlock}>
                        {block.start_time} - {block.end_time}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
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
  lineHeight: 1.5,
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