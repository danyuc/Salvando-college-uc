'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import {
  getAvailabilityBlocks,
  type AvailabilityBlock,
} from '../../lib/availability'
import {
  getMyPracticeAttempts,
  type PracticeAttempt,
} from '../../lib/practice-attempts'
import {
  buildWeaknessesByTopic,
  type WeaknessSummary,
} from '../../lib/weakness-engine'
import { SUBJECT_PRESETS, getSubjectColor } from '../../lib/subjects'
import { buildStudyCoachPlan } from '../../lib/study-coach'

function normalizeAttempts(attempts: PracticeAttempt[]) {
  return attempts.map((attempt) => ({
    subject: attempt.subject || 'General',
    topic: attempt.topic || 'General',
    is_correct: Boolean(attempt.is_correct),
  }))
}

export default function SmartPlanView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [weeklyHours, setWeeklyHours] = useState(35)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        const user = await getCurrentUser()

        if (!user) {
          setEvaluations([])
          setAvailability([])
          setAttempts([])
          return
        }

        const [evals, blocks, practice] = await Promise.all([
          getUserEvaluations(user.id),
          getAvailabilityBlocks(user.id),
          getMyPracticeAttempts(user.id),
        ])

        setEvaluations(evals || [])
        setAvailability(blocks || [])
        setAttempts(practice || [])
      } catch (error) {
        console.error('SMART PLAN LOAD ERROR:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const weaknesses: WeaknessSummary[] = useMemo(() => {
    return buildWeaknessesByTopic(normalizeAttempts(attempts))
  }, [attempts])

  const plan = useMemo(() => {
    return buildStudyCoachPlan({
      evaluations,
      weaknesses,
      availability,
      subjects: SUBJECT_PRESETS,
      weeklyHours,
    })
  }, [evaluations, weaknesses, availability, weeklyHours])

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>Cargando SmartPlan...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <div>
          <h2 style={title}>🚀 SmartPlan UC</h2>
          <p style={subtitle}>
            Plan inteligente según evaluaciones, disponibilidad, debilidades y
            horas reales de estudio.
          </p>
        </div>
      </div>

      <div style={card}>
        <label style={label}>Horas semanales disponibles</label>
        <input
          type="number"
          min={1}
          max={80}
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(Number(e.target.value) || 35)}
          style={input}
        />
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <div style={statLabel}>Evaluaciones</div>
          <div style={statValue}>{evaluations.length}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Bloques disponibles</div>
          <div style={statValue}>{availability.length}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Intentos</div>
          <div style={statValue}>{attempts.length}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Debilidades</div>
          <div style={statValue}>{weaknesses.length}</div>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Resumen del plan</h3>
        <div style={summaryBox}>
          {plan?.summary ||
            'Aún faltan datos para generar un resumen inteligente.'}
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Plan semanal recomendado</h3>

        {!plan?.blocks || plan.blocks.length === 0 ? (
          <div style={emptyText}>
            Agrega evaluaciones, disponibilidad y práctica para generar un plan
            semanal más preciso.
          </div>
        ) : (
          <div style={list}>
            {plan.blocks.map((block: any, index: number) => (
              <div
                key={`${block.day}-${block.subject}-${block.topic}-${index}`}
                style={{
                  ...item,
                  borderLeft: `5px solid ${getSubjectColor(
                    block.subject || 'General'
                  )}`,
                }}
              >
                <div style={itemTitle}>
                  {block.day || 'Día'} · {block.subject || 'General'}
                </div>

                <div style={itemMeta}>
                  {block.unit || 'Unidad general'} ·{' '}
                  {block.topic || 'Tema general'}
                </div>

                <div style={itemMeta}>
                  {block.minutes || 0} min ·{' '}
                  {block.reason || 'Bloque recomendado por SmartPlan'}
                </div>

                <div style={priority}>
                  Prioridad: {block.priority ?? 'media'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Debilidades usadas para priorizar</h3>

        {weaknesses.length === 0 ? (
          <div style={emptyText}>
            Todavía no hay debilidades detectadas. Practica para que SmartPlan
            se vuelva más preciso.
          </div>
        ) : (
          <div style={list}>
            {weaknesses.slice(0, 8).map((weakness, index) => (
              <div
                key={`${weakness.subject}-${weakness.topic}-${index}`}
                style={{
                  ...item,
                  borderLeft: `5px solid ${getSubjectColor(
                    weakness.subject
                  )}`,
                }}
              >
                <div style={itemTitle}>
                  {weakness.subject} · {weakness.topic}
                </div>
                <div style={itemMeta}>
                  Precisión: {weakness.accuracy}% · Nivel:{' '}
                  {weakness.weaknessLevel}
                </div>
                <div style={itemMeta}>{weakness.recommendation}</div>
              </div>
            ))}
          </div>
        )}
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
  background:
    'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(34,197,94,0.14))',
  border: '1px solid rgba(255,255,255,0.12)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  lineHeight: 1.5,
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: 800,
}

const input: React.CSSProperties = {
  width: '160px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#111827',
  color: 'white',
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
}

const statCard: React.CSSProperties = {
  padding: '16px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const statLabel: React.CSSProperties = {
  opacity: 0.75,
  fontWeight: 700,
}

const statValue: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '1.8rem',
  fontWeight: 900,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const summaryBox: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(37,99,235,0.12)',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
}

const emptyText: React.CSSProperties = {
  opacity: 0.76,
  lineHeight: 1.5,
}

const list: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const item: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const itemTitle: React.CSSProperties = {
  fontWeight: 900,
}

const itemMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.82,
  lineHeight: 1.45,
}

const priority: React.CSSProperties = {
  marginTop: '8px',
  fontWeight: 900,
  color: '#93c5fd',
}