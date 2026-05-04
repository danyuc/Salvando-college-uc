'use client'

import { useMemo, useState } from 'react'

type GeneratedQuestion = {
  question: string
  options?: string[]
  answerIndex?: number
  explanation?: string
}

export default function TextStudyView() {
  const [subject, setSubject] = useState('Psicología')
  const [topic, setTopic] = useState('Tipos de memoria')
  const [format, setFormat] = useState<'multiple-choice' | 'true-false' | 'open'>('multiple-choice')
  const [count, setCount] = useState(8)
  const [text, setText] = useState('')
  const [summary, setSummary] = useState('')
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const promptToCopy = useMemo(() => {
    return `Actúa como un profesor experto en ${subject}. 
Tema: ${topic}.

Usa únicamente el siguiente texto como base. No inventes información que no esté en el texto.

Quiero que me entregues:
1. Un resumen breve y claro.
2. ${count} preguntas en formato ${format === 'multiple-choice' ? 'alternativas' : format === 'true-false' ? 'verdadero/falso' : 'desarrollo'}.
3. En cada pregunta incluye la respuesta correcta y una explicación breve.
4. Haz las preguntas útiles para estudiar sin necesidad de leer todo el texto de nuevo.
5. Si el tema es conceptual, mezcla definición, comprensión, comparación y aplicación.

Texto:
"""
${text}
"""`.trim()
  }, [subject, topic, count, format, text])

  async function handleGenerate() {
    if (!text.trim()) {
      alert('Primero pega un texto o contenido extraído del PDF.')
      return
    }

    try {
      setLoading(true)
      setQuestions([])
      setSummary('')

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate-questions-from-text',
          text,
          subject,
          topic,
          count,
          format,
          difficulty: 'media',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || 'No se pudo generar preguntas')
      }

      setQuestions(Array.isArray(data?.questions) ? data.questions : [])
      setSummary(data?.summary || '')
    } catch (error) {
      console.error(error)
      alert('Falló la generación automática. Puedes usar el prompt copiable de abajo.')
    } finally {
      setLoading(false)
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(promptToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error(error)
      alert('No se pudo copiar el prompt')
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Estudiar desde texto / PDF</h2>
        <p style={subtitle}>
          Pega aquí el texto o usa el contenido extraído de un PDF. Si la generación falla, tienes abajo un prompt listo para copiar y pegar.
        </p>

        <div style={grid}>
          <div style={field}>
            <label style={label}>Asignatura</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} style={input} />
          </div>

          <div style={field}>
            <label style={label}>Tema</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} style={input} />
          </div>

          <div style={field}>
            <label style={label}>Formato</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as any)} style={input}>
              <option value="multiple-choice">Alternativas</option>
              <option value="true-false">Verdadero / Falso</option>
              <option value="open">Desarrollo</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>Cantidad</label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 8)}
              style={input}
            />
          </div>
        </div>

        <div style={field}>
          <label style={label}>Texto base</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega aquí el texto del PDF, apuntes o lectura..."
            style={textarea}
          />
        </div>

        <div style={actions}>
          <button onClick={handleGenerate} style={button} disabled={loading}>
            {loading ? 'Generando...' : 'Generar preguntas'}
          </button>
        </div>
      </div>

      {summary && (
        <div style={card}>
          <h3 style={sectionTitle}>Resumen</h3>
          <div style={summaryBox}>{summary}</div>
        </div>
      )}

      {questions.length > 0 && (
        <div style={card}>
          <h3 style={sectionTitle}>Preguntas generadas</h3>

          <div style={questionList}>
            {questions.map((q, index) => (
              <div key={index} style={questionCard}>
                <div style={questionTitle}>
                  {index + 1}. {q.question}
                </div>

                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div style={optionsList}>
                    {q.options.map((option, i) => (
                      <div key={i} style={optionItem}>
                        {String.fromCharCode(65 + i)}. {option}
                      </div>
                    ))}
                  </div>
                )}

                {typeof q.answerIndex === 'number' && Array.isArray(q.options) && q.options[q.answerIndex] && (
                  <div style={answerBox}>
                    Respuesta correcta: {String.fromCharCode(65 + q.answerIndex)}. {q.options[q.answerIndex]}
                  </div>
                )}

                {q.explanation && <div style={explanationBox}>{q.explanation}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={card}>
        <div style={promptHeader}>
          <h3 style={sectionTitle}>Prompt de respaldo</h3>
          <button onClick={copyPrompt} style={secondaryButton}>
            {copied ? 'Copiado' : 'Copiar prompt'}
          </button>
        </div>

        <p style={subtitle}>
          Úsalo si el lector o la generación automática fallan. Así no pierdes tiempo.
        </p>

        <textarea value={promptToCopy} readOnly style={promptBox} />
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

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.76,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
  gap: '12px',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
  marginTop: '12px',
}

const label: React.CSSProperties = {
  fontWeight: 700,
}

const input: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: '240px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const actions: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '14px',
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

const secondaryButton: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const summaryBox: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.55,
}

const questionList: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const questionCard: React.CSSProperties = {
  padding: '14px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const questionTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '10px',
}

const optionsList: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
}

const optionItem: React.CSSProperties = {
  opacity: 0.92,
}

const answerBox: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(16,185,129,0.16)',
}

const explanationBox: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(59,130,246,0.10)',
  lineHeight: 1.45,
}

const promptHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '10px',
  alignItems: 'center',
}

const promptBox: React.CSSProperties = {
  width: '100%',
  minHeight: '260px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
}
