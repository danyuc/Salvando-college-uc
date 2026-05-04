'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { supabase } from '@/lib/supabase'

type Stage =
  | 'diagnostico_inicio'
  | 'entrenamiento_1'
  | 'diagnostico_medio'
  | 'refuerzo'
  | 'diagnostico_final'
  | 'finalizado'

type Mode = 'guiado' | 'mixto' | 'alternativas' | 'desarrollo'
type OrderMode = 'mezclado' | 'tema' | 'dificultad'
type RawQuestion = Record<string, any>

type Question = {
  id: string
  pregunta: string
  asignatura: string
  tema: string
  subtema: string
  autor: string
  fuente: string
  dificultad: string
  nivelCognitivo: string
  tipo: 'seleccion_multiple' | 'desarrollo'
  opciones: string[]
  correcta: string | null
  explicacion: string | null
  respuestaEsperada: string | null
  criterios: string[]
  errorComun: string | null
}

type Attempt = {
  questionId: string
  tema: string
  subtema: string
  autor: string
  fuente: string
  dificultad: string
  stage: Stage
  tipo: Question['tipo']
  correct: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']
const LIMITS = [5, 10, 15, 20, 30, 40, 50]

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeType(raw: RawQuestion): Question['tipo'] {
  const value = clean(raw.tipo ?? raw.tipopregunta ?? raw.type).toLowerCase()

  if (
    value.includes('seleccion') ||
    value.includes('selección') ||
    value.includes('multiple') ||
    value.includes('múltiple') ||
    value.includes('alternativa')
  ) {
    return 'seleccion_multiple'
  }

  return 'desarrollo'
}

function normalizeCorrect(value: unknown) {
  const text = clean(value).toUpperCase()
  return LETTERS.includes(text) ? text : null
}

function parseOptions(raw: RawQuestion) {
  const jsonOptions = Array.isArray(raw.opciones)
    ? raw.opciones.map((item: unknown) => clean(item)).filter(Boolean)
    : Array.isArray(raw.options)
      ? raw.options.map((item: unknown) => clean(item)).filter(Boolean)
      : []

  const columnOptions = [raw.opciona, raw.opcionb, raw.opcionc, raw.opciond]
    .map((item) => clean(item))
    .filter(Boolean)

  const options = jsonOptions.length > 0 ? jsonOptions : columnOptions

  return options.map((option, index) => {
    const text = clean(option)
    return /^[A-D]\)/i.test(text) ? text : `${LETTERS[index]}) ${text}`
  })
}

function normalizeQuestion(raw: RawQuestion): Question | null {
  const pregunta = clean(raw.pregunta ?? raw.question)
  if (!pregunta) return null

  const tipo = normalizeType(raw)
  const opciones = parseOptions(raw)
  const correcta = normalizeCorrect(raw.respuesta_correcta ?? raw.correcta ?? raw.correct_answer)

  const isMultipleValid = tipo === 'seleccion_multiple' && opciones.length >= 2 && Boolean(correcta)
  const isDevelopmentValid = tipo === 'desarrollo'

  if (!isMultipleValid && !isDevelopmentValid) return null

  return {
    id: String(raw.id),
    pregunta,
    asignatura: clean(raw.asignatura ?? raw.clase ?? raw.subject) || 'Sociología',
    tema: clean(raw.tema ?? raw.topic) || 'General',
    subtema: clean(raw.subtema ?? raw.subtopic) || 'General',
    autor: clean(raw.referencia_autor ?? raw.author_reference) || 'General',
    fuente: clean(raw.fuente ?? raw.source) || 'Sin fuente',
    dificultad: clean(raw.dificultad ?? raw.difficulty) || 'media',
    nivelCognitivo: clean(raw.nivel_cognitivo ?? raw.cognitive_level) || 'general',
    tipo,
    opciones,
    correcta,
    explicacion: clean(raw.explicacion ?? raw.explanation) || null,
    respuestaEsperada: clean(raw.respuesta_esperada ?? raw.expected_answer) || null,
    criterios: Array.isArray(raw.criterios_evaluacion)
      ? raw.criterios_evaluacion
      : Array.isArray(raw.evaluation_criteria)
        ? raw.evaluation_criteria
        : [],
    errorComun: clean(raw.error_comun ?? raw.common_mistake) || null,
  }
}

function shuffleQuestionOptions(question: Question): Question {
  if (question.tipo !== 'seleccion_multiple' || !question.correcta) return question

  const original = question.opciones.map((option, index) => ({
    originalLetter: LETTERS[index],
    text: option.replace(/^[A-D]\)\s*/i, '').trim(),
  }))

  const correctText = original.find((item) => item.originalLetter === question.correcta)?.text
  const shuffled = [...original].sort(() => Math.random() - 0.5)
  const newCorrectIndex = shuffled.findIndex((item) => item.text === correctText)

  return {
    ...question,
    opciones: shuffled.map((item, index) => `${LETTERS[index]}) ${item.text}`),
    correcta: newCorrectIndex >= 0 ? LETTERS[newCorrectIndex] : question.correcta,
  }
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function difficultyValue(value: string) {
  const v = value.toLowerCase()
  if (v.includes('facil') || v.includes('fácil')) return 1
  if (v.includes('media')) return 2
  if (v.includes('alta')) return 3
  return 2
}

function nextStage(stage: Stage): Stage {
  if (stage === 'diagnostico_inicio') return 'entrenamiento_1'
  if (stage === 'entrenamiento_1') return 'diagnostico_medio'
  if (stage === 'diagnostico_medio') return 'refuerzo'
  if (stage === 'refuerzo') return 'diagnostico_final'
  if (stage === 'diagnostico_final') return 'finalizado'
  return 'finalizado'
}

function stageLabel(stage: Stage) {
  const labels: Record<Stage, string> = {
    diagnostico_inicio: 'Diagnóstico inicial',
    entrenamiento_1: 'Entrenamiento guiado',
    diagnostico_medio: 'Diagnóstico medio',
    refuerzo: 'Refuerzo inteligente',
    diagnostico_final: 'Diagnóstico final',
    finalizado: 'Resumen final',
  }

  return labels[stage]
}

export default function PracticeEngine() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [stage, setStage] = useState<Stage>('diagnostico_inicio')

  const [selectedSubject, setSelectedSubject] = useState('Todas')
  const [selectedTopic, setSelectedTopic] = useState('Todos')
  const [selectedSubtopic, setSelectedSubtopic] = useState('Todos')
  const [selectedAuthor, setSelectedAuthor] = useState('Todos')
  const [selectedSource, setSelectedSource] = useState('Todas')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Todas')
  const [mode, setMode] = useState<Mode>('guiado')
  const [orderMode, setOrderMode] = useState<OrderMode>('mezclado')
  const [questionLimit, setQuestionLimit] = useState(20)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [developmentAnswer, setDevelopmentAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const [focusSeconds, setFocusSeconds] = useState(25 * 60)
  const [focusRunning, setFocusRunning] = useState(true)

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (!focusRunning) return

    const timer = window.setInterval(() => {
      setFocusSeconds((value) => (value > 0 ? value - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [focusRunning])

  async function loadQuestions() {
    setLoading(true)

    const { data, error } = await supabase.from('questions').select('*')

    if (error) {
      console.error('LOAD QUESTIONS ERROR:', error)
      setAllQuestions([])
      setLoading(false)
      return
    }

    const normalized = ((data ?? []) as RawQuestion[])
      .map(normalizeQuestion)
      .filter(Boolean) as Question[]

    setAllQuestions(normalized.map(shuffleQuestionOptions).sort(() => Math.random() - 0.5))
    setLoading(false)
  }

  const filteredBase = useMemo(() => {
    return allQuestions.filter((q) => {
      const subjectOk = selectedSubject === 'Todas' || q.asignatura === selectedSubject
      const topicOk = selectedTopic === 'Todos' || q.tema === selectedTopic
      const subtopicOk = selectedSubtopic === 'Todos' || q.subtema === selectedSubtopic
      const authorOk = selectedAuthor === 'Todos' || q.autor === selectedAuthor
      const sourceOk = selectedSource === 'Todas' || q.fuente === selectedSource
      const difficultyOk = selectedDifficulty === 'Todas' || q.dificultad === selectedDifficulty

      return subjectOk && topicOk && subtopicOk && authorOk && sourceOk && difficultyOk
    })
  }, [
    allQuestions,
    selectedSubject,
    selectedTopic,
    selectedSubtopic,
    selectedAuthor,
    selectedSource,
    selectedDifficulty,
  ])

  const subjects = useMemo(() => ['Todas', ...unique(allQuestions.map((q) => q.asignatura))], [allQuestions])

  const topics = useMemo(() => {
    const base = selectedSubject === 'Todas'
      ? allQuestions
      : allQuestions.filter((q) => q.asignatura === selectedSubject)

    return ['Todos', ...unique(base.map((q) => q.tema))]
  }, [allQuestions, selectedSubject])

  const subtopics = useMemo(() => {
    const base = selectedTopic === 'Todos'
      ? filteredBase
      : filteredBase.filter((q) => q.tema === selectedTopic)

    return ['Todos', ...unique(base.map((q) => q.subtema))]
  }, [filteredBase, selectedTopic])

  const authors = useMemo(() => ['Todos', ...unique(filteredBase.map((q) => q.autor))], [filteredBase])
  const sources = useMemo(() => ['Todas', ...unique(filteredBase.map((q) => q.fuente))], [filteredBase])
  const difficulties = useMemo(() => ['Todas', ...unique(allQuestions.map((q) => q.dificultad))], [allQuestions])

  const weakTopics = useMemo(() => {
    const map = new Map<string, number>()

    for (const attempt of attempts) {
      if (!attempt.correct) {
        map.set(attempt.tema, (map.get(attempt.tema) ?? 0) + 1)
      }
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tema]) => tema)
  }, [attempts])

  function applyOrder(questions: Question[]) {
    if (orderMode === 'tema') {
      return [...questions].sort((a, b) => a.tema.localeCompare(b.tema))
    }

    if (orderMode === 'dificultad') {
      return [...questions].sort((a, b) => difficultyValue(a.dificultad) - difficultyValue(b.dificultad))
    }

    return [...questions].sort(() => Math.random() - 0.5)
  }

  function buildQuestionsForStage(targetStage: Stage) {
    let base = [...filteredBase]

    if (mode === 'alternativas') {
      base = base.filter((q) => q.tipo === 'seleccion_multiple')
    }

    if (mode === 'desarrollo') {
      base = base.filter((q) => q.tipo === 'desarrollo')
    }

    if (targetStage.includes('diagnostico')) {
      const diagnostic = base.filter((q) => q.tipo === 'seleccion_multiple')
      const explicitDiagnostic = diagnostic.filter((q) => q.nivelCognitivo === 'diagnostico')

      base = explicitDiagnostic.length >= 5 ? explicitDiagnostic : diagnostic
    }

    if (targetStage === 'refuerzo' && weakTopics.length > 0) {
      const weakBase = base.filter((q) => weakTopics.includes(q.tema))
      base = weakBase.length >= 3 ? weakBase : base
    }

    if (targetStage === 'entrenamiento_1') {
      base = base.filter((q) => mode === 'guiado' ? true : q)
    }

    const stageLimit =
      targetStage === 'diagnostico_inicio' ? Math.min(10, questionLimit) :
      targetStage === 'diagnostico_medio' ? Math.min(8, questionLimit) :
      targetStage === 'diagnostico_final' ? Math.min(8, questionLimit) :
      targetStage === 'refuerzo' ? Math.min(12, questionLimit) :
      questionLimit

    return applyOrder(base)
      .slice(0, stageLimit)
      .map(shuffleQuestionOptions)
  }

  function startSession() {
    const firstStage: Stage = 'diagnostico_inicio'
    const built = buildQuestionsForStage(firstStage)

    setStage(firstStage)
    setSessionQuestions(built)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setScore(0)
    setAttempts([])
    setFocusSeconds(25 * 60)
    setFocusRunning(true)
  }

  function moveToStage(targetStage: Stage) {
    if (targetStage === 'finalizado') {
      setStage('finalizado')
      setSessionQuestions([])
      setCurrentIndex(0)
      setSelectedAnswer('')
      setDevelopmentAnswer('')
      setShowResult(false)
      return
    }

    const built = buildQuestionsForStage(targetStage)

    setStage(targetStage)
    setSessionQuestions(built)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)
    setScore(0)
  }

  function resetFilters() {
    setSelectedSubject('Todas')
    setSelectedTopic('Todos')
    setSelectedSubtopic('Todos')
    setSelectedAuthor('Todos')
    setSelectedSource('Todas')
    setSelectedDifficulty('Todas')
    setMode('guiado')
    setOrderMode('mezclado')
    setQuestionLimit(20)
  }

  function answerMultiple(letter: string) {
    const current = sessionQuestions[currentIndex]
    if (!current || showResult) return

    const correct = letter === current.correcta

    setSelectedAnswer(letter)
    setShowResult(true)

    if (correct) {
      setScore((prev) => prev + 1)
    }

    setAttempts((prev) => [
      ...prev,
      {
        questionId: current.id,
        tema: current.tema,
        subtema: current.subtema,
        autor: current.autor,
        fuente: current.fuente,
        dificultad: current.dificultad,
        stage,
        tipo: current.tipo,
        correct,
      },
    ])
  }

  function checkDevelopment() {
    const current = sessionQuestions[currentIndex]
    if (!current || !developmentAnswer.trim()) return

    setShowResult(true)

    setAttempts((prev) => [
      ...prev,
      {
        questionId: current.id,
        tema: current.tema,
        subtema: current.subtema,
        autor: current.autor,
        fuente: current.fuente,
        dificultad: current.dificultad,
        stage,
        tipo: current.tipo,
        correct: true,
      },
    ])
  }

  function nextQuestion() {
    setSelectedAnswer('')
    setDevelopmentAnswer('')
    setShowResult(false)

    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }

    moveToStage(nextStage(stage))
  }

  const currentQuestion = sessionQuestions[currentIndex]

  const progress = sessionQuestions.length
    ? Math.round(((currentIndex + 1) / sessionQuestions.length) * 100)
    : 0

  const totalCorrect = attempts.filter((a) => a.correct).length
  const accuracy = attempts.length ? Math.round((totalCorrect / attempts.length) * 100) : 0

  const focusMinutes = Math.floor(focusSeconds / 60).toString().padStart(2, '0')
  const focusRest = (focusSeconds % 60).toString().padStart(2, '0')

  if (loading) {
    return (
      <main style={main}>
        <section style={card}>Cargando banco de preguntas...</section>
      </main>
    )
  }

  return (
    <main style={main}>
      <section style={hero}>
        <div>
          <p style={pill}>Jornada inteligente UC</p>
          <h1 style={title}>{stageLabel(stage)}</h1>
          <p style={muted}>
            Flujo guiado con 3 diagnósticos, práctica adaptativa, filtros avanzados y bloques de concentración.
          </p>
        </div>

        <div style={heroActions}>
          <button onClick={loadQuestions} style={secondaryButton}>Actualizar</button>
          <button onClick={startSession} style={primaryButtonNoMargin}>Iniciar jornada</button>
        </div>
      </section>

      <section style={card}>
        <div style={filters}>
          <Field label="Cantidad">
            <select value={questionLimit} onChange={(e) => setQuestionLimit(Number(e.target.value))} style={select}>
              {LIMITS.map((limit) => <option key={limit} value={limit}>{limit} preguntas</option>)}
            </select>
          </Field>

          <Field label="Tipo de sesión">
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={select}>
              <option value="guiado">Guiado UC</option>
              <option value="mixto">Mixto libre</option>
              <option value="alternativas">Solo alternativas</option>
              <option value="desarrollo">Solo desarrollo</option>
            </select>
          </Field>

          <Field label="Asignatura">
            <select value={selectedSubject} onChange={(e) => {
              setSelectedSubject(e.target.value)
              setSelectedTopic('Todos')
              setSelectedSubtopic('Todos')
            }} style={select}>
              {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Tema">
            <select value={selectedTopic} onChange={(e) => {
              setSelectedTopic(e.target.value)
              setSelectedSubtopic('Todos')
            }} style={select}>
              {topics.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Subtema">
            <select value={selectedSubtopic} onChange={(e) => setSelectedSubtopic(e.target.value)} style={select}>
              {subtopics.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Autor">
            <select value={selectedAuthor} onChange={(e) => setSelectedAuthor(e.target.value)} style={select}>
              {authors.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Clase / fuente">
            <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} style={select}>
              {sources.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Dificultad">
            <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} style={select}>
              {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Orden">
            <select value={orderMode} onChange={(e) => setOrderMode(e.target.value as OrderMode)} style={select}>
              <option value="mezclado">Mezclado</option>
              <option value="tema">Por tema</option>
              <option value="dificultad">Por dificultad</option>
            </select>
          </Field>
        </div>

        <div style={filterActions}>
          <button onClick={resetFilters} style={secondaryButton}>Limpiar filtros</button>
          <button onClick={startSession} style={primaryButtonNoMargin}>Crear sesión</button>
        </div>
      </section>

      <section style={stats}>
        <Stat label="Banco" value={allQuestions.length} />
        <Stat label="Filtro" value={filteredBase.length} />
        <Stat label="Sesión" value={sessionQuestions.length} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="Foco" value={`${focusMinutes}:${focusRest}`} />
      </section>

      {focusSeconds === 0 && (
        <section style={notice}>
          Descanso breve recomendado. Respira, toma agua y vuelve con otra ronda.
          <button onClick={() => setFocusSeconds(5 * 60)} style={miniButton}>5 min</button>
          <button onClick={() => setFocusSeconds(25 * 60)} style={miniButton}>Nuevo bloque</button>
        </section>
      )}

      {stage === 'finalizado' ? (
        <section style={card}>
          <h2 style={sectionTitle}>Resumen final</h2>
          <p style={muted}>Precisión total: {accuracy}% · Intentos registrados: {attempts.length}</p>

          <h3>Temas a reforzar</h3>
          {weakTopics.length ? (
            <ul>
              {weakTopics.slice(0, 5).map((topic) => <li key={topic}>{topic}</li>)}
            </ul>
          ) : (
            <p style={muted}>No se detectaron debilidades críticas en esta jornada.</p>
          )}

          <button onClick={startSession} style={primaryButtonNoMargin}>Nueva jornada</button>
        </section>
      ) : !currentQuestion ? (
        <section style={card}>
          <h2>No hay preguntas para este filtro.</h2>
          <p style={muted}>Prueba con “Todas”, “Todos”, modo guiado y orden mezclado.</p>
        </section>
      ) : (
        <section style={card}>
          <div style={questionTop}>
            <span style={badge}>{stageLabel(stage)}</span>
            <span style={badge}>{currentQuestion.asignatura}</span>
            <span style={badge}>{currentQuestion.tema}</span>
            <span style={badge}>{currentQuestion.subtema}</span>
            <span style={badge}>{currentQuestion.autor}</span>
            <span style={badge}>{currentQuestion.dificultad}</span>
          </div>

          <h2 style={questionTitle}>Pregunta {currentIndex + 1} de {sessionQuestions.length}</h2>
          <div style={progressTrack}><div style={{ ...progressFill, width: `${progress}%` }} /></div>

          <p style={questionText}>{currentQuestion.pregunta}</p>

          {currentQuestion.tipo === 'desarrollo' ? (
            <>
              <textarea
                value={developmentAnswer}
                onChange={(e) => setDevelopmentAnswer(e.target.value)}
                placeholder="Escribe tu respuesta..."
                style={textarea}
              />

              {!showResult && (
                <button onClick={checkDevelopment} style={primaryButton}>Revisar respuesta</button>
              )}

              {showResult && (
                <div style={resultBox}>
                  <strong>Respuesta esperada:</strong>
                  <p>{currentQuestion.respuestaEsperada || currentQuestion.explicacion || 'Sin pauta cargada.'}</p>

                  {currentQuestion.criterios.length > 0 && (
                    <>
                      <strong>Criterios:</strong>
                      <ul>{currentQuestion.criterios.map((c, i) => <li key={i}>{c}</li>)}</ul>
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
                    disabled={showResult}
                    style={style}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}

          {showResult && currentQuestion.tipo !== 'desarrollo' && (
            <div style={resultBox}>
              <strong>{selectedAnswer === currentQuestion.correcta ? '✅ Correcta' : '❌ Incorrecta'}</strong>
              <p>{currentQuestion.explicacion || 'Sin explicación cargada.'}</p>
              {currentQuestion.errorComun && <p><strong>Error común:</strong> {currentQuestion.errorComun}</p>}
            </div>
          )}

          {showResult && (
            <button onClick={nextQuestion} style={primaryButton}>
              {currentIndex >= sessionQuestions.length - 1
                ? `Pasar a ${stageLabel(nextStage(stage))}`
                : 'Siguiente →'}
            </button>
          )}
        </section>
      )}
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statBox}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  )
}

const main: CSSProperties = { minHeight: '100vh', padding: 24, color: 'white', background: '#020617' }
const hero: CSSProperties = { padding: 24, borderRadius: 24, background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', marginBottom: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }
const heroActions: CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }
const pill: CSSProperties = { margin: 0, color: '#93c5fd', fontWeight: 900 }
const title: CSSProperties = { margin: '8px 0', fontSize: 36 }
const muted: CSSProperties = { color: '#cbd5e1', lineHeight: 1.5 }
const card: CSSProperties = { padding: 22, borderRadius: 22, background: '#0f172a', border: '1px solid rgba(255,255,255,.12)', marginBottom: 18 }
const filters: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }
const filterActions: CSSProperties = { marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }
const labelStyle: CSSProperties = { display: 'block', marginBottom: 8, fontWeight: 900 }
const select: CSSProperties = { width: '100%', padding: 14, borderRadius: 14, border: 'none', fontSize: 16 }
const stats: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 18 }
const statBox: CSSProperties = { padding: '12px 14px', borderRadius: 14, background: '#1e293b', fontWeight: 900 }
const statLabel: CSSProperties = { color: '#cbd5e1', fontSize: 13 }
const statValue: CSSProperties = { fontSize: 20, marginTop: 4 }
const notice: CSSProperties = { padding: 16, borderRadius: 16, background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.35)', marginBottom: 18, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }
const miniButton: CSSProperties = { padding: '8px 10px', borderRadius: 10, border: 'none', fontWeight: 900, cursor: 'pointer' }
const sectionTitle: CSSProperties = { marginTop: 0 }
const questionTop: CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }
const badge: CSSProperties = { padding: '7px 10px', borderRadius: 999, background: 'rgba(37,99,235,.18)', color: '#bfdbfe', fontWeight: 900, fontSize: 13 }
const questionTitle: CSSProperties = { marginTop: 0 }
const questionText: CSSProperties = { fontSize: 20, lineHeight: 1.5 }
const progressTrack: CSSProperties = { height: 9, borderRadius: 999, background: 'rgba(255,255,255,.1)', overflow: 'hidden', marginBottom: 18 }
const progressFill: CSSProperties = { height: '100%', borderRadius: 999, background: '#2563eb' }
const optionsGrid: CSSProperties = { display: 'grid', gap: 12 }
const optionButton: CSSProperties = { padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,.12)', background: '#111827', color: 'white', textAlign: 'left', cursor: 'pointer', fontSize: 16 }
const correctButton: CSSProperties = { ...optionButton, background: 'rgba(34,197,94,.28)', border: '1px solid rgba(34,197,94,.5)' }
const wrongButton: CSSProperties = { ...optionButton, background: 'rgba(239,68,68,.28)', border: '1px solid rgba(239,68,68,.5)' }
const resultBox: CSSProperties = { marginTop: 16, padding: 16, borderRadius: 16, background: '#1e293b', lineHeight: 1.5 }
const primaryButton: CSSProperties = { marginTop: 16, padding: '13px 16px', borderRadius: 14, border: 'none', background: '#2563eb', color: 'white', fontWeight: 900, cursor: 'pointer' }
const primaryButtonNoMargin: CSSProperties = { padding: '13px 16px', borderRadius: 14, border: 'none', background: '#2563eb', color: 'white', fontWeight: 900, cursor: 'pointer' }
const secondaryButton: CSSProperties = { padding: '12px 15px', borderRadius: 14, border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.08)', color: 'white', fontWeight: 900, cursor: 'pointer' }
const textarea: CSSProperties = { width: '100%', minHeight: 160, padding: 14, borderRadius: 14, background: '#020617', color: 'white', border: '1px solid rgba(255,255,255,.14)', fontSize: 16 }
