'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type PracticeMode =
  | 'practica'
  | 'diagnostico'
  | 'adaptativo'
  | 'simulacion'
  | 'rapido'

type AnswerState = 'idle' | 'correct' | 'incorrect'
type Difficulty = 'facil' | 'media' | 'alta'
type QuestionType = 'seleccion_multiple' | 'desarrollo'

type Evaluation = {
  id: string
  subject?: string | null
  title?: string | null
  includes_units?: string[] | null
  includes_topics?: string[] | null
  includes_authors?: string[] | null
  format?: string | null
  num_questions?: number | null
  difficulty_level?: string | null
  weight_percent?: number | null
}

type Question = {
  id: string
  asignatura: string | null
  tema: string
  subtema: string
  tipo: QuestionType
  dificultad: Difficulty
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

type Attempt = {
  questionId: string
  tema: string
  subtema: string
  tipo: QuestionType
  dificultad: Difficulty
  correct: boolean
}

const LIMITS = [5, 10, 15, 20, 30, 40, 50]
const LETTERS = ['A', 'B', 'C', 'D'] as const

function getSubjectDisplayName(subject?: string | null) {
  const map: Record<string, string> = {
    SOL500: '¿Qué es la Sociología?',
    MAT1000: 'Matemática',
    PSI1101: 'Psicología',
    IHI0204: 'Taller de fuentes I',
  }

  return subject ? map[subject] ?? subject : 'Sin ramo'
}

function normalizeMode(value?: string | null): PracticeMode {
  if (value === 'diagnostico') return 'diagnostico'
  if (value === 'adaptativo') return 'adaptativo'
  if (value === 'simulacion') return 'simulacion'
  if (value === 'rapido') return 'rapido'
  return 'practica'
}

function cleanArray(values?: string[] | null) {
  return Array.isArray(values) ? values.filter(Boolean) : []
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function normalizeDifficulty(value?: string | null): Difficulty {
  const v = (value || '').toLowerCase()
  if (v.includes('facil') || v.includes('fácil')) return 'facil'
  if (v.includes('alta')) return 'alta'
  return 'media'
}

function shuffleOptions(question: Question): Question {
  if (question.tipo !== 'seleccion_multiple' || !question.opciones?.length) {
    return question
  }

  const original = question.opciones
    .map((option, index) => ({
      originalLetter: LETTERS[index],
      text: option.replace(/^[A-D]\)\s*/i, '').trim(),
    }))
    .filter((item) => item.text)

  const correctText = original.find(
    (item) => item.originalLetter === question.respuesta_correcta
  )?.text

  const mixed = shuffle(original)
  const correctIndex = mixed.findIndex((item) => item.text === correctText)

  return {
    ...question,
    opciones: mixed.map((item, index) => `${LETTERS[index]}) ${item.text}`),
    respuesta_correcta:
      correctIndex >= 0 ? LETTERS[correctIndex] : question.respuesta_correcta,
  }
}

function modeLabel(mode: PracticeMode) {
  const labels: Record<PracticeMode, string> = {
    practica: 'Práctica libre',
    diagnostico: 'Diagnóstico UC',
    adaptativo: 'Adaptativo UC',
    simulacion: 'Simulación de prueba',
    rapido: 'Ronda corta',
  }

  return labels[mode]
}

function buildSessionHint(mode: PracticeMode, evaluation?: Evaluation | null) {
  if (evaluation) {
    return `${getSubjectDisplayName(evaluation.subject)} · ${
      evaluation.title || 'Evaluación'
    }`
  }

  if (mode === 'diagnostico') return 'Detecta debilidades antes de practicar.'
  if (mode === 'adaptativo') return 'La dificultad cambia según tu precisión.'
  if (mode === 'simulacion') return 'Entrena como si fuera una prueba real.'
  if (mode === 'rapido') return 'Haz una ronda breve para entrar en ritmo.'

  return 'Entrena por asignatura, tema, autor y dificultad.'
}

export default function PracticeView() {
  const params = useSearchParams()
  const urlEvaluationId = params.get('evaluationId')
  const urlMode = normalizeMode(params.get('mode'))

  const [subjects, setSubjects] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [sources, setSources] = useState<string[]>([])

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('alta')
  const [selectedLimit, setSelectedLimit] = useState(20)
  const [mode, setMode] = useState<PracticeMode>(urlMode)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [developmentAnswer, setDevelopmentAnswer] = useState('')
  const [answerState, setAnswerState] = useState<AnswerState>('idle')

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  const [userId, setUserId] = useState<string | null>(null)
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [weakTopics, setWeakTopics] = useState<string[]>([])

  const currentQuestion = questions[currentIndex]

  const correctCount = attempts.filter((a) => a.correct).length
  const wrongCount = attempts.filter((a) => !a.correct).length

  const accuracy = useMemo(() => {
    const total = correctCount + wrongCount
    if (total === 0) return 0
    return Math.round((correctCount / total) * 100)
  }, [correctCount, wrongCount])

  const adaptiveDifficulty = useMemo<Difficulty>(() => {
    if (accuracy < 50) return 'facil'
    if (accuracy < 80) return 'media'
    return 'alta'
  }, [accuracy])

  const stats = useMemo(() => {
    const total = questions.length
    const progress = total ? Math.round(((currentIndex + 1) / total) * 100) : 0

    return {
      total,
      progress,
      answered: attempts.length,
    }
  }, [questions.length, currentIndex, attempts.length])

  const weakSummary = useMemo(() => {
    const map = new Map<string, number>()

    for (const attempt of attempts) {
      if (!attempt.correct) {
        map.set(attempt.tema, (map.get(attempt.tema) ?? 0) + 1)
      }
    }

    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [attempts])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUserId(data.user?.id ?? null)
  }

  async function loadEvaluation(evaluationId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', evaluationId)
      .maybeSingle()

    if (error) {
      console.error('LOAD EVALUATION ERROR:', error)
      return null
    }

    return data as Evaluation | null
  }

  async function loadInitialData() {
    try {
      setInitialLoading(true)

      let loadedEvaluation: Evaluation | null = null

      if (urlEvaluationId) {
        loadedEvaluation = await loadEvaluation(urlEvaluationId)
        setEvaluation(loadedEvaluation)

        if (loadedEvaluation?.subject) {
          setSelectedSubject(loadedEvaluation.subject)
        }

        if (loadedEvaluation?.num_questions) {
          setSelectedLimit(loadedEvaluation.num_questions)
        }

        if (loadedEvaluation?.difficulty_level) {
          setSelectedDifficulty(normalizeDifficulty(loadedEvaluation.difficulty_level))
        }
      }

      const { data, error } = await supabase
        .from('questions')
        .select('asignatura, tema, referencia_autor, fuente')
        .not('asignatura', 'is', null)

      if (error) throw error

      const rows = data ?? []

      const uniqueSubjects = Array.from(
        new Set(rows.map((item) => item.asignatura).filter(Boolean))
      ) as string[]

      const uniqueTopics = Array.from(
        new Set(rows.map((item) => item.tema).filter(Boolean))
      ) as string[]

      const uniqueAuthors = Array.from(
        new Set(rows.map((item) => item.referencia_autor).filter(Boolean))
      ) as string[]

      const uniqueSources = Array.from(
        new Set(rows.map((item) => item.fuente).filter(Boolean))
      ) as string[]

      setSubjects(uniqueSubjects)
      setTopics(uniqueTopics)
      setAuthors(uniqueAuthors)
      setSources(uniqueSources)

      if (!loadedEvaluation?.subject && uniqueSubjects[0]) {
        setSelectedSubject(uniqueSubjects[0])
      }
    } catch (error) {
      console.error('LOAD INITIAL DATA ERROR:', error)
      alert('No se pudo cargar la práctica.')
    } finally {
      setInitialLoading(false)
    }
  }

  async function loadTopicsBySubject(subject: string) {
    if (!subject) return

    try {
      let query = supabase
        .from('questions')
        .select('tema, referencia_autor, fuente')
        .eq('asignatura', subject)

      const { data, error } = await query

      if (error) throw error

      setTopics(
        Array.from(new Set((data ?? []).map((item) => item.tema).filter(Boolean)))
      )

      setAuthors(
        Array.from(
          new Set((data ?? []).map((item) => item.referencia_autor).filter(Boolean))
        )
      )

      setSources(
        Array.from(new Set((data ?? []).map((item) => item.fuente).filter(Boolean)))
      )
    } catch (error) {
      console.error('LOAD FILTER DATA ERROR:', error)
    }
  }

  async function loadWeakTopics(currentUserId: string) {
    const { data, error } = await supabase
      .from('user_topic_stats')
      .select('tema, mastery_score')
      .eq('user_id', currentUserId)
      .lt('mastery_score', 70)

    if (error) {
      console.error('LOAD WEAK TOPICS ERROR:', error)
      setWeakTopics([])
      return
    }

    setWeakTopics((data ?? []).map((item) => item.tema).filter(Boolean))
  }

  function resetSession() {
    setQuestions([])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setDevelopmentAnswer('')
    setAnswerState('idle')
    setAttempts([])
    setSeenIds([])
    setSessionStarted(false)
    setFinished(false)
  }

  async function loadQuestions() {
    try {
      setLoading(true)
      setQuestions([])
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setDevelopmentAnswer('')
      setAnswerState('idle')
      setAttempts([])
      setSeenIds([])
      setFinished(false)

      let query = supabase.from('questions').select('*').limit(200)

      if (selectedSubject) {
        query = query.eq('asignatura', selectedSubject)
      }

      if (evaluation) {
        const evaluationTopics = cleanArray(evaluation.includes_topics)
        const evaluationAuthors = cleanArray(evaluation.includes_authors)

        if (evaluationTopics.length > 0) {
          query = query.in('tema', evaluationTopics)
        }

        if (evaluationAuthors.length > 0) {
          query = query.in('referencia_autor', evaluationAuthors)
        }
      }

      if (!evaluation && selectedTopic) query = query.eq('tema', selectedTopic)
      if (!evaluation && selectedAuthor) query = query.eq('referencia_autor', selectedAuthor)
      if (!evaluation && selectedSource) query = query.eq('fuente', selectedSource)

      if (mode === 'diagnostico') {
        query = query.eq('tipo', 'seleccion_multiple').eq('nivel_cognitivo', 'diagnostico')
      }

      if (mode === 'practica') {
        query = query.eq('dificultad', selectedDifficulty)
      }

      if (mode === 'rapido') {
        query = query.eq('tipo', 'seleccion_multiple')
      }

      const { data, error } = await query

      if (error) throw error

      let cleanData = ((data ?? []) as Question[]).filter((q) => {
        if (!q.pregunta) return false
        if (q.tipo === 'seleccion_multiple') {
          return Array.isArray(q.opciones) && q.opciones.length >= 2
        }

        return q.tipo === 'desarrollo'
      })

      if (mode === 'simulacion') {
        const multiple = cleanData.filter((q) => q.tipo === 'seleccion_multiple')
        const development = cleanData.filter((q) => q.tipo === 'desarrollo')

        cleanData = [
          ...shuffle(multiple).slice(0, Math.max(4, selectedLimit - 2)),
          ...shuffle(development).slice(0, 2),
        ]
      }

      if (mode === 'adaptativo') {
        cleanData = cleanData.filter((q) => q.tipo === 'seleccion_multiple')
      }

      const limit = mode === 'rapido' ? 5 : selectedLimit

      const shuffled = shuffle(cleanData)
        .slice(0, limit)
        .map(shuffleOptions)

      setQuestions(shuffled)
      setSessionStarted(true)

      if (userId) {
        await loadWeakTopics(userId)
      }
    } catch (error) {
      console.error('LOAD QUESTIONS ERROR:', error)
      alert('No se pudieron cargar las preguntas.')
    } finally {
      setLoading(false)
    }
  }

  async function saveAttempt(question: Question, selected: string, isCorrect: boolean) {
    if (!userId) return

    const { error } = await supabase.from('user_question_attempts').insert({
      user_id: userId,
      question_id: question.id,
      selected_answer: selected,
      is_correct: isCorrect,
      tema: question.tema,
      subtema: question.subtema,
      dificultad: question.dificultad,
      nivel_cognitivo: question.nivel_cognitivo,
    })

    if (error) {
      console.error('SAVE ATTEMPT ERROR:', error)
      return
    }

    await updateTopicStats(question.tema, isCorrect)
  }

  async function updateTopicStats(tema: string, isCorrect: boolean) {
    if (!userId || !tema) return

    const { data, error } = await supabase
      .from('user_topic_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('tema', tema)
      .maybeSingle()

    if (error) {
      console.error('GET TOPIC STATS ERROR:', error)
      return
    }

    if (!data) {
      await supabase.from('user_topic_stats').insert({
        user_id: userId,
        tema,
        total_attempts: 1,
        correct_attempts: isCorrect ? 1 : 0,
        wrong_attempts: isCorrect ? 0 : 1,
        mastery_score: isCorrect ? 100 : 0,
        last_attempt_at: new Date().toISOString(),
      })

      return
    }

    const total = Number(data.total_attempts ?? 0) + 1
    const correct = Number(data.correct_attempts ?? 0) + (isCorrect ? 1 : 0)
    const wrong = total - correct
    const mastery = Math.round((correct / total) * 100)

    await supabase
      .from('user_topic_stats')
      .update({
        total_attempts: total,
        correct_attempts: correct,
        wrong_attempts: wrong,
        mastery_score: mastery,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('id', data.id)
  }

  function handleAnswer(letter: string) {
    if (!currentQuestion || selectedAnswer) return

    const isCorrect = letter === currentQuestion.respuesta_correcta

    setSelectedAnswer(letter)
    setAnswerState(isCorrect ? 'correct' : 'incorrect')

    setAttempts((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        tema: currentQuestion.tema,
        subtema: currentQuestion.subtema,
        tipo: currentQuestion.tipo,
        dificultad: currentQuestion.dificultad,
        correct: isCorrect,
      },
    ])

    if (!isCorrect && !weakTopics.includes(currentQuestion.tema)) {
      setWeakTopics((prev) => [...prev, currentQuestion.tema])
    }

    saveAttempt(currentQuestion, letter, isCorrect)
  }

  function checkDevelopment() {
    if (!currentQuestion || !developmentAnswer.trim()) return

    setSelectedAnswer('DESARROLLO')
    setAnswerState('correct')

    setAttempts((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        tema: currentQuestion.tema,
        subtema: currentQuestion.subtema,
        tipo: currentQuestion.tipo,
        dificultad: currentQuestion.dificultad,
        correct: true,
      },
    ])
  }

  function pickAdaptiveNextIndex() {
    const candidates = questions.filter((q) => !seenIds.includes(q.id))
    if (candidates.length === 0) return -1

    const weakCandidates = candidates.filter(
      (q) => weakTopics.includes(q.tema) && q.dificultad === adaptiveDifficulty
    )

    const difficultyCandidates = candidates.filter(
      (q) => q.dificultad === adaptiveDifficulty
    )

    const finalPool =
      weakCandidates.length > 0
        ? weakCandidates
        : difficultyCandidates.length > 0
          ? difficultyCandidates
          : candidates

    const selected = finalPool[Math.floor(Math.random() * finalPool.length)]
    return questions.findIndex((q) => q.id === selected.id)
  }

  function nextQuestion() {
    setSelectedAnswer(null)
    setDevelopmentAnswer('')
    setAnswerState('idle')

    if (!currentQuestion) return

    setSeenIds((prev) => [...prev, currentQuestion.id])

    if (mode === 'adaptativo') {
      const nextIndex = pickAdaptiveNextIndex()

      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex)
        return
      }

      setFinished(true)
      return
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }

    setFinished(true)
  }

  function restartPractice() {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setDevelopmentAnswer('')
    setAnswerState('idle')
    setAttempts([])
    setSeenIds([])
    setFinished(false)
  }

  useEffect(() => {
    loadUser()
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      loadTopicsBySubject(selectedSubject)
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
          <div style={premiumPill}>Motor UC</div>
          <h2 style={title}>🧠 Práctica inteligente</h2>
          <p style={subtitle}>
            {buildSessionHint(mode, evaluation)}
          </p>
        </div>

        <div style={actions}>
          <button onClick={loadQuestions} disabled={loading} style={button}>
            {loading ? 'Cargando...' : sessionStarted ? 'Nueva sesión' : 'Comenzar'}
          </button>

          {questions.length > 0 && (
            <button onClick={restartPractice} style={secondaryButton}>
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {evaluation && (
        <div style={evaluationBanner}>
          <div>
            <strong>
              {evaluation.subject} · {getSubjectDisplayName(evaluation.subject)}
            </strong>
            <p style={smallText}>
              {evaluation.title || 'Evaluación'} · {evaluation.format || 'Formato no cargado'} ·{' '}
              {evaluation.weight_percent ?? 0}%
            </p>
          </div>

          <span style={modeBadge}>{modeLabel(mode)}</span>
        </div>
      )}

      <div style={statsGrid}>
        <Stat label="Preguntas" value={questions.length} />
        <Stat label="Respondidas" value={attempts.length} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="Nivel sugerido" value={adaptiveDifficulty} />
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
              disabled={Boolean(evaluation)}
              style={{
                ...select,
                opacity: evaluation ? 0.55 : 1,
              }}
            >
              <option value="">Selecciona asignatura</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject} · {getSubjectDisplayName(subject)}
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
              <option value="diagnostico">Diagnóstico UC</option>
              <option value="adaptativo">Adaptativo UC</option>
              <option value="simulacion">Simulación</option>
              <option value="rapido">Ronda corta</option>
            </select>
          </div>

          <div style={field}>
            <label style={label}>Cantidad</label>
            <select
              value={selectedLimit}
              onChange={(e) => setSelectedLimit(Number(e.target.value))}
              style={select}
            >
              {LIMITS.map((limit) => (
                <option key={limit} value={limit}>
                  {limit} preguntas
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Tema</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={mode === 'diagnostico' || Boolean(evaluation)}
              style={{
                ...select,
                opacity: mode === 'diagnostico' || evaluation ? 0.55 : 1,
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
            <label style={label}>Autor</label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              disabled={Boolean(evaluation)}
              style={{
                ...select,
                opacity: evaluation ? 0.55 : 1,
              }}
            >
              <option value="">Todos</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Fuente / clase</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={Boolean(evaluation)}
              style={{
                ...select,
                opacity: evaluation ? 0.55 : 1,
              }}
            >
              <option value="">Todas</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Dificultad</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
              disabled={mode !== 'practica'}
              style={{
                ...select,
                opacity: mode !== 'practica' ? 0.55 : 1,
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
            Presiona “Comenzar”. Si vienes desde Home, la práctica ya está filtrada
            por la evaluación seleccionada.
          </p>
        </div>
      )}

      {finished && (
        <div style={summaryCard}>
          <h3 style={sectionTitle}>✅ Sesión terminada</h3>
          <p style={emptyText}>
            Precisión: <strong>{accuracy}%</strong> · Correctas: {correctCount} ·
            Errores: {wrongCount}
          </p>

          {weakSummary.length > 0 ? (
            <div style={weakBox}>
              <strong>Temas a reforzar:</strong>
              <ul>
                {weakSummary.slice(0, 5).map(([topic, count]) => (
                  <li key={topic}>
                    {topic}: {count} error(es)
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={emptyText}>No se detectaron debilidades fuertes en esta ronda.</p>
          )}

          <button onClick={loadQuestions} style={button}>
            Hacer otra ronda
          </button>
        </div>
      )}

      {currentQuestion && !finished && (
        <div style={questionCard}>
          <div style={questionHeader}>
            <div style={chips}>
              <span style={chip}>{currentQuestion.asignatura ?? 'General'}</span>
              <span style={chip}>{currentQuestion.tema}</span>
              <span style={chip}>{currentQuestion.subtema}</span>
              <span style={chip}>{currentQuestion.dificultad}</span>
              <span style={chip}>{currentQuestion.tipo}</span>
              <span style={chip}>
                {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <div style={modeBadge}>
              {mode === 'adaptativo'
                ? `Adaptativo · ${adaptiveDifficulty}`
                : modeLabel(mode)}
            </div>
          </div>

          <div style={progressTrack}>
            <div style={{ ...progressFill, width: `${stats.progress}%` }} />
          </div>

          <div style={miniStats}>
            <span>Correctas: {correctCount}</span>
            <span>Errores: {wrongCount}</span>
            <span>Precisión: {accuracy}%</span>
            <span>Débiles: {weakTopics.length}</span>
          </div>

          <h3 style={questionTitle}>{currentQuestion.pregunta}</h3>

          {currentQuestion.tipo === 'desarrollo' ? (
            <div style={developmentBox}>
              <textarea
                value={developmentAnswer}
                onChange={(e) => setDevelopmentAnswer(e.target.value)}
                placeholder="Escribe tu respuesta de desarrollo..."
                style={textarea}
              />

              {!selectedAnswer && (
                <button onClick={checkDevelopment} style={button}>
                  Revisar desarrollo
                </button>
              )}
            </div>
          ) : (
            <div style={optionsGrid}>
              {(currentQuestion.opciones ?? []).map((option) => {
                const letter = option.trim().slice(0, 1)
                const isSelected = selectedAnswer === letter
                const isCorrect = currentQuestion.respuesta_correcta === letter

                let optionStyle: CSSProperties = optionButton

                if (selectedAnswer && isCorrect) {
                  optionStyle = { ...optionButton, ...correctOption }
                }

                if (selectedAnswer && isSelected && !isCorrect) {
                  optionStyle = { ...optionButton, ...wrongOption }
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
          )}

          {selectedAnswer && (
            <div
              style={{
                ...feedbackBox,
                ...(answerState === 'correct' ? feedbackCorrect : feedbackIncorrect),
              }}
            >
              <div style={feedbackTitle}>
                {currentQuestion.tipo === 'desarrollo'
                  ? '✍️ Desarrollo revisado'
                  : answerState === 'correct'
                    ? '✅ Correcta'
                    : '❌ Incorrecta'}
              </div>

              {currentQuestion.tipo === 'seleccion_multiple' && (
                <div style={feedbackText}>
                  Respuesta correcta:{' '}
                  <strong>{currentQuestion.respuesta_correcta}</strong>
                </div>
              )}

              {currentQuestion.explicacion && (
                <div style={feedbackText}>{currentQuestion.explicacion}</div>
              )}

              {currentQuestion.respuesta_esperada && (
                <div style={feedbackText}>
                  <strong>Respuesta esperada:</strong>{' '}
                  {currentQuestion.respuesta_esperada}
                </div>
              )}

              {currentQuestion.criterios_evaluacion?.length ? (
                <div style={warningBox}>
                  <strong>Criterios:</strong>
                  <ul>
                    {currentQuestion.criterios_evaluacion.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {currentQuestion.error_comun && (
                <div style={warningBox}>
                  Error común: {currentQuestion.error_comun}
                </div>
              )}

              <button onClick={nextQuestion} style={button}>
                {currentIndex >= questions.length - 1 ? 'Finalizar' : 'Siguiente'}
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

const container: CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const premiumPill: CSSProperties = {
  width: 'fit-content',
  padding: '7px 11px',
  borderRadius: 999,
  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
  fontWeight: 900,
  marginBottom: 8,
}

const heroCard: CSSProperties = {
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

const title: CSSProperties = {
  margin: 0,
  fontSize: '1.7rem',
  fontWeight: 950,
}

const subtitle: CSSProperties = {
  marginTop: '8px',
  opacity: 0.78,
  lineHeight: 1.5,
  maxWidth: '680px',
}

const actions: CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const button: CSSProperties = {
  padding: '11px 15px',
  borderRadius: '13px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const secondaryButton: CSSProperties = {
  padding: '11px 15px',
  borderRadius: '13px',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.07)',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const evaluationBanner: CSSProperties = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(37,99,235,0.12)',
  border: '1px solid rgba(37,99,235,0.22)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const smallText: CSSProperties = {
  margin: '6px 0 0',
  opacity: 0.78,
  lineHeight: 1.45,
}

const statsGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
}

const statCard: CSSProperties = {
  padding: '16px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.11)',
}

const statLabel: CSSProperties = {
  opacity: 0.72,
  fontSize: '0.9rem',
}

const statValue: CSSProperties = {
  marginTop: '8px',
  fontSize: '1.45rem',
  fontWeight: 950,
}

const card: CSSProperties = {
  padding: '18px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.055)',
  border: '1px solid rgba(255,255,255,0.11)',
}

const filterGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
}

const field: CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: CSSProperties = {
  fontWeight: 850,
  fontSize: '0.92rem',
}

const select: CSSProperties = {
  padding: '12px',
  borderRadius: '13px',
  background: 'white',
  color: '#0f172a',
  border: 'none',
  outline: 'none',
  fontWeight: 700,
}

const sectionTitle: CSSProperties = {
  marginTop: 0,
  fontWeight: 900,
}

const emptyText: CSSProperties = {
  opacity: 0.78,
  lineHeight: 1.55,
}

const summaryCard: CSSProperties = {
  padding: '20px',
  borderRadius: '22px',
  background: 'rgba(34,197,94,0.10)',
  border: '1px solid rgba(34,197,94,0.22)',
}

const weakBox: CSSProperties = {
  marginTop: '12px',
  padding: '14px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.06)',
  lineHeight: 1.55,
}

const questionCard: CSSProperties = {
  padding: '22px',
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  display: 'grid',
  gap: '18px',
}

const questionHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
}

const chips: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}

const chip: CSSProperties = {
  padding: '7px 10px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.10)',
  fontSize: '0.82rem',
  fontWeight: 800,
}

const modeBadge: CSSProperties = {
  padding: '7px 11px',
  borderRadius: '999px',
  background: 'rgba(37,99,235,0.22)',
  color: '#bfdbfe',
  border: '1px solid rgba(37,99,235,0.30)',
  fontWeight: 900,
  fontSize: '0.82rem',
}

const progressTrack: CSSProperties = {
  height: '9px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.08)',
  overflow: 'hidden',
}

const progressFill: CSSProperties = {
  height: '100%',
  borderRadius: '999px',
  background: '#2563eb',
}

const miniStats: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  opacity: 0.85,
  fontWeight: 800,
  fontSize: '0.9rem',
}

const questionTitle: CSSProperties = {
  margin: 0,
  fontSize: '1.35rem',
  lineHeight: 1.45,
  fontWeight: 950,
}

const optionsGrid: CSSProperties = {
  display: 'grid',
  gap: '12px',
}

const optionButton: CSSProperties = {
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

const correctOption: CSSProperties = {
  border: '1px solid rgba(34,197,94,0.75)',
  background: 'rgba(34,197,94,0.16)',
}

const wrongOption: CSSProperties = {
  border: '1px solid rgba(239,68,68,0.75)',
  background: 'rgba(239,68,68,0.16)',
}

const developmentBox: CSSProperties = {
  display: 'grid',
  gap: '12px',
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

const feedbackBox: CSSProperties = {
  display: 'grid',
  gap: '10px',
  padding: '16px',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.12)',
}

const feedbackCorrect: CSSProperties = {
  background: 'rgba(34,197,94,0.12)',
}

const feedbackIncorrect: CSSProperties = {
  background: 'rgba(239,68,68,0.12)',
}

const feedbackTitle: CSSProperties = {
  fontWeight: 950,
  fontSize: '1.05rem',
}

const feedbackText: CSSProperties = {
  opacity: 0.86,
  lineHeight: 1.55,
}

const warningBox: CSSProperties = {
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(245,158,11,0.14)',
  border: '1px solid rgba(245,158,11,0.24)',
  color: '#fde68a',
  lineHeight: 1.45,
}