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
import { buildWeaknessesByTopic } from '../../lib/weakness-engine'
import { SUBJECT_PRESETS, getSubjectColor } from '../../lib/subjects'
import {
  buildStudyCoachPlan,
  getWeekKey,
  type WeeklyStudyCoachPlan,
} from '../../lib/study-coach'
import {
  getStudyCoachPlan,
  saveStudyCoachPlan,
} from '../../lib/study-coach-storage'

export default function StudyCoachView() {
  const [userId, setUserId] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(35)

  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([])
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([])

  const [savedPlan, setSavedPlan] = useState<WeeklyStudyCoachPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function loadAll() {
    try {
      setLoading(true)

      const user = await getCurrentUser()
      if (!user) return

      setUserId(user.id)

      const weekKey = getWeekKey()

      const [evaluationsData, availabilityData, attemptsData, existingPlan] =
        await Promise.all([
          getUserEvaluations(user.id),
          getAvailabilityBlocks(user.id),
          getMyPracticeAttempts(user.id),
          getStudyCoachPlan(user.id, weekKey),
        ])

      setEvaluations(evaluationsData || [])
      setAvailability(availabilityData || [])
      setAttempts(attemptsData || [])

      if (existingPlan) {
        setSavedPlan({
          week_key: existingPlan.week_key,
          total_weekly_minutes: existingPlan.total_weekly_minutes,
          blocks: existingPlan.blocks || [],
          summary: existingPlan.coach_summary || '',
        })

        setWeeklyHours(Math.round(existingPlan.total_weekly_minutes / 60))
      }
    } catch (error) {
      console.error(error)
      alert('No se pudo cargar el coach de estudio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const weaknesses = useMemo(() => {
    return buildWeaknessesByTopic(
      attempts.map((attempt) => ({
        subject: attempt.subject || 'General',
        topic: attempt.topic || 'General',
        is_correct: attempt.is_correct,
      }))
    )
  }, [attempts])

  const generatedPlan = useMemo(() => {
    return buildStudyCoachPlan({
      evaluations,
      weaknesses,
      availability,
      subjects: SUBJECT_PRESETS,
      weeklyHours,
    })
  }, [evaluations, weaknesses, availability, weeklyHours])

  const planToShow = savedPlan || generatedPlan

  async function handleSavePlan() {
    if (!userId) return

    try {
      setSaving(true)

      await saveStudyCoachPlan({
        user_id: userId,
        week_key: generatedPlan.week_key,
        total_weekly_minutes: generatedPlan.total_weekly_minutes,
        blocks: generatedPlan.blocks,
        coach_summary: generatedPlan.summary,
      })

      setSavedPlan(generatedPlan)
      alert('Plan semanal guardado')
    } catch (error) {
      console.error(error)
      alert('No se pudo guardar el plan semanal')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Coach de estudio</h2>
        <p style={subtitle}>
          Plan automático según riesgo, evaluaciones, disponibilidad y debilidades.
        </p>

        <div style={controls}>
          <div style={field}>
            <label style={label}>Horas semanales</label>
            <input
              type="number"
              min={1}
              max={80}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value) || 35)}
              style={input}
            />
          </div>

          <button onClick={handleSavePlan} style={button} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar plan semanal'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={card}>Cargando...</div>
      ) : (
        <>
          <div style={card}>
            <h3 style={sectionTitle}>Resumen</h3>
            <div style={summaryBox}>{planToShow.summary}</div>
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>Plan semanal</h3>

            {planToShow.blocks.length === 0 ? (
              <div style={emptyText}>
                Faltan datos. Agrega disponibilidad y evaluaciones.
              </div>
            ) : (
              <div style={list}>
                {planToShow.blocks.map((block, index) => (
                  <div
                    key={`${block.day}-${block.subject}-${block.topic}-${index}`}
                    style={{
                      ...listItem,
                      borderLeft: `4px solid ${getSubjectColor(block.subject)}`,
                    }}
                  >
                    <div style={listTitle}>
                      {block.day} · {block.subject}
                    </div>
                    <div style={listMeta}>
                      {block.unit} · {block.topic}
                    </div>
                    <div style={listMeta}>
                      {block.minutes} min · {block.evaluationType} ·{' '}
                      {block.evaluationDate}
                    </div>
                    <div style={listMeta}>{block.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={grid}>
            <div style={card}>
              <h3 style={sectionTitle}>Debilidades consideradas</h3>

              {weaknesses.length === 0 ? (
                <div style={emptyText}>Aún no hay debilidades detectadas.</div>
              ) : (
                <div style={list}>
                  {weaknesses.slice(0, 8).map((item, index) => (
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
                        Precisión: {Math.round(item.accuracy * 100)}% · Nivel:{' '}
                        {item.weaknessLevel}
                      </div>
                      <div style={listMeta}>{item.recommendation}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={card}>
              <h3 style={sectionTitle}>Base del plan</h3>
              <div style={metaBox}>Semana: {planToShow.week_key}</div>
              <div style={metaBox}>
                Tiempo semanal: {Math.round(planToShow.total_weekly_minutes / 60)} h
              </div>
              <div style={metaBox}>Evaluaciones: {evaluations.length}</div>
              <div style={metaBox}>
                Bloques disponibles: {availability.length}
              </div>
              <div style={metaBox}>Intentos analizados: {attempts.length}</div>
            </div>
          </div>
        </>
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

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = { margin: 0 }

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  lineHeight: 1.45,
}

const sectionTitle: React.CSSProperties = { marginTop: 0 }

const controls: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
  flexWrap: 'wrap',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
}

const label: React.CSSProperties = { fontWeight: 700 }

const input: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  minWidth: '140px',
}

const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const summaryBox: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.55,
}

const emptyText: React.CSSProperties = { opacity: 0.75 }

const list: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const listItem: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const listTitle: React.CSSProperties = { fontWeight: 800 }

const listMeta: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.82,
  lineHeight: 1.4,
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 0.8fr',
  gap: '18px',
}

const metaBox: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '8px',
}