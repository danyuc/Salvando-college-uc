'use client'
'use client'

import { safeDate } from '@/lib/utils/date'  
import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getSubjectColor } from '../../lib/subjects'

type RiskLevel = 'alto' | 'medio' | 'bajo'

type PredictionItem = {
  subject: string
  total: number
  upcoming: number
  urgent: number
  averageWeight: number
  riskLevel: RiskLevel
  score: number
  recommendation: string
}


function daysUntil(value?: string | null) {
  const date = safeDate(value)
  if (!date) return 999
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

function formatDate(value?: string | null) {
  const date = safeDate(value)
  if (!date) return 'Sin fecha'

  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getEvaluationDate(evaluation: Evaluation) {
  return evaluation.start_date ?? evaluation.end_date ?? null
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'alto'
  if (score >= 35) return 'medio'
  return 'bajo'
}

function getRecommendation(risk: RiskLevel) {
  if (risk === 'alto') {
    return 'Prioriza esta asignatura hoy. Tiene evaluaciones cercanas o de alto peso.'
  }

  if (risk === 'medio') {
    return 'Mantén práctica constante y refuerza los temas con más peso.'
  }

  return 'Riesgo bajo. Conviene repasar de forma preventiva.'
}

function buildPredictions(evaluations: Evaluation[]): PredictionItem[] {
  const map = new Map<string, Evaluation[]>()

  for (const evaluation of evaluations) {
    const subject = evaluation.subject || 'General'

    if (!map.has(subject)) {
      map.set(subject, [])
    }

    map.get(subject)!.push(evaluation)
  }

  return [...map.entries()]
    .map(([subject, items]) => {
      const upcomingItems = items.filter((evaluation) => {
        const date = safeDate(getEvaluationDate(evaluation))
        return date ? date.getTime() >= Date.now() : false
      })

      const urgent = upcomingItems.filter((evaluation) => {
        const days = daysUntil(getEvaluationDate(evaluation))
        return days <= 7
      }).length

      const totalWeight = items.reduce((sum, evaluation) => {
        return sum + Number(evaluation.weight_percent ?? 0)
      }, 0)

      const averageWeight = items.length
        ? Math.round(totalWeight / items.length)
        : 0

      const score = Math.round(
        urgent * 30 +
          upcomingItems.length * 12 +
          averageWeight * 0.8 +
          items.length * 3
      )

      const riskLevel = getRiskLevel(score)

      return {
        subject,
        total: items.length,
        upcoming: upcomingItems.length,
        urgent,
        averageWeight,
        riskLevel,
        score,
        recommendation: getRecommendation(riskLevel),
      }
    })
    .sort((a, b) => b.score - a.score)
}

function orderEvaluations(evaluations: Evaluation[]) {
  return [...evaluations].sort((a, b) => {
    const aDate = safeDate(getEvaluationDate(a))
    const bDate = safeDate(getEvaluationDate(b))

    if (!aDate && !bDate) return 0
    if (!aDate) return 1
    if (!bDate) return -1

    return aDate.getTime() - bDate.getTime()
  })
}

export default function PredictionView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('todas')
  const [onlyUpcoming, setOnlyUpcoming] = useState(true)
  const [copied, setCopied] = useState(false)

  async function loadData() {
    try {
      setLoading(true)

      const user = await getCurrentUser()
      if (!user) {
        setEvaluations([])
        return
      }

      const data = await getUserEvaluations(user.id)
      setEvaluations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('PREDICTION LOAD ERROR:', error)
      alert('No se pudieron cargar las predicciones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const subjects = useMemo(() => {
    const unique = new Set(
      evaluations.map((evaluation) => evaluation.subject || 'General')
    )

    return ['todas', ...Array.from(unique)]
  }, [evaluations])

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const subjectOk =
        selectedSubject === 'todas' ||
        (evaluation.subject || 'General') === selectedSubject

      const date = safeDate(getEvaluationDate(evaluation))
      const upcomingOk = !onlyUpcoming || (date ? date.getTime() >= Date.now() : false)

      return subjectOk && upcomingOk
    })
  }, [evaluations, selectedSubject, onlyUpcoming])

  const predictions = useMemo(
    () => buildPredictions(filteredEvaluations),
    [filteredEvaluations]
  )

  const orderedEvaluations = useMemo(
    () => orderEvaluations(filteredEvaluations),
    [filteredEvaluations]
  )

  const totalEvaluations = evaluations.length

  const upcomingEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const date = safeDate(getEvaluationDate(evaluation))
      return date ? date.getTime() >= Date.now() : false
    }).length
  }, [evaluations])

  const urgentEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      const days = daysUntil(getEvaluationDate(evaluation))
      return days <= 7
    }).length
  }, [evaluations])

  const highestRisk = predictions[0]

  async function copySummary() {
    const text = [
      'Resumen de predicción académica',
      '',
      `Evaluaciones totales: ${totalEvaluations}`,
      `Evaluaciones próximas: ${upcomingEvaluations}`,
      `Evaluaciones urgentes: ${urgentEvaluations}`,
      '',
      ...predictions.map(
        (item) =>
          `${item.subject}: riesgo ${item.riskLevel}, score ${item.score}. ${item.recommendation}`
      ),
    ].join('\n')

    await navigator.clipboard.writeText(text)
    setCopied(true)

    window.setTimeout(() => setCopied(false), 1800)
  }

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>Cargando predicciones...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <div>
          <h2 style={title}>📊 Predicción académica</h2>
          <p style={subtitle}>
            Analiza riesgo, urgencia y prioridad según tus evaluaciones guardadas.
          </p>
        </div>

        <div style={actions}>
          <button onClick={loadData} style={secondaryButton}>
            Actualizar
          </button>

          <button onClick={copySummary} style={button}>
            {copied ? 'Copiado' : 'Copiar resumen'}
          </button>
        </div>
      </div>

      <div style={statsGrid}>
        <Stat label="Evaluaciones" value={totalEvaluations} />
        <Stat label="Próximas" value={upcomingEvaluations} />
        <Stat label="Urgentes" value={urgentEvaluations} />
        <Stat
          label="Mayor riesgo"
          value={highestRisk ? highestRisk.subject : 'Sin datos'}
        />
      </div>

      <div style={card}>
        <div style={filterGrid}>
          <div style={field}>
            <label style={label}>Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              style={select}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject === 'todas' ? 'Todas las asignaturas' : subject}
                </option>
              ))}
            </select>
          </div>

          <label style={checkRow}>
            <input
              type="checkbox"
              checked={onlyUpcoming}
              onChange={(e) => setOnlyUpcoming(e.target.checked)}
            />
            Mostrar solo evaluaciones próximas
          </label>
        </div>
      </div>

      <div style={layout}>
        <div style={mainColumn}>
          <div style={card}>
            <h3 style={sectionTitle}>🔥 Riesgo por asignatura</h3>

            {predictions.length === 0 ? (
              <div style={emptyText}>
                No hay datos suficientes para generar predicciones.
              </div>
            ) : (
              <div style={list}>
                {predictions.map((item) => (
                  <div
                    key={item.subject}
                    style={{
                      ...listItem,
                      borderLeft: `5px solid ${getSubjectColor(item.subject)}`,
                    }}
                  >
                    <div style={rowBetween}>
                      <div>
                        <div style={listTitle}>{item.subject}</div>
                        <div style={listMeta}>
                          {item.total} evaluación(es) · {item.upcoming} próximas ·{' '}
                          {item.urgent} urgentes
                        </div>
                      </div>

                      <div style={riskBadge(item.riskLevel)}>
                        Riesgo {item.riskLevel}
                      </div>
                    </div>

                    <div style={progressTrack}>
                      <div
                        style={{
                          ...progressFill,
                          width: `${Math.min(100, item.score)}%`,
                        }}
                      />
                    </div>

                    <div style={listMeta}>
                      Score: {item.score} · Peso promedio: {item.averageWeight}%
                    </div>

                    <div style={recommendationBox}>{item.recommendation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={sideColumn}>
          <div style={card}>
            <h3 style={sectionTitle}>📅 Evaluaciones consideradas</h3>

            {orderedEvaluations.length === 0 ? (
              <div style={emptyText}>No hay evaluaciones en este filtro.</div>
            ) : (
              <div style={list}>
                {orderedEvaluations.slice(0, 10).map((evaluation) => {
                  const subject = evaluation.subject || 'General'
                  const days = daysUntil(getEvaluationDate(evaluation))

                  return (
                    <div
                      key={evaluation.id}
                      style={{
                        ...compactItem,
                        borderLeft: `4px solid ${getSubjectColor(subject)}`,
                      }}
                    >
                      <div style={listTitle}>
                        {subject} · {evaluation.type || 'Evaluación'}
                      </div>

                      <div style={listMeta}>
                        {evaluation.topic || 'Sin tema'} ·{' '}
                        {formatDate(getEvaluationDate(evaluation))}
                      </div>

                      <div style={listMeta}>
                        {days <= 0
                          ? 'Hoy o vencida'
                          : `Faltan ${days} día(s)`}{' '}
                        · Peso: {evaluation.weight_percent ?? 0}%
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>🧠 Lectura rápida</h3>

            {highestRisk ? (
              <div style={emptyText}>
                Tu mayor prioridad ahora es <strong>{highestRisk.subject}</strong>.
                {' '}Conviene empezar por evaluaciones cercanas y de mayor peso.
              </div>
            ) : (
              <div style={emptyText}>
                Agrega evaluaciones para activar el análisis predictivo.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  )
}

function riskBadge(risk: RiskLevel): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: '7px 10px',
    borderRadius: '999px',
    fontWeight: 800,
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
  }

  if (risk === 'alto') {
    return {
      ...base,
      background: 'rgba(239,68,68,0.16)',
      color: '#fecaca',
      border: '1px solid rgba(239,68,68,0.30)',
    }
  }

  if (risk === 'medio') {
    return {
      ...base,
      background: 'rgba(245,158,11,0.16)',
      color: '#fde68a',
      border: '1px solid rgba(245,158,11,0.30)',
    }
  }

  return {
    ...base,
    background: 'rgba(34,197,94,0.16)',
    color: '#bbf7d0',
    border: '1px solid rgba(34,197,94,0.30)',
  }
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
  alignItems: 'center',
  flexWrap: 'wrap',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  lineHeight: 1.5,
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const button: React.CSSProperties = {
  padding: '11px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  padding: '11px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
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
  opacity: 0.72,
  fontSize: '0.9rem',
}

const statValue: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '1.4rem',
  fontWeight: 900,
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const filterGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '14px',
  alignItems: 'end',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: React.CSSProperties = {
  fontWeight: 800,
}

const select: React.CSSProperties = {
  padding: '11px',
  borderRadius: '12px',
  background: 'white',
  color: '#0f172a',
  border: 'none',
}

const checkRow: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  opacity: 0.85,
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

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const emptyText: React.CSSProperties = {
  opacity: 0.78,
  lineHeight: 1.55,
}

const list: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const listItem: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const compactItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const rowBetween: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
}

const listTitle: React.CSSProperties = {
  fontWeight: 900,
}

const listMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.78,
  lineHeight: 1.45,
}

const progressTrack: React.CSSProperties = {
  height: '9px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  overflow: 'hidden',
  marginTop: '12px',
}

const progressFill: React.CSSProperties = {
  height: '100%',
  borderRadius: '999px',
  background: '#2563eb',
}

const recommendationBox: React.CSSProperties = {
  marginTop: '12px',
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,0.10)',
  lineHeight: 1.45,
}