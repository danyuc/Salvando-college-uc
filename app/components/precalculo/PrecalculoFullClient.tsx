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

type Tab = "ruta" | "diagnostico" | "practica" | "formulas" | "graficos" | "tutor"

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function buildTutorAnswer(message: string) {
  const text = message.toLowerCase()
  if (text.includes("cuadrante")) return "En cuadrantes, decide signos antes de calcular. QIII: seno negativo, coseno negativo y tangente positiva."
  if (text.includes("periodo")) return "En y=A·sen(k(x-b))+c, el período es 2π/|k|. Si k=2, el período es π."
  if (text.includes("desfase")) return "El desfase está dentro del paréntesis. x-b mueve b a la derecha; x+b mueve b a la izquierda."
  if (text.includes("log")) return "Un logaritmo pregunta por un exponente: log₂(32)=5 porque 2⁵=32."
  return "Identifica el tema, anota datos reales del enunciado y recién después eliges fórmula. En práctica puedes abrir el panel Pro Max UC para ver el paso exacto."
}

export default function PrecalculoFullClient() {
  const [activeExam, setActiveExam] = useState<PrecalculoExamId>("i3")
  const [activeTopic, setActiveTopic] = useState("cuadrantes")
  const [tab, setTab] = useState<Tab>("ruta")
  const [diagnosticSet, setDiagnosticSet] = useState(() => shuffledDiagnosticQuestions())
  const [diagnosticIndex, setDiagnosticIndex] = useState(0)
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<string, number>>({})
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({})
  const [showFormula, setShowFormula] = useState(true)
  const [showSteps, setShowSteps] = useState(false)
  const [guidedMode, setGuidedMode] = useState(false)
  const [tutorMessage, setTutorMessage] = useState("no entiendo por qué la tangente queda positiva")

  const exam = useMemo(() => PRECALCULO_EXAMS.find((item) => item.id === activeExam) ?? PRECALCULO_EXAMS[0], [activeExam])
  const selectedTopic = useMemo(() => exam.topics.find((topic) => topic.id === activeTopic) ?? exam.topics[0], [activeTopic, exam])
  const diagnosticQuestion = diagnosticSet[diagnosticIndex]
  const practiceQuestion = PRECALCULO_PRACTICE_QUESTIONS[practiceIndex % PRECALCULO_PRACTICE_QUESTIONS.length]
  const diagnosticDone = Object.keys(diagnosticAnswers).length >= 13
  const answeredDiagnostic = diagnosticSet.filter((question) => diagnosticAnswers[question.id] !== undefined)
  const diagnosticCorrect = answeredDiagnostic.filter((question) => diagnosticAnswers[question.id] === question.answerIndex)
  const weaknesses = Array.from(new Set(answeredDiagnostic.filter((question) => diagnosticAnswers[question.id] !== question.answerIndex).map((question) => question.topicLabel)))
  const strengths = Array.from(new Set(answeredDiagnostic.filter((question) => diagnosticAnswers[question.id] === question.answerIndex).map((question) => question.topicLabel)))
  const currentPracticeAnswer = practiceAnswers[practiceQuestion.id]
  const practiceAnswered = currentPracticeAnswer !== undefined

  function changeExam(id: PrecalculoExamId) {
    const nextExam = PRECALCULO_EXAMS.find((item) => item.id === id) ?? PRECALCULO_EXAMS[0]
    setActiveExam(id)
    setActiveTopic(nextExam.topics[0]?.id ?? "")
  }

  function answerDiagnostic(index: number) {
    setDiagnosticAnswers((current) => ({ ...current, [diagnosticQuestion.id]: index }))
  }

  function nextDiagnostic() {
    setDiagnosticIndex((index) => Math.min(diagnosticSet.length - 1, index + 1))
  }

  function restartDiagnostic() {
    setDiagnosticSet(shuffledDiagnosticQuestions())
    setDiagnosticIndex(0)
    setDiagnosticAnswers({})
  }

  function answerPractice(index: number) {
    setPracticeAnswers((current) => ({ ...current, [practiceQuestion.id]: index }))
    setShowSteps(true)
  }

  function nextPractice() {
    setPracticeIndex((index) => index + 1)
    setShowSteps(false)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,.26),transparent_34%),radial-gradient(circle_at_top_right,rgba(124,58,237,.2),transparent_28%),linear-gradient(135deg,#020617,#0f172a_48%,#111827)] px-4 py-6 text-white">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">Asignatura exclusiva</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">Pre Cálculo MAT1000</h1>
              <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-slate-300">
                Ruta premium separada de práctica general: diagnóstico, práctica, fórmulas, gráficos y tutor integrados en una experiencia compacta.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Diagnóstico</p>
              <p className="mt-2 text-3xl font-black">{answeredDiagnostic.length ? Math.round((diagnosticCorrect.length / answeredDiagnostic.length) * 100) : 0}%</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">{weaknesses.length ? `Refuerza: ${weaknesses.slice(0, 3).join(", ")}` : "13 preguntas distintas, balanceadas por tema."}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {PRECALCULO_EXAMS.map((item) => (
              <button key={item.id} type="button" onClick={() => changeExam(item.id)} className={cx(
                "rounded-3xl border p-4 text-left transition hover:-translate-y-1",
                activeExam === item.id ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-2xl shadow-cyan-500/20" : "border-white/10 bg-white/[0.06] text-slate-100"
              )}>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70">{item.difficulty}</p>
                <p className="mt-2 text-lg font-black">{item.title}</p>
                <p className="mt-2 text-sm font-semibold opacity-80">{item.subtitle}</p>
              </button>
            ))}
          </div>

          <nav className="mt-6 flex flex-wrap gap-2">
            {[
              ["ruta", "Ruta"],
              ["diagnostico", "Diagnóstico"],
              ["practica", "Práctica"],
              ["formulas", "Fórmulas y tips"],
              ["graficos", "Gráficos interactivos"],
              ["tutor", "Tutor"],
            ].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id as Tab)} className={cx(
                "rounded-full px-4 py-2 text-sm font-black transition",
                tab === id ? "bg-white text-slate-950" : "border border-white/10 bg-white/10 text-white hover:bg-white/15"
              )}>
                {label}
              </button>
            ))}
          </nav>
        </header>

        {tab === "ruta" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Panel title={`Ruta ${exam.title}`} eyebrow="Temáticas visibles">
              <p className="text-sm font-semibold leading-7 text-slate-300">{exam.goal}</p>
              <div className="mt-5 grid gap-3">
                {exam.topics.map((topic, index) => (
                  <button key={topic.id} onClick={() => setActiveTopic(topic.id)} className={cx(
                    "rounded-3xl border p-4 text-left transition",
                    selectedTopic.id === topic.id ? "border-cyan-300 bg-cyan-300/15" : "border-white/10 bg-slate-950/45"
                  )}>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Tema {index + 1} · {topic.theme}</p>
                    <p className="mt-1 text-xl font-black">{topic.title}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-300">{topic.why}</p>
                  </button>
                ))}
              </div>
            </Panel>

            <PracticeLayout
              question={practiceQuestion}
              selected={currentPracticeAnswer}
              answered={practiceAnswered}
              showFormula={showFormula}
              showSteps={showSteps}
              guidedMode={guidedMode}
              onAnswer={answerPractice}
              onNext={nextPractice}
              onToggleFormula={() => setShowFormula((value) => !value)}
              onToggleGuided={() => setGuidedMode((value) => !value)}
            />
          </section>
        )}

        {tab === "diagnostico" && (
          <section className="mt-6">
            <Panel title="Diagnóstico MAT1000 · 13 preguntas distintas" eyebrow={`Pregunta ${diagnosticIndex + 1}/13`}>
              {!diagnosticDone ? (
                <QuestionCard
                  question={diagnosticQuestion}
                  selected={diagnosticAnswers[diagnosticQuestion.id]}
                  onAnswer={answerDiagnostic}
                  afterAnswer={
                    <button onClick={nextDiagnostic} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
                      Siguiente diagnóstico
                    </button>
                  }
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  <ResultCard title="Fortalezas" items={strengths} />
                  <ResultCard title="Debilidades" items={weaknesses} />
                  <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
                    <p className="text-xl font-black">Ruta sugerida</p>
                    <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
                      Parte por {weaknesses[0] ?? "práctica mixta"} y luego usa Gráficos interactivos para reforzar visualmente.
                    </p>
                    <button onClick={() => setTab("practica")} className="mt-4 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Ir a práctica</button>
                  </div>
                </div>
              )}
              <button onClick={restartDiagnostic} className="mt-5 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">
                Reiniciar con nuevo orden
              </button>
            </Panel>
          </section>
        )}

        {tab === "practica" && (
          <section className="mt-6">
            <PracticeLayout
              question={practiceQuestion}
              selected={currentPracticeAnswer}
              answered={practiceAnswered}
              showFormula={showFormula}
              showSteps={showSteps}
              guidedMode={guidedMode}
              onAnswer={answerPractice}
              onNext={nextPractice}
              onToggleFormula={() => setShowFormula((value) => !value)}
              onToggleGuided={() => setGuidedMode((value) => !value)}
            />
          </section>
        )}

        {tab === "formulas" && (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {PRECALCULO_DIAGNOSTIC_13.map((question) => (
              <Panel key={question.id} title={question.topicLabel} eyebrow={question.module}>
                <ul className="grid gap-2 text-sm font-bold text-slate-200">
                  {question.formulas.map((formula) => <li key={formula} className="rounded-2xl bg-slate-950/55 p-3">{formula}</li>)}
                </ul>
                <p className="mt-4 rounded-2xl bg-cyan-300/10 p-3 text-sm font-bold text-cyan-100">{question.proMax.testTip}</p>
              </Panel>
            ))}
          </section>
        )}

        {tab === "graficos" && (
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <GraphPanel graph={{ type: "trig", amplitude: 3, k: 2, b: 0, c: 0 }} title="Visualizador trigonométrico" />
            <GraphPanel graph={{ type: "line", points: [{ x: 0, y: 4 }, { x: 2, y: 0 }], slope: -2, intercept: 4 }} title="Plano coordenado" />
          </section>
        )}

        {tab === "tutor" && (
          <section className="mt-6">
            <Panel title="Tutor local de Pre Cálculo" eyebrow="Modo Pro Max UC">
              <textarea value={tutorMessage} onChange={(event) => setTutorMessage(event.target.value)} className="min-h-32 w-full rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm font-bold leading-7 text-white outline-none" />
              <div className="mt-3 flex flex-wrap gap-2">
                {TUTOR_SUGGESTIONS.map((item) => <button key={item} onClick={() => setTutorMessage(item)} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-slate-100">{item}</button>)}
              </div>
              <p className="mt-5 rounded-3xl bg-cyan-300/10 p-5 text-sm font-semibold leading-8 text-cyan-50">{buildTutorAnswer(tutorMessage)}</p>
            </Panel>
          </section>
        )}
      </section>
    </main>
  )
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function QuestionCard({ question, selected, onAnswer, afterAnswer }: { question: PrecalculoLearningQuestion; selected?: number; onAnswer: (index: number) => void; afterAnswer?: ReactNode }) {
  const answered = selected !== undefined
  return (
    <div>
      <p className="text-2xl font-black leading-9">{question.prompt}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {question.choices.map((choice, index) => (
          <button key={choice} onClick={() => onAnswer(index)} className={cx(
            "rounded-2xl border p-4 text-left text-sm font-black transition",
            !answered && "border-white/10 bg-slate-950/55 hover:bg-white/10",
            answered && index === question.answerIndex && "border-emerald-300 bg-emerald-300/15 text-emerald-50",
            answered && selected === index && index !== question.answerIndex && "border-rose-300 bg-rose-400/15 text-rose-50",
            answered && selected !== index && index !== question.answerIndex && "border-white/10 bg-slate-950/35 text-slate-400"
          )}>
            {String.fromCharCode(65 + index)}. {choice}
          </button>
        ))}
      </div>
      {answered ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <p className="rounded-3xl bg-slate-950/75 p-5 text-sm font-semibold leading-7 text-slate-100">{question.explanation}</p>
          {afterAnswer}
        </div>
      ) : null}
    </div>
  )
}

function PracticeLayout({
  question,
  selected,
  answered,
  showFormula,
  showSteps,
  guidedMode,
  onAnswer,
  onNext,
  onToggleFormula,
  onToggleGuided,
}: {
  question: PrecalculoLearningQuestion
  selected?: number
  answered: boolean
  showFormula: boolean
  showSteps: boolean
  guidedMode: boolean
  onAnswer: (index: number) => void
  onNext: () => void
  onToggleFormula: () => void
  onToggleGuided: () => void
}) {
  return (
    <section className="grid gap-5 rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl xl:grid-cols-[1fr_0.92fr]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{question.module} · {question.topicLabel} · {question.difficulty}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight">{question.prompt}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={onToggleGuided} className={cx("rounded-full px-4 py-2 text-xs font-black", guidedMode ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white")}>Modo guiado</button>
            <button onClick={onToggleFormula} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white">Ver fórmula y tip</button>
          </div>
        </div>

        {(guidedMode || showFormula) && (
          <FormulaBox question={question} />
        )}

        <div className="mt-4">
          <QuestionCard question={question} selected={selected} onAnswer={onAnswer} />
        </div>

        {answered && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={onNext} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">Siguiente</button>
          </div>
        )}
      </div>

      <aside className="grid gap-4">
        <GraphPanel graph={question.graph} title="Herramienta visual" />
        {answered && showSteps ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-sm font-black text-cyan-300">Paso a paso con los datos reales</p>
            <ol className="mt-3 grid gap-2">
              {question.steps.map((step, index) => (
                <li key={step} className="rounded-2xl bg-white/10 p-3 text-sm font-semibold leading-6 text-slate-100">
                  <span className="font-black text-cyan-200">Paso {index + 1}: </span>{step}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </aside>
    </section>
  )
}

function FormulaBox({ question }: { question: PrecalculoLearningQuestion }) {
  return (
    <div className="mt-4 grid gap-3 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 lg:grid-cols-2">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Fórmulas necesarias</p>
        <ul className="mt-2 grid gap-2">{question.formulas.map((formula) => <li key={formula} className="rounded-2xl bg-slate-950/65 p-3 text-sm font-black">{formula}</li>)}</ul>
      </div>
      <div className="text-sm font-semibold leading-7 text-cyan-50">
        <p><strong>Por qué aplica:</strong> {question.proMax.why}</p>
        <p><strong>Error típico:</strong> {question.proMax.commonMistake}</p>
        <p><strong>Tip UC:</strong> {question.proMax.testTip}</p>
        <p><strong>Ejemplo:</strong> {question.proMax.workedExample}</p>
      </div>
    </div>
  )
}

function ResultCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
      <p className="text-xl font-black">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm font-bold text-slate-300">
        {(items.length ? items : ["Sin datos todavía"]).map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}

function GraphPanel({ graph, title }: { graph: GraphConfig; title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-sm font-black text-cyan-300">{title}</p>
      {graph.type === "none" ? (
        <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-semibold text-slate-300">Esta pregunta se resuelve con análisis algebraico; no requiere gráfico.</p>
      ) : graph.type === "trig" ? (
        <TrigGraph graph={graph} />
      ) : (
        <PlaneGraph graph={graph} />
      )}
    </div>
  )
}

function PlaneGraph({ graph }: { graph: Extract<GraphConfig, { type: "line" | "points" }> }) {
  const points = graph.points
  return (
    <svg viewBox="0 0 360 260" className="mt-3 h-auto w-full rounded-2xl bg-white">
      <line x1="30" y1="220" x2="330" y2="220" stroke="#94a3b8" />
      <line x1="30" y1="20" x2="30" y2="220" stroke="#94a3b8" />
      {graph.type === "line" && graph.slope !== undefined && graph.intercept !== undefined ? (
        <line x1="30" y1={220 - graph.intercept * 16} x2="330" y2={220 - (graph.slope * 8 + graph.intercept) * 16} stroke="#2563eb" strokeWidth="4" />
      ) : null}
      {points.map((point, index) => (
        <g key={`${point.x}-${point.y}-${index}`}>
          <circle cx={30 + point.x * 32} cy={220 - point.y * 16} r="7" fill="#0f172a" />
          <text x={40 + point.x * 32} y={216 - point.y * 16} fill="#0f172a" fontSize="14" fontWeight="800">{("label" in point && point.label) || `P${index + 1}`}</text>
        </g>
      ))}
    </svg>
  )
}

function TrigGraph({ graph }: { graph: Extract<GraphConfig, { type: "trig" }> }) {
  const path = Array.from({ length: 120 }, (_, i) => {
    const x = (i / 119) * Math.PI * 2
    const y = graph.amplitude * Math.sin(graph.k * (x - graph.b)) + graph.c
    const px = 20 + (i / 119) * 420
    const py = 120 - y * 24
    return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`
  }).join(" ")
  const period = graph.k === 0 ? "∞" : `${(2 / Math.abs(graph.k)).toFixed(2)}π`
  return (
    <div className="mt-3 grid gap-4">
      <svg viewBox="0 0 460 240" className="h-auto w-full rounded-2xl bg-white">
        <line x1="20" y1="120" x2="440" y2="120" stroke="#94a3b8" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="5" />
        {[0, Math.PI / 2, Math.PI, 1.5 * Math.PI, 2 * Math.PI].map((x, index) => (
          <circle key={index} cx={20 + (x / (Math.PI * 2)) * 420} cy={120 - (graph.amplitude * Math.sin(graph.k * (x - graph.b)) + graph.c) * 24} r="5" fill="#0f172a" />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-2 text-sm font-black text-slate-100 md:grid-cols-4">
        <span className="rounded-2xl bg-white/10 p-3">Amplitud: {Math.abs(graph.amplitude)}</span>
        <span className="rounded-2xl bg-white/10 p-3">Periodo: {period}</span>
        <span className="rounded-2xl bg-white/10 p-3">Desfase: {graph.b.toFixed(2)}</span>
        <span className="rounded-2xl bg-white/10 p-3">Eje: {graph.c}</span>
      </div>
    </div>
  )
}
