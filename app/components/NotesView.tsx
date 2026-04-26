'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  createEvaluation,
  deleteEvaluation,
  getUserEvaluations,
  updateEvaluation,
  type Evaluation,
} from '../../lib/evaluations'
import { buildAcademicAnalysis } from '../../lib/academic-engine'
import { buildAcademicAlerts } from '../../lib/alert-engine'
import { getSubjectColor } from '../../lib/subjects'

type FormState = {
  subject: string
  title: string
  type: string
  topic: string
  current_grade: string
  weight_percent: string
  start_date: string
  notes: string
}

const initialForm: FormState = {
  subject: '',
  title: '',
  type: 'prueba',
  topic: '',
  current_grade: '',
  weight_percent: '',
  start_date: '',
  notes: '',
}

export default function NotesView() {
  const [userId, setUserId] = useState<string | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)

  const [simulationGrade, setSimulationGrade] = useState(5)
  const [simulationWeight, setSimulationWeight] = useState(20)

  async function loadAll() {
    try {
      setLoading(true)

      const user = await getCurrentUser()

      if (!user) {
        setUserId(null)
        setEvaluations([])
        return
      }

      setUserId(user.id)

      const data = await getUserEvaluations(user.id)
      setEvaluations(data ?? [])
    } catch (error) {
      console.error('NOTES LOAD ERROR:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const academicAnalysis = useMemo(
    () => buildAcademicAnalysis(evaluations),
    [evaluations]
  )

  const academicAlerts = useMemo(
    () => buildAcademicAlerts(academicAnalysis),
    [academicAnalysis]
  )

  function updateForm(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleCreateEvaluation(e: React.FormEvent) {
    e.preventDefault()

    if (!userId) return alert('Debes iniciar sesión.')

    const subject = form.subject.trim()
    const title = form.title.trim()
    const type = form.type.trim() || 'prueba'
    const currentGrade = Number(form.current_grade)
    const weightPercent = Number(form.weight_percent)

    if (!subject) return alert('Falta la asignatura.')
    if (!title) return alert('Falta el nombre de la evaluación.')
    if (!Number.isFinite(currentGrade) || currentGrade < 1 || currentGrade > 7) {
      return alert('La nota debe estar entre 1.0 y 7.0.')
    }
    if (!Number.isFinite(weightPercent) || weightPercent <= 0 || weightPercent > 100) {
      return alert('La ponderación debe estar entre 1 y 100.')
    }

    try {
      setSaving(true)

      await createEvaluation({
        user_id: userId,
        subject,
        title,
        type,
        topic: form.topic.trim() || null,
        current_grade: currentGrade,
        grade: currentGrade,
        weight_percent: weightPercent,
        start_date: form.start_date || null,
        end_date: form.start_date || null,
        notes: form.notes.trim() || null,
      } as any)

      setForm(initialForm)
      await loadAll()
    } catch (error) {
      console.error('CREATE EVALUATION ERROR:', error)
      alert('No se pudo guardar la nota. Revisa Supabase/RLS.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEvaluation(id?: string) {
    if (!id) return

    try {
      await deleteEvaluation(id)
      await loadAll()
    } catch (error) {
      console.error('DELETE EVALUATION ERROR:', error)
      alert('No se pudo eliminar.')
    }
  }

  async function handleUpdateGrade(ev: Evaluation, value: string) {
    if (!ev.id) return

    const grade = Number(value)

    if (!Number.isFinite(grade) || grade < 1 || grade > 7) {
      return alert('La nota debe estar entre 1.0 y 7.0.')
    }

    try {
      await updateEvaluation(ev.id, {
        current_grade: grade,
        grade,
      } as any)

      await loadAll()
    } catch (error) {
      console.error('UPDATE GRADE ERROR:', error)
      alert('No se pudo actualizar la nota.')
    }
  }

  if (loading) {
    return <div style={container}>Cargando notas inteligentes...</div>
  }

  return (
    <main style={container}>
      <section style={hero}>
        <div>
          <div style={eyebrow}>Salvando UC</div>
          <h1 style={mainTitle}>Notas Inteligentes</h1>
          <p style={subtitle}>
            Predicción por ramo, alertas académicas, simulador y análisis de riesgo.
          </p>
        </div>

        <div style={heroStats}>
          <div style={heroNumber}>{academicAnalysis.length}</div>
          <div style={heroLabel}>ramos activos</div>
        </div>
      </section>

      <section style={topGrid}>
        <form style={panel} onSubmit={handleCreateEvaluation}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Agregar evaluación</h2>
            <span style={badge}>IA académica</span>
          </div>

          <div style={formGrid}>
            <input
              style={input}
              placeholder="Asignatura"
              value={form.subject}
              onChange={(e) => updateForm('subject', e.target.value)}
            />

            <input
              style={input}
              placeholder="Nombre evaluación"
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
            />

            <select
              style={input}
              value={form.type}
              onChange={(e) => updateForm('type', e.target.value)}
            >
              <option value="control">Control</option>
              <option value="prueba">Prueba</option>
              <option value="examen">Examen</option>
              <option value="tarea">Tarea</option>
              <option value="trabajo">Trabajo</option>
            </select>

            <input
              style={input}
              placeholder="Tema / contenido"
              value={form.topic}
              onChange={(e) => updateForm('topic', e.target.value)}
            />

            <input
              style={input}
              type="number"
              min="1"
              max="7"
              step="0.1"
              placeholder="Nota"
              value={form.current_grade}
              onChange={(e) => updateForm('current_grade', e.target.value)}
            />

            <input
              style={input}
              type="number"
              min="1"
              max="100"
              step="1"
              placeholder="Ponderación %"
              value={form.weight_percent}
              onChange={(e) => updateForm('weight_percent', e.target.value)}
            />

            <input
              style={input}
              type="date"
              value={form.start_date}
              onChange={(e) => updateForm('start_date', e.target.value)}
            />

            <input
              style={input}
              placeholder="Notas internas"
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
            />
          </div>

          <button style={primaryButton} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar nota'}
          </button>
        </form>

        <aside style={panel}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>Alertas</h2>
            <span style={badge}>{academicAlerts.length}</span>
          </div>

          {academicAlerts.length === 0 ? (
            <p style={muted}>Todo está bajo control por ahora.</p>
          ) : (
            <div style={stack}>
              {academicAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} style={alertCard(alert.level)}>
                  <strong>{alert.title}</strong>
                  <p style={alertText}>{alert.message}</p>
                  <small style={mutedSmall}>{alert.action}</small>
                </div>
              ))}
            </div>
          )}

          <div style={simBox}>
            <h3 style={miniTitle}>Simulador global</h3>

            <label style={label}>
              Nota simulada: <b>{simulationGrade.toFixed(1)}</b>
            </label>
            <input
              type="range"
              min={1}
              max={7}
              step={0.1}
              value={simulationGrade}
              onChange={(e) => setSimulationGrade(Number(e.target.value))}
              style={{ width: '100%' }}
            />

            <label style={label}>
              Peso simulado: <b>{simulationWeight}%</b>
            </label>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={simulationWeight}
              onChange={(e) => setSimulationWeight(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </aside>
      </section>

      {academicAnalysis.length === 0 && (
        <section style={emptyState}>
          Aún no hay notas registradas. Agrega una evaluación para activar el análisis.
        </section>
      )}

      <section style={cardsGrid}>
        {academicAnalysis.map((item) => {
          const color = getSubjectColor(item.subject)
          const simulatedFinal =
            ((item.weightedScore ?? 0) + simulationGrade * simulationWeight) / 100

          return (
            <article key={item.subject} style={{ ...subjectCard, borderTop: `4px solid ${color}` }}>
              <header style={cardHeader}>
                <div>
                  <h2 style={subjectTitle}>{item.subject}</h2>
                  <p style={muted}>
                    {item.completedWeight.toFixed(0)}% rendido ·{' '}
                    {item.remainingWeight.toFixed(0)}% restante
                  </p>
                </div>

                <div style={gradeCircle(item.risk)}>
                  {item.currentAverage === null ? '—' : item.currentAverage.toFixed(2)}
                </div>
              </header>

              <div style={metricsGrid}>
                <Metric label="Proyección" value={item.projectedFinal === null ? '—' : item.projectedFinal.toFixed(2)} />
                <Metric label="Salud" value={`${item.healthScore}/100`} />
                <Metric label="Riesgo" value={item.risk.toUpperCase()} />
                <Metric label="Tendencia" value={item.trend.toUpperCase()} />
                <Metric
                  label="Necesitas 4.0"
                  value={
                    item.neededToPass === null
                      ? '—'
                      : item.neededToPass > 7
                        ? '+7.0'
                        : Math.max(item.neededToPass, 1).toFixed(2)
                  }
                />
                <Metric label="Simulado" value={simulatedFinal.toFixed(2)} />
              </div>

              <div style={progressTrack}>
                <div
                  style={{
                    ...progressFill,
                    width: `${Math.min(item.completedWeight, 100)}%`,
                    background: color,
                  }}
                />
              </div>

              <div style={box}>
                <strong>Lectura IA</strong>
                <p style={muted}>{item.recommendation}</p>
              </div>

              <div style={box}>
                <strong>Evaluaciones</strong>

                <div style={stack}>
                  {item.evaluations.map((ev) => (
                    <div key={ev.id} style={evaluationRow}>
                      <div>
                        <strong>{ev.title ?? ev.type ?? 'Evaluación'}</strong>
                        <div style={mutedSmall}>
                          {ev.type ?? 'nota'} · {Number(ev.weight_percent ?? ev.weight ?? 0)}% ·{' '}
                          {ev.start_date ?? ev.date ?? 'sin fecha'}
                        </div>
                      </div>

                      <div style={actions}>
                        <input
                          style={miniInput}
                          type="number"
                          min={1}
                          max={7}
                          step={0.1}
                          defaultValue={Number(ev.current_grade ?? ev.grade ?? 0)}
                          onBlur={(e) => handleUpdateGrade(ev, e.target.value)}
                        />

                        <button
                          style={dangerButton}
                          onClick={() => handleDeleteEvaluation(ev.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricCard}>
      <span style={metricLabel}>{label}</span>
      <strong style={metricValue}>{value}</strong>
    </div>
  )
}

const container: React.CSSProperties = {
  padding: 24,
  display: 'grid',
  gap: 20,
  color: 'white',
}

const hero: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 20,
  padding: 24,
  borderRadius: 28,
  background: 'linear-gradient(135deg, rgba(37,99,235,0.35), rgba(2,6,23,0.92))',
  border: '1px solid rgba(255,255,255,0.12)',
}

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 1.6,
  textTransform: 'uppercase',
  opacity: 0.7,
}

const mainTitle: React.CSSProperties = {
  margin: '4px 0',
  fontSize: 34,
  fontWeight: 950,
}

const subtitle: React.CSSProperties = {
  margin: 0,
  opacity: 0.76,
}

const heroStats: React.CSSProperties = {
  minWidth: 130,
  padding: 18,
  borderRadius: 22,
  background: 'rgba(0,0,0,0.25)',
  textAlign: 'center',
}

const heroNumber: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 950,
}

const heroLabel: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.7,
}

const topGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, 0.75fr)',
  gap: 16,
}

const panel: React.CSSProperties = {
  padding: 18,
  borderRadius: 24,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const sectionHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 14,
}

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 900,
}

const badge: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.22)',
  color: '#bfdbfe',
  fontSize: 12,
  fontWeight: 800,
}

const formGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: '12px 13px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(15,23,42,0.88)',
  color: 'white',
  outline: 'none',
}

const primaryButton: React.CSSProperties = {
  width: '100%',
  marginTop: 12,
  padding: '13px 16px',
  borderRadius: 14,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const stack: React.CSSProperties = {
  display: 'grid',
  gap: 10,
}

function alertCard(level: string): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: 13,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.10)',
  }

  if (level === 'critico') {
    return { ...base, background: 'rgba(239,68,68,0.15)', color: '#fecaca' }
  }

  if (level === 'alto') {
    return { ...base, background: 'rgba(245,158,11,0.14)', color: '#fde68a' }
  }

  return { ...base, background: 'rgba(59,130,246,0.13)', color: '#bfdbfe' }
}

const alertText: React.CSSProperties = {
  margin: '6px 0',
  lineHeight: 1.35,
}

const simBox: React.CSSProperties = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: '1px solid rgba(255,255,255,0.10)',
}

const miniTitle: React.CSSProperties = {
  margin: '0 0 10px',
}

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  marginTop: 10,
  opacity: 0.8,
}

const emptyState: React.CSSProperties = {
  padding: 20,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  opacity: 0.8,
}

const cardsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: 16,
}

const subjectCard: React.CSSProperties = {
  padding: 18,
  borderRadius: 24,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const cardHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
}

const subjectTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
}

const muted: React.CSSProperties = {
  margin: '5px 0 0',
  opacity: 0.72,
  lineHeight: 1.4,
}

const mutedSmall: React.CSSProperties = {
  fontSize: 12,
  opacity: 0.65,
}

function gradeCircle(risk: string): React.CSSProperties {
  let border = 'rgba(34,197,94,0.55)'

  if (risk === 'critico' || risk === 'alto') border = 'rgba(239,68,68,0.65)'
  if (risk === 'medio') border = 'rgba(245,158,11,0.65)'

  return {
    width: 76,
    height: 76,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    border: `2px solid ${border}`,
    background: 'rgba(0,0,0,0.24)',
    fontSize: 23,
    fontWeight: 950,
  }
}

const metricsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
  marginTop: 16,
}

const metricCard: React.CSSProperties = {
  padding: 12,
  borderRadius: 16,
  background: 'rgba(0,0,0,0.22)',
}

const metricLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  opacity: 0.62,
  marginBottom: 4,
}

const metricValue: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
}

const progressTrack: React.CSSProperties = {
  height: 8,
  marginTop: 16,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.10)',
  overflow: 'hidden',
}

const progressFill: React.CSSProperties = {
  height: '100%',
  borderRadius: 999,
}

const box: React.CSSProperties = {
  marginTop: 14,
  padding: 13,
  borderRadius: 16,
  background: 'rgba(0,0,0,0.20)',
}

const evaluationRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: 12,
  borderRadius: 14,
  background: 'rgba(255,255,255,0.04)',
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
}

const miniInput: React.CSSProperties = {
  width: 72,
  padding: '8px 9px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(15,23,42,0.9)',
  color: 'white',
}

const dangerButton: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid rgba(239,68,68,0.25)',
  background: 'rgba(239,68,68,0.12)',
  color: '#fecaca',
  cursor: 'pointer',
}