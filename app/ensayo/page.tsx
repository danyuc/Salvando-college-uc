'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Evaluation,
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
    setLoading(true)

    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('date', { ascending: true })

    if (error) {
      console.error(error)
      setEvaluations([])
    } else {
      setEvaluations((data || []) as Evaluation[])
    }

    setLoading(false)
  }

  const subjects = useMemo(() => {
    return ['Todas', ...Array.from(new Set(evaluations.map((e) => e.subject)))]
  }, [evaluations])

  const filtered = useMemo(() => {
    if (selectedSubject === 'Todas') return evaluations
    return evaluations.filter((e) => e.subject === selectedSubject)
  }, [evaluations, selectedSubject])

  const focus = getPracticeTopic(filtered)

  function generatePrompt() {
    const prompt = `Genera una práctica universitaria tipo UC para el ramo ${focus.subject}, centrada en: ${focus.topic}. 
Incluye 10 preguntas de selección múltiple con 4 alternativas, una correcta, dificultad alta, explicación breve y enfoque aplicado.
Motivo de prioridad: ${focus.reason}`

    setAiPrompt(prompt)
  }

  if (loading) {
    return <main style={main}>Cargando práctica inteligente...</main>
  }

  return (
    <main style={main}>
      <section style={hero}>
        <div>
          <p style={pill}>Práctica inteligente</p>
          <h1 style={title}>Modo PSU / UC adaptativo</h1>
          <p style={muted}>
            La app detecta tu próxima evaluación y prioriza automáticamente qué estudiar.
          </p>
        </div>
      </section>

      <section style={card}>
        <label style={label}>Asignatura</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={select}
        >
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </section>

      <section style={card}>
        <h2>🔥 Foco recomendado</h2>
        <p><strong>Ramo:</strong> {focus.subject}</p>
        <p><strong>Tema:</strong> {focus.topic}</p>
        <p style={muted}>{focus.reason}</p>

        <button onClick={generatePrompt} style={button}>
          Generar prompt de práctica con IA
        </button>
      </section>

      {aiPrompt && (
        <section style={card}>
          <h2>🧠 Prompt listo para IA</h2>
          <textarea value={aiPrompt} readOnly style={textarea} />
        </section>
      )}

      <section style={card}>
        <h2>⚠️ Evaluaciones próximas</h2>

        {filtered.length === 0 ? (
          <p style={muted}>No hay evaluaciones registradas.</p>
        ) : (
          filtered.map((e) => (
            <article key={e.id || e.title} style={miniCard}>
              <strong>{e.subject} · {e.title}</strong>
              <p>{e.date} · {(Number(e.weight) * 100).toFixed(0)}%</p>
              <p>Riesgo: {getRiskLevel(e)}</p>
              <p style={muted}>{getPriorityText(e)}</p>
            </article>
          ))
        )}
      </section>
    </main>
  )
}

const main = {
  minHeight: '100vh',
  background: '#020617',
  color: 'white',
  padding: 24,
  fontFamily: 'Arial, sans-serif',
}

const hero = {
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
}

const card = {
  padding: 22,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
}

const miniCard = {
  padding: 16,
  borderRadius: 16,
  background: '#111827',
  border: '1px solid rgba(255,255,255,.1)',
  marginTop: 12,
}

const pill = {
  color: '#93c5fd',
  fontWeight: 800,
  margin: 0,
}

const title = {
  fontSize: 36,
  margin: '8px 0',
}

const muted = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}

const label = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 800,
}

const select = {
  width: '100%',
  padding: 14,
  borderRadius: 14,
  border: 'none',
  fontSize: 16,
}

const button = {
  marginTop: 14,
  padding: '14px 18px',
  borderRadius: 14,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const textarea = {
  width: '100%',
  minHeight: 180,
  padding: 14,
  borderRadius: 14,
  background: '#020617',
  color: 'white',
  border: '1px solid rgba(255,255,255,.12)',
}