"use client"

import { type ReactNode, useMemo, useState } from "react"
import {
  PRECALCULO_EXAMS,
  TUTOR_SUGGESTIONS,
  type PrecalculoExamId,
} from "@/lib/precalculo-full-data"
import {
  PRECALCULO_DIAGNOSTIC_13,
  PRECALCULO_PRACTICE_QUESTIONS,
  shuffledDiagnosticQuestions,
  type GraphConfig,
  type PrecalculoLearningQuestion,
} from "@/lib/precalculo-practice-data"
import {
  globalMAT1000Analysis,
  pastExamExercises,
  simulationSources,
  ucPatterns,
  ucVariants,
  type PastExamExercise,
  type UCPattern,
  type UCVariant,
} from "@/lib/precalculo"

type Tab =
  | "ruta"
  | "diagnostico"
  | "practica"
  | "formulas"
  | "graficos"
  | "pasadas"
  | "patrones"
  | "variantes"
  | "simulacros"
  | "analisis"
  | "tutor"

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "ruta", label: "Ruta" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "practica", label: "Práctica" },
  { id: "formulas", label: "Fórmulas y tips" },
  { id: "graficos", label: "Gráficos" },
  { id: "pasadas", label: "Pruebas pasadas" },
  { id: "patrones", label: "Patrones UC" },
  { id: "variantes", label: "Variantes UC" },
  { id: "simulacros", label: "Simulacros" },
  { id: "analisis", label: "Análisis" },
  { id: "tutor", label: "Tutor" },
]

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
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
    .replaceAll("Â´", "'")
    .replaceAll("â‡’", "=>")
    .replaceAll("â€¢", "•")
    .replaceAll("Ï€", "π")
    .replaceAll("âˆž", "∞")
}

function buildTutorAnswer(message: string) {
  const text = message.toLowerCase()
  if (text.includes("cuadrante")) {
    return "Primero fija signos. En QIII, seno y coseno son negativos; tangente queda positiva porque negativo dividido por negativo es positivo."
  }
  if (text.includes("periodo") || text.includes("período")) {
    return "En y = A·sen(k(x-b)) + c, el período es 2π/|k|. El valor k comprime o estira la onda en horizontal."
  }
  if (text.includes("desfase")) {
    return "El desfase está dentro del paréntesis. x - b mueve la gráfica b unidades a la derecha; x + b la mueve a la izquierda."
  }
  if (text.includes("log")) {
    return "Un logaritmo pregunta por un exponente: log₂(32) = 5 porque 2⁵ = 32. Cambia a forma exponencial si dudas."
  }
  return "Anota datos, identifica el tema y recién después eliges fórmula. El panel de práctica muestra fórmula, error típico y pasos con los números reales de la pregunta."
}

export default function PrecalculoFullClient() {
  const [activeExam, setActiveExam] = useState<PrecalculoExamId>("i3")
  const [activeTopic, setActiveTopic] = useState("cuadrantes")
  const [tab, setTab] = useState<Tab>("practica")
  const [diagnosticSet, setDiagnosticSet] = useState(() => shuffledDiagnosticQuestions())
  const [diagnosticIndex, setDiagnosticIndex] = useState(0)
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, number>>({})
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({})
  const [draftAnswer, setDraftAnswer] = useState<number | null>(null)
  const [bankEvaluation, setBankEvaluation] = useState("Todos")
  const [bankTopic, setBankTopic] = useState("Todos")
  const [bankPattern, setBankPattern] = useState("Todos")
  const [bankSource, setBankSource] = useState("todos")
  const [tutorMessage, setTutorMessage] = useState("no entiendo por qué la tangente queda positiva")

  const exam = useMemo(
    () => PRECALCULO_EXAMS.find((item) => item.id === activeExam) ?? PRECALCULO_EXAMS[0],
    [activeExam]
  )
  const selectedTopic = useMemo(
    () => exam.topics.find((topic) => topic.id === activeTopic) ?? exam.topics[0],
    [activeTopic, exam]
  )
  const practiceQuestion = PRECALCULO_PRACTICE_QUESTIONS[practiceIndex % PRECALCULO_PRACTICE_QUESTIONS.length]
  const diagnosticQuestion = diagnosticSet[diagnosticIndex]
  const answeredDiagnostic = diagnosticSet.filter((question) => diagnosticAnswers[question.id] !== undefined)
  const diagnosticCorrect = answeredDiagnostic.filter(
    (question) => diagnosticAnswers[question.id] === question.answerIndex
  )
  const diagnosticDone = answeredDiagnostic.length === PRECALCULO_DIAGNOSTIC_13.length
  const diagnosticWeaknesses = Array.from(
    new Set(
      answeredDiagnostic
        .filter((question) => diagnosticAnswers[question.id] !== question.answerIndex)
        .map((question) => question.topicLabel)
    )
  )
  const diagnosticStrengths = Array.from(
    new Set(
      answeredDiagnostic
        .filter((question) => diagnosticAnswers[question.id] === question.answerIndex)
        .map((question) => question.topicLabel)
    )
  )
  const practiceAnsweredIds = Object.keys(practiceAnswers)
  const practiceCorrect = PRECALCULO_PRACTICE_QUESTIONS.filter(
    (question) => practiceAnswers[question.id] === question.answerIndex
  )
  const practiceAccuracy = practiceAnsweredIds.length
    ? Math.round((practiceCorrect.length / practiceAnsweredIds.length) * 100)
    : 0
  const currentPracticeAnswer = practiceAnswers[practiceQuestion.id]
  const practiceAnswered = currentPracticeAnswer !== undefined
  const weakTopics = diagnosticWeaknesses.length ? diagnosticWeaknesses : ["Trigonometría visual", "Modelamiento"]
  const recommendation = diagnosticWeaknesses[0] ?? practiceQuestion.topicLabel
  const topicOptions = useMemo(
    () => ["Todos", ...Array.from(new Set(pastExamExercises.map((exercise) => exercise.theme))).sort()],
    []
  )
  const patternOptions = useMemo(
    () => ["Todos", ...Array.from(new Set(pastExamExercises.map((exercise) => exercise.pattern))).sort()],
    []
  )
  const filteredPastExercises = useMemo(
    () =>
      pastExamExercises.filter((exercise) => {
        const evaluationMatch = bankEvaluation === "Todos" || exercise.eval === bankEvaluation
        const topicMatch = bankTopic === "Todos" || exercise.theme === bankTopic
        const patternMatch = bankPattern === "Todos" || exercise.pattern === bankPattern
        const sourceMatch =
          bankSource === "todos" ||
          (bankSource === "graficos" && exercise.hasGraph) ||
          (bankSource === "sin-graficos" && !exercise.hasGraph) ||
          (bankSource === "requiere-solucion" && exercise.solutionStatus.includes("requiere"))
        return evaluationMatch && topicMatch && patternMatch && sourceMatch
      }),
    [bankEvaluation, bankPattern, bankSource, bankTopic]
  )

  function changeExam(id: PrecalculoExamId) {
    const nextExam = PRECALCULO_EXAMS.find((item) => item.id === id) ?? PRECALCULO_EXAMS[0]
    setActiveExam(id)
    setActiveTopic(nextExam.topics[0]?.id ?? "")
  }

  function verifyPractice() {
    if (draftAnswer === null) return
    setPracticeAnswers((current) => ({ ...current, [practiceQuestion.id]: draftAnswer }))
  }

  function nextPractice() {
    setPracticeIndex((index) => index + 1)
    setDraftAnswer(null)
  }

  function answerDiagnostic(index: number) {
    setDiagnosticAnswers((current) => ({ ...current, [diagnosticQuestion.id]: index }))
  }

  function restartDiagnostic() {
    setDiagnosticSet(shuffledDiagnosticQuestions())
    setDiagnosticIndex(0)
    setDiagnosticAnswers({})
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(148,163,184,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.06)_1px,transparent_1px),radial-gradient(circle_at_8%_12%,rgba(34,211,238,.22),transparent_28%),radial-gradient(circle_at_88%_8%,rgba(99,102,241,.2),transparent_30%),linear-gradient(180deg,#06101d,#0b1220_45%,#050816)] bg-[size:36px_36px,36px_36px,100%_100%,100%_100%,100%_100%]" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-[0.16]">
        {["π", "√", "f(x)", "log", "sen", "cos", "tan", "θ"].map((symbol, index) => (
          <span
            key={symbol}
            className="absolute select-none text-5xl font-black text-cyan-100 md:text-8xl"
            style={{
              left: `${8 + ((index * 13) % 78)}%`,
              top: `${8 + ((index * 17) % 76)}%`,
              transform: `rotate(${index % 2 === 0 ? -10 : 9}deg)`,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>
      <section className="relative mx-auto flex min-h-screen max-w-[1480px] flex-col px-4 py-4 md:px-6">
        <header className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl lg:grid-cols-[1fr_1.05fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                MAT1000 UC
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-300">
                Práctica visual separada de /practica
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Pre Cálculo MAT1000</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300 md:text-base">
              Entrenamiento UC compacto: diagnóstico de 13 preguntas, práctica con visualizaciones y pasos usando los datos reales de cada ejercicio.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Diagnóstico" value={`${answeredDiagnostic.length}/13`} detail={`${diagnosticCorrect.length} correctas`} />
            <MetricCard label="Práctica" value={`${practiceAccuracy}%`} detail={`${practiceAnsweredIds.length} intentos`} />
            <MetricCard label="Débil" value={weakTopics[0]} detail={weakTopics.slice(1, 3).join(" · ") || "Sin datos aún"} />
            <MetricCard label="Siguiente" value={recommendation} detail="Abrir práctica guiada" />
          </div>
        </header>

        <nav className="mt-4 flex gap-2 overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/70 p-2 shadow-xl shadow-black/20">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cx(
                "shrink-0 rounded-2xl px-4 py-3 text-sm font-black transition",
                tab === item.id
                  ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/20"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "ruta" && (
          <section className="mt-4 grid flex-1 gap-4 xl:grid-cols-[340px_1fr]">
            <ExamRail activeExam={activeExam} activeTopic={activeTopic} onExam={changeExam} onTopic={setActiveTopic} />
            <Panel title={`Ruta ${exam.title}`} eyebrow="Mapa de evaluación">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {exam.topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveTopic(topic.id)}
                    className={cx(
                      "min-h-36 rounded-3xl border p-4 text-left transition hover:-translate-y-1",
                      selectedTopic.id === topic.id
                        ? "border-cyan-300 bg-cyan-300 text-slate-950"
                        : "border-white/10 bg-white/[0.05] text-slate-100"
                    )}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">Tema {index + 1}</p>
                    <p className="mt-2 text-xl font-black">{topic.title}</p>
                    <p className="mt-2 text-sm font-semibold opacity-80">{topic.why}</p>
                  </button>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {tab === "diagnostico" && (
          <section className="mt-4 flex-1">
            <DiagnosticV2
              question={diagnosticQuestion}
              index={diagnosticIndex}
              answers={diagnosticAnswers}
              done={diagnosticDone}
              strengths={diagnosticStrengths}
              weaknesses={diagnosticWeaknesses}
              onAnswer={answerDiagnostic}
              onNext={() => setDiagnosticIndex((index) => Math.min(index + 1, diagnosticSet.length - 1))}
              onRestart={restartDiagnostic}
              onPractice={() => setTab("practica")}
            />
          </section>
        )}

        {tab === "practica" && (
          <section className="mt-4 flex-1">
            <PracticeV2
              question={practiceQuestion}
              selected={draftAnswer}
              answered={practiceAnswered}
              finalAnswer={currentPracticeAnswer}
              onSelect={setDraftAnswer}
              onVerify={verifyPractice}
              onNext={nextPractice}
            />
          </section>
        )}

        {tab === "formulas" && (
          <section className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PRECALCULO_DIAGNOSTIC_13.map((question) => (
              <FormulaTile key={question.id} question={question} />
            ))}
          </section>
        )}

        {tab === "graficos" && (
          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <VisualPanel graph={{ type: "trig", amplitude: 3, k: 2, b: 0, c: 0 }} title="Seno/coseno: amplitud y período" />
            <VisualPanel graph={{ type: "line", points: [{ x: 0, y: 4 }, { x: 2, y: 0 }], slope: -2, intercept: 4 }} title="Plano cartesiano y recta" />
            <GraphMetadataPanel exercises={pastExamExercises.filter((exercise) => exercise.hasGraph).slice(0, 6)} />
          </section>
        )}

        {tab === "pasadas" && (
          <PastExamBank
            exercises={filteredPastExercises}
            topicOptions={topicOptions}
            patternOptions={patternOptions}
            evaluation={bankEvaluation}
            topic={bankTopic}
            pattern={bankPattern}
            source={bankSource}
            onEvaluation={setBankEvaluation}
            onTopic={setBankTopic}
            onPattern={setBankPattern}
            onSource={setBankSource}
          />
        )}

        {tab === "patrones" && <PatternBank patterns={ucPatterns} />}
        {tab === "variantes" && <VariantBank variants={ucVariants} />}
        {tab === "simulacros" && <SimulationBank />}
        {tab === "analisis" && <AnalysisPanel />}

        {tab === "tutor" && (
          <section className="mt-4">
            <Panel title="Tutor MAT1000" eyebrow="Tutor local">
              <textarea
                value={tutorMessage}
                onChange={(event) => setTutorMessage(event.target.value)}
                className="min-h-28 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm font-bold leading-7 text-white outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {TUTOR_SUGGESTIONS.map((item) => (
                  <button key={item} type="button" onClick={() => setTutorMessage(item)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-slate-100">
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-sm font-semibold leading-8 text-cyan-50">
                {buildTutorAnswer(tutorMessage)}
              </p>
            </Panel>
          </section>
        )}

        <footer className="relative mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.28em] text-cyan-100">
          MAT1000 · Práctica inteligente
        </footer>
      </section>
    </main>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="min-h-24 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{label}</p>
      <p className="mt-2 line-clamp-2 text-lg font-black leading-tight text-white">{value}</p>
      <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-400">{detail}</p>
    </div>
  )
}

function PastExamBank({
  exercises,
  topicOptions,
  patternOptions,
  evaluation,
  topic,
  pattern,
  source,
  onEvaluation,
  onTopic,
  onPattern,
  onSource,
}: {
  exercises: PastExamExercise[]
  topicOptions: string[]
  patternOptions: string[]
  evaluation: string
  topic: string
  pattern: string
  source: string
  onEvaluation: (value: string) => void
  onTopic: (value: string) => void
  onPattern: (value: string) => void
  onSource: (value: string) => void
}) {
  return (
    <section className="mt-4 grid gap-4">
      <Panel title="Pruebas pasadas UC" eyebrow={`${exercises.length} ejercicios filtrados`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SelectControl label="Evaluación" value={evaluation} onChange={onEvaluation} options={["Todos", "I1", "I2", "I3", "Examen"]} />
          <SelectControl label="Tema" value={topic} onChange={onTopic} options={topicOptions} />
          <SelectControl label="Patrón UC" value={pattern} onChange={onPattern} options={patternOptions} />
          <SelectControl
            label="Filtro"
            value={source}
            onChange={onSource}
            options={["todos", "graficos", "sin-graficos", "requiere-solucion"]}
          />
        </div>
      </Panel>
      <div className="grid gap-3 xl:grid-cols-2">
        {exercises.slice(0, 18).map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </section>
  )
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl">
        {options.map((option) => (
          <option key={option} value={option}>
            {cleanText(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

function ExerciseCard({ exercise }: { exercise: PastExamExercise }) {
  const solutionLabel = exercise.solutionStatus.includes("oficial")
    ? "Solución oficial"
    : exercise.solutionStatus.includes("propuesta")
      ? "Solución propuesta · requiere validación"
      : "Requiere solución"

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap gap-2">
        <Badge>Prueba pasada UC</Badge>
        <Badge>{exercise.eval} {exercise.year} {exercise.forma}</Badge>
        <Badge>{exercise.hasGraph ? "Con gráfico" : "Sin gráfico"}</Badge>
        <Badge>{solutionLabel}</Badge>
      </div>
      <h3 className="mt-4 text-lg font-black leading-7">{exercise.id}</h3>
      <p className="mt-2 line-clamp-5 whitespace-pre-line text-sm font-semibold leading-6 text-slate-200">{cleanText(exercise.prompt)}</p>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <MiniInfo title="Tema" items={[cleanText(exercise.theme), cleanText(exercise.subtopic)]} />
        <MiniInfo title="Patrón UC" items={[cleanText(exercise.pattern)]} />
        <MiniInfo title="Datos" items={[`Tipo: ${exercise.questionType}`, `Dificultad: ${exercise.difficulty}`, `Fuente: ${exercise.sourceFile} pág. ${exercise.page}`]} />
        <MiniInfo title="Estado" items={[solutionLabel, "Si falta solución, no se muestra respuesta inventada."]} />
      </div>
    </article>
  )
}

function PatternBank({ patterns }: { patterns: UCPattern[] }) {
  return (
    <section className="mt-4 grid gap-3 xl:grid-cols-2">
      {patterns.map((pattern) => (
        <article key={pattern.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{pattern.level}</Badge>
            <Badge>{pattern.frequency} apariciones</Badge>
            <Badge>{reappearanceLabel(pattern.frequency)}</Badge>
          </div>
          <h3 className="mt-3 text-2xl font-black">{cleanText(pattern.name)}</h3>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{cleanText(pattern.structure)}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MiniInfo title="Qué no cambia" items={[cleanText(pattern.invariantLogic)]} />
            <MiniInfo title="Método" items={[cleanText(pattern.method)]} />
            <MiniInfo title="Errores comunes" items={pattern.commonErrors.map(cleanText)} />
            <MiniInfo title="Ejercicios asociados" items={pattern.examples.slice(0, 6)} />
          </div>
        </article>
      ))}
    </section>
  )
}

function reappearanceLabel(frequency: number) {
  if (frequency >= 30) return "Probabilidad: muy alta"
  if (frequency >= 15) return "Probabilidad: alta"
  if (frequency >= 6) return "Probabilidad: media"
  return "Probabilidad: baja"
}

function VariantBank({ variants }: { variants: UCVariant[] }) {
  return (
    <section className="mt-4 grid gap-3 xl:grid-cols-3">
      {variants.map((variant) => (
        <article key={variant.id} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <Badge>Variante UC</Badge>
          <h3 className="mt-3 text-xl font-black">{cleanText(variant.sourcePattern)}</h3>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{cleanText(variant.prompt)}</p>
          <MiniInfo title="Estado" items={[variant.validationStatus === "requires validation" ? "Requiere validación" : "Solución propuesta"]} />
          <MiniInfo title="Respuesta" items={[cleanText(variant.answer)]} />
        </article>
      ))}
    </section>
  )
}

function SimulationBank() {
  const simulations = [
    ["Simulacro I1", "I1", "13", "Patrones de I1, alternativas y desarrollo", simulationSources.I1],
    ["Simulacro I2", "I2", "13", "Funciones, logaritmos, exponenciales y modelamiento", simulationSources.I2],
    ["Simulacro I3", "I3", "13", "Trigonometría, polinomios y análisis gráfico", simulationSources.I3],
    ["Simulacro Examen", "Examen", "20", "Mixto con foco en recurrencia UC", simulationSources.Examen],
    ["Simulacro mixto", "Mixto", "20", "Distribución balanceada por tema", "Banco interno"],
    ["Simulacro de ejercicios con gráficos", "Mixto", "12", "Solo ejercicios marcados con gráfico", "Banco interno"],
    ["Simulacro de desarrollo", "Mixto", "8", "Preguntas de desarrollo con pauta cuando exista", "Banco interno"],
    ["Simulacro de alternativas", "Mixto", "20", "Alternativas con revisión al final", "Banco interno"],
  ]

  return (
    <section className="mt-4 grid gap-3 xl:grid-cols-4">
      {simulations.map(([title, evaluation, count, strategy, source]) => (
        <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
          <Badge>{evaluation}</Badge>
          <h3 className="mt-3 text-xl font-black">{title}</h3>
          <MiniInfo title="Configuración" items={[`${count} preguntas`, "Tiempo sugerido: 45-90 min", strategy]} />
          <MiniInfo title="Fuente" items={[source]} />
          <button type="button" className="mt-4 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
            Iniciar simulacro
          </button>
        </article>
      ))}
    </section>
  )
}

function AnalysisPanel() {
  return (
    <section className="mt-4 grid gap-4 xl:grid-cols-2">
      <RankingCard title="Ranking de temas más frecuentes" items={globalMAT1000Analysis.topicRanking.map((item) => `${cleanText(item.theme)}: ${item.count}`)} />
      <RankingCard title="Patrones UC más repetidos" items={globalMAT1000Analysis.patternRanking.map((item) => `${cleanText(item.pattern)}: ${item.count}`)} />
      <RankingCard title="Tipos de preguntas comunes" items={summarizeBy(pastExamExercises, (exercise) => exercise.questionType)} />
      <RankingCard title="Desarrollo vs alternativas" items={summarizeBy(pastExamExercises, (exercise) => exercise.questionType.includes("desarrollo") ? "desarrollo" : "alternativas/mixta")} />
      <RankingCard title="Gráficos más usados" items={summarizeBy(pastExamExercises.filter((exercise) => exercise.hasGraph), (exercise) => cleanText(exercise.pattern)).slice(0, 8)} />
      <RankingCard title="Patrones que conviene entrenar" items={globalMAT1000Analysis.patternRanking.slice(0, 8).map((item) => cleanText(item.pattern))} />
    </section>
  )
}

function summarizeBy<T>(items: T[], getter: (item: T) => string) {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    const key = getter(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => `${label}: ${count}`)
}

function RankingCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel title={title} eyebrow="Análisis MAT1000">
      <ol className="grid gap-2">
        {(items.length ? items : ["TODO: requiere datos adicionales"]).slice(0, 10).map((item, index) => (
          <li key={`${item}-${index}`} className="rounded-2xl bg-slate-950/60 p-3 text-sm font-bold text-slate-200">
            <span className="mr-2 text-cyan-200">{index + 1}.</span>{item}
          </li>
        ))}
      </ol>
    </Panel>
  )
}

function GraphMetadataPanel({ exercises }: { exercises: PastExamExercise[] }) {
  return (
    <Panel title="Metadatos graphConfig" eyebrow="Preparación SVG/canvas">
      <p className="text-sm font-semibold leading-7 text-slate-300">
        TODO: implementar renderizado SVG/canvas para graphConfig. Mientras tanto se muestran ejercicios con gráfico detectado.
      </p>
      <div className="mt-4 grid gap-2">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm font-bold text-slate-200">
            {exercise.id} · {cleanText(exercise.pattern)} · {exercise.sourceFile} pág. {exercise.page}
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black md:text-3xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  )
}

function ExamRail({
  activeExam,
  activeTopic,
  onExam,
  onTopic,
}: {
  activeExam: PrecalculoExamId
  activeTopic: string
  onExam: (id: PrecalculoExamId) => void
  onTopic: (id: string) => void
}) {
  const exam = PRECALCULO_EXAMS.find((item) => item.id === activeExam) ?? PRECALCULO_EXAMS[0]
  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/65 p-4">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Evaluaciones</p>
      <div className="mt-3 grid gap-2">
        {PRECALCULO_EXAMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onExam(item.id)}
            className={cx(
              "rounded-2xl border px-4 py-3 text-left transition",
              activeExam === item.id ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-white/10 bg-white/5 text-slate-200"
            )}
          >
            <p className="font-black">{item.title}</p>
            <p className="text-xs font-bold opacity-75">{item.subtitle}</p>
          </button>
        ))}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Temas</p>
      <div className="mt-3 grid gap-2">
        {exam.topics.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onTopic(topic.id)}
            className={cx(
              "rounded-2xl px-3 py-2 text-left text-sm font-bold",
              activeTopic === topic.id ? "bg-white text-slate-950" : "bg-white/5 text-slate-300"
            )}
          >
            {topic.title}
          </button>
        ))}
      </div>
    </aside>
  )
}

function PracticeV2({
  question,
  selected,
  answered,
  finalAnswer,
  onSelect,
  onVerify,
  onNext,
}: {
  question: PrecalculoLearningQuestion
  selected: number | null
  answered: boolean
  finalAnswer?: number
  onSelect: (index: number) => void
  onVerify: () => void
  onNext: () => void
}) {
  const isCorrect = finalAnswer === question.answerIndex
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_480px]">
      <article className="min-h-[520px] rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{question.module}</Badge>
          <Badge>{question.topicLabel}</Badge>
          <Badge>{question.difficulty}</Badge>
        </div>
        <h2 className="mt-5 text-2xl font-black leading-tight md:text-4xl">{question.prompt}</h2>
        <div className="mt-6 grid gap-3">
          {question.choices.map((choice, index) => (
            <button
              key={choice}
              type="button"
              onClick={() => onSelect(index)}
              className={cx(
                "group rounded-3xl border p-4 text-left transition",
                !answered && selected === index && "border-cyan-300 bg-cyan-300/15",
                !answered && selected !== index && "border-white/10 bg-slate-950/55 hover:border-cyan-300/40 hover:bg-white/10",
                answered && index === question.answerIndex && "border-emerald-300 bg-emerald-300/15",
                answered && finalAnswer === index && index !== question.answerIndex && "border-rose-300 bg-rose-400/15",
                answered && finalAnswer !== index && index !== question.answerIndex && "border-white/10 bg-slate-950/35 opacity-70"
              )}
            >
              <span className="mr-3 inline-grid h-8 w-8 place-items-center rounded-full bg-white/10 text-sm font-black text-cyan-100">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-base font-black leading-7 text-white">{choice}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={selected === null || answered}
            onClick={onVerify}
            className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Verificar
          </button>
          <button
            type="button"
            disabled={!answered}
            onClick={onNext}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3 text-sm font-black text-cyan-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Siguiente pregunta
          </button>
        </div>
      </article>

      <aside className="xl:sticky xl:top-4 xl:self-start">
        <VisualPanel graph={question.graph} title="Panel visual del ejercicio" />
      </aside>

      <section className="xl:col-span-2">
        <BottomFeedback question={question} answered={answered} isCorrect={isCorrect} />
      </section>
    </div>
  )
}

function BottomFeedback({ question, answered, isCorrect }: { question: PrecalculoLearningQuestion; answered: boolean; isCorrect: boolean }) {
  return (
    <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20 lg:grid-cols-[0.7fr_1fr_0.85fr]">
      <div className={cx("rounded-3xl border p-4", answered ? (isCorrect ? "border-emerald-300/30 bg-emerald-300/10" : "border-rose-300/30 bg-rose-300/10") : "border-white/10 bg-white/5")}>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Feedback</p>
        <p className="mt-2 text-2xl font-black">{answered ? (isCorrect ? "Correcto" : "Ajustemos") : "Responde para abrir el paso a paso"}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{answered ? question.explanation : "La explicación aparecerá aquí con los datos de esta pregunta."}</p>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Paso a paso</p>
        <ol className="mt-3 grid gap-2">
          {(answered ? question.steps : question.steps.slice(0, 2)).map((step, index) => (
            <li key={step} className="rounded-2xl bg-slate-950/70 p-3 text-sm font-semibold leading-6 text-slate-100">
              <span className="font-black text-cyan-200">{index + 1}. </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-3">
        <MiniInfo title="Fórmula usada" items={question.formulas} />
        <MiniInfo title="Error típico" items={[question.proMax.commonMistake]} />
        <MiniInfo title="UC tip" items={[question.proMax.testTip]} />
      </div>
    </div>
  )
}

function DiagnosticV2({
  question,
  index,
  answers,
  done,
  strengths,
  weaknesses,
  onAnswer,
  onNext,
  onRestart,
  onPractice,
}: {
  question: PrecalculoLearningQuestion
  index: number
  answers: Record<string, number>
  done: boolean
  strengths: string[]
  weaknesses: string[]
  onAnswer: (index: number) => void
  onNext: () => void
  onRestart: () => void
  onPractice: () => void
}) {
  const selected = answers[question.id]
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <article className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Diagnóstico MAT1000</p>
            <h2 className="mt-2 text-3xl font-black">Pregunta {index + 1}/13</h2>
          </div>
          <div className="h-3 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${((Object.keys(answers).length) / 13) * 100}%` }} />
          </div>
        </div>
        <p className="mt-6 text-2xl font-black leading-9">{question.prompt}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {question.choices.map((choice, choiceIndex) => (
            <button
              key={choice}
              type="button"
              onClick={() => onAnswer(choiceIndex)}
              className={cx(
                "rounded-3xl border p-4 text-left text-sm font-black leading-6",
                selected === choiceIndex ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-slate-950/55 hover:bg-white/10"
              )}
            >
              {String.fromCharCode(65 + choiceIndex)}. {choice}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={onNext} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Siguiente</button>
          <button type="button" onClick={onRestart} className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black">Reiniciar</button>
        </div>
      </article>
      <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Resultado vivo</p>
        <p className="mt-2 text-4xl font-black">{Object.keys(answers).length}/13</p>
        {done ? (
          <div className="mt-5 grid gap-3">
            <MiniInfo title="Fortalezas" items={strengths.length ? strengths : ["Sin fortalezas registradas"]} />
            <MiniInfo title="Debilidades" items={weaknesses.length ? weaknesses : ["Sin debilidades registradas"]} />
            <MiniInfo title="Ruta recomendada" items={[weaknesses[0] ?? "Práctica mixta con visualizaciones"]} />
            <button type="button" onClick={onPractice} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Ir a Práctica</button>
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">Son 13 preguntas únicas, una por tema crítico.</p>
        )}
      </aside>
    </div>
  )
}

function VisualPanel({ graph, title }: { graph: GraphConfig; title: string }) {
  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(8,47,73,.8),rgba(15,23,42,.92))] p-4 shadow-2xl shadow-cyan-950/25">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-cyan-100">{title}</p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{graph.type}</span>
      </div>
      {graph.type === "none" ? (
        <FormulaPreview />
      ) : graph.type === "trig" ? (
        <TrigVisualizer graph={graph} />
      ) : (
        <CartesianVisualizer graph={graph} />
      )}
    </div>
  )
}

function FormulaPreview() {
  return (
    <div className="mt-4 grid min-h-[360px] place-items-center rounded-3xl border border-white/10 bg-slate-950/65 p-6 text-center">
      <div>
        <p className="text-5xl font-black text-cyan-200">f(x)</p>
        <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">
          Esta pregunta se resuelve con análisis algebraico. Usa el panel inferior para ver fórmula, pasos y error típico.
        </p>
      </div>
    </div>
  )
}

function CartesianVisualizer({ graph }: { graph: Extract<GraphConfig, { type: "line" | "points" }> }) {
  const xScale = 38
  const yScale = 18
  const x0 = 58
  const y0 = 250
  return (
    <svg viewBox="0 0 520 320" className="mt-4 h-auto w-full rounded-3xl bg-slate-50">
      <defs>
        <pattern id="grid-v2" width="38" height="38" patternUnits="userSpaceOnUse">
          <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#dbeafe" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="520" height="320" fill="url(#grid-v2)" />
      <line x1="34" y1={y0} x2="488" y2={y0} stroke="#0f172a" strokeWidth="2" />
      <line x1={x0} y1="24" x2={x0} y2="288" stroke="#0f172a" strokeWidth="2" />
      {graph.type === "line" && graph.slope !== undefined && graph.intercept !== undefined && (
        <line
          x1={x0}
          y1={y0 - graph.intercept * yScale}
          x2={x0 + 10 * xScale}
          y2={y0 - (graph.slope * 10 + graph.intercept) * yScale}
          stroke="#2563eb"
          strokeWidth="5"
          strokeLinecap="round"
        />
      )}
      {graph.points.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle cx={x0 + point.x * xScale} cy={y0 - point.y * yScale} r="9" fill="#0891b2" stroke="#0f172a" strokeWidth="3" />
          <text x={x0 + point.x * xScale + 12} y={y0 - point.y * yScale - 10} fill="#0f172a" fontSize="15" fontWeight="900">
            {"label" in point ? point.label : `(${point.x},${point.y})`}
          </text>
        </g>
      ))}
      <text x="482" y={y0 - 10} fill="#0f172a" fontSize="14" fontWeight="900">x</text>
      <text x={x0 + 10} y="34" fill="#0f172a" fontSize="14" fontWeight="900">y</text>
    </svg>
  )
}

function TrigVisualizer({ graph }: { graph: Extract<GraphConfig, { type: "trig" }> }) {
  const wave = Array.from({ length: 160 }, (_, i) => {
    const x = (i / 159) * Math.PI * 2
    const y = graph.amplitude * Math.sin(graph.k * (x - graph.b)) + graph.c
    return `${i === 0 ? "M" : "L"} ${220 + (i / 159) * 270} ${(150 - y * 22).toFixed(1)}`
  }).join(" ")
  const radius = 70
  const angle = Math.PI * 1.25
  const px = 96 + Math.cos(angle) * radius
  const py = 150 - Math.sin(angle) * radius
  const period = graph.k === 0 ? "∞" : `${(2 / Math.abs(graph.k)).toFixed(2)}π`
  const keyPoints = ["0", "π/2", "π", "3π/2", "2π"]
  return (
    <div className="mt-4 grid gap-3">
      <svg viewBox="0 0 520 300" className="h-auto w-full rounded-3xl bg-slate-50">
        <line x1="26" y1="150" x2="500" y2="150" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="96" y1="60" x2="96" y2="240" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="96" cy="150" r={radius} fill="none" stroke="#0f172a" strokeWidth="3" />
        <line x1="96" y1="150" x2={px} y2={py} stroke="#2563eb" strokeWidth="4" />
        <line x1={px} y1={py} x2={px} y2="150" stroke="#f97316" strokeWidth="3" strokeDasharray="6 6" />
        <line x1="96" y1={py} x2={px} y2={py} stroke="#0891b2" strokeWidth="3" strokeDasharray="6 6" />
        <circle cx={px} cy={py} r="8" fill="#2563eb" />
        <text x="34" y="42" fill="#0f172a" fontSize="14" fontWeight="900">QII</text>
        <text x="136" y="42" fill="#0f172a" fontSize="14" fontWeight="900">QI</text>
        <text x="34" y="272" fill="#0f172a" fontSize="14" fontWeight="900">QIII</text>
        <text x="136" y="272" fill="#0f172a" fontSize="14" fontWeight="900">QIV</text>
        <path d={wave} fill="none" stroke="#2563eb" strokeWidth="5" />
        {keyPoints.map((label, index) => (
          <g key={label}>
            <circle cx={220 + (index / 4) * 270} cy="150" r="4" fill="#0f172a" />
            <text x={208 + (index / 4) * 270} y="174" fill="#0f172a" fontSize="12" fontWeight="900">{label}</text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-2 text-sm font-black text-slate-100 md:grid-cols-4">
        <span className="rounded-2xl bg-white/10 p-3">Amplitud: {Math.abs(graph.amplitude)}</span>
        <span className="rounded-2xl bg-white/10 p-3">Período: {period}</span>
        <span className="rounded-2xl bg-white/10 p-3">Desfase: {graph.b.toFixed(2)}</span>
        <span className="rounded-2xl bg-white/10 p-3">Eje: {graph.c}</span>
      </div>
    </div>
  )
}

function FormulaTile({ question }: { question: PrecalculoLearningQuestion }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">{question.module} · {question.topicLabel}</p>
      <h3 className="mt-2 text-xl font-black">{question.prompt}</h3>
      <MiniInfo title="Fórmulas" items={question.formulas} />
      <MiniInfo title="Tip UC" items={[question.proMax.testTip]} />
    </article>
  )
}

function MiniInfo({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">{title}</p>
      <ul className="mt-2 grid gap-1 text-sm font-semibold leading-6 text-slate-200">
        {(items.length ? items : ["Sin datos aún"]).map((item) => (
          <li key={item}>{cleanText(item)}</li>
        ))}
      </ul>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
      {children}
    </span>
  )
}
