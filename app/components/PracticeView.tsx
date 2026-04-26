'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type PracticeMode = 'practica' | 'diagnostico'
type AnswerState = 'idle' | 'correct' | 'incorrect'

type Question = {
  id: string
  asignatura: string | null
  tema: string
  subtema: string
  tipo: 'seleccion_multiple' | 'desarrollo'
  dificultad: 'facil' | 'media' | 'alta'
  pregunta: string
  opciones: string[] | null
  respuesta_correcta: 'A' | 'B' | 'C' | 'D' | null
  explicacion: string | null
  respuesta_esperada: string | null
  criterios_evaluacion: string[] | null
  nivel_cognitivo: string | null
  referencia_autor: string | null
  error_comun: string | null
  tags: string[] | null
  fuente: string | null
}

export default function PracticeView() {
  const [subjects, setSubjects] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('alta')
  const [mode, setMode] = useState<PracticeMode>('practica')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const currentQuestion = questions[currentIndex]

  const stats = useMemo(() => {
    const answered = questions.filter((_, index) => index < currentIndex).length
    const total = questions.length
    const progress = total ? Math.round(((currentIndex + 1) / total) * 100) : 0

    return {
      answered,
      total,
      progress,
    }
  }, [questions, currentIndex])

  async function loadInitialData() {
    try {
      setInitialLoading(true)

      const { data, error } = await supabase
        .from('questions')
        .select('asignatura')
        .not('asignatura', 'is', null)

      if (error) throw error

      const uniqueSubjects = Array.from(
        new Set((data ?? []).map((item) => item.asignatura).filter(Boolean))
      )

      setSubjects(uniqueSubjects)

      if (uniqueSubjects[0]) {
        setSelectedSubject(uniqueSubjects[0])
      }
    } catch (error) {
      console.error('LOAD SUBJECTS ERROR:', error)
      alert('No se pudieron cargar las asignaturas.')
    } finally {
      setInitialLoading(false)
    }
  }

  async function loadTopics(subject: string) {
    if (!subject) return

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('tema')
        .eq('asignatura', subject)
        .not('tema', 'is', null)

      if (error) throw error

      const uniqueTopics = Array.from(
        new Set((data ?? []).map((item) => item.tema).filter(Boolean))
      )

      setTopics(uniqueTopics)
    } catch (error) {
      console.error('LOAD TOPICS ERROR:', error)
      setTopics([])
    }
  }

  async function loadQuestions() {
    try {
      setLoading(true)
      setQuestions([])
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setAnswerState('idle')

      let query = supabase
        .from('questions')
        .select('*')
        .eq('tipo', 'seleccion_multiple')
        .limit(30)

      if (selectedSubject) {
        query = query.eq('asignatura', selectedSubject)
      }

      if (mode === 'diagnostico') {
        query = query.eq('nivel_cognitivo', 'diagnostico')
      } else {
        if (selectedTopic) {
          query = query.eq('tema', selectedTopic)
        }

        if (selectedDifficulty) {
          query = query.eq('dificultad', selectedDifficulty)
        }
      }

      const { data, error } = await query

      if (error) throw error

      const shuffled = [...((data ?? []) as Question[])].sort(
        () => Math.random() - 0.5
      )

      setQuestions(shuffled)
    } catch (error) {
      console.error('LOAD QUESTIONS ERROR:', error)
      alert('No se pudieron cargar las preguntas.')
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(letter: string) {
    if (!currentQuestion || selectedAnswer) return

    setSelectedAnswer(letter)

    if (letter === currentQuestion.respuesta_correcta) {
      setAnswerState('correct')
    } else {
      setAnswerState('incorrect')
    }
  }

  function nextQuestion() {
    setSelectedAnswer(null)
    setAnswerState('idle')

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  function restartPractice() {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswerState('idle')
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject)
    }
  }, [selectedSubject])

  if (initialLoading) {
    return (
      <div style={container}>
        <div style={card}>Cargando banco de preguntas...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <div>
          <h2 style={title}>🧠 Práctica inteligente</h2>
          <p style={subtitle}>
            Entrena con preguntas reales desde Supabase, modo práctica y
            diagnóstico obligatorio.
          </p>
        </div>

        <div style={actions}>
          <button onClick={loadQuestions} disabled={loading} style={button}>
            {loading ? 'Cargando...' : 'Comenzar'}
          </button>

          {questions.length > 0 && (
            <button onClick={restartPractice} style={secondaryButton}>
              Reiniciar
            </button>
          )}
        </div>
      </div>

      <div style={statsGrid}>
        <Stat label="Asignaturas" value={subjects.length} />
        <Stat label="Temas" value={topics.length} />
        <Stat label="Preguntas cargadas" value={questions.length} />
        <Stat label="Progreso" value={`${stats.progress}%`} />
      </div>

      <div style={card}>
        <div style={filterGrid}>
          <div style={field}>
            <label style={label}>Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value)
                setSelectedTopic('')
              }}
              style={select}
            >
              <option value="">Selecciona asignatura</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Modo</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as PracticeMode)}
              style={select}
            >
              <option value="practica">Práctica</option>
              <option value="diagnostico">Diagnóstico obligatorio</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>Tema</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={mode === 'diagnostico'}
              style={{
                ...select,
                opacity: mode === 'diagnostico' ? 0.55 : 1,
              }}
            >
              <option value="">Todos los temas</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Dificultad</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              disabled={mode === 'diagnostico'}
              style={{
                ...select,
                opacity: mode === 'diagnostico' ? 0.55 : 1,
              }}
            >
              <option value="facil">Fácil</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
      </div>

      {questions.length === 0 && !loading && (
        <div style={card}>
          <h3 style={sectionTitle}>Banco conectado ✅</h3>
          <p style={emptyText}>
            Selecciona una asignatura y presiona “Comenzar”. Si usas diagnóstico,
            se cargarán preguntas con nivel cognitivo diagnóstico.
          </p>
        </div>
      )}

      {currentQuestion && (
        <div style={questionCard}>
          <div style={questionHeader}>
            <div style={chips}>
              <span style={chip}>{currentQuestion.asignatura ?? 'General'}</span>
              <span style={chip}>{currentQuestion.tema}</span>
              <span style={chip}>{currentQuestion.subtema}</span>
              <span style={chip}>
                {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <div style={modeBadge}>
              {mode === 'diagnostico' ? 'Diagnóstico' : 'Práctica'}
            </div>
          </div>

          <div style={progressTrack}>
            <div
              style={{
                ...progressFill,
                width: `${stats.progress}%`,
              }}
            />
          </div>

          <h3 style={questionTitle}>{currentQuestion.pregunta}</h3>

          <div style={optionsGrid}>
            {(currentQuestion.opciones ?? []).map((option) => {
              const letter = option.trim().slice(0, 1)
              const isSelected = selectedAnswer === letter
              const isCorrect = currentQuestion.respuesta_correcta === letter

              let optionStyle: React.CSSProperties = optionButton

              if (selectedAnswer && isCorrect) {
                optionStyle = {
                  ...optionButton,
                  ...correctOption,
                }
              }

              if (selectedAnswer && isSelected && !isCorrect) {
                optionStyle = {
                  ...optionButton,
                  ...wrongOption,
                }
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(letter)}
                  disabled={Boolean(selectedAnswer)}
                  style={optionStyle}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {selectedAnswer && (
            <div
              style={{
                ...feedbackBox,
                ...(answerState === 'correct'
                  ? feedbackCorrect
                  : feedbackIncorrect),
              }}
            >
              <div style={feedbackTitle}>
                {answerState === 'correct'
                  ? '✅ Correcta'
                  : '❌ Incorrecta'}
              </div>

              <div style={feedbackText}>
                Respuesta correcta: <strong>{currentQuestion.respuesta_correcta}</strong>
              </div>

              {currentQuestion.explicacion && (
                <div style={feedbackText}>{currentQuestion.explicacion}</div>
              )}

              {currentQuestion.error_comun && (
                <div style={warningBox}>
                  Error común: {currentQuestion.error_comun}
                </div>
              )}

              <button
                onClick={nextQuestion}
                disabled={currentIndex >= questions.length - 1}
                style={button}
              >
                {currentIndex >= questions.length - 1
                  ? 'Terminaste'
                  : 'Siguiente'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '20px',
  borderRadius: '22px',
  background:
    'linear-gradient(135deg, rgba(37,99,235,0.24), rgba(147,51,234,0.16))',
  border: '1px solid rgba(255,255,255,0.12)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'wrap',
}

const title: React.CSSProperties = {
  margin: 0,
  fontSize: '1.7rem',
  fontWeight: 950,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  lineHeight: 1.5,
  maxWidth: '680px',
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const button: React.CSSProperties = {
  padding: '11px 15px',
  borderRadius: '13px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  padding: '11px 15px',
  borderRadius: '13px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.07)',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
}

const statCard: React.CSSProperties = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.11)',
}

const statLabel: React.CSSProperties = {
  opacity: 0.72,
  fontSize: '0.9rem',
}

const statValue: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '1.45rem',
  fontWeight: 950,
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.11)',
}

const filterGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '14px',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: React.CSSProperties = {
  fontWeight: 850,
  fontSize: '0.92rem',
}

const select: React.CSSProperties = {
  padding: '12px',
  borderRadius: '13px',
  background: 'white',
  color: '#0f172a',
  border: 'none',
  outline: 'none',
  fontWeight: 700,
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  fontWeight: 900,
}

const emptyText: React.CSSProperties = {
  opacity: 0.78,
  lineHeight: 1.55,
}

const questionCard: React.CSSProperties = {
  padding: '22px',
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  display: 'grid',
  gap: '18px',
}

const questionHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
}

const chips: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}

const chip: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.10)',
  fontSize: '0.82rem',
  fontWeight: 800,
}

const modeBadge: React.CSSProperties = {
  padding: '7px 11px',
  borderRadius: '999px',
  background: 'rgba(37,99,235,0.22)',
  color: '#bfdbfe',
  border: '1px solid rgba(37,99,235,0.30)',
  fontWeight: 900,
  fontSize: '0.82rem',
}

const progressTrack: React.CSSProperties = {
  height: '9px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  overflow: 'hidden',
}

const progressFill: React.CSSProperties = {
  height: '100%',
  borderRadius: '999px',
  background: '#2563eb',
}

const questionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.35rem',
  lineHeight: 1.45,
  fontWeight: 950,
}

const optionsGrid: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const optionButton: React.CSSProperties = {
  width: '100%',
  padding: '15px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.055)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.12)',
  textAlign: 'left',
  fontWeight: 750,
  cursor: 'pointer',
  lineHeight: 1.45,
}

const correctOption: React.CSSProperties = {
  border: '1px solid rgba(34,197,94,0.75)',
  background: 'rgba(34,197,94,0.16)',
}

const wrongOption: React.CSSProperties = {
  border: '1px solid rgba(239,68,68,0.75)',
  background: 'rgba(239,68,68,0.16)',
}

const feedbackBox: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
  padding: '16px',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.12)',
}

const feedbackCorrect: React.CSSProperties = {
  background: 'rgba(34,197,94,0.12)',
}

const feedbackIncorrect: React.CSSProperties = {
  background: 'rgba(239,68,68,0.12)',
}

const feedbackTitle: React.CSSProperties = {
  fontWeight: 950,
  fontSize: '1.05rem',
}

const feedbackText: React.CSSProperties = {
  opacity: 0.86,
  lineHeight: 1.55,
}

const warningBox: React.CSSProperties = {
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(245,158,11,0.14)',
  border: '1px solid rgba(245,158,11,0.24)',
  color: '#fde68a',
  lineHeight: 1.45,
}