'use client'

import { LOG_NATURAL_BANK } from "@/lib/math/log-natural-bank"
import { useEffect, useMemo, useState } from "react"

import MathLessonEngine from "./MathLessonEngine"
import FormulaDrawer from "./FormulaDrawer"
import GuidedSolutionDrawer from "./math/GuidedSolutionDrawer"
import DomainAnimator from "./math-animators/DomainAnimator"
import CompositionAnimator from "./math-animators/CompositionAnimator"
import AlgebraMotionPro from "./AlgebraMotionPro"
import PrecalculoSteps from "./PrecalculoSteps"
import PrecalculoVisual from "./PrecalculoVisual"
import ProMaxUCPanel from "./ProMaxUCPanel"

import { lessonForQuestion } from "@/lib/math-lessons"
import { hasUserDiagnostic } from "@/lib/user-diagnostics"
import { registerPracticeResult } from "@/lib/precalculo-god-mode"
import { detectMathError } from "@/lib/precalculo-god-mode/error-detector"
import { getAdaptiveRecommendation } from "@/lib/precalculo-god-mode/adaptive-next"
import { useUser } from "@/lib/useUser"
import { SUBJECT_THEMES, type SubjectCode } from "@/lib/academic-calendar-data"
import { generateMat1000ForceQuestions } from "@/lib/mat1000-force-questions"
import {
  getMat1000ModulesForEvaluation,
  getMat1000SubtemasForModule,
} from "@/lib/precalculo-ui-options"

type Mode = "practica" | "diagnostico" | "simulacion" | "intensivo"
type QuestionKind = "seleccion_multiple" | "desarrollo" | "modelamiento" | "mixtas"

const evaluations = ["I1", "I2", "I3", "EXAMEN"]

function normalizeSubject(value: string | null): SubjectCode {
  if (value === "PSI1101" || value === "SOL500" || value === "CLG0000" || value === "IHI0204") return value
  return "MAT1000"
}

function normalizeEvaluation(value: string | null) {
  if (value === "I1" || value === "I2" || value === "I3" || value === "EXAMEN") return value
  return "I1"
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}


function normalizeMathAnswer(value: any) {
  return String(value ?? "")
    .toLowerCase()
    .replaceAll("√", "sqrt")
    .replaceAll("raíz", "sqrt")
    .replaceAll("raiz", "sqrt")
    .replace(/\s+/g, "")
    .replace(/[.$]/g, "")
}

function getCorrectOptionText(question: any) {
  const raw =
    question?.respuesta_correcta ??
    question?.correcta ??
    question?.correctAnswer ??
    question?.answer

  const options = question?.opciones || []

  if (typeof raw === "string") {
    const key = raw.trim().toUpperCase()
    const letterIndex = ["A", "B", "C", "D", "E"].indexOf(key)

    if (letterIndex >= 0 && options[letterIndex]) {
      return options[letterIndex]
    }

    return raw
  }

  if (typeof raw === "number" && options[raw]) {
    return options[raw]
  }

  return raw
}

function isCorrectOption(question: any, option: string) {
  const correctText = getCorrectOptionText(question)
  return normalizeMathAnswer(option) === normalizeMathAnswer(correctText)
}

function getDiagnosticDone(subject: SubjectCode, evaluation: string) {
  if (typeof window === "undefined") return false
  return Boolean(localStorage.getItem(`diagnostic-${subject}-${evaluation}`))
}

function saveWeakness(evaluation: string, subtema: string) {
  if (typeof window === "undefined") return
  const key = `mat1000-weaknesses-${evaluation}`
  const raw = localStorage.getItem(key)
  const prev = raw ? JSON.parse(raw) : []
  const next = Array.from(new Set([...prev, subtema]))
  localStorage.setItem(key, JSON.stringify(next))
}

function buildGenericQuestions(subject: SubjectCode) {
  const theme = SUBJECT_THEMES[subject]
  return [
    {
      tipo: "desarrollo",
      subtema: "Conceptos base",
      pregunta: `Explica el concepto central más importante de ${theme.name} con un ejemplo.`,
      respuesta_correcta: "Respuesta abierta",
      explicacion: "La idea es verificar comprensión conceptual, no memorizar una frase.",
      opciones: null,
    },
  ]
}

function enrichQuestions(base: any[], kind: QuestionKind, mode: Mode) {
  const extras = [
    {
      id: "dev-lineal-1",
      tipo: "desarrollo",
      subtema: "Ecuación lineal",
      pregunta: "Desarrollo: resuelve 10 + 2x = 30 mostrando cada paso.",
      opciones: null,
      respuesta_correcta: "x = 10",
      explicacion: "Se resta 10 a ambos lados y luego se divide por 2.",
      pasos: [
        { orden: 1, titulo: "Identificar", explicacion: "El 10 está sumando.", expresion: "10 + 2x = 30" },
        { orden: 2, titulo: "Restar 10", explicacion: "Restamos 10 a ambos lados.", expresion: "2x = 30 - 10" },
        { orden: 3, titulo: "Simplificar", explicacion: "30 - 10 = 20.", expresion: "2x = 20" },
        { orden: 4, titulo: "Dividir por 2", explicacion: "El 2 multiplica a x, por eso dividimos.", expresion: "x = 10" },
      ],
    },
    {
      id: "mod-funciones-1",
      tipo: "modelamiento",
      subtema: "Modelamiento",
      pregunta: "Modelamiento: Si C(x)=2x+15 e I(x)=5x, modela la utilidad y determina cuándo hay ganancia.",
      opciones: null,
      respuesta_correcta: "U(x)=3x-15; hay ganancia si x>5",
      explicacion: "La utilidad es ingreso menos costo: U(x)=5x-(2x+15)=3x-15. Hay ganancia cuando U(x)>0.",
      pasos: [
        { orden: 1, titulo: "Definir utilidad", explicacion: "Utilidad = ingreso - costo.", expresion: "U(x)=I(x)-C(x)" },
        { orden: 2, titulo: "Sustituir", explicacion: "Reemplazamos las funciones dadas.", expresion: "U(x)=5x-(2x+15)" },
        { orden: 3, titulo: "Simplificar", explicacion: "Distribuimos el signo negativo.", expresion: "U(x)=3x-15" },
        { orden: 4, titulo: "Ganancia", explicacion: "Pedimos utilidad positiva.", expresion: "3x-15>0 ⇒ x>5" },
      ],
    },
  ]

  if (kind === "desarrollo") return extras.filter(q => q.tipo === "desarrollo")
  if (kind === "modelamiento") return extras.filter(q => q.tipo === "modelamiento")
  if (kind === "mixtas" || mode === "intensivo") return [...base, ...extras]
  return base
}

export default function PracticeView() {
  const { name: userName } = useUser()

  const [subject, setSubject] = useState<SubjectCode>("MAT1000")
  const [evaluation, setEvaluation] = useState("I1")
  const [moduleLabel, setModuleLabel] = useState("Todos")
  const [subtema, setSubtema] = useState("Todos")
  const [mode, setMode] = useState<Mode>("practica")
  const [kind, setKind] = useState<QuestionKind>("mixtas")
  const [amount, setAmount] = useState(20)
  const [minutes, setMinutes] = useState(120)

  const [questions, setQuestions] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState("")
  const [feeling, setFeeling] = useState<"facil" | "medio" | "dificil" | null>(null)
  const [written, setWritten] = useState("")
  const [showSteps, setShowSteps] = useState(false)
  const [answers, setAnswers] = useState<any[]>([])
  const [finished, setFinished] = useState(false)
  const [remaining, setRemaining] = useState(120 * 60)
  const [timerStarted, setTimerStarted] = useState(false)
  const [diagnosticDone, setDiagnosticDone] = useState(false)
  const [visualStep, setVisualStep] = useState(0)
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now())

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSubject(normalizeSubject(params.get("subject")))
    setEvaluation(normalizeEvaluation(params.get("evaluation")))
    const urlMode = params.get("mode")
    if (urlMode === "practica" || urlMode === "diagnostico" || urlMode === "simulacion" || urlMode === "intensivo") {
      setMode(urlMode)
    }
  }, [])

  useEffect(() => {
    if (!timerStarted || finished || questions.length === 0) return

    const interval = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          window.clearInterval(interval)
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timerStarted, finished, questions.length])

  const theme = SUBJECT_THEMES[subject]
  const isMath = subject === "MAT1000"

  const modules = useMemo(() => {
    if (!isMath) return ["Todos", "Lecturas", "Conceptos", "Evaluaciones"]
    return getMat1000ModulesForEvaluation(evaluation)
  }, [isMath, evaluation])

  const subtemas = useMemo(() => {
    if (!isMath) return ["Todos", "Lecturas", "Conceptos", "Aplicación"]
    return getMat1000SubtemasForModule(moduleLabel, evaluation)
  }, [isMath, moduleLabel, evaluation])

  const current = questions[index]
  const currentLesson = current ? lessonForQuestion(current) : null
  const correctCount = answers.filter(a => a.correct).length
  const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0
  const weak = Array.from(new Set(answers.filter(a => !a.correct).map(a => a.subtema)))
  useEffect(() => {
    hasUserDiagnostic(subject, evaluation).then(setDiagnosticDone)
  }, [subject, evaluation])

  // diagnosticDone ahora se sincroniza con Supabase
  const diagnosticRequired = !diagnosticDone
  const totalSeconds = mode === "simulacion" ? 120 * 60 : minutes * 60
  const avgSeconds = questions.length ? Math.floor(totalSeconds / questions.length) : 0
  const timePercent = totalSeconds > 0 ? Math.max(0, Math.min(100, (remaining / totalSeconds) * 100)) : 100

  function reset() {
    setQuestions([])
    setIndex(0)
    setSelected("")
    setFeeling(null)
    setQuestionStartedAt(Date.now())
    setWritten("")
    setShowSteps(false)
    setAnswers([])
    setFinished(false)
    setRemaining(mode === "simulacion" ? 120 * 60 : minutes * 60)
    setTimerStarted(false)
  }

  function start() {
    if (diagnosticRequired) return

    let finalQuestions: any[] = []

    if (isMath) {
      const base = generateMat1000ForceQuestions({
        evaluation,
        mode,
        moduleLabel,
        subtema,
        cantidad: mode === "simulacion" ? 13 : amount,
      })

      finalQuestions = enrichQuestions(base, kind, mode)
        .slice(0, mode === "simulacion" ? 13 : amount)
    } else {
      finalQuestions = buildGenericQuestions(subject)
    }

    setQuestions(finalQuestions)
    setIndex(0)
    setSelected("")
    setFeeling(null)
    setQuestionStartedAt(Date.now())
    setWritten("")
    setShowSteps(false)
    setAnswers([])
    setFinished(false)
    setRemaining(mode === "simulacion" ? 120 * 60 : minutes * 60)
    setTimerStarted(true)
  }

  function answer(option: string) {
    if (!current || selected) return

    const correct = isCorrectOption(current, option)
    setSelected(option)
    setAnswers(prev => [...prev, { subtema: current.subtema || "general", correct }])

    if (!correct) saveWeakness(evaluation, current.subtema || "general")
  }

  function submitWritten() {
    if (!current || selected) return
    setSelected("respuesta_abierta")
    setAnswers(prev => [...prev, { subtema: current.subtema || "desarrollo", correct: true, written }])
  }

  function next() {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }

    setIndex(i => i + 1)
    setSelected("")
    setFeeling(null)
    setQuestionStartedAt(Date.now())
    setWritten("")
    setShowSteps(false)
    setVisualStep(0)
  }

  function handleFeeling(value: "facil" | "medio" | "dificil") {
    if (!current || !selected) return

    setFeeling(value)

    const confidence =
      value === "facil" ? "alta" :
      value === "dificil" ? "baja" :
      "media"

    const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))
    const correct = selected === "respuesta_abierta" || isCorrectOption?.(current, selected) || selected === current.respuesta_correcta

    registerPracticeResult({
      subtema: current.subtema || "general",
      correct,
      seconds,
      confidence,
    })
  }

  const errorAnalysis = current && selected
    ? detectMathError({
        question: current,
        selectedAnswer: selected,
        writtenAnswer: written,
        correctAnswer: String(getCorrectOptionText(current)),
      })
    : null

  const adaptiveRecommendation = current && selected
    ? getAdaptiveRecommendation({
        errorType: errorAnalysis?.type,
        feeling,
        subtema: current.subtema || "general",
        correct: selected === "respuesta_abierta" || isCorrectOption(current, selected),
      })
    : null

  return (
    <main className="practice-page" style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}>
      <section className="shell">
        <section className="hero-card">
          <div>
            <span className="badge">{theme.icon} {theme.short}</span>
            <h1>Hola, {userName}</h1>
            <p>Práctica Pro Max UC: personalizada, visual, explicativa y orientada a prueba real.</p>
          </div>

          <div className="timer">
            <strong>{formatTime(remaining)}</strong>
            <span>tiempo restante</span>
            <div className="timerbar"><i style={{ width: `${timePercent}%` }} /></div>
          </div>
        </section>

        <section className="mode-card">
          <h3>{diagnosticRequired ? "🔒 Diagnóstico obligatorio" : "🧠 Sistema inteligente activo"}</h3>
          <p>
            {diagnosticRequired
              ? `Antes de practicar ${theme.name} ${evaluation}, completa el diagnóstico.`
              : `Modo ${mode} · foco ${subtema} · explicación adaptativa.`}
          </p>

          {diagnosticRequired && (
            <a className="diagnostic-cta" href={`/diagnostico?subject=${subject}&evaluation=${evaluation}`}>
              Hacer diagnóstico ahora
            </a>
          )}
        </section>

        <section className="filters-card">
          <label>
            Asignatura
            <select value={subject} onChange={(e) => { setSubject(e.target.value as SubjectCode); reset() }}>
              {(Object.entries(SUBJECT_THEMES) as [SubjectCode, any][]).map(([code, t]) => (
                <option key={code} value={code}>{t.icon} {t.name}</option>
              ))}
            </select>
          </label>

          {isMath && (
            <label>
              Evaluación
              <select value={evaluation} onChange={(e) => { setEvaluation(e.target.value); setModuleLabel("Todos"); setSubtema("Todos"); reset() }}>
                {evaluations.map(ev => <option key={ev}>{ev}</option>)}
              </select>
            </label>
          )}

          <label>
            Módulo
            <select value={moduleLabel} onChange={(e) => { setModuleLabel(e.target.value); setSubtema("Todos"); reset() }}>
              {modules.map(m => <option key={m}>{m}</option>)}
            </select>
          </label>

          <label>
            Subtema
            <select value={subtema} onChange={(e) => { setSubtema(e.target.value); reset() }}>
              {subtemas.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Modo
            <select value={mode} onChange={(e) => { setMode(e.target.value as Mode); reset() }}>
              <option value="practica">Práctica guiada</option>
              <option value="diagnostico">Diagnóstico</option>
              <option value="simulacion">Prueba UC real</option>
              <option value="intensivo">Intensivo pre-prueba</option>
            </select>
          </label>

          <label>
            Tipo
            <select value={kind} onChange={(e) => setKind(e.target.value as QuestionKind)}>
              <option value="mixtas">Mixtas</option>
              <option value="seleccion_multiple">Selección múltiple</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="modelamiento">Modelamiento</option>
            </select>
          </label>

          <label>
            Cantidad
            <input type="number" min={1} max={120} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </label>

          <label>
            Tiempo total
            <input type="number" min={5} max={240} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          </label>

          <div className="actions">
            <button disabled={diagnosticRequired} onClick={start}>Comenzar sesión</button>
            <button className="secondary" onClick={reset}>Reiniciar</button>
          </div>
        </section>

        <section className="stats">
          <div><span>Preguntas</span><strong>{questions.length}</strong></div>
          <div><span>Respondidas</span><strong>{answers.length}</strong></div>
          <div><span>Precisión</span><strong>{accuracy}%</strong></div>
          <div><span>Promedio/pregunta</span><strong>{avgSeconds ? formatTime(avgSeconds) : "—"}</strong></div>
          <div><span>Débiles</span><strong>{weak.length}</strong></div>
        </section>

        {finished && (
          <section className="result-card">
            <h2>Sesión finalizada</h2>
            <p>Precisión: <strong>{accuracy}%</strong></p>
            {weak.length > 0 ? (
              <p>Refuerza: <strong>{weak.join(", ")}</strong>.</p>
            ) : (
              <p>No se detectaron debilidades críticas.</p>
            )}
            <button onClick={start}>Repetir sesión</button>
          </section>
        )}

        {!finished && current && (
          <section className="question-card">
            <div className="chips">
              <span>{theme.short}</span>
              <span>{current.tipo || "selección"}</span>
              <span>{current.subtema || "general"}</span>
              <span>{index + 1}/{questions.length}</span>
            </div>

            <h2>{current.pregunta}</h2>

            <FormulaDrawer question={current} />

                    <GuidedSolutionDrawer question={current} />

            {false && <ProMaxUCPanel
              question={current}
              answered={!!selected}
              correct={isCorrectOption(current, selected) || selected === "respuesta_abierta"}
            />

            {Array.isArray(current.visualizacion?.parametros?.puntos) && (
              <PrecalculoVisual puntos={current.visualizacion.parametros.puntos} activeStep={visualStep} />
            )}

            {current.opciones ? (
              <div className="options">
                {(current.opciones || []).map((op: string) => {
                  const answered = !!selected
                  const correct = isCorrectOption(current, op)
                  const chosen = op === selected

                  function handleFeeling(value: "facil" | "medio" | "dificil") {
    if (!current || !selected) return

    setFeeling(value)

    const confidence =
      value === "facil" ? "alta" :
      value === "dificil" ? "baja" :
      "media"

    const seconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))
    const correct = selected === "respuesta_abierta" || isCorrectOption?.(current, selected) || selected === current.respuesta_correcta

    registerPracticeResult({
      subtema: current.subtema || "general",
      correct,
      seconds,
      confidence,
    })
  }

  return (
                    <button
                      key={op}
                      onClick={() => answer(op)}
                      className={`option ${answered && mode !== "simulacion" && correct ? "correct" : ""} ${answered && mode !== "simulacion" && chosen && !correct ? "wrong" : ""}`}
                    >
                      {op}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="written">
                <textarea value={written} onChange={(e) => setWritten(e.target.value)} placeholder="Escribe tu desarrollo aquí..." />
                <button onClick={submitWritten}>Guardar desarrollo</button>
              </div>
            )}

            {selected && (
              <section className="feedback">
                {mode === "simulacion" || mode === "diagnostico" ? (
                  <>
                    <p>Respuesta guardada. En Prueba UC real se corrige al final.</p>
                    <button onClick={next}>Siguiente</button>
                  </>
                ) : (
                  <>
                    <h3>{selected === current.respuesta_correcta || selected === "respuesta_abierta" ? "✅ Revisemos" : "❌ Incorrecta"}</h3>
                    <p><strong>Respuesta esperada:</strong> {String(getCorrectOptionText(current))}</p>
                    <p>{current.explicacion || current.explanation}</p>

                    {errorAnalysis && errorAnalysis.title !== "Sin error detectado" && (
                      <div className={`errorAnalysisBox ${errorAnalysis.severity}`}>
                        <strong>{errorAnalysis.title}</strong>
                        <p>{errorAnalysis.message}</p>
                        <small>{errorAnalysis.fix}</small>
                      </div>
                    )}

                    {adaptiveRecommendation && (
                      <div className="adaptiveRecommendationBox">
                        <strong>Próximo ajuste IA</strong>
                        <p>{adaptiveRecommendation.message}</p>
                      </div>
                    )}

                    {current.error_comun && (
                      <div className="note">Trampa típica UC: {current.error_comun}</div>
                    )}

                    
                    <div className="feelingBox">
                      <p>¿Cómo se te hizo?</p>
                      <div className="feelingBtns">
                        <button onClick={() => handleFeeling("facil")} className={feeling === "facil" ? "active easy" : ""}>Fácil</button>
                        <button onClick={() => handleFeeling("medio")} className={feeling === "medio" ? "active mid" : ""}>Normal</button>
                        <button onClick={() => handleFeeling("dificil")} className={feeling === "dificil" ? "active hard" : ""}>Difícil</button>
                      </div>
                      {feeling && <small>Guardado. La próxima sesión se adaptará a esto.</small>}
                    </div>


                    <div className="feedback-actions">
                      <button onClick={() => {
                        setShowSteps(v => !v)
                        setVisualStep(0)
                      }}>
                        {showSteps ? "Ocultar explicación" : "Ver explicación paso a paso"}
                      </button>
                      <button onClick={next}>Siguiente</button>
                    </div>

                    {showSteps && currentLesson && (
                  <>

                    {currentLesson?.steps?.length > 0 && (
                      <AlgebraMotionPro
                        steps={currentLesson.steps.map((st: any) => ({
                          equation: st.equation || st.expresion || st.title,
                          explanation: st.explanation || st.explicacion || "",
                          operation: st.action || st.titulo || "",
                        }))}
                      />
                    )}

                      <>
                        <MathLessonEngine title={currentLesson.title} steps={currentLesson.steps as any} />
                  </>
                        {Array.isArray(current.pasos) && (
                          <div style={{ marginTop: 16 }}>
                            <PrecalculoSteps pasos={current.pasos || []} onStepChange={setVisualStep} />
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </section>
            )}
          </section>
        )}
      </section>

      <style jsx>{`
        .practice-page {
          min-height: 100vh;
          padding: 28px;
          color: white;
          background:
            radial-gradient(circle at 18% 10%, var(--a), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .shell {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .hero-card,
        .mode-card,
        .filters-card,
        .question-card,
        .result-card {
          border: 1px solid rgba(148,163,184,.20);
          background: linear-gradient(135deg,rgba(30,41,59,.82),rgba(15,23,42,.86));
          border-radius: 28px;
          box-shadow: 0 28px 80px rgba(0,0,0,.28);
        }

        .hero-card {
          padding: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-color: var(--c);
          box-shadow: 0 0 0 1px var(--c),0 30px 90px rgba(0,0,0,.35);
        }

        .badge,
        .chips span {
          display: inline-flex;
          padding: 7px 11px;
          border-radius: 999px;
          background: var(--a);
          font-weight: 950;
          font-size: 12px;
        }

        h1 {
          font-size: clamp(34px,5vw,56px);
          margin: 12px 0 8px;
          letter-spacing: -.05em;
        }

        .hero-card p,
        .mode-card p {
          color: #cbd5e1;
        }

        .timer {
          width: 170px;
          padding: 15px;
          border-radius: 24px;
          background: rgba(2,6,23,.55);
          text-align: center;
        }

        .timer strong {
          font-size: 30px;
          display: block;
        }

        .timer span {
          color: #cbd5e1;
          font-size: 13px;
        }

        .timerbar {
          height: 8px;
          margin-top: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          overflow: hidden;
        }

        .timerbar i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg,#22c55e,#3b82f6,#f97316);
          transition: width .35s linear;
        }

        .mode-card {
          padding: 20px;
          border-color: color-mix(in srgb,var(--c) 60%,transparent);
        }

        .diagnostic-cta {
          display: inline-flex;
          margin-top: 10px;
          padding: 12px 16px;
          border-radius: 16px;
          background: linear-gradient(135deg,#ef4444,#f97316);
          color: white;
          text-decoration: none;
          font-weight: 950;
        }

        .filters-card {
          padding: 22px;
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 16px;
        }

        label {
          display: grid;
          gap: 8px;
          color: #e2e8f0;
          font-weight: 900;
        }

        select,
        input {
          min-height: 56px;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.24);
          background: rgba(15,23,42,.88);
          color: white;
          padding: 0 16px;
          font-weight: 900;
          font-size: 15px;
        }

        option {
          background: #0f172a;
          color: #ffffff;
          font-weight: 900;
        }

        select:focus,
        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--c);
          box-shadow: 0 0 0 3px color-mix(in srgb,var(--c) 30%,transparent);
        }

        .actions {
          display: flex;
          gap: 10px;
          align-items: end;
        }

        button {
          min-height: 52px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.14);
          background: linear-gradient(135deg,var(--c),#2563eb);
          color: white;
          padding: 0 18px;
          font-weight: 950;
          cursor: pointer;
        }

        button.secondary {
          background: rgba(255,255,255,.08);
        }

        button:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 14px;
        }

        .stats div {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
        }

        .stats span {
          color: #cbd5e1;
          display: block;
          margin-bottom: 8px;
        }

        .stats strong {
          font-size: 22px;
        }

        .question-card,
        .result-card {
          padding: 24px;
          border-color: var(--c);
          box-shadow: 0 0 0 1px var(--c),0 0 34px color-mix(in srgb,var(--c) 45%,transparent),0 30px 90px rgba(0,0,0,.35);
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .question-card h2 {
          font-size: 24px;
          line-height: 1.35;
        }

        .options {
          display: grid;
          gap: 11px;
          margin-top: 18px;
        }

        .option {
          text-align: left;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          transition: .18s ease;
        }

        .option:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,.11);
        }

        .option.correct {
          background: rgba(34,197,94,.20);
          border-color: rgba(34,197,94,.65);
        }

        .option.wrong {
          background: rgba(239,68,68,.20);
          border-color: rgba(239,68,68,.65);
        }

        .written {
          display: grid;
          gap: 12px;
          margin-top: 18px;
        }

        textarea {
          min-height: 150px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.70);
          color: white;
          padding: 14px;
          font-weight: 800;
        }

        .feedback {
          margin-top: 18px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(15,23,42,.78);
          border: 1px solid rgba(255,255,255,.12);
        }

        .note {
          margin-top: 12px;
          padding: 12px;
          border-radius: 14px;
          background: rgba(245,158,11,.16);
          border: 1px solid rgba(245,158,11,.30);
          color: #fde68a;
        }

        .feedback-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }


        .feelingBox {
          margin-top: 14px;
          padding: 15px;
          border-radius: 20px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
        }

        .feelingBox p {
          margin: 0 0 10px;
          font-weight: 950;
          color: #e2e8f0;
        }

        .feelingBox small {
          display: block;
          margin-top: 9px;
          color: #bfdbfe;
          font-weight: 800;
        }

        .feelingBtns {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
        }

        .feelingBtns button {
          background: rgba(255,255,255,.08);
        }

        .feelingBtns button.active.easy {
          background: linear-gradient(135deg,#22c55e,#86efac);
          color: #052e16;
        }

        .feelingBtns button.active.mid {
          background: linear-gradient(135deg,#3b82f6,#93c5fd);
          color: #082f49;
        }

        .feelingBtns button.active.hard {
          background: linear-gradient(135deg,#f97316,#facc15);
          color: #431407;
        }

        .errorAnalysisBox {
          margin-top: 14px;
          padding: 15px;
          border-radius: 20px;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(248,113,113,.28);
        }

        .errorAnalysisBox strong {
          display: block;
          color: #fecaca;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .errorAnalysisBox p {
          margin: 0;
          color: #fee2e2;
          line-height: 1.55;
        }

        .errorAnalysisBox small {
          display: block;
          margin-top: 8px;
          color: #fde68a;
          font-weight: 900;
        }

        .errorAnalysisBox.media {
          background: rgba(245,158,11,.12);
          border-color: rgba(245,158,11,.28);
        }

        .errorAnalysisBox.baja {
          background: rgba(34,197,94,.12);
          border-color: rgba(34,197,94,.28);
        }

        .adaptiveRecommendationBox {
          margin-top: 14px;
          padding: 15px;
          border-radius: 20px;
          background: rgba(59,130,246,.12);
          border: 1px solid rgba(147,197,253,.28);
        }

        .adaptiveRecommendationBox strong {
          display: block;
          color: #bfdbfe;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .adaptiveRecommendationBox p {
          margin: 0;
          color: #e2e8f0;
          line-height: 1.55;
        }

        @media(max-width:900px) {
          .filters-card {
            grid-template-columns: 1fr;
          }

          .stats {
            grid-template-columns: repeat(2,1fr);
          }

          .hero-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}
</style>
        
    </main>
  )
}


const EXTRA_PRECALCULO_TOPICS = [
  {
    label: "Logaritmos naturales",
    value: "logaritmos_naturales",
  }
]
