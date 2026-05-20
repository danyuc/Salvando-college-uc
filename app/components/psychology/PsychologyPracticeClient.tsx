"use client"

import { type ReactNode, useMemo, useState } from "react"
import {
  PSYCHOLOGY_CLASSES,
  PSYCHOLOGY_QUESTIONS,
  PSYCHOLOGY_SUBJECT,
  getPsychologyClassSummary,
  getPsychologyDiagnosticQuestions,
  getPsychologyExamSimulation,
  getPsychologyQuestionsByClass,
  type PsychologyCognitiveSkill,
  type PsychologyDifficulty,
  type PsychologyQuestion,
  type PsychologyQuestionType,
} from "@/lib/psychology-ui-data"

type Mode = "review" | "practice" | "diagnostic" | "exam" | "incorrect" | "weakness"
type OptionId = "A" | "B" | "C" | "D"

type PsychologyProgress = {
  answeredIds: string[]
  correctIds: string[]
  incorrectIds: string[]
  improvedIds: string[]
  diagnosticHistory: Array<{ date: string; total: number; correct: number; weaknesses: string[] }>
  examSimulationHistory: Array<{ date: string; total: number; objectiveCorrect: number; estimatedScore: number; weaknesses: string[] }>
  classProgress: Record<string, { answered: number; correct: number }>
  weaknessMap: Record<string, number>
  lastSelectedClassId: string
  lastSelectedMode: Mode
}

type Filters = {
  classId: string
  difficulty: "all" | PsychologyDifficulty
  type: "all" | PsychologyQuestionType
  cognitiveSkill: "all" | PsychologyCognitiveSkill
  concept: string
}

const STORAGE_KEY = "psychology-practice-progress-v1"

const defaultProgress: PsychologyProgress = {
  answeredIds: [],
  correctIds: [],
  incorrectIds: [],
  improvedIds: [],
  diagnosticHistory: [],
  examSimulationHistory: [],
  classProgress: {},
  weaknessMap: {},
  lastSelectedClassId: "clase-4-memoria",
  lastSelectedMode: "review",
}

const defaultFilters: Filters = {
  classId: "all",
  difficulty: "all",
  type: "all",
  cognitiveSkill: "all",
  concept: "",
}

const modeLabels: Record<Mode, string> = {
  review: "Class Review",
  practice: "Practice Questions",
  diagnostic: "Diagnostic Mode",
  exam: "Exam Simulation",
  incorrect: "Incorrect Review",
  weakness: "Weakness Map",
}

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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function unique(values: string[]) {
  return Array.from(new Set(values))
}

function loadProgress(): PsychologyProgress {
  if (typeof window === "undefined") return defaultProgress
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress
    return { ...defaultProgress, ...JSON.parse(raw) }
  } catch {
    return defaultProgress
  }
}

function canAutoCorrect(question: PsychologyQuestion) {
  return question.type === "multiple_choice" || question.type === "application_case"
}

function applyQuestionResult(progress: PsychologyProgress, question: PsychologyQuestion, isCorrect: boolean) {
  const classStats = progress.classProgress[question.classId] ?? { answered: 0, correct: 0 }
  const wasAnswered = progress.answeredIds.includes(question.id)
  const wasCorrect = progress.correctIds.includes(question.id)
  const wasIncorrect = progress.incorrectIds.includes(question.id)
  const nextWeaknessMap = { ...progress.weaknessMap }

  if (!isCorrect) {
    nextWeaknessMap[question.weaknessDetected] = (nextWeaknessMap[question.weaknessDetected] ?? 0) + 1
  }

  return {
    ...progress,
    answeredIds: unique([...progress.answeredIds, question.id]),
    correctIds: isCorrect
      ? unique([...progress.correctIds, question.id])
      : progress.correctIds.filter((id) => id !== question.id),
    incorrectIds: isCorrect
      ? progress.incorrectIds.filter((id) => id !== question.id)
      : unique([...progress.incorrectIds, question.id]),
    improvedIds: isCorrect && wasIncorrect ? unique([...progress.improvedIds, question.id]) : progress.improvedIds,
    weaknessMap: nextWeaknessMap,
    classProgress: {
      ...progress.classProgress,
      [question.classId]: {
        answered: classStats.answered + (wasAnswered ? 0 : 1),
        correct: classStats.correct + (isCorrect && !wasCorrect ? 1 : 0),
      },
    },
  }
}

function filterQuestions(questions: PsychologyQuestion[], filters: Filters, fallbackClassId: string) {
  return questions.filter((question) => {
    const classMatch =
      filters.classId === "all" ? question.classId === fallbackClassId : question.classId === filters.classId
    const difficultyMatch = filters.difficulty === "all" || question.difficulty === filters.difficulty
    const typeMatch = filters.type === "all" || question.type === filters.type
    const skillMatch = filters.cognitiveSkill === "all" || question.cognitiveSkill === filters.cognitiveSkill
    const concept = filters.concept.trim().toLowerCase()
    const conceptMatch =
      !concept ||
      question.tags.some((tag) => tag.toLowerCase().includes(concept)) ||
      question.relatedConcepts.some((tag) => tag.toLowerCase().includes(concept)) ||
      question.prompt.toLowerCase().includes(concept)

    return classMatch && difficultyMatch && typeMatch && skillMatch && conceptMatch
  })
}

function summarizeWeaknesses(questions: PsychologyQuestion[], answerMap: Record<string, string>) {
  return questions
    .filter((question) => canAutoCorrect(question) && answerMap[question.id] && answerMap[question.id] !== question.correctAnswer)
    .map((question) => question.weaknessDetected)
}

export default function PsychologyPracticeClient() {
  const [progress, setProgress] = useState<PsychologyProgress>(() => loadProgress())
  const [mode, setModeState] = useState<Mode>(progress.lastSelectedMode)
  const [selectedClassId, setSelectedClassId] = useState(progress.lastSelectedClassId)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null)
  const [answeredQuestionId, setAnsweredQuestionId] = useState<string | null>(null)
  const [developmentDraft, setDevelopmentDraft] = useState("")
  const [showExpected, setShowExpected] = useState(false)
  const [diagnosticSeed, setDiagnosticSeed] = useState(1)
  const [diagnosticIndex, setDiagnosticIndex] = useState(0)
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, string>>({})
  const [diagnosticSubmitted, setDiagnosticSubmitted] = useState(false)
  const [examSeed, setExamSeed] = useState(7)
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({})
  const [examDrafts, setExamDrafts] = useState<Record<string, string>>({})
  const [examSubmitted, setExamSubmitted] = useState(false)

  const selectedClass = getPsychologyClassSummary(selectedClassId) ?? PSYCHOLOGY_CLASSES[0]
  const allConcepts = useMemo(
    () => unique(PSYCHOLOGY_QUESTIONS.flatMap((question) => [...question.tags, ...question.relatedConcepts])).sort(),
    []
  )
  const filteredQuestions = useMemo(
    () => filterQuestions(PSYCHOLOGY_QUESTIONS, filters, selectedClassId),
    [filters, selectedClassId]
  )
  const practiceQuestions = filteredQuestions.length ? filteredQuestions : getPsychologyQuestionsByClass(selectedClassId)
  const incorrectQuestions = useMemo(
    () => PSYCHOLOGY_QUESTIONS.filter((question) => progress.incorrectIds.includes(question.id)),
    [progress.incorrectIds]
  )
  const diagnosticQuestions = useMemo(
    () => getPsychologyDiagnosticQuestions(24, diagnosticSeed),
    [diagnosticSeed]
  )
  const examQuestions = useMemo(() => getPsychologyExamSimulation(examSeed), [examSeed])
  const activeQuestion =
    mode === "incorrect"
      ? incorrectQuestions[practiceIndex % Math.max(incorrectQuestions.length, 1)]
      : practiceQuestions[practiceIndex % Math.max(practiceQuestions.length, 1)]

  const answeredCount = progress.answeredIds.length
  const accuracy = answeredCount ? Math.round((progress.correctIds.length / answeredCount) * 100) : 0

  function persist(next: PsychologyProgress) {
    setProgress(next)
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function setMode(nextMode: Mode) {
    setModeState(nextMode)
    setSelectedOption(null)
    setAnsweredQuestionId(null)
    setDevelopmentDraft("")
    setShowExpected(false)
    persist({ ...progress, lastSelectedMode: nextMode })
  }

  function changeClass(classId: string) {
    setSelectedClassId(classId)
    setPracticeIndex(0)
    setFilters((current) => ({ ...current, classId: "all" }))
    persist({ ...progress, lastSelectedClassId: classId })
  }

  function recordPracticeAnswer(question: PsychologyQuestion, isCorrect: boolean) {
    persist(applyQuestionResult(progress, question, isCorrect))
    setAnsweredQuestionId(question.id)
  }

  function verifyCurrentQuestion(question: PsychologyQuestion) {
    if (!selectedOption) return
    recordPracticeAnswer(question, selectedOption === question.correctAnswer)
  }

  function nextPracticeQuestion() {
    setPracticeIndex((value) => value + 1)
    setSelectedOption(null)
    setAnsweredQuestionId(null)
    setDevelopmentDraft("")
    setShowExpected(false)
  }

  function restartDiagnostic() {
    setDiagnosticSeed((value) => value + 17)
    setDiagnosticIndex(0)
    setDiagnosticAnswers({})
    setDiagnosticSubmitted(false)
  }

  function submitDiagnostic() {
    let nextProgress = progress
    for (const question of diagnosticQuestions) {
      const answer = diagnosticAnswers[question.id]
      if (canAutoCorrect(question) && answer) {
        nextProgress = applyQuestionResult(nextProgress, question, answer === question.correctAnswer)
      }
    }
    const autoQuestions = diagnosticQuestions.filter(canAutoCorrect)
    const correct = autoQuestions.filter((question) => diagnosticAnswers[question.id] === question.correctAnswer).length
    const weaknesses = summarizeWeaknesses(diagnosticQuestions, diagnosticAnswers)
    persist({
      ...nextProgress,
      diagnosticHistory: [
        ...nextProgress.diagnosticHistory,
        { date: new Date().toISOString(), total: autoQuestions.length, correct, weaknesses: unique(weaknesses) },
      ].slice(-8),
    })
    setDiagnosticSubmitted(true)
  }

  function newExam() {
    setExamSeed((value) => value + 31)
    setExamAnswers({})
    setExamDrafts({})
    setExamSubmitted(false)
  }

  function submitExam() {
    const autoQuestions = examQuestions.filter(canAutoCorrect)
    const objectiveCorrect = autoQuestions.filter((question) => examAnswers[question.id] === question.correctAnswer).length
    const developmentAnswered = examQuestions.filter(
      (question) => !canAutoCorrect(question) && (examDrafts[question.id]?.trim().length ?? 0) > 40
    ).length
    const estimatedScore = Math.round(((objectiveCorrect + developmentAnswered * 0.5) / examQuestions.length) * 100)
    const weaknesses = summarizeWeaknesses(examQuestions, examAnswers)
    let nextProgress = progress

    for (const question of autoQuestions) {
      const answer = examAnswers[question.id]
      if (answer) nextProgress = applyQuestionResult(nextProgress, question, answer === question.correctAnswer)
    }

    persist({
      ...nextProgress,
      examSimulationHistory: [
        ...nextProgress.examSimulationHistory,
        {
          date: new Date().toISOString(),
          total: examQuestions.length,
          objectiveCorrect,
          estimatedScore,
          weaknesses: unique(weaknesses),
        },
      ].slice(-8),
    })
    setExamSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.2),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,.2),transparent_30%),linear-gradient(135deg,#020617,#0f172a_52%,#111827)] px-4 py-6 text-white">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-300">Práctica universitaria</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">{PSYCHOLOGY_SUBJECT.name}</h1>
              <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-slate-300">
                {PSYCHOLOGY_SUBJECT.description} Banco serio de 100 preguntas con casos, desarrollo, simulacro y mapa de debilidades.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Progreso local</p>
              <p className="mt-2 text-3xl font-black">{accuracy}%</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                {answeredCount} respondidas · {progress.incorrectIds.length} por repasar · {progress.improvedIds.length} mejoradas
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(Object.keys(modeLabels) as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-black transition",
                  mode === item ? "bg-white text-slate-950" : "border border-white/10 bg-white/10 text-white hover:bg-white/15"
                )}
              >
                {modeLabels[item]}
              </button>
            ))}
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Clases</p>
            <div className="mt-4 grid gap-3">
              {PSYCHOLOGY_CLASSES.map((item) => {
                const stats = progress.classProgress[item.id]
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeClass(item.id)}
                    className={cx(
                      "rounded-3xl border p-4 text-left transition hover:-translate-y-0.5",
                      selectedClass.id === item.id ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-slate-950/45"
                    )}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                      {getPsychologyQuestionsByClass(item.id).length} preguntas
                    </p>
                    <p className="mt-1 text-xl font-black">{item.title}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                      {stats ? `${stats.correct}/${stats.answered} correctas` : "Sin práctica registrada"}
                    </p>
                  </button>
                )
              })}
            </div>
            <WeaknessSummary progress={progress} compact />
          </aside>

          <section className="min-w-0">
            {mode === "review" && <ClassReview selectedClass={selectedClass} />}
            {mode === "practice" && (
              <>
                <FiltersPanel filters={filters} concepts={allConcepts} onChange={setFilters} />
                <QuestionPracticePanel
                  title="Practice Questions"
                  question={activeQuestion}
                  index={practiceIndex}
                  total={practiceQuestions.length}
                  selectedOption={selectedOption}
                  answered={activeQuestion ? answeredQuestionId === activeQuestion.id : false}
                  developmentDraft={developmentDraft}
                  showExpected={showExpected}
                  onSelectOption={setSelectedOption}
                  onVerify={verifyCurrentQuestion}
                  onDraft={setDevelopmentDraft}
                  onShowExpected={() => setShowExpected(true)}
                  onSelfCheck={recordPracticeAnswer}
                  onNext={nextPracticeQuestion}
                />
              </>
            )}
            {mode === "diagnostic" && (
              <DiagnosticPanel
                questions={diagnosticQuestions}
                index={diagnosticIndex}
                answers={diagnosticAnswers}
                submitted={diagnosticSubmitted}
                onAnswer={(id, value) => setDiagnosticAnswers((current) => ({ ...current, [id]: value }))}
                onDraft={(id, value) => setDiagnosticAnswers((current) => ({ ...current, [id]: value }))}
                onNext={() => setDiagnosticIndex((value) => Math.min(value + 1, diagnosticQuestions.length - 1))}
                onPrev={() => setDiagnosticIndex((value) => Math.max(value - 1, 0))}
                onSubmit={submitDiagnostic}
                onRestart={restartDiagnostic}
              />
            )}
            {mode === "exam" && (
              <ExamPanel
                questions={examQuestions}
                answers={examAnswers}
                drafts={examDrafts}
                submitted={examSubmitted}
                onAnswer={(id, value) => setExamAnswers((current) => ({ ...current, [id]: value }))}
                onDraft={(id, value) => setExamDrafts((current) => ({ ...current, [id]: value }))}
                onSubmit={submitExam}
                onNewExam={newExam}
              />
            )}
            {mode === "incorrect" && (
              <QuestionPracticePanel
                title="Incorrect Review"
                question={activeQuestion}
                index={practiceIndex}
                total={incorrectQuestions.length}
                selectedOption={selectedOption}
                answered={activeQuestion ? answeredQuestionId === activeQuestion.id : false}
                developmentDraft={developmentDraft}
                showExpected={showExpected}
                onSelectOption={setSelectedOption}
                onVerify={verifyCurrentQuestion}
                onDraft={setDevelopmentDraft}
                onShowExpected={() => setShowExpected(true)}
                onSelfCheck={recordPracticeAnswer}
                onNext={nextPracticeQuestion}
              />
            )}
            {mode === "weakness" && <WeaknessMap progress={progress} />}
          </section>
        </section>
      </section>
    </main>
  )
}

function ClassReview({ selectedClass }: { selectedClass: NonNullable<ReturnType<typeof getPsychologyClassSummary>> }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Class Review</p>
      <h2 className="mt-2 text-3xl font-black">{selectedClass.title}</h2>
      <p className="mt-4 rounded-3xl bg-slate-950/60 p-5 text-base font-semibold leading-8 text-slate-100">
        {selectedClass.centralTheme}
      </p>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <InfoList title="Conceptos clave" items={selectedClass.keyConcepts} />
        <InfoList title="Énfasis docente" items={selectedClass.teacherEmphasis} />
        <InfoList title="Errores comunes" items={selectedClass.commonErrors} />
        <InfoList title="Fuentes" items={selectedClass.sources} />
      </div>
      <p className="mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm font-semibold leading-7 text-amber-50">
        {selectedClass.examPrediction}
      </p>
    </article>
  )
}

function FiltersPanel({
  filters,
  concepts,
  onChange,
}: {
  filters: Filters
  concepts: string[]
  onChange: (filters: Filters) => void
}) {
  return (
    <div className="mb-5 grid gap-3 rounded-[2rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl md:grid-cols-2 xl:grid-cols-5">
      <SelectBox label="Clase" value={filters.classId} onChange={(classId) => onChange({ ...filters, classId })}>
        <option value="all">Clase seleccionada</option>
        {PSYCHOLOGY_CLASSES.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </SelectBox>
      <SelectBox label="Dificultad" value={filters.difficulty} onChange={(difficulty) => onChange({ ...filters, difficulty: difficulty as Filters["difficulty"] })}>
        <option value="all">Todas</option>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </SelectBox>
      <SelectBox label="Tipo" value={filters.type} onChange={(type) => onChange({ ...filters, type: type as Filters["type"] })}>
        <option value="all">Todos</option>
        {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </SelectBox>
      <SelectBox label="Habilidad" value={filters.cognitiveSkill} onChange={(cognitiveSkill) => onChange({ ...filters, cognitiveSkill: cognitiveSkill as Filters["cognitiveSkill"] })}>
        <option value="all">Todas</option>
        {Object.entries(skillLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </SelectBox>
      <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
        Tag/concepto
        <input
          list="psychology-concepts"
          value={filters.concept}
          onChange={(event) => onChange({ ...filters, concept: event.target.value })}
          className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm font-bold normal-case tracking-normal text-white outline-none"
          placeholder="memoria, EI, Sapir..."
        />
        <datalist id="psychology-concepts">
          {concepts.map((concept) => <option key={concept} value={concept} />)}
        </datalist>
      </label>
    </div>
  )
}

function SelectBox({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl">
        {children}
      </select>
    </label>
  )
}

function QuestionPracticePanel({
  title,
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
}: {
  title: string
  question?: PsychologyQuestion
  index: number
  total: number
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
}) {
  if (!question) return <EmptyState title={title} />
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <QuestionHeader title={title} question={question} index={index} total={total} />
      <QuestionBody
        question={question}
        selectedOption={selectedOption}
        answered={answered}
        developmentDraft={developmentDraft}
        showExpected={showExpected}
        onSelectOption={onSelectOption}
        onVerify={onVerify}
        onDraft={onDraft}
        onShowExpected={onShowExpected}
        onSelfCheck={onSelfCheck}
      />
      {(answered || showExpected) && (
        <button type="button" onClick={onNext} className="mt-5 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
          Siguiente pregunta
        </button>
      )}
    </article>
  )
}

function QuestionHeader({ title, question, index, total }: { title: string; question: PsychologyQuestion; index: number; total: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          {title} · {Math.min(index + 1, Math.max(total, 1))}/{total}
        </p>
        <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-slate-400">
          {typeLabels[question.type]} · {difficultyLabels[question.difficulty]} · {skillLabels[question.cognitiveSkill]}
        </p>
      </div>
      <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs font-black text-slate-200">
        {question.source.label}
      </span>
    </div>
  )
}

function QuestionBody({
  question,
  selectedOption,
  answered,
  developmentDraft,
  showExpected,
  onSelectOption,
  onVerify,
  onDraft,
  onShowExpected,
  onSelfCheck,
}: {
  question: PsychologyQuestion
  selectedOption: OptionId | null
  answered: boolean
  developmentDraft: string
  showExpected: boolean
  onSelectOption: (option: OptionId) => void
  onVerify: (question: PsychologyQuestion) => void
  onDraft: (value: string) => void
  onShowExpected: () => void
  onSelfCheck: (question: PsychologyQuestion, isCorrect: boolean) => void
}) {
  const objective = canAutoCorrect(question)
  return (
    <>
      <h2 className="mt-5 text-2xl font-black leading-9 md:text-3xl">{question.prompt}</h2>
      {objective ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {question.options?.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={cx(
                  "rounded-3xl border p-4 text-left text-sm font-black leading-6 transition",
                  selectedOption === option.id && !answered && "border-cyan-300 bg-cyan-300/15",
                  selectedOption !== option.id && !answered && "border-white/10 bg-slate-950/55 hover:bg-white/10",
                  answered && option.id === question.correctAnswer && "border-emerald-300 bg-emerald-300/15 text-emerald-50",
                  answered && selectedOption === option.id && option.id !== question.correctAnswer && "border-rose-300 bg-rose-400/15 text-rose-50",
                  answered && selectedOption !== option.id && option.id !== question.correctAnswer && "border-white/10 bg-slate-950/35 text-slate-400"
                )}
              >
                {option.id}. {option.text}
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
          {answered && <FeedbackCard question={question} selectedAnswer={selectedOption ?? ""} />}
        </>
      ) : (
        <>
          <textarea
            value={developmentDraft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder="Responde como en prueba: define, aplica, compara y usa vocabulario del curso."
            className="mt-5 min-h-40 w-full rounded-3xl border border-white/10 bg-slate-950/65 p-4 text-sm font-semibold leading-7 text-white outline-none placeholder:text-slate-500"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={onShowExpected} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
              Ver respuesta esperada
            </button>
            <button type="button" onClick={() => onSelfCheck(question, true)} className="rounded-full border border-emerald-300/30 bg-emerald-300/15 px-5 py-3 text-sm font-black text-emerald-50">
              La logré
            </button>
            <button type="button" onClick={() => onSelfCheck(question, false)} className="rounded-full border border-amber-300/30 bg-amber-300/15 px-5 py-3 text-sm font-black text-amber-50">
              Queda por repasar
            </button>
          </div>
          {showExpected && <FeedbackCard question={question} selectedAnswer="" />}
        </>
      )}
    </>
  )
}

function DiagnosticPanel({
  questions,
  index,
  answers,
  submitted,
  onAnswer,
  onDraft,
  onNext,
  onPrev,
  onSubmit,
  onRestart,
}: {
  questions: PsychologyQuestion[]
  index: number
  answers: Record<string, string>
  submitted: boolean
  onAnswer: (id: string, value: string) => void
  onDraft: (id: string, value: string) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onRestart: () => void
}) {
  const question = questions[index]
  const autoQuestions = questions.filter(canAutoCorrect)
  const correct = autoQuestions.filter((item) => answers[item.id] === item.correctAnswer).length
  const weaknesses = unique(summarizeWeaknesses(questions, answers))
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <QuestionHeader title="Diagnostic Mode" question={question} index={index} total={questions.length} />
      <h2 className="mt-5 text-2xl font-black leading-9 md:text-3xl">{question.prompt}</h2>
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
          onChange={(event) => onDraft(question.id, event.target.value)}
          className="mt-5 min-h-36 w-full rounded-3xl border border-white/10 bg-slate-950/65 p-4 text-sm font-semibold leading-7 text-white outline-none"
          placeholder="Respuesta de desarrollo para diagnóstico."
        />
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onPrev} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black">Anterior</button>
        <button type="button" onClick={onNext} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black">Siguiente</button>
        <button type="button" onClick={onSubmit} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Corregir diagnóstico</button>
        <button type="button" onClick={onRestart} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-50">Nuevo diagnóstico</button>
      </div>
      {submitted && (
        <ResultPanel
          title="Resultado diagnóstico"
          score={`${correct}/${autoQuestions.length} objetivas correctas`}
          weaknesses={weaknesses}
          questions={questions}
          answers={answers}
        />
      )}
    </article>
  )
}

function ExamPanel({
  questions,
  answers,
  drafts,
  submitted,
  onAnswer,
  onDraft,
  onSubmit,
  onNewExam,
}: {
  questions: PsychologyQuestion[]
  answers: Record<string, string>
  drafts: Record<string, string>
  submitted: boolean
  onAnswer: (id: string, value: string) => void
  onDraft: (id: string, value: string) => void
  onSubmit: () => void
  onNewExam: () => void
}) {
  const autoQuestions = questions.filter(canAutoCorrect)
  const objectiveCorrect = autoQuestions.filter((item) => answers[item.id] === item.correctAnswer).length
  const developmentAnswered = questions.filter((item) => !canAutoCorrect(item) && (drafts[item.id]?.trim().length ?? 0) > 40).length
  const estimatedScore = Math.round(((objectiveCorrect + developmentAnswered * 0.5) / questions.length) * 100)
  const weaknesses = unique(summarizeWeaknesses(questions, answers))
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Exam Simulation</p>
          <h2 className="mt-2 text-3xl font-black">Simulacro variable · 20 preguntas</h2>
        </div>
        <button type="button" onClick={onNewExam} className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-black text-cyan-50">Generar otro</button>
      </div>
      <div className="mt-5 grid gap-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
            <QuestionHeader title={`Pregunta ${index + 1}`} question={question} index={index} total={questions.length} />
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
                placeholder="Respuesta de desarrollo."
              />
            )}
            {submitted && <FeedbackCard question={question} selectedAnswer={answers[question.id] ?? ""} compact />}
          </div>
        ))}
      </div>
      {!submitted ? (
        <button type="button" onClick={onSubmit} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
          Correct exam
        </button>
      ) : (
        <ResultPanel
          title="Resultado del simulacro"
          score={`Estimación: ${estimatedScore}% · Objetivas: ${objectiveCorrect}/${autoQuestions.length}`}
          weaknesses={weaknesses}
          questions={questions}
          answers={answers}
        />
      )}
    </article>
  )
}

function ResultPanel({
  title,
  score,
  weaknesses,
  questions,
  answers,
}: {
  title: string
  score: string
  weaknesses: string[]
  questions: PsychologyQuestion[]
  answers: Record<string, string>
}) {
  const strengths = unique(
    questions
      .filter((question) => canAutoCorrect(question) && answers[question.id] === question.correctAnswer)
      .flatMap((question) => question.tags.slice(0, 2))
  )
  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-3">
      <InfoList title={title} items={[score]} />
      <InfoList title="Fortalezas" items={strengths.length ? strengths : ["requires confirmation"]} />
      <InfoList title="Debilidades críticas" items={weaknesses.length ? weaknesses : ["Sin debilidades objetivas detectadas"]} />
      <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 xl:col-span-3">
        <p className="text-lg font-black text-cyan-100">Ruta recomendada</p>
        <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-cyan-50">
          {(weaknesses.length ? weaknesses : ["Mantener práctica mixta de aplicación y desarrollo"]).slice(0, 5).map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FeedbackCard({
  question,
  selectedAnswer,
  compact = false,
}: {
  question: PsychologyQuestion
  selectedAnswer: string
  compact?: boolean
}) {
  const objective = canAutoCorrect(question)
  const correct = objective && selectedAnswer === question.correctAnswer
  return (
    <div className={cx("mt-5 rounded-3xl border p-5", compact && "p-4", correct ? "border-emerald-300/25 bg-emerald-300/12" : "border-cyan-300/25 bg-cyan-300/10")}>
      <p className="text-xl font-black">{objective ? (correct ? "Correcta" : "Revisar") : "Respuesta esperada"}</p>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-100">{question.explanation}</p>
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
      {!objective && question.gradingCriteria && <InfoList title="Criterios" items={question.gradingCriteria} />}
      <div className="mt-4 flex flex-wrap gap-2">
        {[...question.tags, ...question.relatedConcepts].slice(0, 8).map((tag) => (
          <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{tag}</span>
        ))}
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">Fuente: {question.source.label}</p>
      <p className="mt-2 text-xs font-bold text-amber-100">Si fallaste: {question.studyRecommendation}</p>
    </div>
  )
}

function WeaknessSummary({ progress, compact = false }: { progress: PsychologyProgress; compact?: boolean }) {
  const items = Object.entries(progress.weaknessMap).sort((a, b) => b[1] - a[1]).slice(0, compact ? 4 : 10)
  return (
    <div className={cx("mt-5 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5", compact && "p-4")}>
      <p className="text-lg font-black text-amber-100">Debilidades</p>
      <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-amber-50">
        {(items.length ? items.map(([label, count]) => `${label} (${count})`) : ["Sin debilidades registradas"]).map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  )
}

function WeaknessMap({ progress }: { progress: PsychologyProgress }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Weakness Map</p>
      <h2 className="mt-2 text-3xl font-black">Mapa de debilidades y ruta de estudio</h2>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <WeaknessSummary progress={progress} />
        <InfoList
          title="Historial"
          items={[
            `Diagnósticos: ${progress.diagnosticHistory.length}`,
            `Simulacros: ${progress.examSimulationHistory.length}`,
            `Preguntas mejoradas: ${progress.improvedIds.length}`,
          ]}
        />
      </div>
    </article>
  )
}

function EmptyState({ title }: { title: string }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <p className="text-2xl font-black">{title}</p>
      <p className="mt-3 text-sm font-semibold text-slate-300">No hay preguntas en esta sección. Si esperabas contenido adicional, falta fuente o requires confirmation.</p>
    </article>
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
      <p className="text-lg font-black">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-slate-300">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  )
}
