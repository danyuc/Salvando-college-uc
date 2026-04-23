'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  getDiagnosticBySubject,
  type SubjectDiagnostic,
} from '../../lib/diagnostics'
import {
  getQuestionsFromBank,
  getCorrectIndex,
  normalizeAiQuestionsToBankShape,
  type BankQuestion,
} from '../../lib/question-bank'
import {
  generateAdaptiveQuestion,
  type GeneratedQuestion,
} from '../../lib/question-variation'
import { SUBJECT_PRESETS, SUBJECT_COLORS } from '../../lib/subjects'
import {
  calculatePercent,
  calculateXp,
  createUserScore,
} from '../../lib/scores'
import { createPracticeAttempts } from '../../lib/practice-attempts'
import AIStudyChat from './AIStudyChat'
import PizarraView from './PizarraView'

type PracticeSource =
  | 'bank'
  | 'ai'
  | 'mixed'
  | 'weakest'
  | 'past-exam'

type PracticeFormat =
  | 'multiple-choice'
  | 'true-false'
  | 'flashcards'
  | 'open'
  | 'problem-solving'
  | 'exam'
  | 'all'

type EvaluationTarget =
  | 'todas'
  | 'control'
  | 'prueba'
  | 'interrogacion'
  | 'dossier'
  | 'ensayo'
  | 'actividad-evaluada'
  | 'evaluacion-oral'
  | 'trabajo-final'
  | 'examen-final'

type DiagnosticStage = 'inicio' | 'ninguno' | 'medio' | 'final'
type Stage = 'subject-selection' | 'practice'

type SubjectMode =
  | 'history-analysis'
  | 'seminar-text'
  | 'math-problem-solving'
  | 'memory-understanding'
  | 'sociology-analysis'
  | 'mixed'

type SubjectUnit = {
  id: string
  name: string
  topics: string[]
  readings?: string[]
}

type SubjectLike = {
  name: string
  color?: string
  topics?: string[]
  units?: SubjectUnit[]
}

type PracticeProgressState = {
  completedSets: number
  diagnosticInitialDone: boolean
  diagnosticMidDone: boolean
  diagnosticFinalDone: boolean
}

type QuestionCountRange = 5 | 10 | 15 | 20 | 30

function normalizeAnswerValue(
  value: unknown
): string | number | boolean | undefined {
  if (
    typeof value === 'object' &&
    value !== null &&
    'correctIndex' in value &&
    typeof (value as { correctIndex?: unknown }).correctIndex === 'number'
  ) {
    return (value as { correctIndex: number }).correctIndex
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value
  }

  return undefined
}

function shouldTriggerMidDiagnostic(progress: number) {
  return progress >= 0.4 && progress <= 0.6
}

function shouldTriggerFinalDiagnostic(progress: number) {
  return progress >= 0.85
}

function formatLabel(format: PracticeFormat) {
  switch (format) {
    case 'multiple-choice':
      return 'Alternativas'
    case 'true-false':
      return 'Verdadero / Falso'
    case 'flashcards':
      return 'Flashcards'
    case 'open':
      return 'Desarrollo'
    case 'problem-solving':
      return 'Problemas'
    case 'exam':
      return 'Formato prueba'
    case 'all':
      return 'Todos'
    default:
      return format
  }
}

function evaluationLabel(kind: EvaluationTarget) {
  switch (kind) {
    case 'todas':
      return 'Todas'
    case 'control':
      return 'Control'
    case 'prueba':
      return 'Prueba'
    case 'interrogacion':
      return 'Interrogación'
    case 'dossier':
      return 'Dossier'
    case 'ensayo':
      return 'Ensayo'
    case 'actividad-evaluada':
      return 'Actividad evaluada'
    case 'evaluacion-oral':
      return 'Evaluación oral'
    case 'trabajo-final':
      return 'Trabajo final'
    case 'examen-final':
      return 'Examen final'
    default:
      return kind
  }
}

function getSubjectMode(subject: string): SubjectMode {
  const normalized = subject.toLowerCase()

  if (normalized.includes('seminario')) return 'seminar-text'
  if (normalized.includes('historia')) return 'history-analysis'
  if (normalized.includes('precál') || normalized.includes('calculo') || normalized.includes('mat')) {
    return 'math-problem-solving'
  }
  if (normalized.includes('psicolog')) return 'memory-understanding'
  if (normalized.includes('sociolog')) return 'sociology-analysis'

  return 'mixed'
}

function getAllowedFormatsForSubject(subject: string): PracticeFormat[] {
  const mode = getSubjectMode(subject)

  if (mode === 'math-problem-solving') {
    return ['problem-solving', 'multiple-choice', 'open', 'exam', 'all', 'flashcards']
  }

  if (mode === 'seminar-text') {
    return ['multiple-choice', 'open', 'exam', 'all', 'flashcards']
  }

  if (mode === 'history-analysis') {
    return ['multiple-choice', 'open', 'exam', 'all', 'flashcards']
  }

  if (mode === 'memory-understanding') {
    return ['multiple-choice', 'true-false', 'open', 'flashcards', 'exam', 'all']
  }

  if (mode === 'sociology-analysis') {
    return ['multiple-choice', 'open', 'exam', 'all', 'flashcards']
  }

  return ['multiple-choice', 'true-false', 'open', 'flashcards', 'exam', 'all']
}

function getDefaultFormatForSubject(subject: string): PracticeFormat {
  const mode = getSubjectMode(subject)

  if (mode === 'math-problem-solving') return 'problem-solving'
  if (mode === 'seminar-text') return 'exam'
  if (mode === 'history-analysis') return 'exam'
  if (mode === 'memory-understanding') return 'multiple-choice'
  if (mode === 'sociology-analysis') return 'exam'

  return 'multiple-choice'
}

function getEvaluationKindsForSubject(subject: string): EvaluationTarget[] {
  const mode = getSubjectMode(subject)

  if (mode === 'seminar-text') {
    return [
      'todas',
      'control',
      'prueba',
      'dossier',
      'ensayo',
      'actividad-evaluada',
      'trabajo-final',
      'examen-final',
    ]
  }

  if (mode === 'history-analysis') {
    return ['todas', 'control', 'prueba', 'evaluacion-oral', 'examen-final']
  }

  if (mode === 'math-problem-solving') {
    return ['todas', 'control', 'prueba', 'interrogacion', 'examen-final']
  }

  if (mode === 'memory-understanding') {
    return ['todas', 'control', 'prueba', 'interrogacion', 'examen-final']
  }

  if (mode === 'sociology-analysis') {
    return ['todas', 'prueba', 'actividad-evaluada', 'trabajo-final']
  }

  return ['todas', 'control', 'prueba', 'examen-final']
}

function buildUnitList(subjectConfig: SubjectLike | null): SubjectUnit[] {
  if (!subjectConfig) return []

  if (Array.isArray(subjectConfig.units) && subjectConfig.units.length > 0) {
    return subjectConfig.units
  }

  const rawTopics = Array.isArray(subjectConfig.topics) ? subjectConfig.topics : []
  const topics = rawTopics.filter((topic) => topic !== 'Diagnóstico base')

  if (topics.length === 0) return []

  return [
    {
      id: 'u1',
      name: 'Unidad general',
      topics,
      readings: [],
    },
  ]
}

function getRequestedFormat(params: {
  subject: string
  format: PracticeFormat
}): PracticeFormat {
  const mode = getSubjectMode(params.subject)

  if (mode === 'math-problem-solving') {
    if (params.format === 'exam' || params.format === 'all') {
      return 'problem-solving'
    }
    return params.format
  }

  if (mode === 'seminar-text') {
    if (params.format === 'exam' || params.format === 'all') {
      return 'open'
    }
    return params.format
  }

  if (mode === 'history-analysis') {
    if (params.format === 'exam' || params.format === 'all') {
      return 'multiple-choice'
    }
    return params.format
  }

  if (mode === 'sociology-analysis') {
    if (params.format === 'exam' || params.format === 'all') {
      return 'open'
    }
    return params.format
  }

  return params.format
}

function mixAllQuestionTypes(
  allQuestions: GeneratedQuestion[],
  limit: number,
  subject: string
) {
  const mode = getSubjectMode(subject)

  return allQuestions
    .map((question, index) => {
      if (mode === 'math-problem-solving') {
        if (index % 3 === 0) return { ...question, type: 'multiple-choice' as const }
        return { ...question, type: 'problem-solving' as const }
      }

      if (mode === 'seminar-text' || mode === 'history-analysis' || mode === 'sociology-analysis') {
        if (index % 4 === 0) return { ...question, type: 'flashcards' as const }
        if (index % 3 === 0) return { ...question, type: 'open' as const }
        return { ...question, type: 'multiple-choice' as const }
      }

      if (mode === 'memory-understanding') {
        if (index % 4 === 0) return { ...question, type: 'flashcards' as const }
        if (index % 3 === 0) return { ...question, type: 'true-false' as const }
        if (index % 5 === 0) return { ...question, type: 'open' as const }
        return { ...question, type: 'multiple-choice' as const }
      }

      return question
    })
    .slice(0, limit)
}

function getDiagnosticCount(stage: DiagnosticStage, subject: string): QuestionCountRange {
  const mode = getSubjectMode(subject)

  if (stage === 'inicio') return 15
  if (stage === 'medio') return mode === 'math-problem-solving' ? 15 : 10
  if (stage === 'final') return mode === 'math-problem-solving' ? 30 : 20

  return 10
}

function getDiagnosticFormat(stage: DiagnosticStage, subject: string): PracticeFormat {
  const mode = getSubjectMode(subject)

  if (mode === 'math-problem-solving') {
    if (stage === 'final') return 'exam'
    return 'problem-solving'
  }

  if (mode === 'seminar-text' || mode === 'history-analysis' || mode === 'sociology-analysis') {
    return stage === 'inicio' ? 'multiple-choice' : 'exam'
  }

  if (mode === 'memory-understanding') {
    return stage === 'final' ? 'exam' : 'multiple-choice'
  }

  return 'multiple-choice'
}

function buildAttemptTopic(
  source: PracticeSource,
  diagnostic: SubjectDiagnostic | null,
  selectedTopic: string
) {
  if (source === 'weakest') {
    return diagnostic?.weak_topics?.[0] || selectedTopic || 'General'
  }

  return selectedTopic || 'General'
}

export default function PracticeView() {
  const [userId, setUserId] = useState('')
  const [stage, setStage] = useState<Stage>('subject-selection')

  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedReading, setSelectedReading] = useState('')
  const [evaluationTarget, setEvaluationTarget] =
    useState<EvaluationTarget>('todas')

  const [diagnostic, setDiagnostic] = useState<SubjectDiagnostic | null>(null)
  const [diagnosticStage, setDiagnosticStage] =
    useState<DiagnosticStage>('inicio')

  const [source, setSource] = useState<PracticeSource>('mixed')
  const [format, setFormat] = useState<PracticeFormat>('multiple-choice')
  const [count, setCount] = useState<QuestionCountRange>(10)

  const [questions, setQuestions] = useState<GeneratedQuestion[]>([])
  const [answers, setAnswers] = useState<
    Record<string, number | boolean | string>
  >({})
  const [submitted, setSubmitted] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)

  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [progressState, setProgressState] = useState<PracticeProgressState>({
    completedSets: 0,
    diagnosticInitialDone: false,
    diagnosticMidDone: false,
    diagnosticFinalDone: false,
  })

  const subjectConfig = useMemo(() => {
    return (
      (SUBJECT_PRESETS as SubjectLike[]).find(
        (subject) => subject.name === selectedSubject
      ) || null
    )
  }, [selectedSubject])

  const units = useMemo(() => buildUnitList(subjectConfig), [subjectConfig])

  const selectedUnit = useMemo(() => {
    return units.find((unit) => unit.id === selectedUnitId) || null
  }, [units, selectedUnitId])

  const visibleTopics = useMemo(() => {
    if (selectedUnit && Array.isArray(selectedUnit.topics)) {
      return selectedUnit.topics
    }

    return []
  }, [selectedUnit])

  const visibleReadings = useMemo(() => {
    if (selectedUnit && Array.isArray(selectedUnit.readings)) {
      return selectedUnit.readings
    }

    return []
  }, [selectedUnit])

  const allowedFormats = useMemo(
    () => getAllowedFormatsForSubject(selectedSubject || ''),
    [selectedSubject]
  )

  const evaluationKinds = useMemo(
    () => getEvaluationKindsForSubject(selectedSubject || ''),
    [selectedSubject]
  )

  const accentColor = useMemo(
    () => SUBJECT_COLORS?.[selectedSubject] || '#2563eb',
    [selectedSubject]
  )

  const subjectMode = useMemo(
    () => getSubjectMode(selectedSubject || ''),
    [selectedSubject]
  )

  const isMathSubject = subjectMode === 'math-problem-solving'
  const isTextHeavySubject =
    subjectMode === 'seminar-text' ||
    subjectMode === 'history-analysis' ||
    subjectMode === 'sociology-analysis'

  const progress = useMemo(() => {
    return Math.min(progressState.completedSets / 5, 1)
  }, [progressState.completedSets])

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser()
      if (!user) return
      setUserId(user.id)
    }

    loadUser()
  }, [])

  function calculateLevel(totalXp: number) {
    return Math.floor(totalXp / 100) + 1
  }

  async function handleSelectSubject(subject: string) {
    const preset = (SUBJECT_PRESETS as SubjectLike[]).find(
      (item) => item.name === subject
    )

    const unitList = buildUnitList(preset || null)
    const firstUnit = unitList[0] || null
    const firstTopic = firstUnit?.topics?.[0] || 'General'
    const firstReading = firstUnit?.readings?.[0] || ''

    setSelectedSubject(subject)
    setSelectedUnitId(firstUnit?.id || '')
    setSelectedTopic(firstTopic)
    setSelectedReading(firstReading)
    setEvaluationTarget('todas')
    setFormat(getDefaultFormatForSubject(subject))
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    setScoreSaved(false)
    setShowWhiteboard(false)
    setDiagnosticStage('inicio')
    setProgressState({
      completedSets: 0,
      diagnosticInitialDone: false,
      diagnosticMidDone: false,
      diagnosticFinalDone: false,
    })

    if (userId) {
      try {
        const diag = await getDiagnosticBySubject(userId, subject)
        setDiagnostic(diag)
      } catch (error) {
        console.error(error)
        setDiagnostic(null)
      }
    }

    setStage('practice')
  }

  function handleSelectUnit(unitId: string) {
    const unit = units.find((item) => item.id === unitId) || null
    setSelectedUnitId(unitId)
    setSelectedTopic(unit?.topics?.[0] || 'General')
    setSelectedReading(unit?.readings?.[0] || '')
    setQuestions([])
    setAnswers({})
    setSubmitted(false)
    setScoreSaved(false)
  }

  async function generatePractice() {
    if (!selectedSubject) return

    try {
      setLoadingQuestions(true)
      setSubmitted(false)
      setAnswers({})
      setScoreSaved(false)

      const effectiveTopic =
        source === 'weakest'
          ? diagnostic?.weak_topics?.[0] || selectedTopic || 'General'
          : selectedTopic || 'General'

      const effectiveCount =
        diagnosticStage === 'ninguno'
          ? count
          : getDiagnosticCount(diagnosticStage, selectedSubject)

      const effectiveFormat =
        diagnosticStage === 'ninguno'
          ? format
          : getDiagnosticFormat(diagnosticStage, selectedSubject)

      const requestedFormat = getRequestedFormat({
        subject: selectedSubject,
        format: effectiveFormat,
      })

      let bankQuestions: BankQuestion[] = []

      if (
        effectiveFormat === 'multiple-choice' ||
        effectiveFormat === 'true-false' ||
        effectiveFormat === 'flashcards' ||
        effectiveFormat === 'exam' ||
        effectiveFormat === 'all'
      ) {
        bankQuestions = await getQuestionsFromBank({
          subject: selectedSubject,
          topic: effectiveTopic,
          difficulty: 'media',
          limit: effectiveCount * 2,
        })
      }

      const hasAnyBank = bankQuestions.length > 0

      let aiQuestions: GeneratedQuestion[] = []

      const needAi =
        source === 'ai' ||
        source === 'mixed' ||
        source === 'weakest' ||
        source === 'past-exam' ||
        !hasAnyBank ||
        effectiveFormat === 'open' ||
        effectiveFormat === 'problem-solving' ||
        effectiveFormat === 'exam' ||
        effectiveFormat === 'all'

      if (needAi) {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'generate-practice-questions',
            subject: selectedSubject,
            unit: selectedUnit?.name || '',
            topic: effectiveTopic,
            reading: selectedReading || '',
            difficulty: 'media',
            count: effectiveFormat === 'all' ? effectiveCount * 2 : effectiveCount,
            format: requestedFormat,
            source,
            evaluationTarget,
            subjectStudyMode: subjectMode,
            diagnosticStage,
          }),
        })

        const data = await res.json()

        const rawAi = normalizeAiQuestionsToBankShape(data?.questions || [], {
          subject: selectedSubject,
          topic: effectiveTopic,
          difficulty: 'media',
          type:
            requestedFormat === 'problem-solving'
              ? 'problem-solving'
              : requestedFormat === 'open'
              ? 'open'
              : requestedFormat === 'true-false'
              ? 'true-false'
              : 'multiple-choice',
        })

        aiQuestions = rawAi.map((question, index) =>
          generateAdaptiveQuestion(
            {
              id: question.id || `ai-${index}`,
              type:
                effectiveFormat === 'true-false'
                  ? 'true-false'
                  : effectiveFormat === 'problem-solving'
                  ? 'problem-solving'
                  : effectiveFormat === 'open'
                  ? 'open'
                  : effectiveFormat === 'flashcards'
                  ? 'flashcards'
                  : 'multiple-choice',
              question: question.question,
              options: question.options || undefined,
              answer: normalizeAnswerValue(
                getCorrectIndex(question.answer) ?? question.answer
              ),
              explanation: question.explanation || undefined,
            },
            selectedSubject
          )
        )
      }

      const normalizedBank: GeneratedQuestion[] = bankQuestions.map(
        (question, index) =>
          generateAdaptiveQuestion(
            {
              id: question.id || `bank-${index}`,
              type:
                effectiveFormat === 'true-false'
                  ? 'true-false'
                  : effectiveFormat === 'flashcards'
                  ? 'flashcards'
                  : isMathSubject && effectiveFormat === 'exam'
                  ? 'problem-solving'
                  : 'multiple-choice',
              question: question.question,
              options: question.options || undefined,
              answer: normalizeAnswerValue(
                getCorrectIndex(question.answer) ?? question.answer
              ),
              explanation: question.explanation || undefined,
            },
            selectedSubject
          )
      )

      let finalQuestions: GeneratedQuestion[] = []

      if (source === 'bank') {
        finalQuestions = normalizedBank.slice(0, effectiveCount)
      } else if (source === 'ai') {
        finalQuestions = aiQuestions.slice(0, effectiveCount)
      } else if (effectiveFormat === 'all') {
        finalQuestions = mixAllQuestionTypes(
          [...normalizedBank, ...aiQuestions],
          effectiveCount,
          selectedSubject
        )
      } else if (effectiveFormat === 'exam') {
        finalQuestions = [...normalizedBank, ...aiQuestions]
          .slice(0, effectiveCount)
          .map((question, index) => {
            if (subjectMode === 'math-problem-solving') {
              return {
                ...question,
                type:
                  index % 3 === 0
                    ? ('multiple-choice' as const)
                    : ('problem-solving' as const),
              }
            }

            if (isTextHeavySubject) {
              return {
                ...question,
                type:
                  index % 4 === 0
                    ? ('open' as const)
                    : ('multiple-choice' as const),
              }
            }

            return question
          })
      } else {
        finalQuestions = [...normalizedBank, ...aiQuestions].slice(0, effectiveCount)
      }

      if (effectiveFormat === 'flashcards') {
        finalQuestions = finalQuestions.slice(0, effectiveCount).map((question) => ({
          ...question,
          type: 'flashcards',
        }))
      }

      if (effectiveFormat === 'open') {
        finalQuestions = aiQuestions.slice(0, effectiveCount).map((question) => ({
          ...question,
          type: 'open',
        }))
      }

      if (effectiveFormat === 'problem-solving') {
        finalQuestions = aiQuestions.slice(0, effectiveCount).map((question) => ({
          ...question,
          type: 'problem-solving',
        }))
      }

      if (finalQuestions.length === 0) {
        alert(
          'No hay suficientes preguntas para esta combinación. Rellena tu banco de preguntas o usa la generación por IA.'
        )
        return
      }

      setQuestions(finalQuestions)
    } catch (error) {
      console.error(error)
      alert('No se pudo generar la práctica')
    } finally {
      setLoadingQuestions(false)
    }
  }

  async function finalizePractice() {
    setSubmitted(true)

    if (!userId || scoreSaved) return

    const gradableQuestions = questions.filter(
      (question) =>
        question.type === 'multiple-choice' || question.type === 'true-false'
    )

    const totalQuestions = gradableQuestions.length
    let correctAnswers = 0

    const attemptsPayload = questions.map((question) => {
      const userAnswer = answers[question.id]
      const normalizedAnswer = normalizeAnswerValue(question.answer)
      const isCorrect =
        question.type === 'multiple-choice' || question.type === 'true-false'
          ? userAnswer === normalizedAnswer
          : false

      if (isCorrect) correctAnswers++

      return {
        user_id: userId,
        subject: selectedSubject,
        topic: buildAttemptTopic(source, diagnostic, selectedTopic),
        question_id: question.id,
        question_text: question.question,
        question_type: question.type,
        source,
        is_correct: isCorrect,
      }
    })

    const score = calculatePercent({ correctAnswers, totalQuestions })
    const earnedXp = calculateXp({ correctAnswers, totalQuestions })
    const nextXp = xp + earnedXp
    const nextLevel = calculateLevel(nextXp)

    try {
      await createPracticeAttempts(attemptsPayload)

      await createUserScore({
        user_id: userId,
        subject: selectedSubject,
        source,
        format,
        score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        xp: earnedXp,
      })

      setXp(nextXp)
      setLevel(nextLevel)
      setScoreSaved(true)

      const nextCompleted = progressState.completedSets + 1
      const nextProgress = Math.min(nextCompleted / 5, 1)

      if (diagnosticStage === 'inicio') {
        setDiagnosticStage('ninguno')
        setProgressState((prev) => ({
          ...prev,
          completedSets: nextCompleted,
          diagnosticInitialDone: true,
        }))
        return
      }

      if (
        !progressState.diagnosticMidDone &&
        shouldTriggerMidDiagnostic(nextProgress)
      ) {
        setDiagnosticStage('medio')
        setProgressState((prev) => ({
          ...prev,
          completedSets: nextCompleted,
          diagnosticMidDone: true,
        }))
        return
      }

      if (
        !progressState.diagnosticFinalDone &&
        shouldTriggerFinalDiagnostic(nextProgress)
      ) {
        setDiagnosticStage('final')
        setProgressState((prev) => ({
          ...prev,
          completedSets: nextCompleted,
          diagnosticFinalDone: true,
        }))
        return
      }

      if (diagnosticStage === 'medio') {
        setDiagnosticStage('ninguno')
        setProgressState((prev) => ({
          ...prev,
          completedSets: nextCompleted,
        }))
        return
      }

      if (diagnosticStage === 'final') {
        setProgressState((prev) => ({
          ...prev,
          completedSets: nextCompleted,
        }))
        return
      }

      setProgressState((prev) => ({
        ...prev,
        completedSets: nextCompleted,
      }))
    } catch (error) {
      console.error(error)
    }
  }

  function renderQuestion(question: GeneratedQuestion, index: number) {
    if (question.type === 'flashcards') {
      return (
        <div key={question.id} style={flashcard}>
          <div style={flashcardFront}>Tarjeta {index + 1}</div>
          <div style={flashcardBack}>{question.question}</div>
          {question.explanation && (
            <div style={flashcardHint}>{question.explanation}</div>
          )}
        </div>
      )
    }

    if (question.type === 'open' || question.type === 'problem-solving') {
      return (
        <div
          key={question.id}
          style={{
            ...questionCard,
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          <div style={questionTitle}>
            {index + 1}. {question.question}
          </div>

          <textarea
            value={String(answers[question.id] || '')}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [question.id]: e.target.value,
              }))
            }
            placeholder={
              question.type === 'problem-solving'
                ? 'Desarrolla paso a paso tu respuesta'
                : 'Escribe tu respuesta'
            }
            disabled={submitted}
            style={textarea}
          />

          {isMathSubject && question.type === 'problem-solving' && (
            <div style={inlineActionRow}>
              <button
                onClick={() => setShowWhiteboard((prev) => !prev)}
                style={secondaryButton}
                type="button"
              >
                {showWhiteboard ? 'Ocultar pizarra' : 'Abrir pizarra'}
              </button>
            </div>
          )}

          {submitted && question.explanation && (
            <div style={feedbackBox}>
              <div style={feedbackText}>{question.explanation}</div>
            </div>
          )}
        </div>
      )
    }

    if (question.type === 'true-false') {
      const userAnswer = answers[question.id]
      const normalizedAnswer = normalizeAnswerValue(question.answer)
      const isCorrect = submitted && userAnswer === normalizedAnswer

      return (
        <div
          key={question.id}
          style={{
            ...questionCard,
            borderLeft: `4px solid ${accentColor}`,
          }}
        >
          <div style={questionTitle}>
            {index + 1}. {question.question}
          </div>

          <div style={optionsList}>
            {[
              { label: 'Verdadero', value: true },
              { label: 'Falso', value: false },
            ].map((option) => (
              <label
                key={option.label}
                style={{
                  ...optionLabel,
                  ...(submitted && option.value === normalizedAnswer
                    ? correctOptionStyle
                    : {}),
                  ...(submitted &&
                  userAnswer === option.value &&
                  option.value !== normalizedAnswer
                    ? wrongOptionStyle
                    : {}),
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={userAnswer === option.value}
                  disabled={submitted}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: option.value,
                    }))
                  }
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {submitted && (
            <div style={feedbackBox}>
              <div>{isCorrect ? '✅ Correcta' : '❌ Incorrecta'}</div>
              {question.explanation && (
                <div style={feedbackText}>{question.explanation}</div>
              )}
            </div>
          )}
        </div>
      )
    }

    const normalizedAnswer = normalizeAnswerValue(question.answer)
    const correctIndex =
      typeof normalizedAnswer === 'number' ? normalizedAnswer : null

    return (
      <div
        key={question.id}
        style={{
          ...questionCard,
          borderLeft: `4px solid ${accentColor}`,
        }}
      >
        <div style={questionTitle}>
          {index + 1}. {question.question}
        </div>

        <div style={optionsList}>
          {(question.options || []).map((option, optionIndex) => {
            const selected = answers[question.id] === optionIndex
            const isCorrect =
              submitted &&
              typeof correctIndex === 'number' &&
              correctIndex === optionIndex
            const isWrongSelected =
              submitted && selected && optionIndex !== correctIndex

            return (
              <label
                key={optionIndex}
                style={{
                  ...optionLabel,
                  ...(isCorrect ? correctOptionStyle : {}),
                  ...(isWrongSelected ? wrongOptionStyle : {}),
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  disabled={submitted}
                  onChange={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: optionIndex,
                    }))
                  }
                />
                <span>
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </span>
              </label>
            )
          })}
        </div>

        {submitted && (
          <div style={feedbackBox}>
            <div>
              {answers[question.id] === correctIndex ? '✅ Correcta' : '❌ Incorrecta'}
            </div>

            {typeof correctIndex === 'number' && (
              <div>
                Respuesta correcta: {String.fromCharCode(65 + correctIndex)}
              </div>
            )}

            {question.explanation && (
              <div style={feedbackText}>{question.explanation}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={container}>
      {stage === 'subject-selection' && (
        <div style={card}>
          <h2 style={title}>Práctica PRO</h2>
          <p style={subtitle}>
            Elige una asignatura. Cada materia se organiza por unidades y activa un modo de estudio distinto.
          </p>

          <div style={statsRow}>
            <div style={statCard}>⭐ XP: {xp}</div>
            <div style={statCard}>🏆 Nivel: {level}</div>
          </div>

          <div style={subjectGrid}>
            {(SUBJECT_PRESETS as SubjectLike[]).map((subject) => (
              <button
                key={subject.name}
                onClick={() => handleSelectSubject(subject.name)}
                style={{
                  ...subjectCard,
                  border: `1px solid ${SUBJECT_COLORS?.[subject.name] || 'rgba(255,255,255,0.10)'}`,
                }}
              >
                <div style={subjectCardTitle}>{subject.name}</div>
                <div style={subjectCardMeta}>
                  {buildUnitList(subject).length} unidades
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'practice' && (
        <>
          <div
            style={{
              ...card,
              border: `1px solid ${accentColor}`,
              boxShadow: `0 0 0 1px ${accentColor}22 inset`,
            }}
          >
            <h2 style={title}>Práctica · {selectedSubject}</h2>

            <div style={statsRow}>
              <div style={statCard}>⭐ XP: {xp}</div>
              <div style={statCard}>🏆 Nivel: {level}</div>
              <div style={statCard}>
                🎯 Tema débil: {diagnostic?.weak_topics?.[0] || 'No detectado'}
              </div>
              <div style={statCard}>
                🧪 Diagnóstico: {diagnosticStage === 'ninguno' ? 'Práctica libre' : diagnosticStage}
              </div>
              <div style={statCard}>
                📈 Progreso: {Math.round(progress * 100)}%
              </div>
            </div>

            <div style={sectionSpacer} />

            <div style={field}>
              <label style={label}>Unidad</label>
              <div style={chipRow}>
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => handleSelectUnit(unit.id)}
                    style={selectedUnitId === unit.id ? activeChip : chip}
                  >
                    {unit.name}
                  </button>
                ))}
              </div>
            </div>

            {visibleTopics.length > 0 && (
              <>
                <div style={sectionSpacer} />
                <div style={field}>
                  <label style={label}>Tema</label>
                  <div style={chipRow}>
                    {visibleTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        style={selectedTopic === topic ? activeChip : chip}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {visibleReadings.length > 0 && (
              <>
                <div style={sectionSpacer} />
                <div style={field}>
                  <label style={label}>Texto / lectura</label>
                  <div style={chipRow}>
                    {visibleReadings.map((reading) => (
                      <button
                        key={reading}
                        onClick={() => setSelectedReading(reading)}
                        style={selectedReading === reading ? activeChip : chip}
                      >
                        {reading}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div style={sectionSpacer} />

            <div style={field}>
              <label style={label}>Fuente</label>
              <div style={chipRow}>
                <button
                  onClick={() => setSource('bank')}
                  style={source === 'bank' ? activeChip : chip}
                >
                  Banco
                </button>
                <button
                  onClick={() => setSource('ai')}
                  style={source === 'ai' ? activeChip : chip}
                >
                  IA
                </button>
                <button
                  onClick={() => setSource('mixed')}
                  style={source === 'mixed' ? activeChip : chip}
                >
                  Mixto
                </button>
                <button
                  onClick={() => setSource('weakest')}
                  style={source === 'weakest' ? activeChip : chip}
                >
                  Tema débil
                </button>
                <button
                  onClick={() => setSource('past-exam')}
                  style={source === 'past-exam' ? activeChip : chip}
                >
                  Pruebas pasadas
                </button>
              </div>
            </div>

            <div style={sectionSpacer} />

            <div style={field}>
              <label style={label}>Tipo de evaluación</label>
              <div style={chipRow}>
                {evaluationKinds.map((kind) => (
                  <button
                    key={kind}
                    onClick={() => setEvaluationTarget(kind)}
                    style={evaluationTarget === kind ? activeChip : chip}
                  >
                    {evaluationLabel(kind)}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionSpacer} />

            <div style={field}>
              <label style={label}>Formato</label>
              <div style={chipRow}>
                {allowedFormats.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFormat(item)}
                    style={format === item ? activeChip : chip}
                    disabled={diagnosticStage !== 'ninguno'}
                  >
                    {formatLabel(item)}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionSpacer} />

            <div style={field}>
              <label style={label}>Cantidad de preguntas</label>
              <div style={chipRow}>
                {[5, 10, 15, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n as QuestionCountRange)}
                    style={count === n ? activeChip : chip}
                    disabled={diagnosticStage !== 'ninguno'}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div style={actions}>
              <button
                onClick={generatePractice}
                style={button}
                disabled={loadingQuestions}
              >
                {loadingQuestions
                  ? 'Generando...'
                  : diagnosticStage === 'ninguno'
                  ? 'Generar práctica'
                  : `Iniciar diagnóstico ${diagnosticStage}`}
              </button>

              <button
                onClick={() => setStage('subject-selection')}
                style={secondaryButton}
              >
                Cambiar asignatura
              </button>
            </div>

            {diagnosticStage !== 'ninguno' && (
              <div style={diagnosticInfoBox}>
                Este diagnóstico es obligatorio en esta etapa. Sirve para medir cómo vas, detectar vacíos y ajustar la práctica siguiente.
              </div>
            )}

            {questions.length === 0 && !loadingQuestions && (
              <div style={emptyBankBox}>
                Aún no hay práctica cargada para este contexto. Si el banco está vacío, rellena tu banco de preguntas o usa la generación por IA.
              </div>
            )}
          </div>

          {showWhiteboard && isMathSubject && (
            <div style={card}>
              <h3 style={sectionTitle}>Pizarra integrada</h3>
              <PizarraView />
            </div>
          )}

          {questions.length > 0 && (
            <div style={practiceLayout}>
              <div style={practiceMain}>
                <div style={card}>
                  <h3 style={sectionTitle}>Práctica</h3>

                  {questions.map((question, index) =>
                    renderQuestion(question, index)
                  )}

                  {!submitted && (
                    <button onClick={finalizePractice} style={button}>
                      Corregir práctica
                    </button>
                  )}

                  {submitted && scoreSaved && (
                    <div style={scoreSavedBox}>
                      Puntaje, XP e intentos guardados.
                    </div>
                  )}
                </div>
              </div>

              <div style={practiceSide}>
                <div style={card}>
                  <AIStudyChat
                    context={{
                      subject: selectedSubject,
                      unit: selectedUnit?.name || '',
                      topic: buildAttemptTopic(source, diagnostic, selectedTopic),
                      reading: selectedReading,
                      type: format,
                      evaluationTarget,
                      diagnosticStage: diagnosticStage === 'ninguno' ? undefined : diagnosticStage,
                    }}
                    title="Asistente IA"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '20px',
  padding: '20px',
  color: 'white',
}

const card: React.CSSProperties = {
  padding: '20px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  marginTop: 0,
}

const subtitle: React.CSSProperties = {
  opacity: 0.75,
  lineHeight: 1.45,
}

const statsRow: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '12px',
}

const statCard: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.06)',
}

const subjectGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
  gap: '12px',
  marginTop: '16px',
}

const subjectCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.04)',
  color: 'white',
  textAlign: 'left',
  cursor: 'pointer',
}

const subjectCardTitle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: '1.05rem',
}

const subjectCardMeta: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.75,
}

const chipRow: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const chip: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeChip: React.CSSProperties = {
  ...chip,
  background: '#2563eb',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: React.CSSProperties = {
  fontWeight: 700,
}

const sectionSpacer: React.CSSProperties = {
  height: '12px',
}

const actions: React.CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 700,
}

const secondaryButton: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const inlineActionRow: React.CSSProperties = {
  marginTop: '10px',
  display: 'flex',
  gap: '8px',
}

const practiceLayout: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '18px',
}

const practiceMain: React.CSSProperties = {
  display: 'grid',
}

const practiceSide: React.CSSProperties = {
  display: 'grid',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const questionCard: React.CSSProperties = {
  marginTop: '15px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
}

const questionTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '10px',
}

const optionsList: React.CSSProperties = {
  display: 'grid',
  gap: '6px',
}

const optionLabel: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  padding: '6px',
  borderRadius: '8px',
}

const correctOptionStyle: React.CSSProperties = {
  background: 'rgba(16,185,129,0.2)',
}

const wrongOptionStyle: React.CSSProperties = {
  background: 'rgba(239,68,68,0.2)',
}

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: '100px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.10)',
}

const feedbackBox: React.CSSProperties = {
  marginTop: '10px',
}

const feedbackText: React.CSSProperties = {
  opacity: 0.85,
  lineHeight: 1.45,
}

const flashcard: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
  marginTop: '12px',
}

const flashcardFront: React.CSSProperties = {
  fontWeight: 800,
}

const flashcardBack: React.CSSProperties = {
  marginTop: '8px',
}

const flashcardHint: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.7,
}

const scoreSavedBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(16,185,129,0.18)',
  fontWeight: 700,
}

const emptyBankBox: React.CSSProperties = {
  marginTop: '16px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(245,158,11,0.16)',
  lineHeight: 1.45,
}

const diagnosticInfoBox: React.CSSProperties = {
  marginTop: '16px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,0.12)',
  lineHeight: 1.45,
}