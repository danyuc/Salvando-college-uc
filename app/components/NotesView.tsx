'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getMyPracticeAttempts } from '../../lib/practice-attempts'
import { buildWeaknessesByTopic } from '../../lib/weakness-engine'
import { buildGradePredictions } from '../../lib/grade-prediction'
import { getSubjectColor } from '../../lib/subjects'

export default function NotesView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 🔥 NUEVO: simulador
  const [simulatedGrade, setSimulatedGrade] = useState(5.0)

  async function loadAll() {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) return

      const [evals, atts] = await Promise.all([
        getUserEvaluations(user.id),
        getMyPracticeAttempts(user.id),
      ])

      setEvaluations(evals || [])
      setAttempts(atts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  // 🧠 WEAKNESSES LIMPIAS
  const weaknesses = useMemo(() => {
    return buildWeaknessesByTopic(
      attempts.map((a) => ({
        subject: a.subject,
        topic: a.topic ?? 'General',
        is_correct: a.is_correct,
      }))
    )
  }, [attempts])

  // 📊 PREDICCIONES
  const predictions = useMemo(() => {
    return buildGradePredictions({
      evaluations,
      weaknesses,
    })
  }, [evaluations, weaknesses])

  // 🧠 NUEVO: recomendaciones IA simples (sin backend)
  function getAdvice(p: any) {
    if (p.status === 'critico') {
      return 'Prioriza esta materia. Estudia todos los días.'
    }
    if (p.status === 'en-riesgo') {
      return 'Refuerza ejercicios y temas débiles.'
    }
    return 'Buen progreso, mantén constancia.'
  }

  if (loading) return <div style={container}>Cargando...</div>

  return (
    <div style={container}>
      <h2 style={title}>📊 Notas Inteligentes</h2>

      {predictions.map((p) => {
        const color = getSubjectColor(p.subject)

        return (
          <div key={p.subject} style={{ ...card, borderLeft: `5px solid ${color}` }}>
            
            {/* HEADER */}
            <div style={header}>
              <div>
                <h3>{p.subject}</h3>
                <div style={status(p.status)}>{p.status}</div>
              </div>

              <div style={gradeBox}>
                {p.projectedFinalIfSamePerformance?.toFixed(2) ?? '—'}
              </div>
            </div>

            {/* PROGRESO */}
            <div style={row}>
              <div>📊 Peso rendido: {p.completedWeight}%</div>
              <div>📉 Restante: {p.remainingWeight}%</div>
            </div>

            {/* NECESARIO */}
            <div style={box}>
              <b>🎯 Necesitas:</b>
              <div>4.0 → {p.neededToPass?.toFixed(2) ?? '—'}</div>
              <div>5.0 → {p.neededFor50?.toFixed(2) ?? '—'}</div>
              <div>6.0 → {p.neededFor60?.toFixed(2) ?? '—'}</div>
              <div>7.0 → {p.neededFor70?.toFixed(2) ?? '—'}</div>
            </div>

            {/* 🔥 SIMULADOR */}
            <div style={box}>
              <b>🧪 Simular próxima nota</b>

              <input
                type="range"
                min={1}
                max={7}
                step={0.1}
                value={simulatedGrade}
                onChange={(e) => setSimulatedGrade(Number(e.target.value))}
                style={{ width: '100%' }}
              />

              <div>
                Si sacas <b>{simulatedGrade.toFixed(1)}</b> →
                Nota final aprox:{' '}
                <b>
                  {(
                    (p.currentWeightedScore +
                      simulatedGrade * p.remainingWeight) /
                    100
                  ).toFixed(2)}
                </b>
              </div>
            </div>

            {/* DEBILIDADES */}
            <div style={box}>
              <b>🧠 Debilidades</b>
              {p.weaknessTopics.length > 0 ? (
                p.weaknessTopics.map((t: string) => (
                  <div key={t} style={chip}>
                    {t}
                  </div>
                ))
              ) : (
                <div>Sin debilidades detectadas</div>
              )}
            </div>

            {/* IA ADVICE */}
            <div style={box}>
              <b>🤖 Recomendación</b>
              <div>{getAdvice(p)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ================= STYLES ================= */

const container: React.CSSProperties = {
  padding: 20,
  display: 'grid',
  gap: 16,
  color: 'white',
}

const title: React.CSSProperties = {
  margin: 0,
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  padding: 16,
  borderRadius: 16,
}

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const gradeBox: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
}

const row: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 10,
}

const box: React.CSSProperties = {
  marginTop: 12,
  padding: 10,
  borderRadius: 10,
  background: 'rgba(255,255,255,0.04)',
}

const chip: React.CSSProperties = {
  display: 'inline-block',
  padding: '5px 10px',
  borderRadius: 20,
  background: '#2563eb',
  marginTop: 6,
}

function status(s: string): React.CSSProperties {
  if (s === 'critico') return { color: '#ef4444' }
  if (s === 'en-riesgo') return { color: '#f59e0b' }
  return { color: '#22c55e' }
}