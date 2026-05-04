'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'
import { upsertDiagnostic } from '../../lib/diagnostics'
import { createPracticeAttempts } from '../../lib/practice-attempts'
import { detectFatigue, type FatigueSignal } from '../../lib/fatigue-engine'
import { generateStudySession } from '../../lib/study-engine'

type Difficulty = 'baja' | 'media' | 'alta'

type Question = {
  id: string
  subject: string
  topic: string
  difficulty: Difficulty
  text: string
  options: string[]
  correct: string
}

const QUESTIONS: Question[] = [
  {
    id: 'sol500-1',
    subject: 'SOL500',
    topic: 'Imaginación sociológica',
    difficulty: 'media',
    text: '¿Qué permite comprender la imaginación sociológica según Mills?',
    options: [
      'Separar la vida personal de la sociedad',
      'Relacionar biografía, historia y estructura social',
      'Explicar todo por decisiones individuales',
      'Eliminar los problemas públicos',
    ],
    correct: 'Relacionar biografía, historia y estructura social',
  },
  {
    id: 'sol500-2',
    subject: 'SOL500',
    topic: 'Problemas públicos',
    difficulty: 'media',
    text: 'Un problema público se diferencia de un problema privado porque:',
    options: [
      'Afecta solo a una persona',
      'No tiene relación con la sociedad',
      'Se vincula con estructuras sociales más amplias',
      'Depende solo del carácter individual',
    ],
    correct: 'Se vincula con estructuras sociales más amplias',
  },
  {
    id: 'sol500-3',
    subject: 'SOL500',
    topic: 'Estructura social',
    difficulty: 'alta',
    text: 'Desde una mirada sociológica, una trayectoria individual debe analizarse considerando:',
    options: [
      'Solo esfuerzo personal',
      'Solo emociones privadas',
      'Condiciones históricas, instituciones y posición social',
      'Preferencias aisladas del individuo',
    ],
    correct: 'Condiciones históricas, instituciones y posición social',
  },
  {
    id: 'mat1000-1',
    subject: 'MAT1000',
    topic: 'Funciones',
    difficulty: 'media',
    text: 'Una función se caracteriza porque:',
    options: [
      'Cada entrada tiene una única salida',
      'Cada salida tiene una única entrada',
      'Todas son rectas',
      'Todas son crecientes',
    ],
    correct: 'Cada entrada tiene una única salida',
  },
  {
    id: 'mat1000-2',
    subject: 'MAT1000',
    topic: 'Dominio',
    difficulty: 'alta',
    text: 'Para una función racional, el dominio excluye principalmente:',
    options: [
      'Valores que hacen cero el numerador',
      'Valores que hacen cero el denominador',
      'Todos los números negativos',
      'Todos los números positivos',
    ],
    correct: 'Valores que hacen cero el denominador',
  },
  {
    id: 'psi1101-1',
    subject: 'PSI1101',
    topic: 'Condicionamiento operante',
    difficulty: 'media',
    text: 'El condicionamiento operante se basa principalmente en:',
    options: [
      'La asociación entre dos estímulos',
      'Las consecuencias de la conducta',
      'La memoria visual',
      'La percepción del color',
    ],
    correct: 'Las consecuencias de la conducta',
  },
  {
    id: 'ihi0204-1',
    subject: 'IHI0204',
    topic: 'Fuentes históricas',
    difficulty: 'media',
    text: 'Una fuente primaria es aquella que:',
    options: [
      'Resume textos de otros autores',
      'Fue producida en el contexto del hecho estudiado',
      'Siempre es un libro escolar',
      'No requiere interpretación',
    ],
    correct: 'Fue producida en el contexto del hecho estudiado',
  },
]

function subjectName(subject: string) {
  const map: Record<string, string> = {
    SOL500: 'Sociología',
    MAT1000: 'Matemática',
    PSI1101: 'Psicología',
    IHI0204: 'Taller de fuentes I',
  }

  return map[subject] ?? subject
}

function getNextDifficulty(lastAnswers: boolean[], fatigueLevel: string): Difficulty {
  if (fatigueLevel === 'fatiga') return 'baja'
  if (fatigueLevel === 'atencion') return 'media'

  const recent = lastAnswers.slice(-3)
  const correct = recent.filter(Boolean).length

  if (recent.length >= 3 && correct === 3) return 'alta'
  if (recent.length >= 3 && correct <= 1) return 'baja'

  return 'media'
}

export default function DiagnosticExamView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const subject = searchParams.get('subject') || ''
  const rawNext = searchParams.get('next') || '/practica'
  const mode = searchParams.get('mode') || 'diagnostico'

  const [userId, setUserId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [orderedQuestions, setOrderedQuestions] = useState<Question[]>([])
  const [secondsLeft, setSecondsLeft] = useState(mode === 'simulacion_uc' ? 2700 : 600)
  const [saving, setSaving] = useState(false)
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now())
  const [fatigueSignals, setFatigueSignals] = useState<FatigueSignal[]>([])
  const [lastResults, setLastResults] = useState<boolean[]>([])
  const [fatigueMessage, setFatigueMessage] = useState('Ritmo estable.')

  const baseQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => q.subject === subject)
  }, [subject])

  const question = orderedQuestions[currentIndex]

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser()

      if (!user) {
        router.replace('/login')
        return
      }

      setUserId(user.id)
    }

    loadUser()
  }, [router])

  useEffect(() => {
    if (!subject) return

    const firstQuestions = baseQuestions
      .filter((q) => q.difficulty === 'media')
      .slice(0, 1)

    const fallback = baseQuestions.slice(0, 1)

    setOrderedQuestions(firstQuestions.length ? firstQuestions : fallback)
    setCurrentIndex(0)
    setQuestionStartedAt(Date.now())
  }, [subject, baseQuestions])

  useEffect(() => {
    if (saving || !userId) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          finishDiagnostic()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, userId, answers, orderedQuestions])

  function selectAnswer(value: string) {
    if (!question) return

    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

  function chooseNextQuestion(newLastResults: boolean[], newSignals: FatigueSignal[]) {
    const fatigue = detectFatigue(newSignals)
    setFatigueMessage(fatigue.message)

    const nextDifficulty = getNextDifficulty(newLastResults, fatigue.level)

    const available = baseQuestions.filter((q) => {
      const notUsed = !usedQuestionIds.includes(q.id) && q.id !== question.id
      const sameDifficulty = q.difficulty === nextDifficulty
      return notUsed && sameDifficulty
    })

    const fallback = baseQuestions.filter(
      (q) => !usedQuestionIds.includes(q.id) && q.id !== question.id
    )

    return available[0] ?? fallback[0] ?? null
  }

  function nextQuestion() {
    if (!question) return

    const selected = answers[question.id]
    if (!selected) return

    const isCorrect = selected === question.correct
    const responseTimeSeconds = Math.round((Date.now() - questionStartedAt) / 1000)

    const newSignals: FatigueSignal[] = [
      ...fatigueSignals,
      {
        questionId: question.id,
        isCorrect,
        responseTimeSeconds,
      },
    ]

    const newLastResults = [...lastResults, isCorrect]
    const newUsed = [...usedQuestionIds, question.id]

    setFatigueSignals(newSignals)
    setLastResults(newLastResults)
    setUsedQuestionIds(newUsed)

    const maxQuestions = mode === 'simulacion_uc' ? 20 : 8

    if (orderedQuestions.length >= maxQuestions || newUsed.length >= baseQuestions.length) {
      finishDiagnostic(newSignals, newLastResults, newUsed)
      return
    }

    const nextQ = chooseNextQuestion(newLastResults, newSignals)

    if (!nextQ) {
      finishDiagnostic(newSignals, newLastResults, newUsed)
      return
    }

    setOrderedQuestions((prev) => [...prev, nextQ])
    setCurrentIndex((prev) => prev + 1)
    setQuestionStartedAt(Date.now())
  }

  async function finishDiagnostic(
    finalSignals = fatigueSignals,
    finalResults = lastResults,
    finalUsedIds = usedQuestionIds
  ) {
    if (!userId || saving || !subject || orderedQuestions.length === 0) return

    try {
      setSaving(true)

      const finalQuestions = orderedQuestions.filter((q) =>
        finalUsedIds.length ? finalUsedIds.includes(q.id) : true
      )

      const questionsToGrade = finalQuestions.length ? finalQuestions : orderedQuestions

      const results = questionsToGrade.map((q) => {
        const selected = answers[q.id] || ''
        const isCorrect = selected === q.correct

        return {
          question: q,
          selected,
          isCorrect,
        }
      })

      const correctAnswers = results.filter((r) => r.isCorrect).length
      const score = Number(((correctAnswers / results.length) * 7).toFixed(2))

      const weakTopics = Array.from(
        new Set(results.filter((r) => !r.isCorrect).map((r) => r.question.topic))
      )

      const strongTopics = Array.from(
        new Set(results.filter((r) => r.isCorrect).map((r) => r.question.topic))
      )

      const risk = score < 4 ? 'alto' : score < 5 ? 'medio' : 'bajo'

      const studySession = generateStudySession({
        risk,
        score,
        weakTopics,
      })

      await upsertDiagnostic({
        user_id: userId,
        subject,
        completed: true,
        score,
        weak_topics: weakTopics,
        strong_topics: strongTopics,
        diagnostic_result: {
          mode,
          subject,
          subject_name: subjectName(subject),
          total_questions: results.length,
          correct_answers: correctAnswers,
          duration_seconds: (mode === 'simulacion_uc' ? 2700 : 600) - secondsLeft,
          score,
          risk,
          study_session: studySession,
          fatigue_signals: finalSignals,
          last_results: finalResults,
          answers: results.map((r) => ({
            question_id: r.question.id,
            question_text: r.question.text,
            selected_answer: r.selected,
            correct_answer: r.question.correct,
            is_correct: r.isCorrect,
            topic: r.question.topic,
            difficulty: r.question.difficulty,
          })),
        },
      })

      try {
        await createPracticeAttempts(
          results.map((r) => ({
            user_id: userId,
            subject: r.question.subject,
            topic: r.question.topic,
            question_id: r.question.id,
            question_text: r.question.text,
            question_type: String(mode || 'diagnostico'),
            source: 'diagnostic',
            is_correct: r.isCorrect,
          }))
        )
      } catch (attemptError) {
        console.error('PRACTICE ATTEMPTS NON BLOCKING ERROR:', attemptError)
      }

      window.location.href = '/practica'
    } catch (error) {
      console.error('DIAGNOSTIC EXAM SAVE ERROR:', error)
      alert(
        error instanceof Error
          ? `No se pudo guardar el diagnóstico: ${error.message}`
          : 'No se pudo guardar el diagnóstico.'
      )
      setSaving(false)
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  if (!subject || baseQuestions.length === 0 || !question) {
    return (
      <main style={main}>
        <section style={card}>
          <h1>Sin preguntas disponibles</h1>
          <p>Vuelve y selecciona una asignatura válida.</p>
          <button style={primaryButton} onClick={() => router.push('/diagnostico')}>
            Volver
          </button>
        </section>
      </main>
    )
  }

  return (
    <main style={main}>
      <section style={top}>
        <div>
          <p style={pill}>Diagnóstico obligatorio</p>
          <h1 style={title}>{subjectName(subject)}</h1>
          <p style={subtitle}>
            La dificultad se ajusta automáticamente según tus respuestas.
          </p>
        </div>

        <div style={timer}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </section>

      <section style={card}>
        <div style={metaRow}>
          <span style={progress}>
            Pregunta {currentIndex + 1}
          </span>

          <span style={difficultyBadge}>
            {question.difficulty.toUpperCase()}
          </span>
        </div>

        <h2 style={questionTitle}>{question.text}</h2>

        <div style={options}>
          {question.options.map((option) => {
            const selected = answers[question.id] === option

            return (
              <button
                key={option}
                style={selected ? selectedOption : optionButton}
                onClick={() => selectAnswer(option)}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div style={coachBox}>
          <strong>Sesión inteligente</strong>
          <p>{fatigueMessage}</p>
        </div>

        <button
          style={primaryButton}
          disabled={!answers[question.id] || saving}
          onClick={nextQuestion}
        >
          {saving ? 'Guardando...' : 'Siguiente'}
        </button>
      </section>
    </main>
  )
}

const main: React.CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  background: 'linear-gradient(180deg,#020617,#0f172a)',
  color: 'white',
}

const top: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 20,
  marginBottom: 20,
}

const pill: React.CSSProperties = {
  display: 'inline-block',
  padding: '7px 12px',
  borderRadius: 999,
  background: 'rgba(239,68,68,0.18)',
  color: '#fecaca',
  fontWeight: 900,
  textTransform: 'uppercase',
  fontSize: 12,
}

const title: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: 36,
  fontWeight: 950,
}

const subtitle: React.CSSProperties = {
  margin: '6px 0 0',
  color: '#cbd5e1',
}

const timer: React.CSSProperties = {
  padding: '14px 18px',
  borderRadius: 18,
  background: 'rgba(239,68,68,0.18)',
  border: '1px solid rgba(239,68,68,0.35)',
  color: '#fecaca',
  fontSize: 24,
  fontWeight: 900,
}

const card: React.CSSProperties = {
  maxWidth: 850,
  margin: '0 auto',
  padding: 26,
  borderRadius: 28,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
}

const metaRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
}

const progress: React.CSSProperties = {
  color: '#93c5fd',
  fontWeight: 900,
}

const difficultyBadge: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.22)',
  color: '#bfdbfe',
  fontSize: 12,
  fontWeight: 900,
}

const questionTitle: React.CSSProperties = {
  marginTop: 18,
  lineHeight: 1.35,
}

const options: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  marginTop: 20,
}

const optionButton: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(15,23,42,0.9)',
  color: 'white',
  textAlign: 'left',
  cursor: 'pointer',
  fontWeight: 800,
}

const selectedOption: React.CSSProperties = {
  ...optionButton,
  background: 'rgba(37,99,235,0.35)',
  border: '1px solid rgba(96,165,250,0.65)',
}

const coachBox: React.CSSProperties = {
  marginTop: 18,
  padding: 14,
  borderRadius: 16,
  background: 'rgba(34,197,94,0.10)',
  border: '1px solid rgba(34,197,94,0.20)',
  color: '#bbf7d0',
}

const primaryButton: React.CSSProperties = {
  width: '100%',
  marginTop: 20,
  padding: 16,
  borderRadius: 18,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 950,
  cursor: 'pointer',
}
