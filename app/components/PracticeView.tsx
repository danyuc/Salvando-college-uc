// ===== PARTE 1/3 =====
'use client'

import {getSubjectName, getSubjectMeta} from '../../lib/subjects'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties
} from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

/* ================= TYPES ================= */

type PracticeMode =
  | 'practica'
  | 'diagnostico'
  | 'adaptativo'
  | 'simulacion'
  | 'rapido'

type AnswerState = 'idle' | 'correct' | 'incorrect'
type Difficulty = 'facil' | 'media' | 'alta'
type QuestionType = 'seleccion_multiple' | 'desarrollo'

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
  fuente: string | null
}

type Attempt = {
  questionId: string
  tema: string
  subtema: string
  dificultad: Difficulty
  correct: boolean
  time: number
}

/* ================= CONSTANTES ================= */

const LIMITS = [5, 10, 15, 20, 30, 40, 50]
const LETTERS = ['A', 'B', 'C', 'D'] as const

/* ================= HELPERS ================= */

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function normalizeDifficulty(value?: string | null): Difficulty {
  const v = (value || '').toLowerCase()
  if (v.includes('facil') || v.includes('fácil')) return 'facil'
  if (v.includes('alta')) return 'alta'
  return 'media'
}

/* ================= MOTOR DE FATIGA ================= */

function detectFatigue(attempts: Attempt[]) {
  if (attempts.length < 5) return 'normal'

  const last = attempts.slice(-5)
  const wrong = last.filter(a => !a.correct).length

  if (wrong >= 4) return 'alta'
  if (wrong >= 3) return 'media'

  return 'normal'
}

/* ================= MOTOR ADAPTATIVO ================= */

function getAdaptiveDifficulty(attempts: Attempt[]): Difficulty {
  if (attempts.length === 0) return 'media'

  const correct = attempts.filter(a => a.correct).length
  const acc = correct / attempts.length

  if (acc < 0.5) return 'facil'
  if (acc < 0.8) return 'media'
  return 'alta'
}

/* ================= PREDICTOR BASE ================= */

function predictScore(attempts: Attempt[]) {
  if (attempts.length === 0) return 4.0

  const correct = attempts.filter(a => a.correct).length
  const acc = correct / attempts.length

  // escala chilena
  return Number((1 + acc * 6).toFixed(1))
}
// ===== PARTE 2/3 =====

export default function PracticeView() {
  const router = useRouter()
  const params = useSearchParams()

  const urlSubject = params.get('subject') || ''
  const urlMode = (params.get('mode') || '') as PracticeMode

  const [userId, setUserId] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])

  const [selectedSubject, setSelectedSubject] = useState(urlSubject)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [selectedClassSource, setSelectedClassSource] = useState('')
  const [authors, setAuthors] = useState<string[]>([])
  const [classSources, setClassSources] = useState<string[]>([])
  const [selectedLimit, setSelectedLimit] = useState(20)
  const [mode, setMode] = useState<PracticeMode>(urlMode)

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [weakTopics, setWeakTopics] = useState<string[]>([])
  const [guidedFocus, setGuidedFocus] = useState<string | null>(null)
  const [guidedMessage, setGuidedMessage] = useState(
    'Modo guiado listo: partiré reforzando tus temas débiles.'
  )
  const [tutorExplanation, setTutorExplanation] = useState('')
  const [questionStart, setQuestionStart] = useState(Date.now())

  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [diagnosticRequired, setDiagnosticRequired] = useState(false)
  const [finished, setFinished] = useState(false)

  const currentQuestion = questions[currentIndex]

  const fatigue = useMemo(() => detectFatigue(attempts), [attempts])
  const adaptiveDifficulty = useMemo(() => getAdaptiveDifficulty(attempts), [attempts])
  const predictedScore = useMemo(() => predictScore(attempts), [attempts])
  const isGuidedMode = mode === 'practica' || mode === 'adaptativo' || mode === 'simulacion'
  const subjectMeta = useMemo(() => getSubjectMeta(selectedSubject), [selectedSubject])
  const isExamMode = mode === 'simulacion'

  const modeInfo = {
    practica: {
      title: '🧠 Modo guiado UC activo',
      text: 'Refuerza tus temas débiles con apoyo inmediato y práctica inteligente.',
    },
    adaptativo: {
      title: '⚙️ Modo adaptativo activo',
      text: 'La dificultad se ajusta según tus respuestas: si aciertas sube, si fallas baja.',
    },
    simulacion: {
      title: '🧪 Modo prueba UC real',
      text: 'Simula una evaluación real: temporizador, presión progresiva y feedback solo al final.',
    },
    rapido: {
      title: '⚡ Ronda corta activa',
      text: 'Sesión breve para repasar rápido sin sobrecargarte.',
    },
    diagnostico: {
      title: '🔍 Diagnóstico activo',
      text: 'Detecta fortalezas y debilidades para personalizar tu entrenamiento.',
    },
  }[mode] || {
    title: '🧠 Práctica inteligente',
    text: 'Sesión personalizada según tu avance.',
  }
  const [examDurationMinutes, setExamDurationMinutes] = useState(45)
  const [sessionStyle, setSessionStyle] = useState<'auto' | 'pomodoro25' | 'deep50' | 'custom'>('auto')
  const [customMinutes, setCustomMinutes] = useState(45)
  const [examSecondsLeft, setExamSecondsLeft] = useState(45 * 60)
  const [examDurationOption, setExamDurationOption] = useState<'auto' | '30' | '45' | '60' | '90'>('auto')
  const [savedPrediction, setSavedPrediction] = useState<number | null>(null)
  const [mentalState, setMentalState] = useState('calibrado')
  const [colorPerformance, setColorPerformance] = useState<Record<string, { attempts: number; correct: number }>>({})

  function resolveSessionMinutes() {
    if (mode === 'simulacion') {
      if (examDurationOption !== 'auto') return Number(examDurationOption)
      return selectedLimit <= 10 ? 25 : selectedLimit <= 20 ? 45 : 60
    }

    if (mode === 'rapido') return 10
    if (selectedLimit <= 10) return 20
    if (selectedLimit <= 20) return 30
    return 45
  }

  const correctCount = attempts.filter(a => a.correct).length
  const wrongCount = attempts.filter(a => !a.correct).length
  const accuracy = attempts.length
    ? Math.round((correctCount / attempts.length) * 100)
    : 0

  async function init() {
    try {
      setLoading(true)

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
        return
      }

      setUserId(data.user.id)

      const { data: questionMeta, error } = await supabase
        .from('questions')
        .select('*')
        .not('asignatura', 'is', null)

      if (error) throw error

      const rows = questionMeta || []

      const uniqueSubjects = Array.from(
        new Set(rows.map((r) => r.asignatura).filter(Boolean))
      ) as string[]

      const uniqueTopics = Array.from(
        new Set(rows.map((r) => r.tema).filter(Boolean))
      ) as string[]

      const fallbackSubjects = ['SOL500', 'MAT1000', 'PSI1101', 'IHI0204']

      const finalSubjects = Array.from(
        new Set([
          ...uniqueSubjects,
          'SOL500',
          'MAT1000',
          'PSI1101',
          'IHI0204',
        ])
      )

      const uniqueAuthors = Array.from(
        new Set(
          rows
            .map((r: any) => r.autor || r.author || r.profesor || r.docente)
            .filter(Boolean)
        )
      ) as string[]

      const uniqueClassSources = Array.from(
        new Set(
          rows
            .map((r: any) => r.clase_fuente || r.fuente || r.clase || r.lectura || r.material || r.source)
            .filter(Boolean)
        )
      ) as string[]

      setSubjects(finalSubjects)
      setTopics(uniqueTopics)
      setAuthors(uniqueAuthors)
      setClassSources(uniqueClassSources)

      // 🔥 BUSCAR DIAGNÓSTICO COMPLETADO PRIMERO
      const { data: diag } = await supabase
        .from('subject_diagnostics')
        .select('*')
        .eq('user_id', data.user.id)
        .eq('completed', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const firstSubject =
        urlSubject ||
        diag?.subject ||
        uniqueSubjects[0] ||
        ''

      setSelectedSubject(firstSubject)

      if (firstSubject) {
        await checkDiagnostic(data.user.id, firstSubject)
      }
    } catch (error) {
      console.error('PRACTICE INIT ERROR:', error)
      alert('No se pudo cargar la práctica.')
    } finally {
      setLoading(false)
    }
  }

  async function checkDiagnostic(currentUserId: string, subject: string) {
    const subjectName = getSubjectName(subject)

    const { data, error } = await supabase
      .from('subject_diagnostics')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('DIAGNOSTIC CHECK ERROR:', error)
      setDiagnosticRequired(true)
      return false
    }

    const match = (data || []).find((diag: any) => {
      const diagSubject = String(diag.subject || '')
      return diagSubject === subject || diagSubject === subjectName || getSubjectName(diagSubject) === subjectName
    })

    if (!match) {
      setDiagnosticRequired(true)
      return false
    }

    setSelectedSubject(match.subject || subject)
    setDiagnosticRequired(false)

    if (Array.isArray(match.weak_topics)) {
      setWeakTopics(match.weak_topics)
      setGuidedFocus(match.weak_topics[0] || null)
    }

    return true
  }

  async function loadQuestions() {
    if (!userId || !selectedSubject) {
      alert('Selecciona una asignatura.')
      return
    }

    if (!mode) {
      alert('Selecciona un modo de práctica.')
      return
    }

    if (!mode) {
      alert('Selecciona un modo de práctica.')
      return
    }

    if (!mode) {
      alert('Selecciona un modo de práctica.')
      return
    }

    const canContinue = await checkDiagnostic(userId, selectedSubject)

    if (!canContinue) {
      setQuestions([])
      return
    }

    try {
      setSessionLoading(true)
      setFinished(false)
      if (isExamMode) setExamSecondsLeft(resolveSessionMinutes() * 60)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setAnswerState('idle')
      setAttempts([])
      setQuestionStart(Date.now())

      const subjectLabel = getSubjectName(selectedSubject)

      let query = supabase
        .from('questions')
        .select('*')
        .or(`asignatura.eq.${subjectLabel},asignatura.eq.${selectedSubject}`)
        .limit(300)

      if (selectedTopic) {
        query = query.eq('tema', selectedTopic)
      }

      if (selectedAuthor) {
        query = query.eq('autor', selectedAuthor)
      }

      if (selectedClassSource) {
        query = query.or(
          `clase_fuente.eq.${selectedClassSource},fuente.eq.${selectedClassSource},clase.eq.${selectedClassSource}`
        )
      }

      if (mode === 'rapido') {
        query = query.eq('tipo', 'seleccion_multiple')
      }

      if (mode === 'adaptativo') {
        query = query.eq('tipo', 'seleccion_multiple')
      }

      if (mode === 'diagnostico') {
        query = query.eq('tipo', 'seleccion_multiple')
      }

      const { data, error } = await query

      if (error) throw error

      let clean = ((data || []) as Question[]).filter(q => {
        if (selectedAuthor) {
          const authorValue = String(
            (q as any).autor || (q as any).author || (q as any).profesor || (q as any).docente || ''
          )
          if (authorValue !== selectedAuthor) return false
        }

        if (selectedClassSource) {
          const sourceValue = String(
            (q as any).clase_fuente || (q as any).fuente || (q as any).clase || (q as any).lectura || (q as any).material || (q as any).source || ''
          )
          if (sourceValue !== selectedClassSource) return false
        }

        if (!q.pregunta) return false
        if (q.tipo === 'seleccion_multiple') {
          return Array.isArray(q.opciones) && q.opciones.length >= 2
        }
        return q.tipo === 'desarrollo'
      })

      if (mode === 'practica') {
        const byDifficulty = clean.filter(q => q.dificultad === adaptiveDifficulty)
        clean = byDifficulty.length > 0 ? byDifficulty : clean
      }

      if (mode === 'simulacion') {
        const multiple = clean.filter(q => q.tipo === 'seleccion_multiple')
        const desarrollo = clean.filter(q => q.tipo === 'desarrollo')

        clean = [
          ...shuffle(multiple).slice(0, Math.max(6, selectedLimit - 2)),
          ...shuffle(desarrollo).slice(0, 2),
        ]
      }

      const limit = mode === 'rapido' ? 5 : selectedLimit
      const weakSet = new Set(weakTopics)

      let prioritized: Question[] = []

      if (isGuidedMode && weakTopics.length > 0) {
        const weak = clean.filter(q => weakSet.has(q.tema))
        const rest = clean.filter(q => !weakSet.has(q.tema))

        prioritized = [
          ...shuffle(weak),
          ...shuffle(rest),
        ]

        setGuidedFocus(weak[0]?.tema || weakTopics[0] || null)
        setGuidedMessage(
          weak.length > 0
            ? `Estoy reforzando tu debilidad principal: ${weak[0]?.tema || weakTopics[0]}.`
            : 'No encontré preguntas exactas de tu debilidad, así que usaré práctica general adaptativa.'
        )
      } else {
        prioritized = shuffle(clean)
        setGuidedFocus(null)
        setGuidedMessage('Modo práctica general: iré ajustando según tus respuestas.')
      }

      setQuestions(prioritized.slice(0, limit))
    } catch (error) {
      console.error('LOAD QUESTIONS ERROR:', error)
      alert('No se pudieron cargar las preguntas.')
    } finally {
      setSessionLoading(false)
    }
  }

  async function saveAttempt(question: Question, selected: string, correct: boolean, time: number) {
    if (!userId) return

    await supabase.from('user_question_attempts').insert({
      user_id: userId,
      question_id: question.id,
      selected_answer: selected,
      is_correct: correct,
      tema: question.tema,
      subtema: question.subtema,
      dificultad: question.dificultad,
      nivel_cognitivo: question.nivel_cognitivo,
      response_time_seconds: time,
    })

    await updateTopicStats(question.tema, correct)
  }

  async function updateTopicStats(topic: string, correct: boolean) {
    if (!userId || !topic) return

    const { data } = await supabase
      .from('user_topic_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('tema', topic)
      .maybeSingle()

    if (!data) {
      await supabase.from('user_topic_stats').insert({
        user_id: userId,
        tema: topic,
        total_attempts: 1,
        correct_attempts: correct ? 1 : 0,
        wrong_attempts: correct ? 0 : 1,
        mastery_score: correct ? 100 : 0,
        last_attempt_at: new Date().toISOString(),
      })
      return
    }

    const total = Number(data.total_attempts || 0) + 1
    const correctTotal = Number(data.correct_attempts || 0) + (correct ? 1 : 0)
    const mastery = Math.round((correctTotal / total) * 100)

    await supabase
      .from('user_topic_stats')
      .update({
        total_attempts: total,
        correct_attempts: correctTotal,
        wrong_attempts: total - correctTotal,
        mastery_score: mastery,
        last_attempt_at: new Date().toISOString(),
      })
      .eq('id', data.id)
  }

  function answer(letter: string) {
    if (!currentQuestion || selectedAnswer) return

    const correct = letter === currentQuestion.respuesta_correcta
    const time = Math.round((Date.now() - questionStart) / 1000)

    setSelectedAnswer(letter)
    setAnswerState(correct ? 'correct' : 'incorrect')

    const attempt: Attempt = {
      questionId: currentQuestion.id,
      tema: currentQuestion.tema,
      subtema: currentQuestion.subtema,
      dificultad: currentQuestion.dificultad,
      correct,
      time,
    }

    setAttempts(prev => [...prev, attempt])

    if (!correct && !weakTopics.includes(currentQuestion.tema)) {
      setWeakTopics(prev => [...prev, currentQuestion.tema])
    }

    saveAttempt(currentQuestion, letter, correct, time)
  }

  function nextQuestion() {
    setSelectedAnswer(null)
    setAnswerState('idle')
    setQuestionStart(Date.now())

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      return
    }

    setFinished(true)
  }

  function restartSession() {
    setQuestions([])
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswerState('idle')
    setAttempts([])
    setFinished(false)
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (loading) {
    const subjectMeta = getSubjectMeta(selectedSubject)

  return (
      <main style={container}>
        <section style={card}>Cargando práctica inteligente...</section>
      </main>
    )
  }

  return (
    <main style={container}>
      <section style={{
        ...hero,
        background: `linear-gradient(135deg, ${subjectMeta.color}66, rgba(15,23,42,0.96))`,
        border: `1px solid ${subjectMeta.color}55`,
        boxShadow: `0 0 46px ${subjectMeta.color}22`,
        transition: 'all 450ms ease',
      }}>
        <div>
          <div style={pill}>Motor UC</div>
          <h1 style={title}>{subjectMeta.icon} Práctica inteligente</h1>
          <p style={subtitle}>
            Diagnóstico obligatorio, dificultad adaptativa, fatiga cognitiva y foco en debilidades.
          </p>
        </div>

        <div style={heroStats}>
          <strong>{(savedPrediction ?? predictedScore).toFixed(1)}</strong>
          <span>predicción sesión</span>
        </div>
      </section>

      {diagnosticRequired && (
        <section style={diagnosticBlock}>
          <h2>🔒 Diagnóstico obligatorio</h2>
          <p>
            TIENES QUE HACER EL DIAGNÓSTICO AHORA PARA CONTINUAR Y DARTE LA MEJOR EXPERIENCIA.
          </p>

          <button
            style={button}
            onClick={() =>
              router.push(
                `/diagnostico?subject=${selectedSubject}&next=${encodeURIComponent(
                  `/practica?subject=${selectedSubject}`
                )}`
              )
            }
          >
            Hacer diagnóstico ahora
          </button>
        </section>
      )}

      {isGuidedMode && (
        <section style={guidedPanel}>
          <div>
            <strong>{modeInfo.title}</strong>
            <p style={guidedText}>{isExamMode ? modeInfo.text : guidedMessage}</p>
            {guidedFocus && (
              <div style={guidedChip}>Foco actual: {guidedFocus}</div>
            )}
          </div>
        </section>
      )}

      {isExamMode && (
        <section style={{
          ...examPanel,
          border: `1px solid ${subjectMeta.color}66`,
          boxShadow: `0 0 38px ${subjectMeta.color}22`,
        }}>
          <div>
            <strong>🧪 Modo examen UC real</strong>
            <p style={guidedText}>
              Temporizador activo, presión progresiva, dificultad realista, Pomodoro/bloques y lectura del estado mental.
            </p>
          </div>

          <div style={examGrid}>
            <div style={examMetric}>
              <span>Tiempo</span>
              <strong>
                {Math.floor(examSecondsLeft / 60)}:{String(examSecondsLeft % 60).padStart(2, '0')}
              </strong>
            </div>

            <div style={examMetric}>
              <span>Estado mental</span>
              <strong>{mentalState}</strong>
            </div>

            <div style={examMetric}>
              <span>Color activo</span>
              <strong>{subjectMeta.name}</strong>
            </div>

            <div style={examMetric}>
              <span>Rendimiento color</span>
              <strong>
                {colorPerformance[subjectMeta.color]?.attempts
                  ? `${Math.round((colorPerformance[subjectMeta.color].correct / colorPerformance[subjectMeta.color].attempts) * 100)}%`
                  : 'nuevo'}
              </strong>
            </div>
          </div>
        </section>
      )}

      <section style={panel}>
        <div style={filters}>
          <label style={field}>
            <span>Asignatura</span>
            <select
              style={select}
              value={selectedSubject}
              onChange={(e) => {
                const subject = e.target.value
                setSelectedSubject(subject)
                setQuestions([])
                setAttempts([])
                setFinished(false)

                if (userId && subject) {
                  checkDiagnostic(userId, subject)
                }
              }}
            >
              <option value="">Selecciona asignatura</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {getSubjectMeta(s).icon} {getSubjectMeta(s).name}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span>Tema</span>
            <select
              style={select}
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">Todos</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span>Autor</span>
            <select
              style={select}
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
            >
              <option value="">Todos</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span>Clase / fuente</span>
            <select
              style={select}
              value={selectedClassSource}
              onChange={(e) => setSelectedClassSource(e.target.value)}
            >
              <option value="">Todas</option>
              {classSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>

          <label style={field}>
            <span>Modo</span>
            <select
              style={select}
              value={mode}
              onChange={(e) => setMode(e.target.value as PracticeMode)}
            >
              <option value="">Selecciona modo</option>
              <option value="practica">Práctica guiada</option>
              <option value="adaptativo">Adaptativo</option>
              <option value="simulacion">Modo examen UC</option>
              <option value="rapido">Ronda corta</option>
              <option value="diagnostico">Diagnóstico</option>
            </select>
          </label>

          {mode === 'simulacion' && (
            <label style={field}>
              <span>Duración prueba</span>
              <select
                style={select}
                value={examDurationOption}
                onChange={(e) => setExamDurationOption(e.target.value as any)}
              >
                <option value="auto">Automática</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
              </select>
            </label>
          )}

          <label style={field}>
            <span>Cantidad</span>
            <select
              style={select}
              value={selectedLimit}
              onChange={(e) => setSelectedLimit(Number(e.target.value))}
            >
              {LIMITS.map((limit) => (
                <option key={limit} value={limit}>
                  {limit} preguntas
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={actions}>
          <button
            style={button}
            onClick={loadQuestions}
            disabled={sessionLoading}
          >
            {sessionLoading ? 'Cargando...' : 'Comenzar sesión'}
          </button>

          <button style={secondaryButton} onClick={restartSession}>
            Reiniciar
          </button>
        </div>
      </section>

      <section style={statsGrid}>
        <Stat label="Preguntas" value={questions.length} />
        <Stat label="Respondidas" value={attempts.length} />
        <Stat label="Precisión" value={`${accuracy}%`} />
        <Stat label="Dificultad" value={adaptiveDifficulty.toUpperCase()} />
        <Stat label="Fatiga" value={fatigue.toUpperCase()} />
        <Stat label="Débiles" value={weakTopics.length} />
      </section>

      {fatigue !== 'normal' && (
        <section style={fatigueBox}>
          <strong>⚠️ Sesión inteligente</strong>
          <p>
            Detectamos fatiga {fatigue}. La app ajustará el ritmo y priorizará preguntas más manejables.
          </p>
        </section>
      )}

      {!currentQuestion && !finished && (
        <section style={card}>
          <h2>Banco conectado ✅</h2>
          <p style={muted}>
            Selecciona asignatura, modo y presiona “Comenzar sesión”.
          </p>
        </section>
      )}

      {finished && (
        <section style={summaryCard}>
          <h2>✅ Sesión terminada</h2>
          <p style={muted}>
            Predicción de nota: <strong>{(savedPrediction ?? predictedScore).toFixed(1)}</strong> ·
            Correctas: {correctCount} · Errores: {wrongCount} · Precisión: {accuracy}%
          </p>

          {weakTopics.length > 0 && (
            <div style={weakBox}>
              <strong>Temas a reforzar:</strong>
              <ul>
                {weakTopics.slice(0, 8).map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          <button style={button} onClick={loadQuestions}>
            Hacer otra sesión
          </button>
        </section>
      )}

      {currentQuestion && !finished && (
        <section style={{ ...questionCard, border: `2px solid ${subjectMeta.color}`, boxShadow: `0 0 42px ${subjectMeta.color}66`, background: `linear-gradient(135deg, ${subjectMeta.color}22, rgba(2,6,23,0.94))` }}>
          <div style={questionHeader}>
            <div style={chips}>
              <span style={chip}>{currentQuestion.asignatura || 'General'}</span>
              <span style={chip}>{currentQuestion.tema}</span>
              <span style={chip}>{currentQuestion.subtema}</span>
              <span style={chip}>{currentQuestion.dificultad}</span>
              <span style={chip}>{currentQuestion.tipo}</span>
              <span style={chip}>
                {currentIndex + 1}/{questions.length}
              </span>
            </div>

            <span style={modeBadge}>{mode}</span>
          </div>

          <div style={progressTrack}>
            <div
              style={{
                ...progressFill,
                width: `${questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0}%`,
              }}
            />
          </div>

          <h2 style={questionTitle}>{currentQuestion.pregunta}</h2>

          {currentQuestion.tipo === 'seleccion_multiple' ? (
            <div style={options}>
              {(currentQuestion.opciones || []).map((option) => {
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

                const subjectMeta = getSubjectMeta(selectedSubject)

  return (
                  <button
                    key={option}
                    style={optionStyle}
                    disabled={Boolean(selectedAnswer)}
                    onClick={() => answer(letter)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={developmentBox}>
              <textarea
                style={textarea}
                placeholder="Escribe tu respuesta de desarrollo..."
              />
              <button
                style={button}
                onClick={() => {
                  setSelectedAnswer('DESARROLLO')
                  setAnswerState('correct')
                }}
              >
                Revisar desarrollo
              </button>
            </div>
          )}

          {selectedAnswer && (
            <div
              style={{
                ...feedback,
                ...(answerState === 'correct' && !isExamMode && !isExamMode ? feedbackGood : feedbackBad),
              }}
            >
              <strong>
                {answerState === 'correct' && !isExamMode && !isExamMode ? '✅ Correcta' : '❌ Incorrecta'}
              </strong>

              {currentQuestion.respuesta_correcta && (
                <p>
                  Respuesta correcta:{' '}
                  <strong>{currentQuestion.respuesta_correcta}</strong>
                </p>
              )}

              {currentQuestion.explicacion && (
                <p>{currentQuestion.explicacion}</p>
              )}

              {currentQuestion.error_comun && (
                <div style={warningBox}>
                  Error común: {currentQuestion.error_comun}
                </div>
              )}

              <button style={button} onClick={nextQuestion}>
                {currentIndex >= questions.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCard}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/* ================= STYLES ================= */

const container: CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  display: 'grid',
  gap: 18,
  color: 'white',
  background:
    'radial-gradient(circle at top left, rgba(37,99,235,.22), transparent 28%), linear-gradient(180deg,#020617,#0f172a)',
}

const hero: CSSProperties = {
  padding: 24,
  borderRadius: 28,
  background:
    'linear-gradient(135deg, rgba(37,99,235,.30), rgba(124,58,237,.18))',
  border: '1px solid rgba(255,255,255,.12)',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 18,
  alignItems: 'center',
}

const pill: CSSProperties = {
  width: 'fit-content',
  padding: '7px 12px',
  borderRadius: 999,
  background: 'rgba(37,99,235,.25)',
  color: '#bfdbfe',
  fontWeight: 900,
  marginBottom: 8,
}

const title: CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 950,
}

const subtitle: CSSProperties = {
  margin: '8px 0 0',
  color: '#cbd5e1',
  lineHeight: 1.45,
}

const heroStats: CSSProperties = {
  minWidth: 140,
  padding: 18,
  borderRadius: 22,
  background: 'rgba(0,0,0,.25)',
  display: 'grid',
  textAlign: 'center',
}

const diagnosticBlock: CSSProperties = {
  padding: 20,
  borderRadius: 22,
  background: 'rgba(239,68,68,.16)',
  border: '1px solid rgba(239,68,68,.35)',
  color: '#fecaca',
}

const panel: CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.11)',
  display: 'grid',
  gap: 14,
}

const filters: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: 12,
}

const field: CSSProperties = {
  display: 'grid',
  gap: 7,
  fontWeight: 800,
}

const select: CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: 'none',
  outline: 'none',
  background: 'white',
  color: '#0f172a',
  fontWeight: 800,
}

const actions: CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
}

const button: CSSProperties = {
  padding: '12px 15px',
  borderRadius: 14,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const secondaryButton: CSSProperties = {
  ...button,
  background: 'rgba(255,255,255,.08)',
  border: '1px solid rgba(255,255,255,.13)',
}

const statsGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
}

const statCard: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: 'rgba(255,255,255,.055)',
  border: '1px solid rgba(255,255,255,.11)',
  display: 'grid',
  gap: 8,
}

const fatigueBox: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: 'rgba(245,158,11,.15)',
  border: '1px solid rgba(245,158,11,.35)',
  color: '#fde68a',
}

const card: CSSProperties = {
  padding: 20,
  borderRadius: 22,
  background: 'rgba(255,255,255,.055)',
  border: '1px solid rgba(255,255,255,.11)',
}

const muted: CSSProperties = {
  color: '#cbd5e1',
  lineHeight: 1.5,
}

const summaryCard: CSSProperties = {
  padding: 22,
  borderRadius: 24,
  background: 'rgba(34,197,94,.11)',
  border: '1px solid rgba(34,197,94,.28)',
}

const weakBox: CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: 16,
  background: 'rgba(255,255,255,.07)',
}

const questionCard: CSSProperties = {
  padding: 24,
  borderRadius: 26,
  background: 'rgba(255,255,255,.06)',
  border: '1px solid rgba(255,255,255,.12)',
  display: 'grid',
  gap: 18,
}

const questionHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
}

const chips: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
}

const chip: CSSProperties = {
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(255,255,255,.08)',
  border: '1px solid rgba(255,255,255,.10)',
  fontWeight: 800,
  fontSize: 12,
}

const modeBadge: CSSProperties = {
  padding: '7px 11px',
  borderRadius: 999,
  background: 'rgba(37,99,235,.22)',
  color: '#bfdbfe',
  fontWeight: 900,
  fontSize: 12,
}

const progressTrack: CSSProperties = {
  height: 9,
  borderRadius: 999,
  background: 'rgba(255,255,255,.08)',
  overflow: 'hidden',
}

const progressFill: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: '#2563eb',
}

const questionTitle: CSSProperties = {
  margin: 0,
  lineHeight: 1.4,
}

const options: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const optionButton: CSSProperties = {
  width: '100%',
  padding: 15,
  borderRadius: 16,
  background: 'rgba(255,255,255,.055)',
  color: 'white',
  border: '1px solid rgba(255,255,255,.12)',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: 750,
}

const correctOption: CSSProperties = {
  border: '1px solid rgba(34,197,94,.75)',
  background: 'rgba(34,197,94,.16)',
}

const wrongOption: CSSProperties = {
  border: '1px solid rgba(239,68,68,.75)',
  background: 'rgba(239,68,68,.16)',
}

const developmentBox: CSSProperties = {
  display: 'grid',
  gap: 12,
}

const textarea: CSSProperties = {
  minHeight: 160,
  padding: 14,
  borderRadius: 14,
  background: '#020617',
  color: 'white',
  border: '1px solid rgba(255,255,255,.14)',
}

const feedback: CSSProperties = {
  padding: 16,
  borderRadius: 18,
  display: 'grid',
  gap: 8,
}

const feedbackGood: CSSProperties = {
  background: 'rgba(34,197,94,.12)',
  border: '1px solid rgba(34,197,94,.25)',
}

const feedbackBad: CSSProperties = {
  background: 'rgba(239,68,68,.12)',
  border: '1px solid rgba(239,68,68,.25)',
}

const warningBox: CSSProperties = {
  padding: 10,
  borderRadius: 12,
  background: 'rgba(245,158,11,.14)',
  border: '1px solid rgba(245,158,11,.25)',
  color: '#fde68a',
}

const guidedPanel: React.CSSProperties = {
  padding: '16px',
  borderRadius: '18px',
  background: 'linear-gradient(135deg, rgba(37,99,235,0.22), rgba(15,23,42,0.92))',
  border: '1px solid rgba(96,165,250,0.35)',
  marginBottom: '16px',
}

const guidedText: React.CSSProperties = {
  margin: '6px 0 0',
  opacity: 0.82,
  lineHeight: 1.45,
}

const guidedChip: React.CSSProperties = {
  display: 'inline-block',
  marginTop: '10px',
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'rgba(59,130,246,0.22)',
  color: '#bfdbfe',
  fontSize: '13px',
  fontWeight: 800,
}


const examPanel: React.CSSProperties = {
  padding: '18px',
  borderRadius: '22px',
  background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))',
  marginBottom: '16px',
  transition: 'all 450ms ease',
}

const examGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '10px',
  marginTop: '14px',
}

const examMetric: React.CSSProperties = {
  display: 'grid',
  gap: '4px',
  padding: '12px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)',
}
