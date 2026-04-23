'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  bulkCreateEvaluations,
  deleteEvaluation,
  getUserEvaluations,
  type Evaluation,
} from '../../lib/evaluations'
import { buildFullGradeAnalysis } from '../../lib/grade-engine'
import { getStudyCoachPlan } from '../../lib/study-coach-storage'
import { getWeekKey } from '../../lib/study-coach'
import EvaluationForm from './EvaluationForm'

type ViewMode = 'list' | 'summary'

export default function CalendarView() {
  const [userId, setUserId] = useState('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null)
  const [bulkText, setBulkText] = useState('')
  const [importing, setImporting] = useState(false)
  const [coachBlocks, setCoachBlocks] = useState<any[]>([])
  const [coachSummary, setCoachSummary] = useState('')

  async function loadAll() {
    try {
      setLoading(true)
      const user = await getCurrentUser()
      if (!user) return

      setUserId(user.id)

      const [evaluationsData, plan] = await Promise.all([
        getUserEvaluations(user.id),
        getStudyCoachPlan(user.id, getWeekKey()),
      ])

      setEvaluations(evaluationsData || [])
      setCoachBlocks(plan?.blocks || [])
      setCoachSummary(plan?.coach_summary || '')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const gradeSummaries = useMemo(
    () => buildFullGradeAnalysis(evaluations),
    [evaluations]
  )

  async function removeEvaluation(id: string) {
    try {
      await deleteEvaluation(id)
      await loadAll()
    } catch (error) {
      console.error(error)
      alert('No se pudo eliminar la evaluación')
    }
  }

  async function importEvaluationsFromText() {
    if (!userId || !bulkText.trim()) return

    try {
      setImporting(true)

      const lines = bulkText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)

      const items = lines
        .map((line) => {
          const parts = line.split('|').map((p) => p.trim())

          if (parts.length < 7) return null

          return {
            user_id: userId,
            subject: parts[0],
            type: parts[1],
            number: parts[2] ? Number(parts[2]) : null,
            topic: parts[3],
            start_date: parts[4],
            end_date: parts[5] || parts[4],
            weight_percent: parts[6] ? Number(parts[6]) : null,
            difficulty: 'media' as const,
            notes: null,
          }
        })
        .filter(Boolean) as Array<{
          user_id: string
          subject: string
          type: string
          number: number | null
          topic: string
          start_date: string
          end_date: string
          weight_percent: number | null
          difficulty: 'media'
          notes: null
        }>

      await bulkCreateEvaluations(items)
      setBulkText('')
      await loadAll()
    } catch (error) {
      console.error(error)
      alert('No se pudieron importar las evaluaciones')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div style={container}>
      <div style={topBar}>
        <div>
          <h2 style={title}>Calendario y evaluaciones</h2>
          <p style={subtitle}>
            Aquí puedes crear, editar, eliminar e importar evaluaciones.
          </p>
        </div>

        <div style={controls}>
          <button
            onClick={() => setView('list')}
            style={view === 'list' ? activeToggleButton : toggleButton}
          >
            Lista
          </button>
          <button
            onClick={() => setView('summary')}
            style={view === 'summary' ? activeToggleButton : toggleButton}
          >
            Resumen
          </button>
        </div>
      </div>

      <div style={layout}>
        <div style={mainColumn}>
          <div style={card}>
            <EvaluationForm
              userId={userId}
              initialData={editingEvaluation}
              onSaved={async () => {
                setEditingEvaluation(null)
                await loadAll()
              }}
            />
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>Importar evaluaciones en lote</h3>
            <p style={subtitle}>
              Formato por línea: ramo | tipo | número | tema | fecha inicio | fecha fin | peso
            </p>

            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Precálculo | Control | 3 | Límites | 2026-04-25 | 2026-04-25 | 20"
              style={textarea}
            />

            <div style={actions}>
              <button
                onClick={importEvaluationsFromText}
                style={button}
                disabled={importing}
              >
                {importing ? 'Importando...' : 'Importar evaluaciones'}
              </button>
            </div>
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>Tus evaluaciones</h3>

            {loading ? (
              <div style={emptyText}>Cargando...</div>
            ) : evaluations.length === 0 ? (
              <div style={emptyText}>No hay evaluaciones todavía.</div>
            ) : (
              <div style={list}>
                {evaluations.map((item) => (
                  <div key={item.id} style={listItem}>
                    <div style={listTop}>
                      <div>
                        <div style={listTitle}>
                          {item.subject} · {item.type} {item.number ?? ''}
                        </div>

                        <div style={listMeta}>
                          {item.topic || item.title || 'Sin tema'} · {item.start_date}
                          {item.end_date !== item.start_date ? ` → ${item.end_date}` : ''}
                        </div>

                        <div style={listMeta}>
                          Peso: {item.weight_percent ?? 0}%
                        </div>
                      </div>

                      <div style={rowActions}>
                        <button
                          onClick={() => setEditingEvaluation(item)}
                          style={editButton}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => removeEvaluation(item.id)}
                          style={deleteButton}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>Plan semanal del coach</h3>

            {coachBlocks.length === 0 ? (
              <div style={emptyText}>Aún no hay plan semanal guardado.</div>
            ) : (
              <div style={list}>
                {coachBlocks.map((block, index) => (
                  <div key={index} style={listItem}>
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
          </div>

          {coachSummary && (
            <div style={card}>
              <h3 style={sectionTitle}>Explicación del coach</h3>
              <div style={coachSummaryBox}>{coachSummary}</div>
            </div>
          )}
        </div>

        <div style={sideColumn}>
          <div style={card}>
            <h3 style={sectionTitle}>Resumen académico</h3>

            {gradeSummaries.length === 0 ? (
              <div style={emptyText}>Aún no hay datos suficientes.</div>
            ) : (
              gradeSummaries.map((item) => (
                <div key={item.subject} style={summaryItem}>
                  <div style={summaryTop}>
                    <div style={summaryTitle}>{item.subject}</div>
                    <div style={summaryBadge}>{item.status}</div>
                  </div>

                  <div style={summaryMeta}>
                    Promedio: {item.average === null ? '—' : item.average.toFixed(2)}
                  </div>

                  <div style={summaryMeta}>
                    Peso acumulado: {item.totalWeight}%
                  </div>

                  <div style={summaryMeta}>
                    Peso restante: {item.remainingWeight}%
                  </div>

                  {item.neededToPass !== null && (
                    <div style={summaryHint}>
                      Para llegar al 4.0 necesitas aprox:{' '}
                      <strong>{item.neededToPass.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              ))
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

const topBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  opacity: 0.75,
}

const controls: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
}

const toggleButton: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
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
  gridTemplateColumns: '1.4fr 0.8fr',
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

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: '140px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const actions: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '12px',
}

const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}

const emptyText: React.CSSProperties = {
  opacity: 0.75,
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

const listTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const listTitle: React.CSSProperties = {
  fontWeight: 800,
}

const listMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.78,
}

const rowActions: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
}

const editButton: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: 'none',
  background: 'rgba(59,130,246,0.18)',
  color: 'white',
  cursor: 'pointer',
}

const deleteButton: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '10px',
  border: 'none',
  background: 'rgba(239,68,68,0.18)',
  color: 'white',
  cursor: 'pointer',
}

const summaryItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '10px',
}

const summaryTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
}

const summaryTitle: React.CSSProperties = {
  fontWeight: 800,
}

const summaryBadge: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,0.18)',
  fontSize: '0.8rem',
  textTransform: 'capitalize',
}

const summaryMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.82,
}

const summaryHint: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
}

const coachSummaryBox: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.55,
  opacity: 0.95,
}