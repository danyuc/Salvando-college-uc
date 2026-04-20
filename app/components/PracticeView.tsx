'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import { getQuestionEngineBySubject } from '../../lib/question-engine'
import {
  getCorrectIndex,
  getQuestionsFromBank,
  type BankQuestion,
} from '../../lib/question-bank'
import AIStudyChat from './AIStudyChat'

type PracticeMode = 'test' | 'flashcards' | 'ia'

export default function PracticeView() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [mode, setMode] = useState<PracticeMode>('test')
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([])
  const [loadingBank, setLoadingBank] = useState(false)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) return

      const data = await getUserEvaluations(user.id)
      setEvaluations(data || [])

      if ((data || []).length > 0) {
        setSelectedId(data[0].id)
      }
    }

    load()
  }, [])

  const selectedEvaluation = useMemo(
    () => evaluations.find((item) => item.id === selectedId) ?? null,
    [evaluations, selectedId]
  )

  const engine = useMemo(
    () =>
      selectedEvaluation
        ? getQuestionEngineBySubject(
            selectedEvaluation.subject,
            selectedEvaluation.type
          )
        : null,
    [selectedEvaluation]
  )

  useEffect(() => {
    async function loadBankQuestions() {
      if (!selectedEvaluation || !engine) {
        setBankQuestions([])
        return
      }

      try {
        setLoadingBank(true)
        setSubmitted(false)
        setAnswers({})

        const data = await getQuestionsFromBank({
          subject: selectedEvaluation.subject,
          topic: selectedEvaluation.topic,
          difficulty: engine.difficulty,
          limit: 8,
        })

        setBankQuestions(data || [])
      } catch (error) {
        console.error(error)
        setBankQuestions([])
      } finally {
        setLoadingBank(false)
      }
    }

    loadBankQuestions()
  }, [selectedEvaluation, engine])

  const scoreData = useMemo(() => {
    if (!submitted || bankQuestions.length === 0) {
      return { correct: 0, total: bankQuestions.length, percent: 0 }
    }

    let correct = 0

    for (const question of bankQuestions) {
      const selected = answers[question.id]
      const correctIndex = getCorrectIndex(question.answer)

      if (
        typeof selected === 'number' &&
        typeof correctIndex === 'number' &&
        selected === correctIndex
      ) {
        correct++
      }
    }

    const total = bankQuestions.length
    const percent = total > 0 ? Number(((correct / total) * 100).toFixed(1)) : 0

    return { correct, total, percent }
  }, [submitted, bankQuestions, answers])

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Práctica personalizada</h2>
        <p style={subtitle}>
          Primero usamos tu banco de preguntas real. La IA queda como apoyo.
        </p>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={select}
        >
          {evaluations.length === 0 && <option value="">Sin evaluaciones</option>}

          {evaluations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.subject} · {item.type} {item.number ?? ''} ·{' '}
              {item.topic || item.title || 'Sin tema'}
            </option>
          ))}
        </select>

        <div style={modeSelector}>
          <button
            onClick={() => setMode('test')}
            style={mode === 'test' ? activeModeButton : modeButton}
          >
            📝 Test
          </button>
          <button
            onClick={() => setMode('flashcards')}
            style={mode === 'flashcards' ? activeModeButton : modeButton}
          >
            🧠 Flashcards
          </button>
          <button
            onClick={() => setMode('ia')}
            style={mode === 'ia' ? activeModeButton : modeButton}
          >
            🤖 IA
          </button>
        </div>
      </div>

      {!selectedEvaluation || !engine ? (
        <div style={card}>Selecciona una evaluación para practicar.</div>
      ) : (
        <>
          <div style={card}>
            <h3 style={sectionTitle}>Cómo conviene practicar esto</h3>

            <div style={modeBox}>
              <div style={modeTitle}>
                Modo recomendado: {engine.recommendedMode}
              </div>
              <div style={modeStrategy}>{engine.strategy}</div>
            </div>

            <div style={explanation}>{engine.explanation}</div>

            <div style={chips}>
              {engine.prompts.map((prompt) => (
                <div key={prompt} style={chip}>
                  {prompt}
                </div>
              ))}
            </div>
          </div>

          {mode === 'test' && (
            <div style={card}>
              <h3 style={sectionTitle}>Test desde banco de preguntas</h3>

              {loadingBank ? (
                <div style={emptyText}>Cargando preguntas del banco...</div>
              ) : bankQuestions.length === 0 ? (
                <div style={emptyText}>
                  No encontré preguntas en `question_bank` para este ramo/tema.
                  La base quedó lista; ahora conviene cargar preguntas reales.
                </div>
              ) : (
                <>
                  {bankQuestions.map((question, index) => {
                    const correctIndex = getCorrectIndex(question.answer)

                    return (
                      <div key={question.id} style={questionCard}>
                        <div style={questionTitle}>
                          {index + 1}. {question.question}
                        </div>

                        <div style={optionsList}>
                          {(question.options || []).map((option, optionIndex) => {
                            const selected = answers[question.id] === optionIndex
                            const isCorrect =
                              submitted &&
                              typeof correctIndex === 'number' &&
                              correctIndex === optionIndex
                            const isWrongSelected =
                              submitted && selected && !isCorrect

                            return (
                              <label
                                key={optionIndex}
                                style={{
                                  ...optionLabel,
                                  ...(isCorrect ? correctOptionStyle : {}),
                                  ...(isWrongSelected ? wrongOptionStyle : {}),
                                }}
                              >
                                <input
                                  type="radio"
                                  name={question.id}
                                  checked={selected}
                                  disabled={submitted}
                                  onChange={() =>
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [question.id]: optionIndex,
                                    }))
                                  }
                                />
                                <span>
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </span>
                              </label>
                            )
                          })}
                        </div>

                        {submitted && (
                          <div style={feedbackBox}>
                            <div>
                              Respuesta correcta:{' '}
                              {typeof correctIndex === 'number'
                                ? String.fromCharCode(65 + correctIndex)
                                : '—'}
                            </div>
                            {question.explanation && (
                              <div style={feedbackText}>{question.explanation}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <div style={actions}>
                    {!submitted ? (
                      <button
                        onClick={() => setSubmitted(true)}
                        style={button}
                      >
                        Corregir test
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSubmitted(false)
                          setAnswers({})
                        }}
                        style={secondaryButton}
                      >
                        Reiniciar test
                      </button>
                    )}
                  </div>

                  {submitted && (
                    <div style={scoreBox(scoreData.percent)}>
                      Puntaje: {scoreData.correct}/{scoreData.total} · {scoreData.percent}%
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {mode === 'flashcards' && (
            <div style={card}>
              <h3 style={sectionTitle}>Flashcards</h3>

              {loadingBank ? (
                <div style={emptyText}>Cargando tarjetas...</div>
              ) : bankQuestions.length === 0 ? (
                <div style={emptyText}>
                  No hay preguntas del banco para transformar en tarjetas todavía.
                </div>
              ) : (
                <div style={flashcardsGrid}>
                  {bankQuestions.slice(0, 6).map((question, index) => (
                    <div key={question.id} style={flashcard}>
                      <div style={flashcardFront}>Tarjeta {index + 1}</div>
                      <div style={flashcardBack}>{question.question}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'ia' && (
            <AIStudyChat
              context={{
                subject: selectedEvaluation.subject,
                type: selectedEvaluation.type,
                topic:
                  selectedEvaluation.topic ||
                  selectedEvaluation.title ||
                  'tema principal',
                difficulty: engine.difficulty,
                start_date: selectedEvaluation.start_date,
                end_date: selectedEvaluation.end_date,
                number: selectedEvaluation.number,
                notes: selectedEvaluation.notes,
                mode: engine.recommendedMode,
                strategy: engine.strategy,
              }}
              title="IA de práctica"
            />
          )}
        </>
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
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  marginTop: 0,
}

const subtitle: React.CSSProperties = {
  opacity: 0.75,
}

const select: React.CSSProperties = {
  width: '100%',
  marginTop: '12px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const modeSelector: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  marginTop: '14px',
  flexWrap: 'wrap',
}

const modeButton: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeModeButton: React.CSSProperties = {
  ...modeButton,
  background: '#2563eb',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const modeBox: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(16,185,129,0.15)',
  marginBottom: '10px',
}

const modeTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '6px',
}

const modeStrategy: React.CSSProperties = {
  opacity: 0.9,
}

const explanation: React.CSSProperties = {
  opacity: 0.82,
  lineHeight: 1.5,
}

const chips: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '12px',
}

const chip: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,0.16)',
  border: '1px solid rgba(59,130,246,0.24)',
  fontSize: '0.82rem',
}

const emptyText: React.CSSProperties = {
  opacity: 0.75,
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
  padding: '8px',
  borderRadius: '10px',
}

const correctOptionStyle: React.CSSProperties = {
  background: 'rgba(16,185,129,0.18)',
  border: '1px solid rgba(16,185,129,0.28)',
}

const wrongOptionStyle: React.CSSProperties = {
  background: 'rgba(239,68,68,0.18)',
  border: '1px solid rgba(239,68,68,0.28)',
}

const feedbackBox: React.CSSProperties = {
  marginTop: '10px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
}

const feedbackText: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.85,
  lineHeight: 1.45,
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

const flashcardsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
  gap: '12px',
  marginTop: '12px',
}

const flashcard: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
  minHeight: '120px',
  display: 'grid',
  gap: '10px',
}

const flashcardFront: React.CSSProperties = {
  fontWeight: 800,
}

const flashcardBack: React.CSSProperties = {
  opacity: 0.85,
}