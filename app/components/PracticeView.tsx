'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type PracticeMode = 'practica' | 'diagnostico' | 'adaptativo'
type AnswerState = 'idle' | 'correct' | 'incorrect'
type Difficulty = 'facil' | 'media' | 'alta'

type Question = {
  id: string
  asignatura: string | null
  tema: string
  subtema: string
  tipo: 'seleccion_multiple' | 'desarrollo'
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

export default function PracticeView() {
  const [subjects, setSubjects] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('alta')
  const [mode, setMode] = useState<PracticeMode>('practica')

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [userId, setUserId] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [weakTopics, setWeakTopics] = useState<string[]>([])

  const currentQuestion = questions[currentIndex]

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
      answered: correctCount + wrongCount,
    }
  }, [questions.length, currentIndex, correctCount, wrongCount])

  async function loadUser() {
    const { data } = await supabase.auth.getUser()
    setUserId(data.user?.id ?? null)
  }

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
      ) as string[]

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
      ) as string[]

      setTopics(uniqueTopics)
    } catch (error) {
      console.error('LOAD TOPICS ERROR:', error)
      setTopics([])
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

  async function loadQuestions() {
    try {
      setLoading(true)
      setQuestions([])
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setAnswerState('idle')
      setCorrectCount(0)
      setWrongCount(0)
      setSeenIds([])

      let query = supabase
        .from('questions')
        .select('*')
        .eq('tipo', 'seleccion_multiple')
        .limit(80)

      if (selectedSubject) {
        query = query.eq('asignatura', selectedSubject)
      }

      if (mode === 'diagnostico') {
        query = query.eq('nivel_cognitivo', 'diagnostico')
      }

      if (mode === 'practica') {
        if (selectedTopic) query = query.eq('tema', selectedTopic)
        if (selectedDifficulty) query = query.eq('dificultad', selectedDifficulty)
      }

      if (mode === 'adaptativo') {
        if (selectedTopic) query = query.eq('tema', selectedTopic)
      }

      const { data, error } = await query

      if (error) throw error

      const cleanData = ((data ?? []) as Question[]).filter(
        (q) => q.pregunta && Array.isArray(q.opciones) && q.opciones.length === 4
      )

      const shuffled = [...cleanData].sort(() => Math.random() - 0.5)

      setQuestions(shuffled)

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

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
    } else {
      setWrongCount((prev) => prev + 1)
      if (!weakTopics.includes(currentQuestion.tema)) {
        setWeakTopics((prev) => [...prev, currentQuestion.tema])
      }
    }

    saveAttempt(currentQuestion, letter, isCorrect)
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
    setAnswerState('idle')

    if (!currentQuestion) return

    setSeenIds((prev) => [...prev, currentQuestion.id])

    if (mode === 'adaptativo') {
      const nextIndex = pickAdaptiveNextIndex()

      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex)
      }

      return
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  function restartPractice() {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswerState('idle')
    setCorrectCount(0)
    setWrongCount(0)
    setSeenIds([])
  }

  useEffect(() => {
    loadUser()
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
            Entrena con preguntas reales, diagnóstico obligatorio y modo adaptativo.
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
        <Stat label="Preguntas" value={questions.length} />
        <Stat label="Precisión" value={`${accuracy}%`} />
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
              <option value="adaptativo">Adaptativo UC</option>
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
            Selecciona una asignatura y presiona “Comenzar”. El modo adaptativo
            sube o baja dificultad según tu rendimiento.
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
              <span style={chip}>{currentQuestion.dificultad}</span>
              <span style={chip}>
                {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <div style={modeBadge}>
              {mode === 'diagnostico'
                ? 'Diagnóstico'
                : mode === 'adaptativo'
                  ? `Adaptativo · ${adaptiveDifficulty}`
                  : 'Práctica'}
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

          <div style={miniStats}>
            <span>Correctas: {correctCount}</span>
            <span>Errores: {wrongCount}</span>
            <span>Precisión: {accuracy}%</span>
            <span>Débiles: {weakTopics.length}</span>
          </div>

          <h3 style={questionTitle}>{currentQuestion.pregunta}</h3>

          <div style={optionsGrid}>
            {(currentQuestion.opciones ?? []).map((option) => {
              const letter = option.trim().slice(0, 1)
              const isSelected = selectedAnswer === letter
              const isCorrect = currentQuestion.respuesta_correcta === letter

              let optionStyle: React.CSSProperties = optionButton

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
                {answerState === 'correct' ? '✅ Correcta' : '❌ Incorrecta'}
              </div>

              <div style={feedbackText}>
                Respuesta correcta:{' '}
                <strong>{currentQuestion.respuesta_correcta}</strong>
              </div>

              {currentQuestion.explicacion && (
                <div style={feedbackText}>{currentQuestion.explicacion}</div>
              )}

              {currentQuestion.error_comun && (
                <div style={warningBox}>
                  Error común: {currentQuestion.error_comun}
                </div>
              )}

              <button onClick={nextQuestion} style={button}>
                Siguiente
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

const miniStats: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  opacity: 0.85,
  fontWeight: 800,
  fontSize: '0.9rem',
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