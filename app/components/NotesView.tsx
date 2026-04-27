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
import {
  getSubjectName,
  getSubjectColorByCodeOrName,
} from '../../lib/subjects'
import PerusallTracker from './PerusallTracker'

type FormState = {
  subject: string
  title: string
  type: string
  current_grade: string
  weight_percent: string
}

export default function NotesView() {
  const [userId, setUserId] = useState<string | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [form, setForm] = useState<FormState>({
    subject: '',
    title: '',
    type: 'prueba',
    current_grade: '',
    weight_percent: '',
  })

  async function load() {
    const user = await getCurrentUser()
    if (!user) return

    setUserId(user.id)
    const data = await getUserEvaluations(user.id)
    setEvaluations(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  const analysis = useMemo(() => buildAcademicAnalysis(evaluations), [evaluations])
  const alerts = useMemo(() => buildAcademicAlerts(analysis), [analysis])

  function updateForm(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function createEv(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    await createEvaluation({
      user_id: userId,
      subject: form.subject,
      title: form.title,
      type: form.type,
      current_grade: Number(form.current_grade),
      grade: Number(form.current_grade),
      weight_percent: Number(form.weight_percent),
    } as any)

    setForm({
      subject: '',
      title: '',
      type: 'prueba',
      current_grade: '',
      weight_percent: '',
    })

    load()
  }

  async function updateGrade(ev: Evaluation, value: string) {
    await updateEvaluation(ev.id!, {
      current_grade: Number(value),
      grade: Number(value),
    } as any)

    load()
  }

  async function handlePerusall(grade: number) {
    if (!userId) return

    await createEvaluation({
      user_id: userId,
      subject: 'PSI1101',
      title: 'Perusall',
      type: 'lectura-colaborativa',
      current_grade: grade,
      grade,
      weight_percent: 30,
    } as any)

    load()
  }

  return (
    <main style={{ padding: 20, color: 'white' }}>
      <h1>Notas Inteligentes</h1>

      {/* FORM */}
      <form onSubmit={createEv} style={{ marginBottom: 20 }}>
        <input placeholder="Ramo" value={form.subject} onChange={(e) => updateForm('subject', e.target.value)} />
        <input placeholder="Nombre" value={form.title} onChange={(e) => updateForm('title', e.target.value)} />
        <input placeholder="Nota" value={form.current_grade} onChange={(e) => updateForm('current_grade', e.target.value)} />
        <input placeholder="Peso %" value={form.weight_percent} onChange={(e) => updateForm('weight_percent', e.target.value)} />
        <button>Guardar</button>
      </form>

      {/* ALERTAS */}
      <div>
        <h2>Alertas</h2>
        {alerts.map((a) => (
          <div key={a.id}>{a.message}</div>
        ))}
      </div>

      {/* RAMOS */}
      {analysis.map((item) => (
        <div key={item.subject} style={{ marginTop: 20 }}>
          <h2>{getSubjectName(item.subject)}</h2>
          <p>Promedio: {item.currentAverage?.toFixed(2)}</p>

          {item.subject === 'PSI1101' && (
            <PerusallTracker onGradeChange={handlePerusall} />
          )}

          {item.evaluations.map((ev) => (
            <div key={ev.id}>
              {ev.title} ({ev.weight_percent}%)
              <input
                defaultValue={ev.current_grade}
                onBlur={(e) => updateGrade(ev, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
    </main>
  )
}
