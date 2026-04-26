'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type Mode = 'mixto' | 'alternativas' | 'desarrollo'

type RawQuestion = {
  id: string
  pregunta: string | null

  opciona?: string | null
  opcionb?: string | null
  opcionc?: string | null
  opciond?: string | null
  correcta?: string | null

  opciones?: string[] | null
  respuesta_correcta?: string | null

  explicacion: string | null
  clase?: string | null
  asignatura?: string | null
  tema: string | null
  subtema: string | null
  tipopregunta?: string | null
  tipo?: string | null
  dificultad: string | null
  nivel_cognitivo?: string | null
  expected_answer?: string | null
  respuesta_esperada?: string | null
  evaluation_criteria?: string[] | null
  criterios_evaluacion?: string[] | null
  error_comun?: string | null
  referencia_autor?: string | null
}

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
  nivel_cognitivo: string | null
  expected_answer: string | null
  evaluation_criteria: string[] | null
  error_comun: string | null
  referencia_autor: string | null
}

const letters = ['A', 'B', 'C', 'D'] as const

function normalizeQuestion(raw: RawQuestion): Question | null {
  if (!raw.pregunta) return null

  const tipo = raw.tipo ?? raw.tipopregunta ?? 'desarrollo'
  const clase = raw.asignatura ?? raw.clase ?? 'Sociología'

  let opciona = raw.opciona ?? null
  let opcionb = raw.opcionb ?? null
  let opcionc = raw.opcionc ?? null
  let opciond = raw.opciond ?? null

  if (Array.isArray(raw.opciones) && raw.opciones.length > 0) {
    opciona = raw.opciones[0] ?? opciona
    opcionb = raw.opciones[1] ?? opcionb
    opcionc = raw.opciones[2] ?? opcionc
    opciond = raw.opciones[3] ?? opciond
  }

  return {
    id: raw.id,
    pregunta: raw.pregunta,
    opciona,
    opcionb,
    opcionc,
    opciond,
    correcta: raw.respuesta_correcta ?? raw.correcta ?? null,
    explicacion: raw.explicacion ?? null,
    clase,
    tema: raw.tema ?? 'General',
    subtema: raw.subtema ?? 'General',
    tipopregunta: tipo,
    dificultad: raw.dificultad ?? 'media',
    nivel_cognitivo: raw.nivel_cognitivo ?? null,
    expected_answer: raw.respuesta_esperada ?? raw.expected_answer ?? null,
    evaluation_criteria:
      raw.criterios_evaluacion ?? raw.evaluation_criteria ?? null,
    error_comun: raw.error_comun ?? null,
    referencia_autor: raw.referencia_autor ?? null,
  }
}

function shuffleOptions(question: Question): Question {
  if (question.tipopregunta === 'desarrollo') return question

  const options = [
    { letter: 'A', text: question.opciona },
    { letter: 'B', text: question.opcionb },
    { letter: 'C', text: question.opcionc },
    { letter: 'D', text: question.opciond },
  ].filter((item) => Boolean(item.text))

  const correctText = options.find(
    (item) => item.letter === question.correcta
  )?.text

  const shuffled = [...options].sort(() => Math.random() - 0.5)

  const newCorrectIndex = shuffled.findIndex(
    (item) => item.text === correctText
  )

  return {
    ...question,
    opciona: shuffled[0]?.text ?? null,
    opcionb: shuffled[1]?.text ?? null,
    opcionc: shuffled[2]?.text ?? null,
    opciond: shuffled[3]?.text ?? null,
    correcta:
      newCorrectIndex >= 0 ? letters[newCorrectIndex] : question.correcta,
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

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('tema', { ascending: true })

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
      .map(shuffleOptions)
      .sort(() => Math.random() - 0.5)

    setQuestions(randomized)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setScore(0)
    setLoading(false)
  }

  const subjects = useMemo(() => {
    return [
      'Todas',
      ...Array.from(new Set(questions.map((q) => q.clase).filter(Boolean))),
    ] as string[]
  }, [questions])

  const topics = useMemo(() => {
    const base =
      selectedSubject === 'Todas'
        ? questions
        : questions.filter((q) => q.clase === selectedSubject)

    return [
      'Todos',
      ...Array.from(new Set(base.map((q) => q.tema).filter(Boolean))),
    ] as string[]
  }, [questions, selectedSubject])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const subjectOk = selectedSubject === 'Todas' || q.clase === selectedSubject
      const topicOk = selectedTopic === 'Todos' || q.tema === selectedTopic

      const isDevelopment = q.tipopregunta === 'desarrollo'

      const isMultiple =
        q.tipopregunta === 'seleccion_multiple' &&
        Boolean(q.correcta) &&
        [q.opciona, q.opcionb, q.opcionc, q.opciond].filter(Boolean).length >= 2

      const modeOk =
        mode === 'mixto' ||
        (mode === 'alternativas' && isMultiple) ||
        (mode === 'desarrollo' && isDevelopment)

      return subjectOk && topicOk && modeOk && (isDevelopment || isMultiple)
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
      nivel_cognitivo: currentQuestion.nivel_cognitivo,
    })
  }

  function answerMultiple(letter: string) {
    if (!currentQuestion || showResult) return

    const isCorrect = letter === currentQuestion.correcta

    setSelectedAnswer(letter)
    setShowResult(true)

    if (isCorrect) setScore((prev) => prev + 1)

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
            Preguntas de alternativas y desarrollo desde Supabase, con alternativas mezcladas automáticamente.
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
        <div style={statBox}>Preguntas: {filteredQuestions.length}</div>
        <div style={statBox}>Puntaje: {score}</div>
        <div style={statBox}>Progreso: {progress}%</div>
      </section>

      {!currentQuestion ? (
        <section style={card}>
          <h2>No hay preguntas para este filtro.</h2>
          <p style={muted}>
            Revisa que existan preguntas de alternativas o desarrollo para la asignatura y tema seleccionados.
          </p>
        </section>
      ) : (
        <section style={card}>
          <div style={questionTop}>
            <span style={badge}>{currentQuestion.clase || 'Sin asignatura'}</span>
            <span style={badge}>{currentQuestion.tema || 'Sin tema'}</span>
            <span style={badge}>{currentQuestion.tipopregunta || 'Sin tipo'}</span>
            <span style={badge}>{currentQuestion.dificultad || 'media'}</span>
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
                  <p>
                    {currentQuestion.expected_answer ||
                      currentQuestion.explicacion ||
                      'Sin pauta cargada.'}
                  </p>

                  {currentQuestion.evaluation_criteria?.length ? (
                    <>
                      <strong>Criterios:</strong>
                      <ul>
                        {currentQuestion.evaluation_criteria.map((criterion, i) => (
                          <li key={i}>{criterion}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
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
                    disabled={showResult}
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
}'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type Mode = 'mixto' | 'alternativas' | 'desarrollo'

type RawQuestion = {
  id: string
  pregunta: string | null

  opciona?: string | null
  opcionb?: string | null
  opcionc?: string | null
  opciond?: string | null
  correcta?: string | null

  opciones?: string[] | null
  respuesta_correcta?: string | null

  explicacion: string | null
  clase?: string | null
  asignatura?: string | null
  tema: string | null
  subtema: string | null
  tipopregunta?: string | null
  tipo?: string | null
  dificultad: string | null
  nivel_cognitivo?: string | null
  expected_answer?: string | null
  respuesta_esperada?: string | null
  evaluation_criteria?: string[] | null
  criterios_evaluacion?: string[] | null
  error_comun?: string | null
  referencia_autor?: string | null
}

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
  nivel_cognitivo: string | null
  expected_answer: string | null
  evaluation_criteria: string[] | null
  error_comun: string | null
  referencia_autor: string | null
}

const letters = ['A', 'B', 'C', 'D'] as const

function normalizeQuestion(raw: RawQuestion): Question | null {
  if (!raw.pregunta) return null

  const tipo = raw.tipo ?? raw.tipopregunta ?? 'desarrollo'
  const clase = raw.asignatura ?? raw.clase ?? 'Sociología'

  let opciona = raw.opciona ?? null
  let opcionb = raw.opcionb ?? null
  let opcionc = raw.opcionc ?? null
  let opciond = raw.opciond ?? null

  if (Array.isArray(raw.opciones) && raw.opciones.length > 0) {
    opciona = raw.opciones[0] ?? opciona
    opcionb = raw.opciones[1] ?? opcionb
    opcionc = raw.opciones[2] ?? opcionc
    opciond = raw.opciones[3] ?? opciond
  }

  return {
    id: raw.id,
    pregunta: raw.pregunta,
    opciona,
    opcionb,
    opcionc,
    opciond,
    correcta: raw.respuesta_correcta ?? raw.correcta ?? null,
    explicacion: raw.explicacion ?? null,
    clase,
    tema: raw.tema ?? 'General',
    subtema: raw.subtema ?? 'General',
    tipopregunta: tipo,
    dificultad: raw.dificultad ?? 'media',
    nivel_cognitivo: raw.nivel_cognitivo ?? null,
    expected_answer: raw.respuesta_esperada ?? raw.expected_answer ?? null,
    evaluation_criteria:
      raw.criterios_evaluacion ?? raw.evaluation_criteria ?? null,
    error_comun: raw.error_comun ?? null,
    referencia_autor: raw.referencia_autor ?? null,
  }
}

function shuffleOptions(question: Question): Question {
  if (question.tipopregunta === 'desarrollo') return question

  const options = [
    { letter: 'A', text: question.opciona },
    { letter: 'B', text: question.opcionb },
    { letter: 'C', text: question.opcionc },
    { letter: 'D', text: question.opciond },
  ].filter((item) => Boolean(item.text))

  const correctText = options.find(
    (item) => item.letter === question.correcta
  )?.text

  const shuffled = [...options].sort(() => Math.random() - 0.5)

  const newCorrectIndex = shuffled.findIndex(
    (item) => item.text === correctText
  )

  return {
    ...question,
    opciona: shuffled[0]?.text ?? null,
    opcionb: shuffled[1]?.text ?? null,
    opcionc: shuffled[2]?.text ?? null,
    opciond: shuffled[3]?.text ?? null,
    correcta:
      newCorrectIndex >= 0 ? letters[newCorrectIndex] : question.correcta,
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

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('tema', { ascending: true })

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
      .map(shuffleOptions)
      .sort(() => Math.random() - 0.5)

    setQuestions(randomized)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setScore(0)
    setLoading(false)
  }

  const subjects = useMemo(() => {
    return [
      'Todas',
      ...Array.from(new Set(questions.map((q) => q.clase).filter(Boolean))),
    ] as string[]
  }, [questions])

  const topics = useMemo(() => {
    const base =
      selectedSubject === 'Todas'
        ? questions
        : questions.filter((q) => q.clase === selectedSubject)

    return [
      'Todos',
      ...Array.from(new Set(base.map((q) => q.tema).filter(Boolean))),
    ] as string[]
  }, [questions, selectedSubject])

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const subjectOk = selectedSubject === 'Todas' || q.clase === selectedSubject
      const topicOk = selectedTopic === 'Todos' || q.tema === selectedTopic

      const isDevelopment = q.tipopregunta === 'desarrollo'

      const isMultiple =
        q.tipopregunta === 'seleccion_multiple' &&
        Boolean(q.correcta) &&
        [q.opciona, q.opcionb, q.opcionc, q.opciond].filter(Boolean).length >= 2

      const modeOk =
        mode === 'mixto' ||
        (mode === 'alternativas' && isMultiple) ||
        (mode === 'desarrollo' && isDevelopment)

      return subjectOk && topicOk && modeOk && (isDevelopment || isMultiple)
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
      nivel_cognitivo: currentQuestion.nivel_cognitivo,
    })
  }

  function answerMultiple(letter: string) {
    if (!currentQuestion || showResult) return

    const isCorrect = letter === currentQuestion.correcta

    setSelectedAnswer(letter)
    setShowResult(true)

    if (isCorrect) setScore((prev) => prev + 1)

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
            Preguntas de alternativas y desarrollo desde Supabase, con alternativas mezcladas automáticamente.
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
        <div style={statBox}>Preguntas: {filteredQuestions.length}</div>
        <div style={statBox}>Puntaje: {score}</div>
        <div style={statBox}>Progreso: {progress}%</div>
      </section>

      {!currentQuestion ? (
        <section style={card}>
          <h2>No hay preguntas para este filtro.</h2>
          <p style={muted}>
            Revisa que existan preguntas de alternativas o desarrollo para la asignatura y tema seleccionados.
          </p>
        </section>
      ) : (
        <section style={card}>
          <div style={questionTop}>
            <span style={badge}>{currentQuestion.clase || 'Sin asignatura'}</span>
            <span style={badge}>{currentQuestion.tema || 'Sin tema'}</span>
            <span style={badge}>{currentQuestion.tipopregunta || 'Sin tipo'}</span>
            <span style={badge}>{currentQuestion.dificultad || 'media'}</span>
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
                  <p>
                    {currentQuestion.expected_answer ||
                      currentQuestion.explicacion ||
                      'Sin pauta cargada.'}
                  </p>

                  {currentQuestion.evaluation_criteria?.length ? (
                    <>
                      <strong>Criterios:</strong>
                      <ul>
                        {currentQuestion.evaluation_criteria.map((criterion, i) => (
                          <li key={i}>{criterion}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
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
                    disabled={showResult}
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