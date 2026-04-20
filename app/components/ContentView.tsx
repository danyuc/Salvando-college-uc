'use client'

import { useState } from 'react'
import { parseStudyContent } from '../../lib/content-parser'
import { getCurrentUser } from '../../lib/auth'
import { createGeneratedTest, createTestAttempt } from '../../lib/tests'

type GeneratedTestShape = {
  title: string
  instructions: string
  multipleChoice: Array<{
    question: string
    options: string[]
    answerIndex: number
  }>
  openQuestions: string[]
  hardQuestion: string
}

export default function ContentView() {
  const [subject, setSubject] = useState('Precálculo')
  const [evaluationType, setEvaluationType] = useState('Prueba')
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [result, setResult] = useState<ReturnType<typeof parseStudyContent> | null>(null)
  const [generatedTest, setGeneratedTest] = useState<GeneratedTestShape | null>(null)
  const [savedTestId, setSavedTestId] = useState<string | null>(null)
  const [loadingTest, setLoadingTest] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState<number | null>(null)

  function handleAnalyze() {
    setResult(parseStudyContent(content))
  }

  async function handleGenerateTest() {
    if (!content.trim()) return

    try {
      setLoadingTest(true)
      setScore(null)
      setAnswers({})

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate-test',
          content,
          subject,
          evaluationType,
          topic,
        }),
      })

      const data = await res.json()
      const test = data?.test || null
      setGeneratedTest(test)

      const user = await getCurrentUser()
      if (user && test) {
        const saved = await createGeneratedTest({
          user_id: user.id,
          subject,
          evaluation_type: evaluationType,
          topic,
          source_content: content,
          test_json: test,
        })
        setSavedTestId(saved.id)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingTest(false)
    }
  }

  async function handleSubmitTest() {
    if (!generatedTest) return

    const total = generatedTest.multipleChoice.length
    let correct = 0

    generatedTest.multipleChoice.forEach((q, index) => {
      if (answers[index] === q.answerIndex) correct++
    })

    const finalScore = Number(((correct / Math.max(total, 1)) * 100).toFixed(1))
    setScore(finalScore)

    try {
      const user = await getCurrentUser()
      if (user && savedTestId) {
        await createTestAttempt({
          user_id: user.id,
          generated_test_id: savedTestId,
          answers_json: answers,
          score: finalScore,
          feedback:
            finalScore >= 80
              ? 'Buen resultado.'
              : finalScore >= 60
              ? 'Resultado intermedio. Conviene reforzar errores.'
              : 'Resultado bajo. Repite conceptos y vuelve a intentarlo.',
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Contenido</h2>
        <p style={subtitle}>
          Pega una guía, clase o apunte y conviértelo en resumen, conceptos y prueba.
        </p>

        <div style={formGrid}>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ramo" style={input} />
          <select value={evaluationType} onChange={(e) => setEvaluationType(e.target.value)} style={input}>
            <option>Prueba</option>
            <option>Control</option>
            <option>Ensayo</option>
            <option>Trabajo</option>
          </select>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema" style={input} />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Pega aquí tu contenido..."
          style={textarea}
        />

        <div style={actions}>
          <button onClick={handleAnalyze} style={button}>Analizar contenido</button>
          <button onClick={handleGenerateTest} style={secondaryButton}>
            {loadingTest ? 'Generando...' : 'Generar prueba'}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div style={card}>
            <h3 style={sectionTitle}>Resumen</h3>
            <p>{result.summary || 'Sin resumen generado.'}</p>
          </div>

          <div style={card}>
            <h3 style={sectionTitle}>Conceptos clave</h3>
            <div style={chips}>
              {result.keyConcepts.map((item) => (
                <div key={item} style={chip}>{item}</div>
              ))}
            </div>
          </div>
        </>
      )}

      {generatedTest && (
        <div style={card}>
          <h3 style={sectionTitle}>{generatedTest.title}</h3>
          <p style={subtitle}>{generatedTest.instructions}</p>

          {generatedTest.multipleChoice.map((item, index) => (
            <div key={index} style={questionCard}>
              <div style={questionTitle}>{index + 1}. {item.question}</div>
              <div style={optionsList}>
                {item.options.map((option, optionIndex) => (
                  <label key={optionIndex} style={optionLabel}>
                    <input
                      type="radio"
                      name={`q-${index}`}
                      checked={answers[index] === optionIndex}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                      }
                    />
                    <span>
                      {String.fromCharCode(65 + optionIndex)}. {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={actions}>
            <button onClick={handleSubmitTest} style={button}>
              Corregir test
            </button>
          </div>

          {score !== null && (
            <div style={scoreBox(score)}>
              Puntaje: {score}%
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function scoreBox(score: number): React.CSSProperties {
  return {
    marginTop: '14px',
    padding: '12px',
    borderRadius: '12px',
    background:
      score >= 80
        ? 'rgba(16,185,129,0.18)'
        : score >= 60
        ? 'rgba(245,158,11,0.18)'
        : 'rgba(239,68,68,0.18)',
    fontWeight: 800,
  }
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}
const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}
const title: React.CSSProperties = { marginTop: 0 }
const subtitle: React.CSSProperties = { opacity: 0.75 }
const formGrid: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  marginTop: '12px',
}
const input: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}
const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: '220px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  resize: 'vertical',
  marginTop: '12px',
}
const actions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '12px',
  flexWrap: 'wrap',
}
const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#10b981',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
}
const secondaryButton: React.CSSProperties = {
  ...button,
  background: '#2563eb',
}
const sectionTitle: React.CSSProperties = { marginTop: 0 }
const chips: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}
const chip: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,0.16)',
  border: '1px solid rgba(59,130,246,0.24)',
  fontSize: '0.82rem',
}
const questionCard: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  marginBottom: '10px',
}
const questionTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '8px',
}
const optionsList: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}
const optionLabel: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start',
}