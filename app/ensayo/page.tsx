'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Evaluation,
  daysUntil,
  getPracticeTopic,
  getRiskLevel,
  getPriorityText,
} from '@/lib/academic-engine'

export default function SmartPracticePage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('Todas')
  const [aiPrompt, setAiPrompt] = useState('')

  useEffect(() => {
    loadEvaluations()
  }, [])

  async function loadEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error cargando evaluaciones:', error)
      setEvaluations([])
    } else {
      setEvaluations((data || []) as Evaluation[])
    }

    setLoading(false)
  }

  const subjects = useMemo(
    () => ['Todas', ...Array.from(new Set(evaluations.map((e) => e.subject)))],
    [evaluations]
  )

  const filtered = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)

    return evaluations
      .filter((e) => selectedSubject === 'Todas' || e.subject === selectedSubject)
      .filter((e) => e.date >= today)
  }, [evaluations, selectedSubject])

  const focus = getPracticeTopic(filtered)

  function generatePrompt() {
    const next = filtered[0]

    const prompt = `Actúa como profesor universitario UC y crea una práctica exigente.

Ramo: ${focus.subject}
Evaluación objetivo: ${next?.title || 'Evaluación próxima'}
Fecha: ${next?.date || 'sin fecha'}
Ponderación: ${next ? `${Number(next.weight) * 100}%` : 'sin ponderación'}
Horario: ${next?.start_time || 'sin hora'} ${next?.end_time ? `a ${next.end_time}` : ''}
Riesgo: ${next ? getRiskLevel(next) : 'sin riesgo calculado'}

Temario exacto:
${focus.topic}

Instrucciones:
- Genera 10 preguntas de selección múltiple.
- Cada pregunta debe tener alternativas A, B, C y D.
- Solo una alternativa correcta.
- Dificultad alta, estilo universidad.
- Deben evaluar comprensión, aplicación y análisis.
- Incluye respuesta correcta y explicación breve.
- Si es Precálculo, incluye desarrollo matemático paso a paso.
- Si es Sociología, Historia, Psicología o Seminario, incluye casos aplicados y preguntas de análisis.
- Evita preguntas obvias o puramente memorísticas.`

    setAiPrompt(prompt)
  }

  if (loading) {
    return <main style={main}>Cargando práctica inteligente...</main>
  }

  return (
    <main style={main}>
      <section style={hero}>
        <p style={pill}>Práctica inteligente</p>
        <h1 style={title}>Modo UC adaptativo</h1>
        <p style={muted}>
          Detecta la próxima evaluación, su ponderación y el temario exacto para
          priorizar qué estudiar.
        </p>
      </section>

      <section style={card}>
        <label style={label}>Asignatura</label>
        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value)
            setAiPrompt('')
          }}
          style={select}
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </section>

      <section style={card}>
        <h2>🔥 Foco recomendado</h2>
        <p>
          <strong>Ramo:</strong> {focus.subject}
        </p>
        <p>
          <strong>Temario:</strong>
        </p>
        <p style={muted}>{focus.topic}</p>
        <p style={muted}>{focus.reason}</p>

        <button onClick={generatePrompt} style={button}>
          Generar práctica con IA
        </button>
      </section>

      {aiPrompt && (
        <section style={card}>
          <h2>🧠 Prompt listo para copiar</h2>
          <textarea value={aiPrompt} readOnly style={textarea} />
        </section>
      )}

      <section style={card}>
        <h2>📅 Evaluaciones próximas</h2>

        {filtered.length === 0 ? (
          <p style={muted}>No hay evaluaciones próximas registradas.</p>
        ) : (
          filtered.map((e) => {
            const risk = getRiskLevel(e)

            return (
              <article key={e.id || `${e.subject}-${e.title}`} style={miniCard}>
                <div style={row}>
                  <strong>
                    {e.subject} · {e.title}
                  </strong>
                  <span style={riskBadge(risk)}>Riesgo {risk}</span>
                </div>

                <p>
                  📅 {e.date} · faltan {daysUntil(e.date)} día(s)
                </p>

                <p>
                  📊 Ponderación: {(Number(e.weight) * 100).toFixed(1)}%
                </p>

                {(e.start_time || e.end_time) && (
                  <p>
                    🕒 {e.start_time || ''} {e.end_time ? `a ${e.end_time}` : ''}
                  </p>
                )}

                <p style={muted}>{getPriorityText(e)}</p>

                {e.contents && (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
                      Ver temario detallado
                    </summary>
                    <p style={muted}>{e.contents}</p>
                  </details>
                )}
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}

const main: CSSProperties = {
  minHeight: '100vh',
  background: '#020617',
  color: 'white',
  padding: 24,
  fontFamily: 'Arial, sans-serif',
}

const hero: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
}

const card: CSSProperties = {
  padding: 22,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
}

const miniCard: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#111827',
  border: '1px solid rgba(255,255,255,.1)',
  marginTop: 12,
}

const row: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
}

const pill: CSSProperties = {
  color: '#93c5fd',
  fontWeight: 800,
  margin: 0,
}

const title: CSSProperties = {
  fontSize: 36,
  margin: '8px 0',
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}

const label: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 800,
}

const select: CSSProperties = {
  width: '100%',
  padding: 14,
  borderRadius: 14,
  border: 'none',
  fontSize: 16,
}

const button: CSSProperties = {
  marginTop: 14,
  padding: '14px 18px',
  borderRadius: 14,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const textarea: CSSProperties = {
  width: '100%',
  minHeight: 240,
  padding: 14,
  borderRadius: 14,
  background: '#020617',
  color: 'white',
  border: '1px solid rgba(255,255,255,.12)',
}

function riskBadge(risk: string): CSSProperties {
  const bg =
    risk === 'alto'
      ? '#7f1d1d'
      : risk === 'medio'
      ? '#78350f'
      : risk === 'bajo'
      ? '#14532d'
      : '#334155'

  return {
    padding: '6px 10px',
    borderRadius: 999,
    background: bg,
    color: 'white',
    fontSize: 13,
    fontWeight: 800,
  }
}