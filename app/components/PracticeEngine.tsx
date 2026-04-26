'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type Question = {
  id: string
  pregunta: string
  opciona: string | null
  opcionb: string | null
  opcionc: string | null
  opciond: string | null
  correcta: string | null
  explicacion: string | null
  clase: string | null
  tema: string | null
  subtema: string | null
  tipopregunta: string | null
  dificultad: string | null
  cognitive_level?: string | null
  expected_answer?: string | null
  evaluation_criteria?: string[] | null
}

export default function PracticeEngine() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedSubject, setSelectedSubject] = useState('Todas')
  const [selectedTopic, setSelectedTopic] = useState('Todos')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [developmentAnswer, setDevelopmentAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('clase', { ascending: true })
      .order('tema', { ascending: true })

    if (error) {
      console.error(error)
      setQuestions([])
    } else {
      setQuestions((data || []) as Question[])
    }

    setLoading(false)
  }

  const subjects = useMemo(() => {
    return ['Todas', ...Array.from(new Set(questions.map((q) => q.clase).filter(Boolean))) as string[]]
  }, [questions])

  const topics = useMemo(() => {
    const base =
      selectedSubject === 'Todas'
        ? questions
        : questions.filter((q) => q.clase === selectedSubject)

    return ['Todos', ...Array.from(new Set(base.map((q) => q.tema).filter(Boolean))) as string[]]
  }, [questions, selectedSubject])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const subjectOk = selectedSubject === 'Todas' || q.clase === selectedSubject
      const topicOk = selectedTopic === 'Todos' || q.tema === selectedTopic
      return subjectOk && topicOk
    })
  }, [questions, selectedSubject, selectedTopic])

  const currentQuestion = filteredQuestions[currentIndex]

  function resetPractice() {
    setCurrentIndex(0)
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setScore(0)
  }

  function changeSubject(value: string) {
    setSelectedSubject(value)
    setSelectedTopic('Todos')
    resetPractice()
  }

  function changeTopic(value: string) {
    setSelectedTopic(value)
    resetPractice()
  }

  function answerMultiple(letter: string) {
    if (!currentQuestion || showResult) return

    setSelectedAnswer(letter)
    setShowResult(true)

    if (letter === currentQuestion.correcta) {
      setScore((prev) => prev + 1)
    }
  }

  function checkDevelopment() {
    if (!developmentAnswer.trim()) return
    setShowResult(true)
  }

  function nextQuestion() {
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setCurrentIndex((prev) => prev + 1)
  }

  const progress =
    filteredQuestions.length > 0
      ? Math.round(((currentIndex + 1) / filteredQuestions.length) * 100)
      : 0

  if (loading) {
    return (
      <main style={main}>
        <section style={card}>Cargando preguntas...</section>
      </main>
    )
  }

  return (
    <main style={main}>
      <section style={hero}>
        <div>
          <p style={pill}>Práctica inteligente</p>
          <h1 style={title}>Modo UC adaptativo</h1>
          <p style={muted}>
            Preguntas reales desde Supabase, filtradas por asignatura, tema y tipo.
          </p>
        </div>

        <button onClick={loadQuestions} style={secondaryButton}>
          Actualizar
        </button>
      </section>

      <section style={card}>
        <div style={filters}>
          <div>
            <label style={label}>Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => changeSubject(e.target.value)}
              style={select}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Tema</label>
            <select
              value={selectedTopic}
              onChange={(e) => changeTopic(e.target.value)}
              style={select}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section style={stats}>
        <div style={statBox}>Preguntas: {filteredQuestions.length}</div>
        <div style={statBox}>Puntaje: {score}</div>
        <div style={statBox}>Progreso: {progress}%</div>
      </section>

      {!currentQuestion ? (
        <section style={card}>
          <h2>No hay preguntas para este filtro.</h2>
          <p style={muted}>
            Revisa que en Supabase existan registros en `questions` con `clase`, `tema` y `tipopregunta`.
          </p>
        </section>
      ) : (
        <section style={card}>
          <div style={questionTop}>
            <span style={badge}>{currentQuestion.clase || 'Sin asignatura'}</span>
            <span style={badge}>{currentQuestion.tema || 'Sin tema'}</span>
            <span style={badge}>{currentQuestion.tipopregunta || 'tipo desconocido'}</span>
          </div>

          <h2 style={questionTitle}>
            Pregunta {currentIndex + 1} de {filteredQuestions.length}
          </h2>

          <p style={questionText}>{currentQuestion.pregunta}</p>

          {currentQuestion.tipopregunta === 'desarrollo' ? (
            <>
              <textarea
                value={developmentAnswer}
                onChange={(e) => setDevelopmentAnswer(e.target.value)}
                placeholder="Escribe tu respuesta de desarrollo..."
                style={textarea}
              />

              {!showResult && (
                <button onClick={checkDevelopment} style={primaryButton}>
                  Revisar respuesta
                </button>
              )}

              {showResult && (
                <div style={resultBox}>
                  <strong>Respuesta esperada:</strong>
                  <p>{currentQuestion.expected_answer || currentQuestion.explicacion || 'Sin pauta cargada.'}</p>

                  {currentQuestion.evaluation_criteria && (
                    <>
                      <strong>Criterios:</strong>
                      <ul>
                        {currentQuestion.evaluation_criteria.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={optionsGrid}>
              {[
                ['A', currentQuestion.opciona],
                ['B', currentQuestion.opcionb],
                ['C', currentQuestion.opcionc],
                ['D', currentQuestion.opciond],
              ].map(([letter, text]) => {
                if (!text) return null

                const isCorrect = letter === currentQuestion.correcta
                const isSelected = letter === selectedAnswer

                let style = optionButton

                if (showResult && isCorrect) style = correctButton
                else if (showResult && isSelected && !isCorrect) style = wrongButton

                return (
                  <button
                    key={letter}
                    onClick={() => answerMultiple(letter)}
                    style={style}
                  >
                    <strong>{letter})</strong> {text}
                  </button>
                )
              })}
            </div>
          )}

          {showResult && currentQuestion.tipopregunta !== 'desarrollo' && (
            <div style={resultBox}>
              <strong>
                {selectedAnswer === currentQuestion.correcta
                  ? '✅ Correcta'
                  : '❌ Incorrecta'}
              </strong>
              <p>{currentQuestion.explicacion || 'Sin explicación cargada.'}</p>
            </div>
          )}

          {showResult && currentIndex < filteredQuestions.length - 1 && (
            <button onClick={nextQuestion} style={primaryButton}>
              Siguiente →
            </button>
          )}

          {showResult && currentIndex >= filteredQuestions.length - 1 && (
            <div style={resultBox}>
              <strong>Práctica terminada</strong>
              <p>
                Puntaje final: {score} / {filteredQuestions.length}
              </p>
              <button onClick={resetPractice} style={primaryButton}>
                Reiniciar práctica
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

const main: CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  color: 'white',
  background: '#020617',
}

const hero: CSSProperties = {
  padding: 24,
  borderRadius: 24,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
}

const pill: CSSProperties = {
  margin: 0,
  color: '#93c5fd',
  fontWeight: 900,
}

const title: CSSProperties = {
  margin: '8px 0',
  fontSize: 36,
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}

const card: CSSProperties = {
  padding: 22,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 18,
}

const filters: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14,
}

const label: CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 900,
}

const select: CSSProperties = {
  width: '100%',
  padding: 14,
  borderRadius: 14,
  border: 'none',
  fontSize: 16,
}

const stats: CSSProperties = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 18,
}

const statBox: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 14,
  background: '#1e293b',
  fontWeight: 900,
}

const questionTop: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 14,
}

const badge: CSSProperties = {
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(37,99,235,.18)',
  color: '#bfdbfe',
  fontWeight: 900,
  fontSize: 13,
}

const questionTitle: CSSProperties = {
  marginTop: 0,
}

const questionText: CSSProperties = {
  fontSize: 20,
  lineHeight: 1.5,
}

const optionsGrid: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const optionButton: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,.12)',
  background: '#111827',
  color: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 16,
}

const correctButton: CSSProperties = {
  ...optionButton,
  background: 'rgba(34,197,94,.28)',
  border: '1px solid rgba(34,197,94,.5)',
}

const wrongButton: CSSProperties = {
  ...optionButton,
  background: 'rgba(239,68,68,.28)',
  border: '1px solid rgba(239,68,68,.5)',
}

const resultBox: CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 16,
  background: '#1e293b',
  lineHeight: 1.5,
}

const primaryButton: CSSProperties = {
  marginTop: 16,
  padding: '13px 16px',
  borderRadius: 14,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const secondaryButton: CSSProperties = {
  padding: '12px 15px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.08)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const textarea: CSSProperties = {
  width: '100%',
  minHeight: 160,
  padding: 14,
  borderRadius: 14,
  background: '#020617',
  color: 'white',
  border: '1px solid rgba(255,255,255,.14)',
  fontSize: 16,
}