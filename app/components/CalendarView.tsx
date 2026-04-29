'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
import { safeDate } from '@/lib/utils/date'

type ViewMode = 'list' | 'summary'

function getEvaluationDate(evaluation: any) {
  return evaluation.start_date ?? evaluation.end_date  ?? null
}

function getEvaluationEndDate(evaluation: any) {
  return evaluation.end_date ?? evaluation.start_date ?? null
}

function getEvaluationTitle(evaluation: any) {
  return evaluation.topic ?? evaluation.title ?? evaluation.contents ?? 'Sin tema'
}

function getEvaluationWeight(evaluation: any) {
  if (typeof evaluation.weight_percent === 'number') return evaluation.weight_percent
  if (typeof evaluation.weight === 'number') return evaluation.weight * 100
  return 0
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

function daysUntil(value?: string | null) {
  const date = safeDate(value)
  if (!date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.ceil((date.getTime() - today.getTime()) / 86400000)
}

function orderEvaluations(evaluations: any[]) {
  return [...evaluations].sort((a, b) => {
    const aDate = safeDate(getEvaluationDate(a))
    const bDate = safeDate(getEvaluationDate(b))

    if (!aDate && !bDate) return 0
    if (!aDate) return 1
    if (!bDate) return -1

    return aDate.getTime() - bDate.getTime()
  })
}

export default function CalendarView() {
  const [userId, setUserId] = useState('')
  const [evaluations, setEvaluations] = useState<any[]>([])
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

      const [userEvaluations, plan] = await Promise.all([
        getUserEvaluations(user.id),
        getStudyCoachPlan(user.id, getWeekKey()),
      ])

      let finalEvaluations: any[] = userEvaluations || []

      if (finalEvaluations.length === 0) {
        const { data, error } = await supabase
          .from('evaluations')
          .select('*')
          .order('date', { ascending: true })

        if (!error && data) {
          finalEvaluations = data
        }
      }

      setEvaluations(finalEvaluations)
      setCoachBlocks(plan?.blocks || [])
      setCoachSummary(plan?.coach_summary || '')
    } catch (error) {
      console.error('CALENDAR LOAD ERROR:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const orderedEvaluations = useMemo(
    () => orderEvaluations(evaluations),
    [evaluations]
  )

  const upcomingEvaluations = useMemo(() => {
    return orderedEvaluations.filter((evaluation) => {
      const days = daysUntil(getEvaluationDate(evaluation))
      return days !== null && days >= 0
    })
  }, [orderedEvaluations])

  const gradeSummaries = useMemo(
    () => buildFullGradeAnalysis(evaluations as Evaluation[]),
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
        .filter(Boolean) as any[]

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
            Evaluaciones reales leídas desde Supabase, usando date/start_date/end_date.
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

      <div style={statsGrid}>
        <Stat label="Total" value={orderedEvaluations.length} />
        <Stat label="Próximas" value={upcomingEvaluations.length} />
        <Stat
          label="Más cercana"
          value={
            upcomingEvaluations[0]
              ? formatDate(getEvaluationDate(upcomingEvaluations[0]))
              : 'Sin datos'
          }
        />
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
            ) : orderedEvaluations.length === 0 ? (
              <div style={emptyText}>No hay evaluaciones todavía.</div>
            ) : (
              <div style={list}>
                {orderedEvaluations.map((item) => {
                  const start = getEvaluationDate(item)
                  const end = getEvaluationEndDate(item)
                  const days = daysUntil(start)

                  return (
                    <div key={item.id} style={listItem}>
                      <div style={listTop}>
                        <div>
                          <div style={listTitle}>
                            {item.subject || 'General'} · {item.type || 'Evaluación'}{' '}
                            {item.number ?? ''}
                          </div>

                          <div style={listMeta}>
                            {getEvaluationTitle(item)}
                          </div>

                          <div style={listMeta}>
                            📅 {formatDate(start)}
                            {end && end !== start ? ` → ${formatDate(end)}` : ''}
                          </div>

                          <div style={listMeta}>
                            {days === null
                              ? 'Sin fecha válida'
                              : days < 0
                              ? 'Ya pasó'
                              : days === 0
                              ? 'Es hoy'
                              : `Faltan ${days} día(s)`}
                          </div>

                          <div style={listMeta}>
                            Peso: {getEvaluationWeight(item).toFixed(1)}%
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
                  )
                })}
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
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
  lineHeight: 1.5,
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

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
  fontSize: '1.3rem',
  fontWeight: 900,
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
  lineHeight: 1.45,
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