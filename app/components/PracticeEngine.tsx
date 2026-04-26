'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type PracticeMode = 'adaptativo' | 'practica' | 'diagnostico' | 'todos'

type Question = {
  id: string
  pregunta: string
  opciones: string[] | null
  respuesta_correcta: string | null
  explicacion: string | null
  asignatura: string | null
  tema: string | null
  subtema: string | null
  tipo: string | null
  dificultad: string | null
  nivel_cognitivo: string | null
  respuesta_esperada?: string | null
  criterios_evaluacion?: string[] | null
  referencia_autor?: string | null
  error_comun?: string | null
  tags?: string[] | null
  fuente?: string | null
}

export default function PracticeEngine() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedSubject, setSelectedSubject] = useState('Todas')
  const [selectedTopic, setSelectedTopic] = useState('Todos')
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('adaptativo')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [errorsByTopic, setErrorsByTopic] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('asignatura', { ascending: true })
      .order('tema', { ascending: true })

    if (error) {
      console.error('LOAD QUESTIONS ERROR:', error)
      setQuestions([])
      setLoading(false)
      return
    }

    const loadedQuestions = ((data || []) as Question[]).filter((q) => {
      const hasQuestion = Boolean(q.pregunta)
      const hasType = Boolean(q.tipo)
      const hasOptions =
        q.tipo === 'desarrollo' ||
        (Array.isArray(q.opciones) && q.opciones.length >= 4)

      return hasQuestion && hasType && hasOptions
    })

    setQuestions(loadedQuestions)

    const uniqueSubjects = Array.from(
      new Set(
        loadedQuestions
          .map((q) => q.asignatura || 'Sociología')
          .filter(Boolean)
      )
    )

    if (uniqueSubjects.length === 1) {
      setSelectedSubject(uniqueSubjects[0])
    } else {
      setSelectedSubject('Todas')
    }

    setSelectedTopic('Todos')
    setSelectedMode('adaptativo')
    setCurrentIndex(0)
    setSelectedAnswer('')
    setShowResult(false)
    setScore(0)
    setLoading(false)
  }

  const subjects = useMemo(() => {
    return [
      'Todas',
      ...Array.from(
        new Set(
          questions
            .map((q) => q.asignatura || 'Sociología')
            .filter(Boolean)
        )
      ),
    ] as string[]
  }, [questions])

  const topics = useMemo(() => {
    const base =
      selectedSubject === 'Todas'
        ? questions
        : questions.filter(
            (q) => (q.asignatura || 'Sociología') === selectedSubject
          )

    return [
      'Todos',
      ...Array.from(new Set(base.map((q) => q.tema).filter(Boolean))),
    ] as string[]
  }, [questions, selectedSubject])

  const filteredQuestions = useMemo(() => {
    let base = questions.filter((q) => {
      const subject = q.asignatura || 'Sociología'
      const subjectOk = selectedSubject === 'Todas' || subject === selectedSubject
      const topicOk = selectedTopic === 'Todos' || q.tema === selectedTopic

      return subjectOk && topicOk
    })

    if (selectedMode === 'diagnostico') {
      const diagnostico = base.filter(
        (q) => q.nivel_cognitivo === 'diagnostico'
      )

      base = diagnostico.length > 0 ? diagnostico : base.slice(0, 20)
    }

    if (selectedMode === 'practica') {
      base = base.filter((q) => q.tipo === 'seleccion_multiple')
    }

    if (selectedMode === 'adaptativo') {
      base = base
        .filter((q) => q.tipo === 'seleccion_multiple')
        .sort((a, b) => {
          const aErrors = errorsByTopic[a.tema || ''] || 0
          const bErrors = errorsByTopic[b.tema || ''] || 0

          if (bErrors !== aErrors) return bErrors - aErrors

          const difficultyOrder: Record<string, number> = {
            facil: 1,
            media: 2,
            alta: 3,
          }

          return (
            (difficultyOrder[a.dificultad || 'media'] || 2) -
            (difficultyOrder[b.dificultad || 'media'] || 2)
          )
        })
    }

    return base
  }, [questions, selectedSubject, selectedTopic, selectedMode, errorsByTopic])

  const currentQuestion = filteredQuestions[currentIndex]

  const progress =
    filteredQuestions.length > 0
      ? Math.round(((currentIndex + 1) / filteredQuestions.length) * 100)
      : 0

  const accuracy =
    currentIndex + (showResult ? 1 : 0) > 0
      ? Math.round((score / (currentIndex + (showResult ? 1 : 0))) * 100)
      : 0

  function resetPractice() {
    setCurrentIndex(0)
    setSelectedAnswer('')
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

  function changeMode(value: PracticeMode) {
    setSelectedMode(value)
    resetPractice()
  }

  async function saveAttempt(letter: string, isCorrect: boolean) {
    if (!currentQuestion) return

    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id

    if (!userId) return

    await supabase.from('user_question_attempts').insert({
      user_id: userId,
      question_id: currentQuestion.id,
      selected_answer: letter,
      is_correct: isCorrect,
      tema: currentQuestion.tema,
      subtema: currentQuestion.subtema,
      dificultad: currentQuestion.dificultad,
      nivel_cognitivo: currentQuestion.nivel_cognitivo,
    })
  }

  function answerMultiple(letter: string) {
    if (!currentQuestion || showResult) return

    const isCorrect = letter === currentQuestion.respuesta_correcta

    setSelectedAnswer(letter)
    setShowResult(true)

    if (isCorrect) {
      setScore((prev) => prev + 1)
    } else {
      const topic = currentQuestion.tema || 'Sin tema'

      setErrorsByTopic((prev) => ({
        ...prev,
        [topic]: (prev[topic] || 0) + 1,
      }))
    }

    saveAttempt(letter, isCorrect)
  }

  function nextQuestion() {
    setSelectedAnswer('')
    setShowResult(false)

    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

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
            Preguntas reales desde Supabase, con selección automática de
            asignatura, diagnóstico y modo adaptativo.
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

          <div>
            <label style={label}>Modo</label>
            <select
              value={selectedMode}
              onChange={(e) => changeMode(e.target.value as PracticeMode)}
              style={select}
            >
              <option value="adaptativo">Adaptativo UC</option>
              <option value="practica">Práctica por tema</option>
              <option value="diagnostico">Diagnóstico UC</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>
      </section>

      <section style={stats}>
        <div style={statBox}>Preguntas: {filteredQuestions.length}</div>
        <div style={statBox}>Puntaje: {score}</div>
        <div style={statBox}>Precisión: {accuracy}%</div>
        <div style={statBox}>Progreso: {progress}%</div>
      </section>

      {!currentQuestion ? (
        <section style={card}>
          <h2>No hay preguntas para este filtro.</h2>
          <p style={muted}>
            Cambia a “Todos” o revisa que tus registros tengan asignatura, tema,
            tipo, pregunta, opciones y respuesta_correcta.
          </p>
        </section>
      ) : (
        <section style={card}>
          <div style={questionTop}>
            <span style={badge}>{currentQuestion.asignatura || 'Sociología'}</span>
            <span style={badge}>{currentQuestion.tema || 'Sin tema'}</span>
            <span style={badge}>{currentQuestion.tipo || 'tipo desconocido'}</span>
            <span style={badge}>
              {selectedMode === 'adaptativo'
                ? 'Adaptativo'
                : selectedMode === 'diagnostico'
                  ? 'Diagnóstico'
                  : selectedMode}
            </span>
            <span style={badge}>{currentQuestion.dificultad || 'media'}</span>
          </div>

          <h2 style={questionTitle}>
            Pregunta {currentIndex + 1} de {filteredQuestions.length}
          </h2>

          <p style={questionText}>{currentQuestion.pregunta}</p>

          <div style={optionsGrid}>
            {(currentQuestion.opciones ?? []).map((option) => {
              const letter = option.trim().slice(0, 1)
              const isCorrect = letter === currentQuestion.respuesta_correcta
              const isSelected = letter === selectedAnswer

              let style = optionButton
              if (showResult && isCorrect) style = correctButton
              else if (showResult && isSelected && !isCorrect) style = wrongButton

              return (
                <button
                  key={option}
                  onClick={() => answerMultiple(letter)}
                  style={style}
                  disabled={showResult}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {showResult && (
            <div style={resultBox}>
              <strong>
                {selectedAnswer === currentQuestion.respuesta_correcta
                  ? '✅ Correcta'
                  : '❌ Incorrecta'}
              </strong>

              <p>{currentQuestion.explicacion || 'Sin explicación cargada.'}</p>

              {currentQuestion.error_comun && (
                <p>
                  <strong>Error común:</strong> {currentQuestion.error_comun}
                </p>
              )}

              {currentQuestion.referencia_autor && (
                <p>
                  <strong>Referencia:</strong> {currentQuestion.referencia_autor}
                </p>
              )}

              {currentIndex < filteredQuestions.length - 1 ? (
                <button onClick={nextQuestion} style={primaryButton}>
                  Siguiente →
                </button>
              ) : (
                <button onClick={resetPractice} style={primaryButton}>
                  Reiniciar práctica
                </button>
              )}
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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