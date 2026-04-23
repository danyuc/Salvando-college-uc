'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { buildGradePredictions } from '../../lib/grade-prediction'

export default function PredictionView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        if (!user) return

        const data = await getUserEvaluations(user.id)
        setEvaluations(data || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const predictions = useMemo(
    () => buildGradePredictions(evaluations),
    [evaluations]
  )

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>Predicción IA de notas</h2>
        <p style={subtitle}>
          Estimación de nota final, riesgo y foco recomendado por ramo.
        </p>
      </div>

      {loading ? (
        <div style={card}>Cargando predicciones...</div>
      ) : predictions.length === 0 ? (
        <div style={card}>Aún no hay suficientes evaluaciones con peso y nota.</div>
      ) : (
        predictions.map((item) => (
          <div key={item.subject} style={card}>
            <div style={topRow}>
              <div style={subject}>{item.subject}</div>
              <div style={riskBadge(item.riskLevel)}>{item.riskLevel}</div>
            </div>

            <div style={grid}>
              <div style={metric}>
                <span style={label}>Nota proyectada</span>
                <strong>{item.predictedFinalGrade}</strong>
              </div>

              <div style={metric}>
                <span style={label}>Peso completado</span>
                <strong>{item.completedWeight}%</strong>
              </div>

              <div style={metric}>
                <span style={label}>Peso restante</span>
                <strong>{item.remainingWeight}%</strong>
              </div>

              <div style={metric}>
                <span style={label}>Piso posible</span>
                <strong>{item.minimumPossibleFinal}</strong>
              </div>

              <div style={metric}>
                <span style={label}>Techo posible</span>
                <strong>{item.maximumPossibleFinal}</strong>
              </div>

              <div style={metric}>
                <span style={label}>Acumulado ponderado</span>
                <strong>{item.currentWeightedScore}</strong>
              </div>
            </div>

            <div style={details}>
              <div>
                Para aprobar con 4.0 necesitas aprox:{' '}
                <b>{item.neededAverageToPass ?? '—'}</b>
              </div>
              <div>
                Para llegar a 5.5 necesitas aprox:{' '}
                <b>{item.neededAverageTo55 ?? '—'}</b>
              </div>
            </div>

            <div style={recommendationBox}>{item.recommendation}</div>
          </div>
        ))
      )}
    </div>
  )
}

function riskBadge(level: 'bajo' | 'medio' | 'alto'): React.CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: '999px',
    background:
      level === 'bajo'
        ? 'rgba(34,197,94,.18)'
        : level === 'medio'
        ? 'rgba(250,204,21,.18)'
        : 'rgba(239,68,68,.18)',
    color:
      level === 'bajo'
        ? '#86efac'
        : level === 'medio'
        ? '#fde68a'
        : '#fca5a5',
    textTransform: 'capitalize',
    fontWeight: 800,
    fontSize: '0.85rem',
  }
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '16px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.75,
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const topRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
  marginBottom: '14px',
}

const subject: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '1.05rem',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '12px',
}

const metric: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  display: 'grid',
  gap: '6px',
}

const label: React.CSSProperties = {
  opacity: 0.75,
  fontSize: '0.9rem',
}

const details: React.CSSProperties = {
  marginTop: '14px',
  display: 'grid',
  gap: '8px',
  opacity: 0.9,
}

const recommendationBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,.12)',
  lineHeight: 1.45,
}