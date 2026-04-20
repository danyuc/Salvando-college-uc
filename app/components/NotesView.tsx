'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { buildFullGradeAnalysis } from '../../lib/grade-engine'

type EvaluationWithGrades = Evaluation & {
  grade?: number | null
  weight_percent?: number | null
}

export default function NotesView() {
  const [evaluations, setEvaluations] = useState<EvaluationWithGrades[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const user = await getCurrentUser()
        if (!user) return

        const data = await getUserEvaluations(user.id)
        setEvaluations((data || []) as EvaluationWithGrades[])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const analytics = useMemo(
    () => buildFullGradeAnalysis(evaluations),
    [evaluations]
  )

  const globalAverage = useMemo(() => {
    const graded = evaluations.filter(
      (item) => typeof item.grade === 'number' && !Number.isNaN(Number(item.grade))
    )

    if (graded.length === 0) return null

    const avg =
      graded.reduce((acc, item) => acc + Number(item.grade || 0), 0) / graded.length

    return Number(avg.toFixed(2))
  }, [evaluations])

  const totalCompleted = evaluations.filter(
    (item) => typeof item.grade === 'number' && !Number.isNaN(Number(item.grade))
  ).length

  const totalPending = evaluations.length - totalCompleted

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>Notas y rendimiento</h2>
        <p style={subtitle}>
          Aquí ves cómo vas por ramo, cuánto llevas acumulado y qué tan cerca estás de aprobar.
        </p>
      </div>

      <div style={statsGrid}>
        <div style={statCard}>
          <div style={statLabel}>Promedio global</div>
          <div style={statValue}>
            {globalAverage === null ? '—' : globalAverage.toFixed(2)}
          </div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Evaluaciones con nota</div>
          <div style={statValue}>{totalCompleted}</div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Pendientes</div>
          <div style={statValue}>{totalPending}</div>
        </div>
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>Resumen por ramo</h3>

        {loading ? (
          <div style={emptyText}>Cargando...</div>
        ) : analytics.length === 0 ? (
          <div style={emptyText}>Aún no tienes datos de notas.</div>
        ) : (
          <div style={subjectGrid}>
            {analytics.map((item) => (
              <div key={item.subject} style={subjectCard}>
                <div style={subjectTop}>
                  <div style={subjectName}>{item.subject}</div>
                  <div style={statusBadge(item.status)}>{item.status}</div>
                </div>

                <div style={subjectMeta}>
                  Promedio: {item.average === null ? '—' : item.average.toFixed(2)}
                </div>

                <div style={subjectMeta}>
                  Peso acumulado: {item.totalWeight}%
                </div>

                <div style={subjectMeta}>
                  Peso faltante: {item.remainingWeight}%
                </div>

                <div style={subjectMeta}>
                  Hechas: {item.completed} · Pendientes: {item.pending}
                </div>

                {item.neededToPass !== null && (
                  <div style={neededText(item.neededToPass)}>
                    Necesitas aprox {item.neededToPass.toFixed(2)} en lo restante para llegar al 4.0
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionCard}>
        <h3 style={sectionTitle}>Detalle de evaluaciones</h3>

        {loading ? (
          <div style={emptyText}>Cargando...</div>
        ) : evaluations.length === 0 ? (
          <div style={emptyText}>No hay evaluaciones aún.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Ramo</th>
                  <th style={th}>Evaluación</th>
                  <th style={th}>Fecha</th>
                  <th style={th}>Nota</th>
                  <th style={th}>Peso %</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((item) => (
                  <tr key={item.id}>
                    <td style={td}>{item.subject}</td>
                    <td style={td}>
                      {item.type} {item.number ?? ''} · {item.topic || item.title || 'Sin tema'}
                    </td>
                    <td style={td}>
                      {item.start_date} → {item.end_date}
                    </td>
                    <td style={td}>
                      {item.grade === null || item.grade === undefined ? '—' : item.grade}
                    </td>
                    <td style={td}>
                      {item.weight_percent === null || item.weight_percent === undefined
                        ? '—'
                        : `${item.weight_percent}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function statusBadge(status: string): React.CSSProperties {
  const background =
    status === 'excelente'
      ? 'rgba(16,185,129,0.25)'
      : status === 'bien'
      ? 'rgba(59,130,246,0.25)'
      : status === 'medio'
      ? 'rgba(245,158,11,0.25)'
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

function neededText(value: number): React.CSSProperties {
  return {
    marginTop: '10px',
    padding: '10px',
    borderRadius: '10px',
    background:
      value <= 4
        ? 'rgba(16,185,129,0.18)'
        : value <= 5.5
        ? 'rgba(245,158,11,0.18)'
        : 'rgba(239,68,68,0.18)',
    fontSize: '0.9rem',
  }
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const title: React.CSSProperties = {
  margin: 0,
  fontSize: '1.7rem',
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.75,
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '12px',
}

const statCard: React.CSSProperties = {
  padding: '16px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const statLabel: React.CSSProperties = {
  opacity: 0.7,
  marginBottom: '8px',
}

const statValue: React.CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: 900,
}

const sectionCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '14px',
}

const emptyText: React.CSSProperties = {
  opacity: 0.7,
}

const subjectGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
  gap: '12px',
}

const subjectCard: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const subjectTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
  marginBottom: '10px',
}

const subjectName: React.CSSProperties = {
  fontWeight: 800,
}

const subjectMeta: React.CSSProperties = {
  opacity: 0.82,
  marginTop: '6px',
  fontSize: '0.95rem',
}

const tableWrapper: React.CSSProperties = {
  overflowX: 'auto',
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  opacity: 0.8,
}

const td: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}