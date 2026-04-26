'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'
import { upsertDiagnostic } from '../../lib/diagnostics'
import { createPracticeAttempts } from '../../lib/practice-attempts'

type Question = {
  id: string
  subject: string
  topic: string
  text: string
  options: string[]
  correct: string
}

const QUESTIONS: Question[] = [
  {
    id: 'diag-soc-1',
    subject: 'SOL500',
    topic: 'Imaginación sociológica',
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
    id: 'diag-mat-1',
    subject: 'MAT1000',
    topic: 'Funciones',
    text: 'Si una función asigna a cada x un único valor de y, entonces se cumple que:',
    options: [
      'Toda relación es función',
      'Cada entrada tiene una única salida',
      'Cada salida tiene una única entrada',
      'La función siempre es lineal',
    ],
    correct: 'Cada entrada tiene una única salida',
  },
  {
    id: 'diag-psi-1',
    subject: 'PSI1101',
    topic: 'Aprendizaje',
    text: 'En el condicionamiento operante, la conducta cambia principalmente por:',
    options: [
      'Asociación entre estímulos neutros',
      'Consecuencias posteriores a la conducta',
      'Memoria sensorial únicamente',
      'Reflejos involuntarios',
    ],
    correct: 'Consecuencias posteriores a la conducta',
  },
]

export default function DiagnosticView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const subjectParam = searchParams.get('subject')
  const evaluationId = searchParams.get('evaluationId')

  const [userId, setUserId] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(600)
  const [saving, setSaving] = useState(false)

  const questions = useMemo(() => {
    if (!subjectParam) return QUESTIONS
    return QUESTIONS.filter((q) => q.subject === subjectParam)
  }, [subjectParam])

  const question = questions[current]

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
    if (saving) return

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
  }, [saving, userId, answers, current])

  function selectAnswer(value: string) {
    if (!question) return

    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }))
  }

  function nextQuestion() {
    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1)
      return
    }

    finishDiagnostic()
  }

  async function finishDiagnostic() {
    if (!userId || saving) return

    try {
      setSaving(true)

      const results = questions.map((q) => {
        const selected = answers[q.id] ?? ''
        const isCorrect = selected === q.correct

        return {
          question: q,
          selected,
          isCorrect,
        }
      })

      const correctCount = results.filter((r) => r.isCorrect).length
      const score =
        questions.length > 0 ? Number(((correctCount / questions.length) * 7).toFixed(2)) : 1

      const weakTopics = results
        .filter((r) => !r.isCorrect)
        .map((r) => r.question.topic)

      const strongTopics = results
        .filter((r) => r.isCorrect)
        .map((r) => r.question.topic)

      const subjectGroups = Array.from(new Set(questions.map((q) => q.subject)))

      await Promise.all(
        subjectGroups.map((subject) => {
          const subjectResults = results.filter((r) => r.question.subject === subject)
          const subjectCorrect = subjectResults.filter((r) => r.isCorrect).length
          const subjectScore =
            subjectResults.length > 0
              ? Number(((subjectCorrect / subjectResults.length) * 7).toFixed(2))
              : null

          return upsertDiagnostic({
            user_id: userId,
            subject,
            completed: true,
            score: subjectScore,
            weak_topics: subjectResults
              .filter((r) => !r.isCorrect)
              .map((r) => r.question.topic),
            strong_topics: subjectResults
              .filter((r) => r.isCorrect)
              .map((r) => r.question.topic),
            diagnostic_result: {
              evaluation_id: evaluationId,
              total_questions: subjectResults.length,
              correct_answers: subjectCorrect,
              duration_seconds: 600 - secondsLeft,
              answers: subjectResults.map((r) => ({
                question_id: r.question.id,
                question_text: r.question.text,
                selected_answer: r.selected,
                correct_answer: r.question.correct,
                is_correct: r.isCorrect,
                topic: r.question.topic,
              })),
            },
          })
        })
      )

      await createPracticeAttempts(
        results.map((r) => ({
          user_id: userId,
          subject: r.question.subject,
          topic: r.question.topic,
          question_id: r.question.id,
          question_text: r.question.text,
          question_type: 'diagnostico',
          source: 'diagnostic',
          is_correct: r.isCorrect,
        }))
      )

      router.replace('/home')
    } catch (error) {
      console.error('DIAGNOSTIC SAVE ERROR:', error)
      alert('No se pudo guardar el diagnóstico. Revisa Supabase/RLS.')
      setSaving(false)
    }
  }

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  if (!question) {
    return (
      <main style={main}>
        <section style={card}>No hay preguntas disponibles para este diagnóstico.</section>
      </main>
    )
  }

  return (
    <main style={main}>
      <section style={topBar}>
        <div>
          <p style={eyebrow}>Diagnóstico obligatorio</p>
          <h1 style={title}>Evaluación inicial</h1>
        </div>

        <div style={timer}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </section>

      <section style={card}>
        <div style={progressText}>
          Pregunta {current + 1} de {questions.length}
        </div>

        <h2 style={questionTitle}>{question.text}</h2>

        <div style={optionsGrid}>
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

        <button
          style={primaryButton}
          onClick={nextQuestion}
          disabled={!answers[question.id] || saving}
        >
          {saving
            ? 'Guardando...'
            : current === questions.length - 1
              ? 'Finalizar diagnóstico'
              : 'Siguiente'}
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

const topBar: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 20,
  marginBottom: 20,
}

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 1.5,
  opacity: 0.7,
}

const title: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 34,
  fontWeight: 900,
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
  padding: 24,
  borderRadius: 26,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
}

const progressText: React.CSSProperties = {
  color: '#93c5fd',
  fontWeight: 800,
  marginBottom: 12,
}

const questionTitle: React.CSSProperties = {
  fontSize: 25,
  lineHeight: 1.3,
  marginBottom: 20,
}

const optionsGrid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
}

const optionButton: React.CSSProperties = {
  textAlign: 'left',
  padding: 16,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(15,23,42,0.9)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const selectedOption: React.CSSProperties = {
  ...optionButton,
  background: 'rgba(37,99,235,0.35)',
  border: '1px solid rgba(96,165,250,0.65)',
}

const primaryButton: React.CSSProperties = {
  marginTop: 20,
  width: '100%',
  padding: 15,
  borderRadius: 16,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}