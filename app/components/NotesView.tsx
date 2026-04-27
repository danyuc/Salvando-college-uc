'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
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
import { getSubjectName, getSubjectColorByCodeOrName } from '../../lib/subjects'
import PerusallTracker from './PerusallTracker'

type FormState = {
  subject: string
  title: string
  type: string
  current_grade: string
  weight_percent: string
}

const initialForm: FormState = {
  subject: 'PSI1101',
  title: '',
  type: 'prueba',
  current_grade: '',
  weight_percent: '',
}

const defaultSubjects = [
  { code: 'PSI1101', name: 'Psicología' },
  { code: 'SOL500', name: 'Sociología' },
  { code: 'MAT1000', name: 'Precálculo' },
  { code: 'IHI0204', name: 'Historia' },
  { code: 'SEMINARIO', name: 'Seminario' },
]

function isPsychology(subject?: string | null) {
  return subject === 'PSI1101' || getSubjectName(subject) === 'Psicología'
}

function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const styles: Record<string, CSSProperties> = {
  container: { padding: 24, display: 'grid', gap: 20, color: 'white' },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20,
    padding: 24,
    borderRadius: 28,
    background: 'linear-gradient(135deg, rgba(37,99,235,0.35), rgba(2,6,23,0.92))',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  panel: {
    padding: 18,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
  },
  title: { margin: '4px 0', fontSize: 34, fontWeight: 950 },
  subtitle: { margin: 0, opacity: 0.76 },
  eyebrow: { fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', opacity: 0.7 },
  heroStats: { minWidth: 150, padding: 18, borderRadius: 22, background: 'rgba(0,0,0,0.25)', textAlign: 'center' },
  heroNumber: { fontSize: 34, fontWeight: 950 },
  heroLabel: { fontSize: 12, opacity: 0.7 },
  topGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(300px, 0.75fr)', gap: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { margin: 0, fontSize: 20, fontWeight: 900 },
  badge: { padding: '5px 10px', borderRadius: 999, background: 'rgba(37,99,235,0.22)', color: '#bfdbfe', fontSize: 12, fontWeight: 800 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 },
  input: {
    width: '100%',
    padding: '12px 13px',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(15,23,42,0.88)',
    color: 'white',
    outline: 'none',
  },
  primaryButton: {
    width: '100%',
    marginTop: 12,
    padding: '13px 16px',
    borderRadius: 14,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer',
  },
  stack: { display: 'grid', gap: 10 },
  muted: { margin: '5px 0 0', opacity: 0.72, lineHeight: 1.4 },
  mutedSmall: { fontSize: 12, opacity: 0.65 },
  alertText: { margin: '6px 0', lineHeight: 1.35 },
  simBox: { marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.10)' },
  miniTitle: { margin: '0 0 10px' },
  label: { display: 'block', fontSize: 13, marginTop: 10, opacity: 0.8 },
  emptyState: { padding: 20, borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', opacity: 0.8 },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 },
  subjectCard: { padding: 18, borderRadius: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  subjectTitle: { margin: 0, fontSize: 22, fontWeight: 900 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 16 },
  metricCard: { padding: 12, borderRadius: 16, background: 'rgba(0,0,0,0.22)' },
  metricLabel: { display: 'block', fontSize: 11, opacity: 0.62, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: 900 },
  progressTrack: { height: 8, marginTop: 16, borderRadius: 999, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  perusallBox: { marginTop: 14, padding: 13, borderRadius: 18, background: 'rgba(236,72,153,0.10)', border: '1px solid rgba(236,72,153,0.22)' },
  box: { marginTop: 14, padding: 13, borderRadius: 16, background: 'rgba(0,0,0,0.20)' },
  evaluationRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,0.04)' },
  actions: { display: 'flex', gap: 8, alignItems: 'center' },
  miniInput: { width: 72, padding: '8px 9px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(15,23,42,0.9)', color: 'white' },
  dangerButton: { padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.12)', color: '#fecaca', cursor: 'pointer' },
}

function alertStyle(level: string): CSSProperties {
  const base: CSSProperties = { padding: 13, borderRadius: 16, border: '1px solid rgba(255,255,255,0.10)' }
  if (level === 'critico') return { ...base, background: 'rgba(239,68,68,0.15)', color: '#fecaca' }
  if (level === 'alto') return { ...base, background: 'rgba(245,158,11,0.14)', color: '#fde68a' }
  return { ...base, background: 'rgba(59,130,246,0.13)', color: '#bfdbfe' }
}

function gradeCircle(risk: string): CSSProperties {
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metricCard}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  )
}

export default function NotesView() {
  const [userId, setUserId] = useState<string | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [simulationGrade, setSimulationGrade] = useState(5)
  const [simulationWeight, setSimulationWeight] = useState(20)

  async function load() {
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
    load()
  }, [])

  const analysis = useMemo(() => buildAcademicAnalysis(evaluations), [evaluations])
  const alerts = useMemo(() => buildAcademicAlerts(analysis), [analysis])

  const globalAverage = useMemo(() => {
    const valid = analysis
      .map((item) => item.projectedFinal ?? item.currentAverage)
      .filter((n): n is number => typeof n === 'number')

    if (!valid.length) return null
    return valid.reduce((a, b) => a + b, 0) / valid.length
  }, [analysis])

  function updateForm(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function createEv(e: FormEvent) {
    e.preventDefault()
    if (!userId) return alert('Debes iniciar sesión.')

    const grade = Number(form.current_grade)
    const weight = Number(form.weight_percent)

    if (!form.subject.trim()) return alert('Selecciona un ramo.')
    if (!form.title.trim()) return alert('Falta el nombre de la evaluación.')
    if (!Number.isFinite(grade) || grade < 1 || grade > 7) return alert('La nota debe estar entre 1.0 y 7.0.')
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) return alert('La ponderación debe estar entre 1 y 100.')

    try {
      setSaving(true)
      await createEvaluation({
        user_id: userId,
        subject: form.subject.trim(),
        title: form.title.trim(),
        type: form.type.trim() || 'prueba',
        current_grade: grade,
        grade,
        weight_percent: weight,
      } as any)

      setForm(initialForm)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function updateGrade(ev: Evaluation, value: string) {
    if (!ev.id) return
    const grade = Number(value)
    if (!Number.isFinite(grade) || grade < 1 || grade > 7) return alert('La nota debe estar entre 1.0 y 7.0.')

    await updateEvaluation(ev.id, { current_grade: grade, grade } as any)
    await load()
  }

  async function removeEvaluation(id?: string) {
    if (!id) return
    await deleteEvaluation(id)
    await load()
  }

  const handlePerusall = useCallback(
    async (grade: number) => {
      if (!userId) return
      if (!Number.isFinite(grade) || grade <= 0) return

      const cleanGrade = Math.min(7, Math.max(1, Number(grade.toFixed(2))))

      const existing = evaluations.find(
        (ev) =>
          ev.subject === 'PSI1101' &&
          String(ev.title ?? '').toLowerCase() === 'perusall acumulado'
      )

      try {
        if (existing?.id) {
          const current = safeNumber(existing.current_grade ?? existing.grade)
          if (Math.abs(current - cleanGrade) < 0.01) return

          await updateEvaluation(existing.id, {
            current_grade: cleanGrade,
            grade: cleanGrade,
            weight_percent: 30,
          } as any)
        } else {
          await createEvaluation({
            user_id: userId,
            subject: 'PSI1101',
            title: 'Perusall acumulado',
            type: 'lectura-colaborativa',
            topic: 'Perusall',
            current_grade: cleanGrade,
            grade: cleanGrade,
            weight_percent: 30,
            notes: 'Nota automática calculada desde Perusall Tracker.',
          } as any)
        }

        await load()
      } catch (error) {
        console.error('PERUSALL SYNC ERROR:', error)
      }
    },
    [userId, evaluations]
  )

  if (loading) {
    return (
      <main style={styles.container}>
        <section style={styles.panel}>Cargando notas inteligentes...</section>
      </main>
    )
  }

  return (
    <main style={styles.container}>
      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>Salvando UC</div>
          <h1 style={styles.title}>Notas Inteligentes</h1>
          <p style={styles.subtitle}>
            Predicción por ramo, alertas académicas, Perusall integrado y simulación de escenarios.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.heroNumber}>
            {globalAverage === null ? '—' : globalAverage.toFixed(2)}
          </div>
          <div style={styles.heroLabel}>promedio proyectado</div>
        </div>
      </section>

      <section style={styles.topGrid}>
        <form style={styles.panel} onSubmit={createEv}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Agregar evaluación</h2>
            <span style={styles.badge}>Manual</span>
          </div>

          <div style={styles.formGrid}>
            <select style={styles.input} value={form.subject} onChange={(e) => updateForm('subject', e.target.value)}>
              {defaultSubjects.map((subject) => (
                <option key={subject.code} value={subject.code}>
                  {subject.name} · {subject.code}
                </option>
              ))}
            </select>

            <input style={styles.input} placeholder="Nombre evaluación" value={form.title} onChange={(e) => updateForm('title', e.target.value)} />

            <select style={styles.input} value={form.type} onChange={(e) => updateForm('type', e.target.value)}>
              <option value="prueba">Prueba</option>
              <option value="control">Control</option>
              <option value="control-lectura">Control lectura</option>
              <option value="lectura-colaborativa">Lectura colaborativa</option>
              <option value="ensayo">Ensayo</option>
              <option value="trabajo">Trabajo</option>
              <option value="examen">Examen</option>
            </select>

            <input style={styles.input} type="number" min={1} max={7} step={0.1} placeholder="Nota" value={form.current_grade} onChange={(e) => updateForm('current_grade', e.target.value)} />
            <input style={styles.input} type="number" min={1} max={100} step={1} placeholder="Ponderación %" value={form.weight_percent} onChange={(e) => updateForm('weight_percent', e.target.value)} />
          </div>

          <button style={styles.primaryButton} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar evaluación'}
          </button>
        </form>

        <aside style={styles.panel}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Alertas</h2>
            <span style={styles.badge}>{alerts.length}</span>
          </div>

          {alerts.length === 0 ? (
            <p style={styles.muted}>Todo está bajo control por ahora.</p>
          ) : (
            <div style={styles.stack}>
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} style={alertStyle(alert.level)}>
                  <strong>{alert.title}</strong>
                  <p style={styles.alertText}>{alert.message}</p>
                  <small style={styles.mutedSmall}>{alert.action}</small>
                </div>
              ))}
            </div>
          )}

          <div style={styles.simBox}>
            <h3 style={styles.miniTitle}>Simulador global</h3>

            <label style={styles.label}>Nota simulada: <b>{simulationGrade.toFixed(1)}</b></label>
            <input type="range" min={1} max={7} step={0.1} value={simulationGrade} onChange={(e) => setSimulationGrade(Number(e.target.value))} style={{ width: '100%' }} />

            <label style={styles.label}>Peso simulado: <b>{simulationWeight}%</b></label>
            <input type="range" min={1} max={60} step={1} value={simulationWeight} onChange={(e) => setSimulationWeight(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        </aside>
      </section>

      {analysis.length === 0 && (
        <section style={styles.emptyState}>
          Aún no hay notas registradas. Agrega una evaluación para activar el análisis.
        </section>
      )}

      <section style={styles.cardsGrid}>
        {analysis.map((item) => {
          const color = getSubjectColorByCodeOrName(item.subject)
          const subjectName = getSubjectName(item.subject)
          const simulatedFinal = ((item.weightedScore ?? 0) + simulationGrade * simulationWeight) / 100

          return (
            <article key={item.subject} style={{ ...styles.subjectCard, borderTop: `4px solid ${color}` }}>
              <header style={styles.cardHeader}>
                <div>
                  <h2 style={styles.subjectTitle}>{subjectName}</h2>
                  <p style={styles.muted}>
                    Código: {item.subject} · {item.completedWeight.toFixed(0)}% rendido · {item.remainingWeight.toFixed(0)}% restante
                  </p>
                </div>

                <div style={gradeCircle(item.risk)}>
                  {item.currentAverage === null ? '—' : item.currentAverage.toFixed(2)}
                </div>
              </header>

              <div style={styles.metricsGrid}>
                <Metric label="Proyección" value={item.projectedFinal === null ? '—' : item.projectedFinal.toFixed(2)} />
                <Metric label="Salud" value={`${item.healthScore}/100`} />
                <Metric label="Riesgo" value={item.risk.toUpperCase()} />
                <Metric label="Tendencia" value={item.trend.toUpperCase()} />
                <Metric label="Necesitas 4.0" value={item.neededToPass === null ? '—' : item.neededToPass > 7 ? '+7.0' : Math.max(item.neededToPass, 1).toFixed(2)} />
                <Metric label="Simulado" value={simulatedFinal.toFixed(2)} />
              </div>

              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${Math.min(item.completedWeight, 100)}%`, background: color }} />
              </div>

              {isPsychology(item.subject) && (
                <div style={styles.perusallBox}>
                  <PerusallTracker onGradeChange={handlePerusall} />
                </div>
              )}

              <div style={styles.box}>
                <strong>Lectura IA</strong>
                <p style={styles.muted}>{item.recommendation}</p>
              </div>

              <div style={styles.box}>
                <strong>Evaluaciones</strong>
                <div style={styles.stack}>
                  {item.evaluations.map((ev) => (
                    <div key={ev.id} style={styles.evaluationRow}>
                      <div>
                        <strong>{ev.title ?? ev.type ?? 'Evaluación'}</strong>
                        <div style={styles.mutedSmall}>
                          {ev.type ?? 'nota'} · {Number(ev.weight_percent ?? ev.weight ?? 0)}% · {ev.start_date ?? ev.date ?? 'sin fecha'}
                        </div>
                      </div>

                      <div style={styles.actions}>
                        <input style={styles.miniInput} type="number" min={1} max={7} step={0.1} defaultValue={Number(ev.current_grade ?? ev.grade ?? 0)} onBlur={(e) => updateGrade(ev, e.target.value)} />
                        <button style={styles.dangerButton} onClick={() => removeEvaluation(ev.id)}>Eliminar</button>
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
