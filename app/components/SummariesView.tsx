'use client'

import { SUBJECT_PRESETS_ARRAY } from '../../lib/subjects'
import { useState } from 'react'
import { buildSubjectPrompt } from '@/lib/subject-prompts'
import {SUBJECT_PRESETS} from '@/lib/subjects'

export default function SummariesView() {
  const [subject, setSubject] = useState('Seminario')
  const [unit, setUnit] = useState('')
  const [topic, setTopic] = useState('')
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)

    try {
      const prompt = buildSubjectPrompt('summary', {
        subject,
        unit,
        topic,
        extraInstruction: text,
      })

      const res = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()
      setResult(data.text)
    } catch (error) {
      console.error(error)
      setResult('Error generando resumen')
    }

    setLoading(false)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🧠 Generador de Resúmenes</h1>

      {/* Asignatura */}
      <select
        className="border p-2 rounded w-full"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      >
        {SUBJECT_PRESETS_ARRAY.map((s) => (
          <option key={s.name}>{s.name}</option>
        ))}
      </select>

      {/* Unidad */}
      <input
        placeholder="Unidad (opcional)"
        className="border p-2 rounded w-full"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />

      {/* Tema */}
      <input
        placeholder="Tema (opcional)"
        className="border p-2 rounded w-full"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      {/* Texto */}
      <textarea
        placeholder="Pega aquí tu texto, PPT o materia..."
        className="border p-2 rounded w-full h-40"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* Botón */}
      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? 'Generando...' : 'Generar Resumen'}
      </button>

      {/* Resultado */}
      {result && (
        <div className="border p-4 rounded bg-white whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  )
}
