'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type Mode = 'mixto' | 'alternativas' | 'desarrollo'

type RawQuestion = Record<string, any>

type Question = {
  id: string
  pregunta: string
  asignatura: string
  tema: string
  subtema: string
  tipo: 'seleccion_multiple' | 'desarrollo'
  dificultad: string
  opciones: string[]
  correcta: string | null
  explicacion: string | null
  expectedAnswer: string | null
  criterios: string[]
  errorComun: string | null
  referenciaAutor: string | null
}

const LETTERS = ['A', 'B', 'C', 'D']

function cleanText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeType(raw: RawQuestion): 'seleccion_multiple' | 'desarrollo' {
  const value = cleanText(raw.tipo ?? raw.tipopregunta).toLowerCase()

  if (
    value.includes('seleccion') ||
    value.includes('alternativa') ||
    value.includes('multiple')
  ) {
    return 'seleccion_multiple'
  }

  return 'desarrollo'
}

function normalizeCorrect(value: unknown) {
  const text = cleanText(value).toUpperCase()
  if (['A', 'B', 'C', 'D'].includes(text)) return text
  return null
}

function parseOptions(raw: RawQuestion) {
  const fromJson = Array.isArray(raw.opciones)
    ? raw.opciones
        .map((item: unknown) => cleanText(item))
        .filter(Boolean)
    : []

  const fromColumns = [
    raw.opciona,
    raw.opcionb,
    raw.opcionc,
    raw.opciond,
  ]
    .map((item) => cleanText(item))
    .filter(Boolean)

  const options = fromJson.length > 0 ? fromJson : fromColumns

  return options.map((option, index) => {
    const trimmed = cleanText(option)
    const alreadyHasLetter = /^[A-D]\)/i.test(trimmed)
    return alreadyHasLetter ? trimmed : `${LETTERS[index]}) ${trimmed}`
  })
}

function shuffleQuestionOptions(question: Question): Question {
  if (question.tipo !== 'seleccion_multiple') return question
  if (!question.correcta) return question
  if (question.opciones.length < 2) return question

  const original = question.opciones.map((option, index) => ({
    originalLetter: LETTERS[index],
    text: option.replace(/^[A-D]\)\s*/i, '').trim(),
  }))

  const correctText = original.find(
    (item) => item.originalLetter === question.correcta
  )?.text

  const shuffled = [...original].sort(() => Math.random() - 0.5)

  const newCorrectIndex = shuffled.findIndex((item) => item.text === correctText)

  return {
    ...question,
    opciones: shuffled.map((item, index) => `${LETTERS[index]}) ${item.text}`),
    correcta: newCorrectIndex >= 0 ? LETTERS[newCorrectIndex] : question.correcta,
  }
}

function normalizeQuestion(raw: RawQuestion): Question | null {
  const pregunta = cleanText(raw.pregunta ?? raw.question)
  if (!pregunta) return null

  const tipo = normalizeType(raw)
  const opciones = parseOptions(raw)
  const correcta = normalizeCorrect(raw.respuesta_correcta ?? raw.correcta)

  const isMultipleValid =
    tipo === 'seleccion_multiple' && opciones.length >= 2 && Boolean(correcta)

  const isDevelopmentValid = tipo === 'desarrollo'

  if (!isMultipleValid && !isDevelopmentValid) return null

  return {
    id: String(raw.id),
    pregunta,
    asignatura: cleanText(raw.asignatura ?? raw.clase ?? raw.subject) || 'Sociología',
    tema: cleanText(raw.tema ?? raw.topic) || 'General',
    subtema: cleanText(raw.subtema ?? raw.subtopic) || 'General',
    tipo,
    dificultad: cleanText(raw.dificultad ?? raw.difficulty) || 'media',
    opciones,
    correcta,
    explicacion: cleanText(raw.explicacion ?? raw.explanation) || null,
    expectedAnswer:
      cleanText(raw.respuesta_esperada ?? raw.expected_answer) || null,
    criterios: Array.isArray(raw.criterios_evaluacion)
      ? raw.criterios_evaluacion
      : Array.isArray(raw.evaluation_criteria)
        ? raw.evaluation_criteria
        : [],
    errorComun: cleanText(raw.error_comun ?? raw.common_mistake) || null,
    referenciaAutor:
      cleanText(raw.referencia_autor ?? raw.author_reference) || null,
  }
}

export default function PracticeEngine() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [mode, setMode] = useState<Mode>('mixto')
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

    const { data, error } = await supabase.from('questions').select('*')

    if (error) {
      console.error('LOAD QUESTIONS ERROR:', error)
      setQuestions([])
      setLoading(false)
      return
    }

    const normalized = ((data ?? []) as RawQuestion[])
      .map(normalizeQuestion)
      .filter(Boolean) as Question[]

    const randomized = normalized
      .map(shuffleQuestionOptions)
      .sort(() => Math.random() - 0.5)

    console.log('QUESTIONS RAW:', data?.length ?? 0)
    console.log('QUESTIONS NORMALIZED:', randomized.length)
    console.log('SUBJECTS:', Array.from(new Set(randomized.map((q) => q.asignatura))))

    setQuestions(randomized)

    const uniqueSubjects = Array.from(
      new Set(randomized.map((q) => q.asignatura).filter(Boolean))
    )

    if (uniqueSubjects.length === 1) {
      setSelectedSubject(uniqueSubjects[0])
    } else {
      setSelectedSubject('Todas')
    }

    setSelectedTopic('Todos')
    setCurrentIndex(0)
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setScore(0)
    setLoading(false)
  }

  const subjects = useMemo(() => {
    const values = Array.from(
      new Set(questions.map((q) => q.asignatura).filter(Boolean))
    )

    return ['Todas', ...values]
  }, [questions])

  const topics = useMemo(() => {
    const base =
      selectedSubject === 'Todas'
        ? questions
        : questions.filter((q) => q.asignatura === selectedSubject)

    return [
      'Todos',
      ...Array.from(new Set(base.map((q) => q.tema).filter(Boolean))),
    ]
  }, [questions, selectedSubject])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const subjectOk =
        selectedSubject === 'Todas' || q.asignatura === selectedSubject

      const topicOk = selectedTopic === 'Todos' || q.tema === selectedTopic

      const modeOk =
        mode === 'mixto' ||
        (mode === 'alternativas' && q.tipo === 'seleccion_multiple') ||
        (mode === 'desarrollo' && q.tipo === 'desarrollo')

      return subjectOk && topicOk && modeOk
    })
  }, [questions, selectedSubject, selectedTopic, mode])

  const currentQuestion = filteredQuestions[currentIndex]

  const progress =
    filteredQuestions.length > 0
      ? Math.round(((currentIndex + 1) / filteredQuestions.length) * 100)
      : 0

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

  function changeMode(value: Mode) {
    setMode(value)
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
      nivel_cognitivo: null,
    })
  }

  function answerMultiple(letter: string) {
    if (!currentQuestion || showResult) return

    const isCorrect = letter === currentQuestion.correcta

    setSelectedAnswer(letter)
    setShowResult(true)

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    saveAttempt(letter, isCorrect)
  }

  function checkDevelopment() {
    if (!developmentAnswer.trim()) return
    setShowResult(true)
  }

  function nextQuestion() {
    setSelectedAnswer('')
    setDevelopmentAnswer('')
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
            Alternativas y desarrollo desde Supabase. Las alternativas se mezclan
            automáticamente.
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
              value={mode}
              onChange={(e) => changeMode(e.target.value as Mode)}
              style={select}
            >
              <option value="mixto">Mixto</option>
              <option value="alternativas">Solo alternativas</option>
              <option value="desarrollo">Solo desarrollo</option>
            </select>
          </div>
        </div>
      </section>

      <section style={stats}>
        <div style={statBox}>Total banco: {questions.length}</div>
        <div style={statBox}>Preguntas filtro: {filteredQuestions.length}</div>
        <div style={statBox}>Puntaje: {score}</div>
        <div style={statBox}>Progreso: {progress}%</div>
      </section>

      {!currentQuestion ? (
        <section style={card}>
          <h2>No hay preguntas para este filtro.</h2>
          <p style={muted}>
            Prueba con Asignatura “Todas”, Tema “Todos” y Modo “Mixto”.
          </p>
        </section>
      ) : (
        <section style={card}>
          <div style={questionTop}>
            <span style={badge}>{currentQuestion.asignatura}</span>
            <span style={badge}>{currentQuestion.tema}</span>
            <span style={badge}>{currentQuestion.tipo}</span>
            <span style={badge}>{currentQuestion.dificultad}</span>
          </div>

          <h2 style={questionTitle}>
            Pregunta {currentIndex + 1} de {filteredQuestions.length}
          </h2>

          <p style={questionText}>{currentQuestion.pregunta}</p>

          {currentQuestion.tipo === 'desarrollo' ? (
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
                  <p>
                    {currentQuestion.expectedAnswer ||
                      currentQuestion.explicacion ||
                      'Sin pauta cargada.'}
                  </p>

                  {currentQuestion.criterios.length > 0 && (
                    <>
                      <strong>Criterios:</strong>
                      <ul>
                        {currentQuestion.criterios.map((criterion, index) => (
                          <li key={index}>{criterion}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={optionsGrid}>
              {currentQuestion.opciones.map((option) => {
                const letter = option.trim().slice(0, 1)
                const isCorrect = letter === currentQuestion.correcta
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
          )}

          {showResult && currentQuestion.tipo !== 'desarrollo' && (
            <div style={resultBox}>
              <strong>
                {selectedAnswer === currentQuestion.correcta
                  ? '✅ Correcta'
                  : '❌ Incorrecta'}
              </strong>
              <p>{currentQuestion.explicacion || 'Sin explicación cargada.'}</p>

              {currentQuestion.errorComun && (
                <p>
                  <strong>Error común:</strong> {currentQuestion.errorComun}
                </p>
              )}

              {currentQuestion.referenciaAutor && (
                <p>
                  <strong>Referencia:</strong> {currentQuestion.referenciaAutor}
                </p>
              )}
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