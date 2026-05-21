"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { type ReactNode, useEffect, useMemo, useState } from "react"
import {
  PSYCHOLOGY_CLASSES,
  PSYCHOLOGY_QUESTIONS,
  getPsychologyDiagnosticQuestions,
  getPsychologyQuestionCounts,
  getPsychologyQuestionsByClass,
  type PsychologyCognitiveSkill,
  type PsychologyDifficulty,
  type PsychologyQuestion,
  type PsychologyQuestionType,
} from "@/lib/psychology-ui-data"
import {
  PSYCHOLOGY_AUTHORS,
  PSYCHOLOGY_CLASSES as SOURCE_CLASSES,
  PSYCHOLOGY_CONCEPTS,
  PSYCHOLOGY_DIAGNOSTIC_RULES,
  PSYCHOLOGY_QUESTIONS as SOURCE_QUESTIONS,
  PSYCHOLOGY_SIMULATIONS,
  PSYCHOLOGY_SUBTOPICS,
  type PsychologySourceRef,
} from "@/lib/psychology"

type SourceQuestion = (typeof SOURCE_QUESTIONS)[number]

type Tab =
  | "ruta"
  | "clases"
  | "autores"
  | "conceptos"
  | "practica"
  | "diagnostico"
  | "simulacion"
  | "errores"
  | "debilidad"
  | "fuentes"

type PracticeMode =
  | "guided"
  | "test"
  | "class"
  | "author"
  | "concept"
  | "application"
  | "smart-review"
  | "adaptive"

type OptionId = "A" | "B" | "C" | "D"

type Filters = {
  classId: string
  authorId: string
  conceptId: string
  difficulty: "all" | PsychologyDifficulty
  type: "all" | PsychologyQuestionType
  cognitiveSkill: "all" | PsychologyCognitiveSkill
  amount: number
}

type DiagnosticKind = "general" | "class" | "author" | "concept"

type DiagnosticAttempt = {
  date: string
  kind: DiagnosticKind
  targetLabel: string
  total: number
  correct: number
  weaknesses: string[]
  weakClasses: string[]
  weakAuthors: string[]
  weakConcepts: string[]
  weakSkills: string[]
}

type SimulationAttempt = {
  date: string
  simulationId: string
  title: string
  total: number
  objectiveCorrect: number
  estimatedScore: number
  weaknesses: string[]
}

type DiagnosticResult = {
  autoQuestions: PsychologyQuestion[]
  correct: number
  weaknesses: string[]
  weakClasses: string[]
  weakAuthors: string[]
  weakConcepts: string[]
  weakSkills: string[]
}

type PsychologyProgress = {
  answeredIds: string[]
  correctIds: string[]
  incorrectIds: string[]
  improvedIds: string[]
  markedForReviewIds: string[]
  diagnosticHistory: DiagnosticAttempt[]
  simulationAttempts: SimulationAttempt[]
  weaknessMap: Record<string, number>
  classProgress: Record<string, { answered: number; correct: number }>
  selectedClassId: string
  selectedAuthorId: string
  selectedConceptId: string
  selectedMode: PracticeMode
  lastActiveTab: Tab
}

const STORAGE_KEY = "psychology-practice-progress-v1"
const ONBOARDING_KEY = "psychology-onboarding-seen-v1"

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "ruta", label: "Ruta" },
  { id: "clases", label: "Clases" },
  { id: "autores", label: "Autores" },
  { id: "conceptos", label: "Conceptos" },
  { id: "practica", label: "Práctica" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "simulacion", label: "Simulación" },
  { id: "errores", label: "Revisión de errores" },
  { id: "debilidad", label: "Mapa de debilidad" },
  { id: "fuentes", label: "Fuentes" },
]

const practiceModes: Array<{ id: PracticeMode; label: string; detail: string }> = [
  { id: "guided", label: "Modo guiado", detail: "Pistas, contexto y feedback amplio." },
  { id: "test", label: "Modo prueba", detail: "Sin pistas antes de corregir." },
  { id: "class", label: "Por clase", detail: "Usa la clase seleccionada." },
  { id: "author", label: "Por autor", detail: "Filtra por autor vinculado." },
  { id: "concept", label: "Por concepto", detail: "Entrena un concepto específico." },
  { id: "application", label: "Aplicación", detail: "Casos aplicados e integrativos." },
  { id: "smart-review", label: "Revisión inteligente", detail: "Errores y marcadas para repaso." },
  { id: "adaptive", label: "Mixto adaptativo", detail: "Prioriza debilidades locales." },
]

const difficultyLabels: Record<PsychologyDifficulty, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
}

const skillLabels: Record<PsychologyCognitiveSkill, string> = {
  remember: "Recordar",
  understand: "Comprender",
  apply: "Aplicar",
  analyze: "Analizar",
  compare: "Comparar",
  interpret: "Interpretar",
}

const typeLabels: Record<PsychologyQuestionType, string> = {
  multiple_choice: "Alternativas",
  short_development: "Desarrollo",
  application_case: "Caso aplicado",
  integrative_question: "Integrativa",
}

const sourceKindLabels: Record<string, string> = {
  ppt: "Clase",
  clase: "Clase",
  texto: "Texto",
  cuaderno: "Cuaderno",
  prueba: "Prueba",
  rubrica: "Rúbrica",
  integracion: "Integración",
  requiere_confirmacion: "Requiere confirmación",
}

const defaultProgress: PsychologyProgress = {
  answeredIds: [],
  correctIds: [],
  incorrectIds: [],
  improvedIds: [],
  markedForReviewIds: [],
  diagnosticHistory: [],
  simulationAttempts: [],
  weaknessMap: {},
  classProgress: {},
  selectedClassId: "clase-4-memoria",
  selectedAuthorId: "gray",
  selectedConceptId: "memoria-trabajo",
  selectedMode: "guided",
  lastActiveTab: "ruta",
}

const defaultFilters: Filters = {
  classId: "all",
  authorId: "all",
  conceptId: "all",
  difficulty: "all",
  type: "all",
  cognitiveSkill: "all",
  amount: 20,
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function labelFromId(id: string) {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function cleanText(value: string) {
  return value
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã©", "é")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã±", "ñ")
    .replaceAll("Ã", "Á")
    .replaceAll("Ã‰", "É")
    .replaceAll("Ã", "Í")
    .replaceAll("Ã“", "Ó")
    .replaceAll("Ãš", "Ú")
    .replaceAll("Â¿", "¿")
    .replaceAll("Â¡", "¡")
    .replaceAll("Â·", "·")
    .replaceAll("â€¢", "•")
}

function sourceLabel(source?: PsychologySourceRef) {
  if (!source) return "falta fuente"
  const kind = sourceKindLabels[source.kind] ?? source.kind
  return `${kind}: ${cleanText(source.label)}${source.detail ? `, ${cleanText(source.detail)}` : ""}`
}

function canAutoCorrect(question: PsychologyQuestion) {
  return question.type === "multiple_choice" || question.type === "application_case"
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function loadProgress(): PsychologyProgress {
  if (typeof window === "undefined") return defaultProgress
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw) as Partial<PsychologyProgress> & {
      lastSelectedClassId?: string
      lastSelectedMode?: PracticeMode
      examSimulationHistory?: SimulationAttempt[]
    }
    return {
      ...defaultProgress,
      ...parsed,
      answeredIds: readStringArray(parsed.answeredIds),
      correctIds: readStringArray(parsed.correctIds),
      incorrectIds: readStringArray(parsed.incorrectIds),
      improvedIds: readStringArray(parsed.improvedIds),
      markedForReviewIds: readStringArray(parsed.markedForReviewIds),
      diagnosticHistory: Array.isArray(parsed.diagnosticHistory) ? parsed.diagnosticHistory : [],
      simulationAttempts: Array.isArray(parsed.simulationAttempts)
        ? parsed.simulationAttempts
        : Array.isArray(parsed.examSimulationHistory)
          ? parsed.examSimulationHistory
          : [],
      weaknessMap: parsed.weaknessMap && typeof parsed.weaknessMap === "object" ? parsed.weaknessMap : {},
      classProgress: parsed.classProgress && typeof parsed.classProgress === "object" ? parsed.classProgress : {},
      selectedClassId: parsed.selectedClassId ?? parsed.lastSelectedClassId ?? defaultProgress.selectedClassId,
      selectedMode: parsed.selectedMode ?? parsed.lastSelectedMode ?? defaultProgress.selectedMode,
      lastActiveTab: parsed.lastActiveTab ?? defaultProgress.lastActiveTab,
    }
  } catch {
    return defaultProgress
  }
}

function scoreForSeed(question: PsychologyQuestion, seed: number) {
  let score = seed
  for (const char of question.id + question.prompt) {
    score = (score * 33 + char.charCodeAt(0)) % 1000003
  }
  return score
}

function seededQuestions(questions: PsychologyQuestion[], seed = 1) {
  return [...questions].sort((a, b) => scoreForSeed(a, seed) - scoreForSeed(b, seed))
}

export default function PsychologyPracticeClient() {
  const prefersReducedMotion = useReducedMotion()
  const [progress, setProgress] = useState<PsychologyProgress>(() => loadProgress())
  const [tab, setTabState] = useState<Tab>(progress.lastActiveTab)
  const [practiceMode, setPracticeModeState] = useState<PracticeMode>(progress.selectedMode)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null)
  const [answeredQuestionId, setAnsweredQuestionId] = useState<string | null>(null)
  const [developmentDraft, setDevelopmentDraft] = useState("")
  const [showExpected, setShowExpected] = useState(false)
  const [seed, setSeed] = useState(11)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [diagnosticKind, setDiagnosticKind] = useState<DiagnosticKind>("general")
  const [diagnosticStarted, setDiagnosticStarted] = useState(false)
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState(false)
  const [diagnosticIndex, setDiagnosticIndex] = useState(0)
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({})
  const [simulationId, setSimulationId] = useState(PSYCHOLOGY_SIMULATIONS[1]?.id ?? "prueba-tipo-1")
  const [simulationStarted, setSimulationStarted] = useState(false)
  const [simulationSubmitted, setSimulationSubmitted] = useState(false)
  const [simulationAnswers, setSimulationAnswers] = useState<Record<string, string>>({})
  const [simulationDrafts, setSimulationDrafts] = useState<Record<string, string>>({})

  const sourceByQuestionId = useMemo(
    () => new Map(SOURCE_QUESTIONS.map((question) => [question.id, question])),
    []
  )
  const sourceClassById = useMemo(() => new Map(SOURCE_CLASSES.map((item) => [item.id, item])), [])
  const authorById = useMemo(() => new Map(PSYCHOLOGY_AUTHORS.map((item) => [item.id, item])), [])
  const conceptById = useMemo(() => new Map(PSYCHOLOGY_CONCEPTS.map((item) => [item.id, item])), [])
  const selectedClass = PSYCHOLOGY_CLASSES.find((item) => item.id === progress.selectedClassId) ?? PSYCHOLOGY_CLASSES[0]
  const selectedAuthor = PSYCHOLOGY_AUTHORS.find((item) => item.id === progress.selectedAuthorId) ?? PSYCHOLOGY_AUTHORS[0]
  const selectedConcept = PSYCHOLOGY_CONCEPTS.find((item) => item.id === progress.selectedConceptId) ?? PSYCHOLOGY_CONCEPTS[0]
  const counts = useMemo(() => getPsychologyQuestionCounts(), [])
  const sourceBackedCount = useMemo(
    () => SOURCE_QUESTIONS.filter((question) => question.sourceRefs.length > 0).length,
    []
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const timer = window.setTimeout(() => {
      setShowOnboarding(localStorage.getItem(ONBOARDING_KEY) !== "true")
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  function saveProgress(next: PsychologyProgress) {
    setProgress(next)
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function updateProgress(patch: Partial<PsychologyProgress>) {
    saveProgress({ ...progress, ...patch })
  }

  function closeOnboarding() {
    setShowOnboarding(false)
    if (typeof window !== "undefined") localStorage.setItem(ONBOARDING_KEY, "true")
  }

  function setTab(nextTab: Tab) {
    setTabState(nextTab)
    updateProgress({ lastActiveTab: nextTab })
  }

  function setPracticeMode(nextMode: PracticeMode) {
    setPracticeModeState(nextMode)
    resetQuestionState()
    setPracticeIndex(0)
    updateProgress({ selectedMode: nextMode })
  }

  function selectClass(classId: string, nextTab?: Tab) {
    setFilters((current) => ({ ...current, classId }))
    setPracticeIndex(0)
    resetQuestionState()
    updateProgress({ selectedClassId: classId, lastActiveTab: nextTab ?? progress.lastActiveTab })
    if (nextTab) setTabState(nextTab)
  }

  function selectAuthor(authorId: string, nextTab?: Tab) {
    setFilters((current) => ({ ...current, authorId }))
    setPracticeIndex(0)
    resetQuestionState()
    updateProgress({ selectedAuthorId: authorId, lastActiveTab: nextTab ?? progress.lastActiveTab })
    if (nextTab) setTabState(nextTab)
  }

  function selectConcept(conceptId: string, nextTab?: Tab) {
    setFilters((current) => ({ ...current, conceptId }))
    setPracticeIndex(0)
    resetQuestionState()
    updateProgress({ selectedConceptId: conceptId, lastActiveTab: nextTab ?? progress.lastActiveTab })
    if (nextTab) setTabState(nextTab)
  }

  function resetQuestionState() {
    setSelectedOption(null)
    setAnsweredQuestionId(null)
    setDevelopmentDraft("")
    setShowExpected(false)
  }

  function questionMeta(question: PsychologyQuestion) {
    return sourceByQuestionId.get(question.id)
  }

  function questionAuthors(question: PsychologyQuestion) {
    return (questionMeta(question)?.authorIds ?? [])
      .map((authorId) => authorById.get(authorId)?.name ?? labelFromId(authorId))
      .map(cleanText)
  }

  function questionConcepts(question: PsychologyQuestion) {
    const ids = questionMeta(question)?.conceptIds ?? []
    return ids.map((conceptId) => conceptById.get(conceptId)?.name ?? labelFromId(conceptId)).map(cleanText)
  }

  function questionSources(question: PsychologyQuestion) {
    return questionMeta(question)?.sourceRefs ?? [{ kind: "requiere_confirmacion", label: "falta fuente" } as PsychologySourceRef]
  }

  function questionClassTitle(classId: string) {
    return PSYCHOLOGY_CLASSES.find((item) => item.id === classId)?.title ?? labelFromId(classId)
  }

  function matchesFilters(question: PsychologyQuestion, customFilters = filters) {
    const meta = questionMeta(question)
    const classMatch = customFilters.classId === "all" || question.classId === customFilters.classId
    const authorMatch = customFilters.authorId === "all" || meta?.authorIds.includes(customFilters.authorId)
    const conceptMatch = customFilters.conceptId === "all" || meta?.conceptIds.includes(customFilters.conceptId)
    const difficultyMatch = customFilters.difficulty === "all" || question.difficulty === customFilters.difficulty
    const typeMatch = customFilters.type === "all" || question.type === customFilters.type
    const skillMatch = customFilters.cognitiveSkill === "all" || question.cognitiveSkill === customFilters.cognitiveSkill
    return classMatch && authorMatch && conceptMatch && difficultyMatch && typeMatch && skillMatch
  }

  function topWeaknessLabel() {
    return Object.entries(progress.weaknessMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""
  }

  const practicePool = (() => {
    const topWeakness = topWeaknessLabel().toLowerCase()
    let pool = PSYCHOLOGY_QUESTIONS.filter((question) => matchesFilters(question))

    if (practiceMode === "class") {
      pool = PSYCHOLOGY_QUESTIONS.filter((question) => question.classId === progress.selectedClassId && matchesFilters(question))
    }
    if (practiceMode === "author") {
      pool = PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.authorIds.includes(progress.selectedAuthorId) && matchesFilters(question))
    }
    if (practiceMode === "concept") {
      pool = PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.conceptIds.includes(progress.selectedConceptId) && matchesFilters(question))
    }
    if (practiceMode === "application") {
      pool = pool.filter((question) => question.type === "application_case" || question.type === "integrative_question")
    }
    if (practiceMode === "smart-review") {
      const ids = new Set([...progress.incorrectIds, ...progress.markedForReviewIds])
      pool = PSYCHOLOGY_QUESTIONS.filter((question) => ids.has(question.id))
    }
    if (practiceMode === "adaptive" && topWeakness) {
      const adaptivePool = pool.filter((question) => {
        const haystack = [
          question.weaknessDetected,
          question.studyRecommendation,
          ...question.tags,
          ...question.relatedConcepts,
          ...questionConcepts(question),
        ].join(" ").toLowerCase()
        return haystack.includes(topWeakness) || topWeakness.includes(question.weaknessDetected.toLowerCase())
      })
      if (adaptivePool.length) pool = adaptivePool
    }

    return seededQuestions(pool, seed).slice(0, filters.amount)
  })()

  const reviewQuestions = useMemo(() => {
    const ids = unique([...progress.incorrectIds, ...progress.markedForReviewIds, ...progress.improvedIds])
    return ids.map((id) => PSYCHOLOGY_QUESTIONS.find((question) => question.id === id)).filter(Boolean) as PsychologyQuestion[]
  }, [progress.incorrectIds, progress.markedForReviewIds, progress.improvedIds])

  const activePracticeQuestion = practicePool[practiceIndex % Math.max(practicePool.length, 1)]
  const activeReviewQuestion = reviewQuestions[practiceIndex % Math.max(reviewQuestions.length, 1)]
  const answeredCount = progress.answeredIds.length
  const accuracy = answeredCount ? Math.round((progress.correctIds.length / answeredCount) * 100) : 0
  const recommendedFocus = topWeaknessLabel() || selectedClass.title

  function applyQuestionResult(question: PsychologyQuestion, isCorrect: boolean) {
    const classStats = progress.classProgress[question.classId] ?? { answered: 0, correct: 0 }
    const wasAnswered = progress.answeredIds.includes(question.id)
    const wasCorrect = progress.correctIds.includes(question.id)
    const wasIncorrect = progress.incorrectIds.includes(question.id)
    const nextWeaknessMap = { ...progress.weaknessMap }

    if (!isCorrect) {
      nextWeaknessMap[question.weaknessDetected] = (nextWeaknessMap[question.weaknessDetected] ?? 0) + 1
    }

    saveProgress({
      ...progress,
      answeredIds: unique([...progress.answeredIds, question.id]),
      correctIds: isCorrect
        ? unique([...progress.correctIds, question.id])
        : progress.correctIds.filter((id) => id !== question.id),
      incorrectIds: isCorrect
        ? progress.incorrectIds.filter((id) => id !== question.id)
        : unique([...progress.incorrectIds, question.id]),
      improvedIds: isCorrect && wasIncorrect ? unique([...progress.improvedIds, question.id]) : progress.improvedIds,
      markedForReviewIds: isCorrect
        ? progress.markedForReviewIds.filter((id) => id !== question.id)
        : progress.markedForReviewIds,
      weaknessMap: nextWeaknessMap,
      classProgress: {
        ...progress.classProgress,
        [question.classId]: {
          answered: classStats.answered + (wasAnswered ? 0 : 1),
          correct: classStats.correct + (isCorrect && !wasCorrect ? 1 : 0),
        },
      },
    })
    setAnsweredQuestionId(question.id)
  }

  function verifyObjective(question: PsychologyQuestion) {
    if (!selectedOption) return
    applyQuestionResult(question, selectedOption === question.correctAnswer)
  }

  function markForReview(question: PsychologyQuestion) {
    updateProgress({ markedForReviewIds: unique([...progress.markedForReviewIds, question.id]) })
  }

  function nextQuestion() {
    setPracticeIndex((value) => value + 1)
    resetQuestionState()
  }

  function diagnosticQuestionsFor(kind: DiagnosticKind) {
    if (kind === "general") return getPsychologyDiagnosticQuestions(24, seed)
    if (kind === "class") return seededQuestions(PSYCHOLOGY_QUESTIONS.filter((question) => question.classId === progress.selectedClassId), seed).slice(0, 16)
    if (kind === "author") return seededQuestions(PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.authorIds.includes(progress.selectedAuthorId)), seed).slice(0, 14)
    return seededQuestions(PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.conceptIds.includes(progress.selectedConceptId)), seed).slice(0, 12)
  }

  const diagnosticQuestions = diagnosticQuestionsFor(diagnosticKind)

  function startDiagnostic(kind: DiagnosticKind) {
    setDiagnosticKind(kind)
    setDiagnosticStarted(true)
    setDiagnosticSubmitted(false)
    setDiagnosticIndex(0)
    setDiagnosticAnswers({})
  }

  function diagnosticTargetLabel(kind: DiagnosticKind) {
    if (kind === "class") return selectedClass.title
    if (kind === "author") return selectedAuthor.name
    if (kind === "concept") return selectedConcept.name
    return "General"
  }

  function summarizeAttempt(questions: PsychologyQuestion[], answers: Record<string, string>) {
    const autoQuestions = questions.filter(canAutoCorrect)
    const wrongQuestions = autoQuestions.filter((question) => answers[question.id] && answers[question.id] !== question.correctAnswer)
    const correct = autoQuestions.filter((question) => answers[question.id] === question.correctAnswer).length
    return {
      autoQuestions,
      correct,
      weaknesses: unique(wrongQuestions.map((question) => question.weaknessDetected)),
      weakClasses: unique(wrongQuestions.map((question) => questionClassTitle(question.classId))),
      weakAuthors: unique(wrongQuestions.flatMap(questionAuthors)),
      weakConcepts: unique(wrongQuestions.flatMap(questionConcepts)),
      weakSkills: unique(wrongQuestions.map((question) => skillLabels[question.cognitiveSkill])),
    }
  }

  function submitDiagnostic() {
    const result = summarizeAttempt(diagnosticQuestions, diagnosticAnswers)
    let next = progress
    for (const question of result.autoQuestions) {
      const answer = diagnosticAnswers[question.id]
      if (!answer) continue
      const isCorrect = answer === question.correctAnswer
      const classStats = next.classProgress[question.classId] ?? { answered: 0, correct: 0 }
      next = {
        ...next,
        answeredIds: unique([...next.answeredIds, question.id]),
        correctIds: isCorrect ? unique([...next.correctIds, question.id]) : next.correctIds.filter((id) => id !== question.id),
        incorrectIds: isCorrect ? next.incorrectIds.filter((id) => id !== question.id) : unique([...next.incorrectIds, question.id]),
        weaknessMap: isCorrect
          ? next.weaknessMap
          : { ...next.weaknessMap, [question.weaknessDetected]: (next.weaknessMap[question.weaknessDetected] ?? 0) + 1 },
        classProgress: {
          ...next.classProgress,
          [question.classId]: {
            answered: classStats.answered + (next.answeredIds.includes(question.id) ? 0 : 1),
            correct: classStats.correct + (isCorrect && !next.correctIds.includes(question.id) ? 1 : 0),
          },
        },
      }
    }

    saveProgress({
      ...next,
      diagnosticHistory: [
        ...next.diagnosticHistory,
        {
          date: new Date().toISOString(),
          kind: diagnosticKind,
          targetLabel: diagnosticTargetLabel(diagnosticKind),
          total: result.autoQuestions.length,
          correct: result.correct,
          weaknesses: result.weaknesses,
          weakClasses: result.weakClasses,
          weakAuthors: result.weakAuthors,
          weakConcepts: result.weakConcepts,
          weakSkills: result.weakSkills,
        },
      ].slice(-10),
    })
    setDiagnosticSubmitted(true)
  }

  const selectedSimulation = PSYCHOLOGY_SIMULATIONS.find((item) => item.id === simulationId) ?? PSYCHOLOGY_SIMULATIONS[0]
  const simulationQuestions = useMemo(
    () => selectSimulationQuestions(selectedSimulation, seed),
    [selectedSimulation, seed]
  )

  function selectSimulationQuestions(simulation: (typeof PSYCHOLOGY_SIMULATIONS)[number], currentSeed: number) {
    const selected: PsychologyQuestion[] = []
    const add = (pool: PsychologyQuestion[], max: number) => {
      for (const question of seededQuestions(pool, currentSeed + selected.length)) {
        if (!selected.some((item) => item.id === question.id)) selected.push(question)
        if (selected.length >= max) break
      }
    }
    for (const [type, count] of Object.entries(simulation.typeDistribution)) {
      add(
        PSYCHOLOGY_QUESTIONS.filter((question) => simulation.classIds.includes(question.classId) && question.type === type),
        selected.length + Number(count)
      )
    }
    add(
      PSYCHOLOGY_QUESTIONS.filter((question) => simulation.classIds.includes(question.classId)),
      simulation.questionCount
    )
    return selected.slice(0, simulation.questionCount)
  }

  function startSimulation(id: string) {
    setSimulationId(id)
    setSimulationStarted(true)
    setSimulationSubmitted(false)
    setSimulationAnswers({})
    setSimulationDrafts({})
  }

  function submitSimulation() {
    const result = summarizeAttempt(simulationQuestions, simulationAnswers)
    const developmentAnswered = simulationQuestions.filter(
      (question) => !canAutoCorrect(question) && (simulationDrafts[question.id]?.trim().length ?? 0) > 40
    ).length
    const estimatedScore = Math.round(((result.correct + developmentAnswered * 0.5) / Math.max(simulationQuestions.length, 1)) * 100)

    for (const question of result.autoQuestions) {
      const answer = simulationAnswers[question.id]
      if (answer) applyQuestionResult(question, answer === question.correctAnswer)
    }

    saveProgress({
      ...loadProgress(),
      simulationAttempts: [
        ...loadProgress().simulationAttempts,
        {
          date: new Date().toISOString(),
          simulationId: selectedSimulation.id,
          title: cleanText(selectedSimulation.title),
          total: simulationQuestions.length,
          objectiveCorrect: result.correct,
          estimatedScore,
          weaknesses: result.weaknesses,
        },
      ].slice(-10),
    })
    setSimulationSubmitted(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070614] text-white">
      <NeuronBackground reduced={Boolean(prefersReducedMotion)} />
      <section className="relative mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-5 md:px-6">
        <Hero
          accuracy={accuracy}
          answeredCount={answeredCount}
          correctCount={progress.correctIds.length}
          reviewCount={unique([...progress.incorrectIds, ...progress.markedForReviewIds]).length}
          improvedCount={progress.improvedIds.length}
          focus={recommendedFocus}
          sourceBackedCount={sourceBackedCount}
          onReplayOnboarding={() => setShowOnboarding(true)}
        />
        <TabBar active={tab} onTab={setTab} />

        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="mt-4 flex-1"
          >
            {tab === "ruta" && (
              <RouteTab
                progress={progress}
                sourceClassById={sourceClassById}
                onClass={(classId) => selectClass(classId, "clases")}
                onPractice={(classId) => {
                  selectClass(classId, "practica")
                  setPracticeModeState("class")
                }}
                onDiagnostic={(classId) => {
                  selectClass(classId, "diagnostico")
                  startDiagnostic("class")
                }}
                onSimulation={(classId) => {
                  selectClass(classId, "simulacion")
                  startSimulation(selectedSimulation.id)
                }}
              />
            )}
            {tab === "clases" && (
              <ClassesTab
                progress={progress}
                selectedClassId={progress.selectedClassId}
                onSelect={(classId) => selectClass(classId)}
                onPractice={(classId) => {
                  selectClass(classId, "practica")
                  setPracticeModeState("class")
                }}
              />
            )}
            {tab === "autores" && (
              <AuthorsTab
                selectedAuthorId={progress.selectedAuthorId}
                onAuthor={(authorId) => selectAuthor(authorId)}
                onPractice={(authorId) => {
                  selectAuthor(authorId, "practica")
                  setPracticeModeState("author")
                }}
                onConcept={(conceptId) => selectConcept(conceptId, "conceptos")}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
              />
            )}
            {tab === "conceptos" && (
              <ConceptsTab
                selectedConceptId={progress.selectedConceptId}
                progress={progress}
                onConcept={(conceptId) => selectConcept(conceptId)}
                onPractice={(conceptId) => {
                  selectConcept(conceptId, "practica")
                  setPracticeModeState("concept")
                }}
                classTitle={questionClassTitle}
                questionMeta={questionMeta}
                authorById={authorById}
              />
            )}
            {tab === "practica" && (
              <PracticeTab
                mode={practiceMode}
                filters={filters}
                questions={practicePool}
                activeQuestion={activePracticeQuestion}
                index={practiceIndex}
                selectedOption={selectedOption}
                answered={activePracticeQuestion ? answeredQuestionId === activePracticeQuestion.id : false}
                developmentDraft={developmentDraft}
                showExpected={showExpected}
                selectedClassId={progress.selectedClassId}
                selectedAuthorId={progress.selectedAuthorId}
                selectedConceptId={progress.selectedConceptId}
                onMode={setPracticeMode}
                onFilters={(next) => {
                  setFilters(next)
                  setPracticeIndex(0)
                  resetQuestionState()
                }}
                onSelectOption={setSelectedOption}
                onVerify={verifyObjective}
                onDraft={setDevelopmentDraft}
                onShowExpected={() => setShowExpected(true)}
                onSelfCheck={applyQuestionResult}
                onNext={nextQuestion}
                onMark={markForReview}
                onConcept={(conceptId) => selectConcept(conceptId, "practica")}
                onClass={(classId) => selectClass(classId, "clases")}
                questionAuthors={questionAuthors}
                questionConcepts={questionConcepts}
                questionSources={questionSources}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
              />
            )}
            {tab === "diagnostico" && (
              <DiagnosticTab
                kind={diagnosticKind}
                started={diagnosticStarted}
                submitted={diagnosticSubmitted}
                questions={diagnosticQuestions}
                index={diagnosticIndex}
                answers={diagnosticAnswers}
                history={progress.diagnosticHistory}
                selectedClass={selectedClass}
                selectedAuthor={selectedAuthor}
                selectedConcept={selectedConcept}
                onKind={setDiagnosticKind}
                onStart={startDiagnostic}
                onAnswer={(id, value) => setDiagnosticAnswers((current) => ({ ...current, [id]: value }))}
                onIndex={setDiagnosticIndex}
                onSubmit={submitDiagnostic}
                onRestart={() => {
                  setSeed((value) => value + 17)
                  startDiagnostic(diagnosticKind)
                }}
                questionAuthors={questionAuthors}
                questionConcepts={questionConcepts}
                questionSources={questionSources}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
                result={summarizeAttempt(diagnosticQuestions, diagnosticAnswers)}
              />
            )}
            {tab === "simulacion" && (
              <SimulationTab
                selectedId={simulationId}
                started={simulationStarted}
                submitted={simulationSubmitted}
                questions={simulationQuestions}
                answers={simulationAnswers}
                drafts={simulationDrafts}
                attempts={progress.simulationAttempts}
                onStart={startSimulation}
                onAnswer={(id, value) => setSimulationAnswers((current) => ({ ...current, [id]: value }))}
                onDraft={(id, value) => setSimulationDrafts((current) => ({ ...current, [id]: value }))}
                onSubmit={submitSimulation}
                onNew={() => {
                  setSeed((value) => value + 31)
                  startSimulation(simulationId)
                }}
                questionAuthors={questionAuthors}
                questionConcepts={questionConcepts}
                questionSources={questionSources}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
              />
            )}
            {tab === "errores" && (
              <ReviewTab
                questions={reviewQuestions}
                activeQuestion={activeReviewQuestion}
                index={practiceIndex}
                progress={progress}
                selectedOption={selectedOption}
                answered={activeReviewQuestion ? answeredQuestionId === activeReviewQuestion.id : false}
                developmentDraft={developmentDraft}
                showExpected={showExpected}
                onSelectOption={setSelectedOption}
                onVerify={verifyObjective}
                onDraft={setDevelopmentDraft}
                onShowExpected={() => setShowExpected(true)}
                onSelfCheck={applyQuestionResult}
                onNext={nextQuestion}
                onMark={markForReview}
                onConcept={(conceptId) => {
                  selectConcept(conceptId, "practica")
                  setPracticeModeState("concept")
                }}
                onClass={(classId) => selectClass(classId, "clases")}
                onPractice={() => {
                  setTab("practica")
                  setPracticeMode("smart-review")
                }}
                questionAuthors={questionAuthors}
                questionConcepts={questionConcepts}
                questionSources={questionSources}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
              />
            )}
            {tab === "debilidad" && (
              <WeaknessTab
                progress={progress}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
                questionAuthors={questionAuthors}
                questionConcepts={questionConcepts}
                onPracticeConcept={(conceptId) => {
                  selectConcept(conceptId, "practica")
                  setPracticeModeState("concept")
                }}
                onPracticeClass={(classId) => {
                  selectClass(classId, "practica")
                  setPracticeModeState("class")
                }}
              />
            )}
            {tab === "fuentes" && (
              <SourcesTab
                sourceBackedCount={sourceBackedCount}
                counts={counts}
                questionMeta={questionMeta}
                classTitle={questionClassTitle}
              />
            )}
          </motion.section>
        </AnimatePresence>
      </section>

      {showOnboarding && <Onboarding onClose={closeOnboarding} onTutorial={() => setTab("ruta")} />}
    </main>
  )
}

function NeuronBackground({ reduced }: { reduced: boolean }) {
  const nodes = [
    ["8%", "18%"],
    ["19%", "72%"],
    ["32%", "28%"],
    ["48%", "64%"],
    ["63%", "16%"],
    ["79%", "48%"],
    ["91%", "78%"],
  ]
  const words = ["memoria", "aprendizaje", "razonamiento", "lenguaje", "autores", "conceptos", "aplicación"]
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(236,72,153,.18),transparent_30%),radial-gradient(circle_at_82%_10%,rgba(34,211,238,.18),transparent_28%),linear-gradient(135deg,#070614,#111827_48%,#1e1b4b)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <svg className="absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
        {nodes.slice(0, -1).map((node, index) => (
          <line
            key={`${node[0]}-${index}`}
            x1={node[0]}
            y1={node[1]}
            x2={nodes[index + 1][0]}
            y2={nodes[index + 1][1]}
            stroke="rgba(125,211,252,.55)"
            strokeWidth="1"
          />
        ))}
      </svg>
      {nodes.map(([left, top], index) => (
        <span
          key={`${left}-${top}`}
          className={cx(
            "absolute h-3 w-3 rounded-full border border-cyan-200/50 bg-cyan-300/30 shadow-[0_0_30px_rgba(34,211,238,.45)]",
            !reduced && "animate-pulse"
          )}
          style={{ left, top, animationDelay: `${index * 180}ms` }}
        />
      ))}
      {words.map((word, index) => (
        <span
          key={word}
          className="absolute select-none text-3xl font-black uppercase tracking-[0.22em] text-white/[0.045] md:text-6xl"
          style={{ left: `${8 + ((index * 13) % 76)}%`, top: `${10 + ((index * 17) % 78)}%` }}
        >
          {word}
        </span>
      ))}
    </div>
  )
}

function Hero({
  accuracy,
  answeredCount,
  correctCount,
  reviewCount,
  improvedCount,
  focus,
  sourceBackedCount,
  onReplayOnboarding,
}: {
  accuracy: number
  answeredCount: number
  correctCount: number
  reviewCount: number
  improvedCount: number
  focus: string
  sourceBackedCount: number
  onReplayOnboarding: () => void
}) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-fuchsia-200/15 bg-white/[0.065] p-5 shadow-2xl shadow-fuchsia-950/25 backdrop-blur-2xl md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(236,72,153,.16),transparent_34%),radial-gradient(circle_at_92%_18%,rgba(34,211,238,.18),transparent_30%)]" />
      <div className="relative grid gap-5 xl:grid-cols-[1fr_420px] xl:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="pink">PSICOLOGÍA UI v2</Badge>
            <Badge>{sourceBackedCount} preguntas con fuente</Badge>
            <Badge>4 clases</Badge>
            <Badge>simulaciones</Badge>
            <Badge>diagnóstico</Badge>
            <Badge>mapa de debilidad</Badge>
          </div>
          <h1 className="mt-4 max-w-5xl text-3xl font-black tracking-tight text-white md:text-5xl">
            Psicología / Procesos Psicológicos Básicos
          </h1>
          <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-slate-200 md:text-base">
            Práctica universitaria basada en clases, autores, conceptos y estilo de prueba, con diagnóstico, simulación y mapa de debilidades.
          </p>
          <button
            type="button"
            onClick={onReplayOnboarding}
            className="mt-4 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black text-slate-100 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
          >
            Ver tutorial de nuevo
          </button>
        </div>
        <div className="rounded-3xl border border-cyan-200/15 bg-slate-950/60 p-4 shadow-xl shadow-cyan-950/20">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Progreso local</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Precisión" value={`${accuracy}%`} />
            <Metric label="Respondidas" value={String(answeredCount)} />
            <Metric label="Correctas" value={String(correctCount)} />
            <Metric label="Repaso" value={String(reviewCount)} />
            <Metric label="Mejoradas" value={String(improvedCount)} />
            <Metric label="Foco" value={focus} />
          </div>
        </div>
      </div>
    </header>
  )
}

function TabBar({ active, onTab }: { active: Tab; onTab: (tab: Tab) => void }) {
  return (
    <nav className="mt-4 flex gap-2 overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/80 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTab(item.id)}
          className={cx(
            "shrink-0 rounded-2xl px-4 py-3 text-sm font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300",
            active === item.id
              ? "bg-gradient-to-br from-fuchsia-500 to-cyan-500 text-white shadow-lg shadow-fuchsia-900/30"
              : "text-slate-200 hover:bg-white/10 hover:text-white"
          )}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}

function RouteTab({
  progress,
  sourceClassById,
  onClass,
  onPractice,
  onDiagnostic,
  onSimulation,
}: {
  progress: PsychologyProgress
  sourceClassById: Map<string, (typeof SOURCE_CLASSES)[number]>
  onClass: (classId: string) => void
  onPractice: (classId: string) => void
  onDiagnostic: (classId: string) => void
  onSimulation: (classId: string) => void
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {PSYCHOLOGY_CLASSES.map((item) => {
        const raw = sourceClassById.get(item.id)
        const questions = getPsychologyQuestionsByClass(item.id)
        const stats = progress.classProgress[item.id] ?? { answered: 0, correct: 0 }
        const weakConcepts = questions
          .filter((question) => progress.incorrectIds.includes(question.id))
          .flatMap((question) => question.relatedConcepts)
        const status = routeStatus(stats, questions.length, weakConcepts.length)
        return (
          <GlassPanel key={item.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-200">Clase {raw?.number ?? ""}</p>
                <h2 className="mt-2 text-2xl font-black">{item.title}</h2>
              </div>
              <Badge tone={status === "reforzar" ? "amber" : status === "completada" ? "green" : "cyan"}>{status}</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{item.centralTheme}</p>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              <Metric label="Preguntas" value={String(questions.length)} />
              <Metric label="Progreso" value={`${stats.answered}/${questions.length}`} />
              <Metric label="Correctas" value={String(stats.correct)} />
            </div>
            <InfoGrid
              items={[
                { title: "Autores", body: (raw?.authorIds ?? []).map(labelFromId).join(", ") || "requiere confirmación" },
                { title: "Conceptos", body: item.keyConcepts.slice(0, 6).join(", ") },
                { title: "Débil", body: unique(weakConcepts).slice(0, 3).join(", ") || "Sin debilidad registrada" },
                { title: "Acción", body: status === "reforzar" ? "Practicar errores de esta clase" : "Continuar ruta y simular preguntas" },
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={() => onClass(item.id)}>Estudiar clase</ActionButton>
              <ActionButton onClick={() => onPractice(item.id)}>Practicar clase</ActionButton>
              <ActionButton onClick={() => onClass(item.id)}>Ver autores</ActionButton>
              <ActionButton onClick={() => onDiagnostic(item.id)}>Diagnóstico de clase</ActionButton>
              <ActionButton onClick={() => onSimulation(item.id)}>Simular preguntas</ActionButton>
            </div>
          </GlassPanel>
        )
      })}
    </section>
  )
}

function ClassesTab({
  progress,
  selectedClassId,
  onSelect,
  onPractice,
}: {
  progress: PsychologyProgress
  selectedClassId: string
  onSelect: (classId: string) => void
  onPractice: (classId: string) => void
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <GlassPanel>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Navegación por clase</p>
        <div className="mt-4 grid gap-2">
          {PSYCHOLOGY_CLASSES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cx(
                "rounded-2xl border p-4 text-left transition hover:bg-white/10",
                selectedClassId === item.id ? "border-fuchsia-300 bg-fuchsia-300/15" : "border-white/10 bg-slate-950/45"
              )}
            >
              <p className="text-sm font-black">{item.title}</p>
              <p className="mt-1 text-xs font-semibold text-slate-300">{getPsychologyQuestionsByClass(item.id).length} preguntas con fuente</p>
            </button>
          ))}
        </div>
      </GlassPanel>
      <div className="grid gap-4">
        {PSYCHOLOGY_CLASSES.filter((item) => item.id === selectedClassId).map((item) => {
          const stats = progress.classProgress[item.id] ?? { answered: 0, correct: 0 }
          return (
            <GlassPanel key={item.id}>
              <Badge>Clase activa</Badge>
              <h2 className="mt-3 text-3xl font-black">{item.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{item.centralTheme}</p>
              <InfoGrid
                items={[
                  { title: "Idea central", body: item.teacherEmphasis.join(" ") },
                  { title: "Predicción de prueba", body: item.examPrediction },
                  { title: "Errores esperados", body: item.commonErrors.join(" ") },
                  { title: "Progreso", body: `${stats.correct}/${stats.answered || 0} correctas registradas` },
                ]}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton onClick={() => onPractice(item.id)}>Practicar clase</ActionButton>
              </div>
            </GlassPanel>
          )
        })}
      </div>
    </section>
  )
}

function AuthorsTab({
  selectedAuthorId,
  onAuthor,
  onPractice,
  onConcept,
  questionMeta,
  classTitle,
}: {
  selectedAuthorId: string
  onAuthor: (authorId: string) => void
  onPractice: (authorId: string) => void
  onConcept: (conceptId: string) => void
  questionMeta: (question: PsychologyQuestion) => SourceQuestion | undefined
  classTitle: (classId: string) => string
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      {PSYCHOLOGY_AUTHORS.map((author) => {
        const questions = PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.authorIds.includes(author.id))
        return (
          <GlassPanel key={author.id} active={selectedAuthorId === author.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">{author.importance} importancia</p>
                <h2 className="mt-2 text-2xl font-black">{cleanText(author.name)}</h2>
              </div>
              <Badge>{questions.length} preguntas</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
              {author.explanation ? cleanText(author.explanation) : "requiere confirmación"}
            </p>
            <InfoGrid
              items={[
                { title: "Clases", body: author.classIds.map(classTitle).join(", ") },
                { title: "Conceptos", body: author.conceptIds.slice(0, 8).map(labelFromId).join(", ") || "requiere confirmación" },
                { title: "Errores típicos", body: author.conceptIds.length ? `Confundir ${labelFromId(author.conceptIds[0])} con conceptos cercanos.` : "requiere confirmación" },
                { title: "Fuente", body: author.sourceRefs.map(sourceLabel).join(" | ") || "falta fuente" },
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={() => onAuthor(author.id)}>Ver autor</ActionButton>
              <ActionButton onClick={() => onPractice(author.id)}>Practicar autor</ActionButton>
              {author.conceptIds[0] && <ActionButton onClick={() => onConcept(author.conceptIds[0])}>Ver conceptos asociados</ActionButton>}
            </div>
          </GlassPanel>
        )
      })}
    </section>
  )
}

function ConceptsTab({
  selectedConceptId,
  progress,
  onConcept,
  onPractice,
  classTitle,
  questionMeta,
  authorById,
}: {
  selectedConceptId: string
  progress: PsychologyProgress
  onConcept: (conceptId: string) => void
  onPractice: (conceptId: string) => void
  classTitle: (classId: string) => string
  questionMeta: (question: PsychologyQuestion) => SourceQuestion | undefined
  authorById: Map<string, (typeof PSYCHOLOGY_AUTHORS)[number]>
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {PSYCHOLOGY_CONCEPTS.map((concept) => {
        const questions = PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.conceptIds.includes(concept.id))
        const weakCount = questions.filter((question) => progress.incorrectIds.includes(question.id)).length
        return (
          <GlassPanel key={concept.id} active={selectedConceptId === concept.id}>
            <Badge tone={concept.status === "requires-confirmation" ? "amber" : "green"}>
              {concept.status === "requires-confirmation" ? "requiere confirmación" : "source-supported"}
            </Badge>
            <h2 className="mt-3 text-xl font-black">{cleanText(concept.name)}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{cleanText(concept.definition || "requiere confirmación")}</p>
            <InfoGrid
              compact
              items={[
                { title: "Clase", body: concept.classIds.map(classTitle).join(", ") },
                { title: "Autores", body: concept.authorIds.map((id) => authorById.get(id)?.name ?? labelFromId(id)).join(", ") || "requiere confirmación" },
                { title: "Preguntas", body: String(questions.length) },
                { title: "Debilidad", body: weakCount ? `${weakCount} errores locales` : "Sin errores registrados" },
              ]}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton onClick={() => onConcept(concept.id)}>Ver concepto</ActionButton>
              <ActionButton onClick={() => onPractice(concept.id)}>Practicar concepto</ActionButton>
            </div>
          </GlassPanel>
        )
      })}
    </section>
  )
}

function PracticeTab({
  mode,
  filters,
  questions,
  activeQuestion,
  index,
  selectedOption,
  answered,
  developmentDraft,
  showExpected,
  selectedClassId,
  selectedAuthorId,
  selectedConceptId,
  onMode,
  onFilters,
  onSelectOption,
  onVerify,
  onDraft,
  onShowExpected,
  onSelfCheck,
  onNext,
  onMark,
  onConcept,
  onClass,
  questionAuthors,
  questionConcepts,
  questionSources,
  questionMeta,
  classTitle,
}: QuestionPanelProps & {
  mode: PracticeMode
  filters: Filters
  questions: PsychologyQuestion[]
  activeQuestion?: PsychologyQuestion
  index: number
  selectedClassId: string
  selectedAuthorId: string
  selectedConceptId: string
  onMode: (mode: PracticeMode) => void
  onFilters: (filters: Filters) => void
}) {
  return (
    <section className="grid gap-4">
      <PracticeModeSelector active={mode} onMode={onMode} />
      <FiltersPanel
        filters={filters}
        onFilters={onFilters}
        selectedClassId={selectedClassId}
        selectedAuthorId={selectedAuthorId}
        selectedConceptId={selectedConceptId}
        poolCount={questions.length}
      />
      {questions.length ? (
        <QuestionPanel
          title="Práctica inteligente"
          mode={mode}
          question={activeQuestion}
          index={index}
          total={questions.length}
          selectedOption={selectedOption}
          answered={answered}
          developmentDraft={developmentDraft}
          showExpected={showExpected}
          onSelectOption={onSelectOption}
          onVerify={onVerify}
          onDraft={onDraft}
          onShowExpected={onShowExpected}
          onSelfCheck={onSelfCheck}
          onNext={onNext}
          onMark={onMark}
          onConcept={onConcept}
          onClass={onClass}
          questionAuthors={questionAuthors}
          questionConcepts={questionConcepts}
          questionSources={questionSources}
          questionMeta={questionMeta}
          classTitle={classTitle}
        />
      ) : (
        <EmptyState title="No hay preguntas suficientes" text="No hay preguntas suficientes para este modo con los filtros actuales." />
      )}
    </section>
  )
}

function PracticeModeSelector({ active, onMode }: { active: PracticeMode; onMode: (mode: PracticeMode) => void }) {
  return (
    <GlassPanel>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Modo de práctica</p>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {practiceModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onMode(mode.id)}
            className={cx(
              "rounded-2xl border p-3 text-left transition hover:bg-white/10",
              active === mode.id ? "border-fuchsia-300 bg-fuchsia-300/15" : "border-white/10 bg-slate-950/45"
            )}
          >
            <p className="text-sm font-black">{mode.label}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">{mode.detail}</p>
          </button>
        ))}
      </div>
    </GlassPanel>
  )
}

function FiltersPanel({
  filters,
  onFilters,
  selectedClassId,
  selectedAuthorId,
  selectedConceptId,
  poolCount,
}: {
  filters: Filters
  onFilters: (filters: Filters) => void
  selectedClassId: string
  selectedAuthorId: string
  selectedConceptId: string
  poolCount: number
}) {
  const activeChips = [
    filters.classId !== "all" && `Clase: ${PSYCHOLOGY_CLASSES.find((item) => item.id === filters.classId)?.title}`,
    filters.authorId !== "all" && `Autor: ${PSYCHOLOGY_AUTHORS.find((item) => item.id === filters.authorId)?.name}`,
    filters.conceptId !== "all" && `Concepto: ${PSYCHOLOGY_CONCEPTS.find((item) => item.id === filters.conceptId)?.name}`,
    filters.difficulty !== "all" && `Dificultad: ${difficultyLabels[filters.difficulty]}`,
    filters.type !== "all" && `Tipo: ${typeLabels[filters.type]}`,
    filters.cognitiveSkill !== "all" && `Habilidad: ${skillLabels[filters.cognitiveSkill]}`,
  ].filter(Boolean) as string[]
  return (
    <GlassPanel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Filtros profesionales</p>
        <Badge>{poolCount} preguntas activas</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectBox label="Clase" value={filters.classId} onChange={(value) => onFilters({ ...filters, classId: value })}>
          <option value="all">Todas las clases</option>
          <option value={selectedClassId}>Clase seleccionada</option>
          {PSYCHOLOGY_CLASSES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
        </SelectBox>
        <SelectBox label="Autor" value={filters.authorId} onChange={(value) => onFilters({ ...filters, authorId: value })}>
          <option value="all">Todos los autores</option>
          <option value={selectedAuthorId}>Autor seleccionado</option>
          {PSYCHOLOGY_AUTHORS.map((item) => <option key={item.id} value={item.id}>{cleanText(item.name)}</option>)}
        </SelectBox>
        <SelectBox label="Concepto" value={filters.conceptId} onChange={(value) => onFilters({ ...filters, conceptId: value })}>
          <option value="all">Todos los conceptos</option>
          <option value={selectedConceptId}>Concepto seleccionado</option>
          {PSYCHOLOGY_CONCEPTS.map((item) => <option key={item.id} value={item.id}>{cleanText(item.name)}</option>)}
        </SelectBox>
        <SelectBox label="Dificultad" value={filters.difficulty} onChange={(value) => onFilters({ ...filters, difficulty: value as Filters["difficulty"] })}>
          <option value="all">Todas</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </SelectBox>
        <SelectBox label="Tipo" value={filters.type} onChange={(value) => onFilters({ ...filters, type: value as Filters["type"] })}>
          <option value="all">Todos los tipos</option>
          {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </SelectBox>
        <SelectBox label="Habilidad" value={filters.cognitiveSkill} onChange={(value) => onFilters({ ...filters, cognitiveSkill: value as Filters["cognitiveSkill"] })}>
          <option value="all">Todas las habilidades</option>
          {Object.entries(skillLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </SelectBox>
        <SelectBox label="Cantidad" value={String(filters.amount)} onChange={(value) => onFilters({ ...filters, amount: Number(value) })}>
          {[8, 12, 16, 20, 30, 40].map((value) => <option key={value} value={value}>{value} preguntas</option>)}
        </SelectBox>
        <button
          type="button"
          onClick={() => onFilters(defaultFilters)}
          className="min-h-12 self-end rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
        >
          Reset filtros
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(activeChips.length ? activeChips : ["Sin filtros específicos"]).map((chip) => (
          <span key={chip} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{chip}</span>
        ))}
      </div>
    </GlassPanel>
  )
}

type QuestionPanelProps = {
  selectedOption: OptionId | null
  answered: boolean
  developmentDraft: string
  showExpected: boolean
  onSelectOption: (option: OptionId) => void
  onVerify: (question: PsychologyQuestion) => void
  onDraft: (value: string) => void
  onShowExpected: () => void
  onSelfCheck: (question: PsychologyQuestion, isCorrect: boolean) => void
  onNext: () => void
  onMark: (question: PsychologyQuestion) => void
  onConcept: (conceptId: string) => void
  onClass: (classId: string) => void
  questionAuthors: (question: PsychologyQuestion) => string[]
  questionConcepts: (question: PsychologyQuestion) => string[]
  questionSources: (question: PsychologyQuestion) => PsychologySourceRef[]
  questionMeta: (question: PsychologyQuestion) => SourceQuestion | undefined
  classTitle: (classId: string) => string
}

function QuestionPanel({
  title,
  mode,
  question,
  index,
  total,
  selectedOption,
  answered,
  developmentDraft,
  showExpected,
  onSelectOption,
  onVerify,
  onDraft,
  onShowExpected,
  onSelfCheck,
  onNext,
  onMark,
  onConcept,
  onClass,
  questionAuthors,
  questionConcepts,
  questionSources,
  questionMeta,
  classTitle,
}: QuestionPanelProps & {
  title: string
  mode: PracticeMode
  question?: PsychologyQuestion
  index: number
  total: number
}) {
  if (!question) return <EmptyState title={title} text="No hay preguntas suficientes para este modo con los filtros actuales." />
  const objective = canAutoCorrect(question)
  const meta = questionMeta(question)
  const authors = questionAuthors(question)
  const concepts = questionConcepts(question)
  const sources = questionSources(question)
  const wasCorrect = answered && selectedOption === question.correctAnswer
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
      <GlassPanel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              {title} · Pregunta {Math.min(index + 1, Math.max(total, 1))}/{total}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{classTitle(question.classId)}</Badge>
              <Badge>{typeLabels[question.type]}</Badge>
              <Badge>{difficultyLabels[question.difficulty]}</Badge>
              <Badge>{skillLabels[question.cognitiveSkill]}</Badge>
            </div>
          </div>
          <button type="button" onClick={() => onMark(question)} className="rounded-full border border-amber-200/25 bg-amber-300/10 px-4 py-2 text-xs font-black text-amber-100">
            Enviar a repaso
          </button>
        </div>
        {mode === "guided" && !answered && !showExpected && (
          <div className="mt-5 rounded-3xl border border-cyan-200/15 bg-cyan-300/10 p-4 text-sm font-semibold leading-7 text-cyan-50">
            Pista conceptual: revisa {concepts.slice(0, 3).join(", ") || question.relatedConcepts.slice(0, 3).join(", ") || "los conceptos asociados"} antes de responder.
          </div>
        )}
        <h2 className="mt-5 text-2xl font-black leading-9 md:text-3xl">{question.prompt}</h2>
        {objective ? (
          <>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {question.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={answered}
                  onClick={() => onSelectOption(option.id)}
                  className={cx(
                    "rounded-3xl border p-4 text-left text-sm font-black leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300",
                    selectedOption === option.id && !answered && "border-cyan-300 bg-cyan-300/15 text-white",
                    selectedOption !== option.id && !answered && "border-white/10 bg-slate-950/55 text-slate-100 hover:bg-white/10",
                    answered && option.id === question.correctAnswer && "border-emerald-300 bg-emerald-300/15 text-emerald-50",
                    answered && selectedOption === option.id && option.id !== question.correctAnswer && "border-orange-300 bg-orange-400/15 text-orange-50",
                    answered && selectedOption !== option.id && option.id !== question.correctAnswer && "border-white/10 bg-slate-950/35 text-slate-400"
                  )}
                >
                  <span className="mr-2 text-cyan-200">{option.id}.</span>{option.text}
                </button>
              ))}
            </div>
            {!answered && (
              <button
                type="button"
                disabled={!selectedOption}
                onClick={() => onVerify(question)}
                className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Verificar
              </button>
            )}
          </>
        ) : (
          <>
            <textarea
              value={developmentDraft}
              onChange={(event) => onDraft(event.target.value)}
              placeholder="Responde como en prueba: define, aplica, compara y usa vocabulario del curso."
              className="mt-5 min-h-44 w-full rounded-3xl border border-white/10 bg-slate-950/65 p-4 text-sm font-semibold leading-7 text-white outline-none placeholder:text-slate-500"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={onShowExpected} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Ver pauta esperada</button>
              <button type="button" onClick={() => onSelfCheck(question, true)} className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-5 py-3 text-sm font-black text-emerald-50">Marcar como entendido</button>
              <button type="button" onClick={() => onSelfCheck(question, false)} className="rounded-full border border-amber-300/30 bg-amber-300/15 px-5 py-3 text-sm font-black text-amber-50">Enviar a repaso</button>
            </div>
          </>
        )}
        {(answered || showExpected) && (
          <>
            <FeedbackCard
              question={question}
              selectedAnswer={selectedOption ?? ""}
              questionSources={questionSources}
              questionMeta={questionMeta}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {meta?.conceptIds[0] && <ActionButton onClick={() => onConcept(meta.conceptIds[0])}>Practicar más de este concepto</ActionButton>}
              <ActionButton onClick={() => onClass(question.classId)}>Repasar clase</ActionButton>
              <ActionButton onClick={onNext}>Siguiente pregunta</ActionButton>
            </div>
          </>
        )}
        {answered && (
          <p className={cx("mt-4 text-sm font-black", wasCorrect ? "text-emerald-200" : "text-orange-200")}>
            {wasCorrect ? "Correcta: respuesta consolidada." : "Incorrecta: se agregó al mapa de debilidad."}
          </p>
        )}
      </GlassPanel>
      <GlassPanel>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-200">Contexto de la pregunta</p>
        <InfoGrid
          items={[
            { title: "Autores", body: authors.join(", ") || "requiere confirmación" },
            { title: "Conceptos", body: concepts.slice(0, 8).join(", ") || question.relatedConcepts.join(", ") },
            { title: "Fuente", body: sources.map(sourceLabel).join(" | ") || "falta fuente" },
            { title: "Debilidad detectada", body: question.weaknessDetected },
            { title: "Recomendación", body: question.studyRecommendation },
          ]}
        />
      </GlassPanel>
    </section>
  )
}

function FeedbackCard({
  question,
  selectedAnswer,
  questionSources,
  questionMeta,
}: {
  question: PsychologyQuestion
  selectedAnswer: string
  questionSources: (question: PsychologyQuestion) => PsychologySourceRef[]
  questionMeta: (question: PsychologyQuestion) => SourceQuestion | undefined
}) {
  const objective = canAutoCorrect(question)
  const correct = objective && selectedAnswer === question.correctAnswer
  const meta = questionMeta(question)
  return (
    <div className={cx("mt-5 rounded-3xl border p-5", correct ? "border-emerald-300/25 bg-emerald-300/12" : "border-cyan-300/25 bg-cyan-300/10")}>
      <p className="text-xl font-black">{objective ? (correct ? "Correcta" : "Revisar") : "Respuesta esperada"}</p>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-100">{question.explanation || "requiere confirmación"}</p>
      {!objective && question.expectedAnswer && (
        <p className="mt-3 rounded-2xl bg-slate-950/55 p-3 text-sm font-semibold leading-7 text-slate-200">{question.expectedAnswer}</p>
      )}
      {objective && question.options && (
        <p className="mt-3 text-sm font-bold text-cyan-100">
          Respuesta correcta: {question.correctAnswer}. {question.options.find((option) => option.id === question.correctAnswer)?.text}
        </p>
      )}
      {objective && Object.keys(question.distractorExplanations).length > 0 && (
        <div className="mt-4 grid gap-2">
          {Object.entries(question.distractorExplanations).map(([key, value]) => (
            <p key={key} className="rounded-2xl bg-slate-950/55 p-3 text-sm font-semibold leading-6 text-slate-200">
              <span className="font-black text-cyan-200">{key}:</span> {value}
            </p>
          ))}
        </div>
      )}
      {!objective && question.gradingCriteria && <InfoList title="Criterios de corrección" items={question.gradingCriteria} />}
      <InfoList
        title="Trazabilidad"
        items={[
          `Error común: ${cleanText(meta?.commonMistake ?? "requiere confirmación")}`,
          `Debilidad: ${question.weaknessDetected}`,
          `Fuente: ${questionSources(question).map(sourceLabel).join(" | ") || "falta fuente"}`,
        ]}
      />
    </div>
  )
}

function DiagnosticTab({
  kind,
  started,
  submitted,
  questions,
  index,
  answers,
  history,
  selectedClass,
  selectedAuthor,
  selectedConcept,
  onKind,
  onStart,
  onAnswer,
  onIndex,
  onSubmit,
  onRestart,
  questionSources,
  questionMeta,
  classTitle,
  result,
}: {
  kind: DiagnosticKind
  started: boolean
  submitted: boolean
  questions: PsychologyQuestion[]
  index: number
  answers: Record<string, string>
  history: DiagnosticAttempt[]
  selectedClass: (typeof PSYCHOLOGY_CLASSES)[number]
  selectedAuthor: (typeof PSYCHOLOGY_AUTHORS)[number]
  selectedConcept: (typeof PSYCHOLOGY_CONCEPTS)[number]
  onKind: (kind: DiagnosticKind) => void
  onStart: (kind: DiagnosticKind) => void
  onAnswer: (id: string, value: string) => void
  onIndex: (index: number) => void
  onSubmit: () => void
  onRestart: () => void
  result: DiagnosticResult
} & Pick<QuestionPanelProps, "questionAuthors" | "questionConcepts" | "questionSources" | "questionMeta" | "classTitle">) {
  const cards: Array<{ kind: DiagnosticKind; title: string; detects: string; target: string; count: number }> = [
    { kind: "general", title: "Diagnóstico general", detects: "clases, autores, conceptos y habilidades débiles", target: "Toda la unidad", count: 24 },
    { kind: "class", title: "Diagnóstico por clase", detects: "dominio específico de una clase", target: selectedClass.title, count: 16 },
    { kind: "author", title: "Diagnóstico por autor", detects: "confusiones asociadas a autores", target: cleanText(selectedAuthor.name), count: 14 },
    { kind: "concept", title: "Diagnóstico por concepto", detects: "precisión conceptual y transferencia", target: cleanText(selectedConcept.name), count: 12 },
  ]
  const question = questions[index]
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-4">
        {cards.map((card) => (
          <GlassPanel key={card.kind} active={kind === card.kind}>
            <Badge>{card.count} preguntas</Badge>
            <h2 className="mt-3 text-xl font-black">{card.title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">Detecta {card.detects}.</p>
            <p className="mt-2 text-xs font-bold text-slate-400">Foco: {card.target}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">Tiempo estimado: {Math.max(12, Math.round(card.count * 1.5))} min</p>
            <p className="mt-2 text-xs font-bold text-slate-400">Cobertura: fuentes declaradas</p>
            <ActionButton onClick={() => {
              onKind(card.kind)
              onStart(card.kind)
            }}>Iniciar</ActionButton>
          </GlassPanel>
        ))}
      </div>
      {!started ? (
        <GlassPanel>
          <h2 className="text-2xl font-black">Elige un diagnóstico para comenzar</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
            Usa las reglas diagnósticas existentes para detectar debilidades por clase, autor, concepto y habilidad cognitiva.
          </p>
          <InfoList title="Reglas activas" items={PSYCHOLOGY_DIAGNOSTIC_RULES.slice(0, 8).map((rule) => cleanText(rule.label))} />
        </GlassPanel>
      ) : questions.length ? (
        <GlassPanel>
          <QuestionHeader question={question} title="Diagnóstico universitario" index={index} total={questions.length} classTitle={classTitle} />
          <h2 className="mt-5 text-2xl font-black leading-9">{question.prompt}</h2>
          {canAutoCorrect(question) ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {question.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  disabled={submitted}
                  onClick={() => onAnswer(question.id, option.id)}
                  className={cx(
                    "rounded-3xl border p-4 text-left text-sm font-black leading-6",
                    answers[question.id] === option.id ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-slate-950/55"
                  )}
                >
                  {option.id}. {option.text}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[question.id] ?? ""}
              disabled={submitted}
              onChange={(event) => onAnswer(question.id, event.target.value)}
              className="mt-5 min-h-36 w-full rounded-3xl border border-white/10 bg-slate-950/65 p-4 text-sm font-semibold leading-7 text-white outline-none"
              placeholder="Respuesta de desarrollo para diagnóstico."
            />
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionButton onClick={() => onIndex(Math.max(index - 1, 0))}>Anterior</ActionButton>
            <ActionButton onClick={() => onIndex(Math.min(index + 1, questions.length - 1))}>Siguiente</ActionButton>
            <ActionButton onClick={onSubmit}>Corregir diagnóstico</ActionButton>
            <ActionButton onClick={onRestart}>Nuevo diagnóstico</ActionButton>
          </div>
          {submitted && (
            <ResultPanel
              title="Resultado diagnóstico"
              score={`${result.correct}/${result.autoQuestions.length} objetivas correctas`}
              weaknesses={result.weaknesses}
              weakClasses={result.weakClasses}
              weakAuthors={result.weakAuthors}
              weakConcepts={result.weakConcepts}
              weakSkills={result.weakSkills}
              limited={result.autoQuestions.length < questions.length}
            />
          )}
          {submitted && <FeedbackCard question={question} selectedAnswer={answers[question.id] ?? ""} questionSources={questionSources} questionMeta={questionMeta} />}
        </GlassPanel>
      ) : (
        <EmptyState title="Diagnóstico limitado" text="Diagnóstico limitado por falta de preguntas con fuente suficiente." />
      )}
      <HistoryPanel title="Historial diagnóstico" items={history.map((item) => `${new Date(item.date).toLocaleDateString("es-CL")} · ${item.targetLabel}: ${item.correct}/${item.total}`)} />
    </section>
  )
}

function SimulationTab({
  selectedId,
  started,
  submitted,
  questions,
  answers,
  drafts,
  attempts,
  onStart,
  onAnswer,
  onDraft,
  onSubmit,
  onNew,
  questionAuthors,
  questionConcepts,
  questionSources,
  questionMeta,
  classTitle,
}: {
  selectedId: string
  started: boolean
  submitted: boolean
  questions: PsychologyQuestion[]
  answers: Record<string, string>
  drafts: Record<string, string>
  attempts: SimulationAttempt[]
  onStart: (id: string) => void
  onAnswer: (id: string, value: string) => void
  onDraft: (id: string, value: string) => void
  onSubmit: () => void
  onNew: () => void
} & Pick<QuestionPanelProps, "questionAuthors" | "questionConcepts" | "questionSources" | "questionMeta" | "classTitle">) {
  const result = summarizeSimulation(questions, answers, drafts)
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-4">
        {PSYCHOLOGY_SIMULATIONS.map((simulation) => (
          <GlassPanel key={simulation.id} active={selectedId === simulation.id}>
            <Badge>{simulation.questionCount} preguntas</Badge>
            <h2 className="mt-3 text-xl font-black">{cleanText(simulation.title)}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{cleanText(simulation.description)}</p>
            <InfoGrid
              compact
              items={[
                { title: "Clases", body: String(simulation.classIds.length) },
                { title: "Dificultad", body: Object.entries(simulation.difficultyDistribution).map(([key, value]) => `${key}: ${value}`).join(", ") },
                { title: "Tipos", body: Object.entries(simulation.typeDistribution).map(([key, value]) => `${typeLabels[key as PsychologyQuestionType]}: ${value}`).join(", ") },
                { title: "Minutos", body: String(simulation.suggestedMinutes) },
              ]}
            />
            <InfoList title="Reglas" items={simulation.rules.map(cleanText)} />
            <ActionButton onClick={() => onStart(simulation.id)}>Iniciar simulación</ActionButton>
          </GlassPanel>
        ))}
      </div>
      {started && (
        <GlassPanel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Simulación activa</p>
              <h2 className="mt-2 text-3xl font-black">{cleanText(PSYCHOLOGY_SIMULATIONS.find((item) => item.id === selectedId)?.title ?? "Simulación")}</h2>
            </div>
            <ActionButton onClick={onNew}>Generar otra</ActionButton>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300" style={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }} />
          </div>
          <div className="mt-5 grid gap-4">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <QuestionHeader question={question} title={`Pregunta ${index + 1}`} index={index} total={questions.length} classTitle={classTitle} />
                <p className="mt-3 text-lg font-black leading-7">{question.prompt}</p>
                {canAutoCorrect(question) ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {question.options?.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        disabled={submitted}
                        onClick={() => onAnswer(question.id, option.id)}
                        className={cx(
                          "rounded-2xl border p-3 text-left text-sm font-bold",
                          answers[question.id] === option.id ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-white/5"
                        )}
                      >
                        {option.id}. {option.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={drafts[question.id] ?? ""}
                    disabled={submitted}
                    onChange={(event) => onDraft(question.id, event.target.value)}
                    className="mt-3 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm font-semibold text-white outline-none"
                    placeholder="Respuesta de desarrollo. Se corrige con pauta y autocorrección manual."
                  />
                )}
                {submitted && <FeedbackCard question={question} selectedAnswer={answers[question.id] ?? ""} questionSources={questionSources} questionMeta={questionMeta} />}
                {submitted && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
                    <span>Autores: {questionAuthors(question).join(", ") || "requiere confirmación"}</span>
                    <span>Conceptos: {questionConcepts(question).slice(0, 4).join(", ") || "requiere confirmación"}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {!submitted ? (
            <button type="button" onClick={onSubmit} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
              Corregir simulación
            </button>
          ) : (
            <ResultPanel
              title="Resultado del simulacro"
              score={`Estimación: ${result.estimatedScore}% · Objetivas: ${result.correct}/${result.autoQuestions.length}`}
              weaknesses={result.weaknesses}
              weakClasses={result.weakClasses}
              weakAuthors={result.weakAuthors}
              weakConcepts={result.weakConcepts}
              weakSkills={result.weakSkills}
              limited={false}
            />
          )}
        </GlassPanel>
      )}
      <HistoryPanel title="Historial de simulaciones" items={attempts.map((item) => `${new Date(item.date).toLocaleDateString("es-CL")} · ${item.title}: ${item.estimatedScore}%`)} />
    </section>
  )
}

function summarizeSimulation(questions: PsychologyQuestion[], answers: Record<string, string>, drafts: Record<string, string>) {
  const autoQuestions = questions.filter(canAutoCorrect)
  const wrongQuestions = autoQuestions.filter((question) => answers[question.id] && answers[question.id] !== question.correctAnswer)
  const correct = autoQuestions.filter((question) => answers[question.id] === question.correctAnswer).length
  const developmentAnswered = questions.filter((question) => !canAutoCorrect(question) && (drafts[question.id]?.trim().length ?? 0) > 40).length
  const estimatedScore = Math.round(((correct + developmentAnswered * 0.5) / Math.max(questions.length, 1)) * 100)
  return {
    autoQuestions,
    correct,
    estimatedScore,
    weaknesses: unique(wrongQuestions.map((question) => question.weaknessDetected)),
    weakClasses: unique(wrongQuestions.map((question) => PSYCHOLOGY_CLASSES.find((item) => item.id === question.classId)?.title ?? question.classId)),
    weakAuthors: [] as string[],
    weakConcepts: unique(wrongQuestions.flatMap((question) => question.relatedConcepts)),
    weakSkills: unique(wrongQuestions.map((question) => skillLabels[question.cognitiveSkill])),
  }
}

function ReviewTab({
  questions,
  activeQuestion,
  index,
  progress,
  onPractice,
  ...props
}: QuestionPanelProps & {
  questions: PsychologyQuestion[]
  activeQuestion?: PsychologyQuestion
  index: number
  progress: PsychologyProgress
  onPractice: () => void
}) {
  if (!questions.length) {
    return (
      <EmptyState
        title="Aún no hay errores registrados"
        text="Aún no hay errores registrados. Responde preguntas para construir tu revisión inteligente."
      />
    )
  }
  return (
    <section className="grid gap-4">
      <GlassPanel>
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Incorrectas" value={String(progress.incorrectIds.length)} />
          <Metric label="Marcadas" value={String(progress.markedForReviewIds.length)} />
          <Metric label="Mejoradas" value={String(progress.improvedIds.length)} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.slice(0, 12).map((question) => (
            <span key={question.id} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-200">
              {question.id}
            </span>
          ))}
        </div>
        <ActionButton onClick={onPractice}>Activar revisión inteligente</ActionButton>
      </GlassPanel>
      <QuestionPanel
        title="Revisión de errores"
        mode="smart-review"
        question={activeQuestion}
        index={index}
        total={questions.length}
        {...props}
      />
    </section>
  )
}

function WeaknessTab({
  progress,
  questionMeta,
  classTitle,
  questionAuthors,
  questionConcepts,
  onPracticeConcept,
  onPracticeClass,
}: {
  progress: PsychologyProgress
  questionMeta: (question: PsychologyQuestion) => SourceQuestion | undefined
  classTitle: (classId: string) => string
  questionAuthors: (question: PsychologyQuestion) => string[]
  questionConcepts: (question: PsychologyQuestion) => string[]
  onPracticeConcept: (conceptId: string) => void
  onPracticeClass: (classId: string) => void
}) {
  const wrongQuestions = PSYCHOLOGY_QUESTIONS.filter((question) => progress.incorrectIds.includes(question.id))
  if (!progress.answeredIds.length && !progress.diagnosticHistory.length) {
    return <EmptyState title="Mapa de debilidad" text="El mapa se activará cuando respondas preguntas o completes un diagnóstico." />
  }
  const byClass = countBy(wrongQuestions, (question) => classTitle(question.classId))
  const byAuthor = countBy(wrongQuestions.flatMap(questionAuthors), (item) => item)
  const byConcept = countBy(wrongQuestions.flatMap(questionConcepts), (item) => item)
  const bySkill = countBy(wrongQuestions, (question) => skillLabels[question.cognitiveSkill])
  const byType = countBy(wrongQuestions, (question) => typeLabels[question.type])
  const topWeaknesses = Object.entries(progress.weaknessMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
  return (
    <section className="grid gap-4">
      <GlassPanel>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Top 3 debilidades</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(topWeaknesses.length ? topWeaknesses : [["Sin debilidad registrada", 0] as [string, number]]).map(([label, count]) => (
            <div key={label} className="rounded-3xl border border-amber-200/20 bg-amber-300/10 p-4">
              <p className="text-lg font-black text-amber-100">{label}</p>
              <p className="mt-2 text-sm font-semibold text-amber-50">{count} señales locales</p>
            </div>
          ))}
        </div>
      </GlassPanel>
      <div className="grid gap-4 xl:grid-cols-2">
        <BarPanel title="Por clase" items={byClass} onAction={(label) => {
          const classId = PSYCHOLOGY_CLASSES.find((item) => item.title === label)?.id
          if (classId) onPracticeClass(classId)
        }} />
        <BarPanel title="Por autor" items={byAuthor} />
        <BarPanel title="Por concepto" items={byConcept} onAction={(label) => {
          const conceptId = PSYCHOLOGY_CONCEPTS.find((item) => cleanText(item.name) === label)?.id
          if (conceptId) onPracticeConcept(conceptId)
        }} />
        <BarPanel title="Por habilidad cognitiva" items={bySkill} />
        <BarPanel title="Por tipo de pregunta" items={byType} />
        <GlassPanel>
          <p className="text-lg font-black">Acción recomendada</p>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
            Practica primero la barra más alta y luego revisa las explicaciones con fuente de las preguntas incorrectas.
          </p>
          <InfoList title="IDs con error" items={wrongQuestions.slice(0, 8).map((question) => `${question.id} · ${questionMeta(question)?.conceptIds.slice(0, 2).map(labelFromId).join(", ") || "requiere confirmación"}`)} />
        </GlassPanel>
      </div>
    </section>
  )
}

function SourcesTab({
  sourceBackedCount,
  counts,
  questionMeta,
  classTitle,
}: {
  sourceBackedCount: number
  counts: ReturnType<typeof getPsychologyQuestionCounts>
  questionMeta: (question: PsychologyQuestion) => SourceQuestion | undefined
  classTitle: (classId: string) => string
}) {
  const missing = SOURCE_QUESTIONS.filter((question) => question.sourceRefs.length === 0)
  const sourceLabels = unique(SOURCE_CLASSES.flatMap((item) => item.sourceRefs.map(sourceLabel)))
  const authorCoverage = PSYCHOLOGY_AUTHORS.map((author) => {
    const count = PSYCHOLOGY_QUESTIONS.filter((question) => questionMeta(question)?.authorIds.includes(author.id)).length
    return `${cleanText(author.name)}: ${count} preguntas`
  })
  const requiringConfirmation = [
    ...PSYCHOLOGY_CONCEPTS.filter((item) => item.status === "requires-confirmation").map((item) => cleanText(item.name)),
    ...PSYCHOLOGY_SUBTOPICS.filter((item) => item.status === "requires-confirmation").map((item) => cleanText(item.title)),
  ]
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <GlassPanel>
        <Badge tone="green">{sourceBackedCount} preguntas con fuente</Badge>
        <h2 className="mt-3 text-3xl font-black">Trazabilidad y cobertura</h2>
        <InfoGrid
          items={[
            { title: "Total banco", body: `${counts.total} preguntas` },
            { title: "Cobertura", body: `${sourceBackedCount}/${counts.total} con sourceRefs` },
            { title: "Faltan fuente", body: missing.length ? `${missing.length} preguntas` : "0 preguntas" },
            { title: "Advertencia", body: missing.length ? "falta fuente" : "Todas las preguntas activas tienen fuente declarada" },
          ]}
        />
      </GlassPanel>
      <GlassPanel>
        <p className="text-lg font-black">Clases y fuentes</p>
        <InfoList title="Fuentes legibles" items={sourceLabels} />
      </GlassPanel>
      <GlassPanel>
        <p className="text-lg font-black">Cobertura por clase</p>
        <InfoList
          title="Preguntas por clase"
          items={Object.entries(counts.byClass).map(([classId, count]) => `${classTitle(classId)}: ${count}`)}
        />
      </GlassPanel>
      <GlassPanel>
        <p className="text-lg font-black">Autores y conceptos</p>
        <InfoList title="Autores" items={authorCoverage} />
        <InfoList title="Requiere confirmación" items={requiringConfirmation.length ? requiringConfirmation : ["Sin conceptos marcados como requiere confirmación"]} />
      </GlassPanel>
    </section>
  )
}

function QuestionHeader({
  question,
  title,
  index,
  total,
  classTitle,
}: {
  question: PsychologyQuestion
  title: string
  index: number
  total: number
  classTitle: (classId: string) => string
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
          {title} · {Math.min(index + 1, Math.max(total, 1))}/{total}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{classTitle(question.classId)}</Badge>
          <Badge>{typeLabels[question.type]}</Badge>
          <Badge>{skillLabels[question.cognitiveSkill]}</Badge>
        </div>
      </div>
      <Badge>{question.source.label}</Badge>
    </div>
  )
}

function ResultPanel({
  title,
  score,
  weaknesses,
  weakClasses,
  weakAuthors,
  weakConcepts,
  weakSkills,
  limited,
}: {
  title: string
  score: string
  weaknesses: string[]
  weakClasses: string[]
  weakAuthors: string[]
  weakConcepts: string[]
  weakSkills: string[]
  limited: boolean
}) {
  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-3">
      <InfoList title={title} items={[score, limited ? "Diagnóstico limitado por falta de preguntas autocorregibles con fuente suficiente." : "Corrección objetiva registrada."]} />
      <InfoList title="Clases débiles" items={weakClasses.length ? weakClasses : ["Sin debilidad objetiva detectada"]} />
      <InfoList title="Autores débiles" items={weakAuthors.length ? weakAuthors : ["Sin debilidad objetiva detectada"]} />
      <InfoList title="Conceptos débiles" items={weakConcepts.length ? weakConcepts : ["Sin debilidad objetiva detectada"]} />
      <InfoList title="Habilidades débiles" items={weakSkills.length ? weakSkills : ["Sin debilidad objetiva detectada"]} />
      <InfoList title="Errores comunes" items={weaknesses.length ? weaknesses : ["Mantener práctica mixta de aplicación y desarrollo"]} />
    </div>
  )
}

function BarPanel({ title, items, onAction }: { title: string; items: Record<string, number>; onAction?: (label: string) => void }) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]).slice(0, 8)
  const max = Math.max(...entries.map(([, value]) => value), 1)
  return (
    <GlassPanel>
      <p className="text-lg font-black">{title}</p>
      <div className="mt-4 grid gap-3">
        {(entries.length ? entries : [["Sin datos", 0] as [string, number]]).map(([label, value]) => (
          <button
            key={label}
            type="button"
            onClick={() => onAction?.(label)}
            className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-left"
          >
            <div className="flex items-center justify-between gap-3 text-sm font-black">
              <span>{label}</span>
              <span className="text-cyan-200">{value}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </button>
        ))}
      </div>
    </GlassPanel>
  )
}

function countBy<T>(items: T[], getter: (item: T) => string) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = getter(item)
    if (key) acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function routeStatus(stats: { answered: number; correct: number }, total: number, weakCount: number) {
  if (weakCount > 0) return "reforzar"
  if (stats.answered === 0) return "pendiente"
  if (stats.answered >= Math.min(total, 12) && stats.correct / Math.max(stats.answered, 1) >= 0.75) return "completada"
  return "en progreso"
}

function GlassPanel({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <article className={cx(
      "rounded-[28px] border p-5 shadow-2xl backdrop-blur-xl",
      active ? "border-fuchsia-300/35 bg-fuchsia-300/12 shadow-fuchsia-950/25" : "border-white/10 bg-white/[0.065] shadow-black/20"
    )}>
      {children}
    </article>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-20 rounded-2xl border border-white/10 bg-white/[0.055] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">{label}</p>
      <p className="mt-2 line-clamp-2 text-lg font-black leading-tight text-white">{value}</p>
    </div>
  )
}

function Badge({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "pink" | "amber" | "green" }) {
  const tones = {
    cyan: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
    pink: "border-fuchsia-300/30 bg-fuchsia-300/12 text-fuchsia-100",
    amber: "border-amber-300/30 bg-amber-300/12 text-amber-100",
    green: "border-emerald-300/30 bg-emerald-300/12 text-emerald-100",
  }
  return (
    <span className={cx("rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em]", tones[tone])}>
      {children}
    </span>
  )
}

function ActionButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black text-cyan-50 transition hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
    >
      {children}
    </button>
  )
}

function SelectBox({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl">
        {children}
      </select>
    </label>
  )
}

function InfoGrid({ items, compact = false }: { items: Array<{ title: string; body: string }>; compact?: boolean }) {
  return (
    <div className={cx("mt-4 grid gap-3", compact ? "md:grid-cols-2" : "md:grid-cols-2")}>
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">{item.title}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{item.body || "requiere confirmación"}</p>
        </div>
      ))}
    </div>
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/55 p-4">
      <p className="text-sm font-black text-white">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-slate-300">
        {(items.length ? items : ["requiere confirmación"]).map((item) => <li key={item}>• {cleanText(item)}</li>)}
      </ul>
    </div>
  )
}

function HistoryPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <GlassPanel>
      <p className="text-lg font-black">{title}</p>
      <div className="mt-3 grid gap-2">
        {(items.length ? items : ["Sin registros todavía"]).slice(-6).map((item) => (
          <p key={item} className="rounded-2xl bg-slate-950/50 p-3 text-sm font-semibold text-slate-300">{item}</p>
        ))}
      </div>
    </GlassPanel>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <GlassPanel>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{text}</p>
    </GlassPanel>
  )
}

function Onboarding({ onClose, onTutorial }: { onClose: () => void; onTutorial: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="max-w-2xl rounded-[28px] border border-white/10 bg-slate-950 p-6 shadow-2xl shadow-black/40">
        <Badge tone="pink">Tutorial breve</Badge>
        <h2 className="mt-4 text-3xl font-black">Qué es esta sección</h2>
        <div className="mt-4 grid gap-3 text-sm font-semibold leading-7 text-slate-300">
          <p>Practica por clase, autor o concepto usando las preguntas existentes con fuente.</p>
          <p>El diagnóstico detecta debilidades y las envía al mapa local.</p>
          <p>Las simulaciones ocultan respuestas hasta la corrección y guardan intentos.</p>
          <p>El mapa de debilidad se construye con errores, repaso y mejora.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Comenzar</button>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/10 px-5 py-3 text-sm font-black text-white">Saltar</button>
          <button
            type="button"
            onClick={() => {
              onTutorial()
              onClose()
            }}
            className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-50"
          >
            Ver tutorial de nuevo
          </button>
        </div>
      </div>
    </div>
  )
}
