'use client'

import { safeDate } from '@/lib/utils/date'
import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import {
  getMyPracticeAttempts,
  type PracticeAttempt,
} from '../../lib/practice-attempts'
import { buildWeaknessesByTopic, type WeaknessSummary } from '../../lib/weakness-engine'
import { buildGradePredictions } from '../../lib/grade-prediction'
import {getSubjectColor} from '../../lib/subjects'

function normalizeAttempts(attempts: PracticeAttempt[]) {
  return attempts.map((attempt) => ({
    subject: attempt.subject || 'General',
    topic: attempt.topic || 'General',
    is_correct: Boolean(attempt.is_correct),
  }))
}

function formatPercent(value?: number | null) {
  if (typeof value !== 'number') return '0%'
  return `${Math.round(value)}%`
}

function formatGrade(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return value.toFixed(1)
}

function getRiskLabel(value?: string | null) {
  if (!value) return 'Sin riesgo calculado'
  return value
}

function getRiskColor(risk?: string | null) {
  const normalized = String(risk || '').toLowerCase()

  if (normalized.includes('alto') || normalized.includes('crítico')) {
    return '#ef4444'
  }

  if (normalized.includes('medio')) {
    return '#f59e0b'
  }

  if (normalized.includes('bajo')) {
    return '#22c55e'
  }

  return '#94a3b8'
}

export default function PredictionView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true)

        const user = await getCurrentUser()

        if (!user) {
          setEvaluations([])
          setAttempts([])
          return
        }

        const [evaluationsData, attemptsData] = await Promise.all([
          getUserEvaluations(user.id),
          getMyPracticeAttempts(user.id),
        ])

        setEvaluations(evaluationsData || [])
        setAttempts(attemptsData || [])
      } catch (error) {
        console.error('PREDICTION LOAD ERROR:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  const weaknesses: WeaknessSummary[] = useMemo(() => {
    return buildWeaknessesByTopic(normalizeAttempts(attempts))
  }, [attempts])

  const predictions = useMemo(() => {
    return buildGradePredictions({
      evaluations,
      weaknesses,
    })
  }, [evaluations, weaknesses])

  const globalStats = useMemo(() => {
    const totalEvaluations = evaluations.length
    const totalAttempts = attempts.length
    const totalWeaknesses = weaknesses.length

    const highWeaknesses = weaknesses.filter(
      (item) => item.weaknessLevel === 'alta'
    ).length


    const upcomingEvaluations = evaluations.filter((evaluation) => {
     const date = safeDate(evaluation.start_date)
     if (!date) return false

     return date.getTime() >= Date.now()
  }).length


    return {
      totalEvaluations,
      totalAttempts,
      totalWeaknesses,
      highWeaknesses,
      upcomingEvaluations,
    }
  }, [evaluations, attempts, weaknesses])

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>Cargando predicción de notas...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <div>
          <h2 style={title}>📊 Predicción de nota final</h2>
          <p style={subtitle}>
            Estimación académica basada en evaluaciones, pesos, práctica guardada y debilidades detectadas.
          </p>
        </div>
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <div style={statLabel}>Evaluaciones</div>
          <div style={statValue}>{globalStats.totalEvaluations}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Prácticas</div>
          <div style={statValue}>{globalStats.totalAttempts}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Debilidades</div>
          <div style={statValue}>{globalStats.totalWeaknesses}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Alta prioridad</div>
          <div style={statValue}>{globalStats.highWeaknesses}</div>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Predicciones por asignatura</h3>

        {!Array.isArray(predictions) || predictions.length === 0 ? (
          <div style={emptyText}>
            Aún no hay suficientes datos para calcular predicciones. Agrega evaluaciones con porcentaje y realiza práctica.
          </div>
        ) : (
          <div style={list}>
            {predictions.map((prediction: any, index: number) => {
              const subject =
                prediction.subject ||
                prediction.name ||
                prediction.course ||
                'Asignatura'

              const predictedGrade =
                prediction.predictedGrade ??
                prediction.predicted_grade ??
                prediction.finalGrade ??
                prediction.final_grade ??
                prediction.grade ??
                null

              const risk =
                prediction.risk ||
                prediction.riskLevel ||
                prediction.risk_level ||
                prediction.status ||
                null

              const progress =
                prediction.progress ??
                prediction.completedPercent ??
                prediction.completed_percent ??
                prediction.completion ??
                null

              const recommendation =
                prediction.recommendation ||
                prediction.advice ||
                prediction.nextAction ||
                prediction.next_action ||
                'Sigue practicando los temas débiles y prioriza evaluaciones próximas.'

              return (
                <div
                  key={`${subject}-${index}`}
                  style={{
                    ...predictionItem,
                    borderLeft: `5px solid ${getSubjectColor(subject)}`,
                  }}
                >
                  <div style={predictionHeader}>
                    <div>
                      <div style={predictionTitle}>{subject}</div>
                      <div style={predictionMeta}>
                        Avance estimado: {formatPercent(progress)}
                      </div>
                    </div>

                    <div style={gradeBox}>
                      <div style={gradeLabel}>Nota estimada</div>
                      <div style={gradeValue}>{formatGrade(predictedGrade)}</div>
                    </div>
                  </div>

                  <div style={riskRow}>
                    <span
                      style={{
                        ...riskBadge,
                        background: getRiskColor(risk),
                      }}
                    >
                      {getRiskLabel(risk)}
                    </span>
                  </div>

                  <div style={recommendationBox}>{recommendation}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Debilidades que más afectan tu nota</h3>

        {weaknesses.length === 0 ? (
          <div style={emptyText}>
            Todavía no hay debilidades detectadas. Cuando practiques, esta sección mostrará qué temas están bajando tu predicción.
          </div>
        ) : (
          <div style={list}>
            {weaknesses.slice(0, 8).map((item, index) => (
              <div
                key={`${item.subject}-${item.topic}-${index}`}
                style={{
                  ...weaknessItem,
                  borderLeft: `5px solid ${getSubjectColor(item.subject)}`,
                }}
              >
                <div style={predictionTitle}>
                  {item.subject} · {item.topic}
                </div>
                <div style={predictionMeta}>
                  Precisión: {formatPercent(item.accuracy)} · Nivel:{' '}
                  {item.weaknessLevel}
                </div>
                <div style={recommendationBox}>{item.recommendation}</div>
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
    'linear-gradient(135deg, rgba(37,99,235,0.24), rgba(236,72,153,0.14))',
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
  opacity: 0.75,
  lineHeight: 1.5,
}

const list: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const predictionItem: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const weaknessItem: React.CSSProperties = {
  ...predictionItem,
}

const predictionHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  flexWrap: 'wrap',
}

const predictionTitle: React.CSSProperties = {
  fontWeight: 900,
}

const predictionMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.8,
  lineHeight: 1.45,
}

const gradeBox: React.CSSProperties = {
  minWidth: '120px',
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(37,99,235,0.15)',
  textAlign: 'center',
}

const gradeLabel: React.CSSProperties = {
  fontSize: '0.75rem',
  opacity: 0.75,
  fontWeight: 800,
}

const gradeValue: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '1.8rem',
  fontWeight: 900,
}

const riskRow: React.CSSProperties = {
  marginTop: '10px',
}

const riskBadge: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: '999px',
  color: 'white',
  fontWeight: 900,
  fontSize: '0.82rem',
}

const recommendationBox: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  lineHeight: 1.5,
}
