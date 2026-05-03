'use client'

import { useEffect, useMemo, useState } from "react"
import { generateMat1000ForceQuestions } from "@/lib/mat1000-force-questions"
import { getMat1000ModulesForEvaluation, getMat1000SubtemasForModule } from "@/lib/precalculo-ui-options"
import { SUBJECT_THEMES, type SubjectCode } from "@/lib/academic-calendar-data"
import { getLocalUser } from "@/lib/local-user"
import PrecalculoVisual from "./PrecalculoVisual"
import PrecalculoSteps from "./PrecalculoSteps"

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

function getWeaknesses(evaluation: string) {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(`mat1000-weaknesses-${evaluation}`)
  if (!raw) return []
  try {
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveWeakness(evaluation: string, subtema: string) {
  const prev = getWeaknesses(evaluation)
  const next = Array.from(new Set([...prev, subtema]))
  localStorage.setItem(`mat1000-weaknesses-${evaluation}`, JSON.stringify(next))
}

function saveEase(subtema: string, value: "facil" | "medio" | "dificil") {
  const raw = localStorage.getItem("mat1000-ease-map")
  const map = raw ? JSON.parse(raw) : {}
  map[subtema] = value
  localStorage.setItem("mat1000-ease-map", JSON.stringify(map))
}

function enrichQuestions(base: any[], kind: QuestionKind, mode: Mode) {
  const extras = [
    {
      id: "dev-distancia-1",
      tipo: "desarrollo",
      subtema: "Distancia entre puntos",
      pregunta: "Desarrollo: Dados A(-2, 5) y B(4, -3), calcula la distancia AB mostrando Δx, Δy y el resultado final.",
      opciones: null,
      respuesta_correcta: "√100 = 10",
      explicacion: "Δx=4-(-2)=6, Δy=-3-5=-8. Entonces d=√(6²+(-8)²)=√(36+64)=√100=10.",
      error_comun: "No explicar de dónde salen Δx y Δy.",
      pasos: [
        { orden: 1, titulo: "Identificar coordenadas", explicacion: "A es el primer punto y B el segundo.", expresion: "A(x₁,y₁)=(-2,5), B(x₂,y₂)=(4,-3)" },
        { orden: 2, titulo: "Cambio horizontal", explicacion: "Restamos x₂-x₁.", expresion: "Δx=4-(-2)=6" },
        { orden: 3, titulo: "Cambio vertical", explicacion: "Restamos y₂-y₁.", expresion: "Δy=-3-5=-8" },
        { orden: 4, titulo: "Pitágoras", explicacion: "La distancia es la hipotenusa.", expresion: "d=√(6²+(-8)²)=10" },
      ],
      visualizacion: { parametros: { puntos: [{ etiqueta: "A", x: -2, y: 5 }, { etiqueta: "B", x: 4, y: -3 }] } },
    },
    {
      id: "mod-funciones-1",
      tipo: "modelamiento",
      subtema: "Modelamiento",
      pregunta: "Modelamiento: El costo de producir x unidades está dado por C(x)=2x+15. Si el ingreso es I(x)=5x, modela la utilidad y determina desde qué cantidad hay ganancia.",
      opciones: null,
      respuesta_correcta: "U(x)=3x-15; hay ganancia si x>5",
      explicacion: "La utilidad es ingreso menos costo: U(x)=I(x)-C(x)=5x-(2x+15)=3x-15. Hay ganancia cuando U(x)>0, entonces 3x-15>0, x>5.",
      error_comun: "Confundir costo con utilidad o no plantear la desigualdad.",
      pasos: [
        { orden: 1, titulo: "Definir utilidad", explicacion: "La utilidad siempre se modela como ingreso menos costo.", expresion: "U(x)=I(x)-C(x)" },
        { orden: 2, titulo: "Sustituir funciones", explicacion: "Reemplazamos I(x)=5x y C(x)=2x+15.", expresion: "U(x)=5x-(2x+15)" },
        { orden: 3, titulo: "Simplificar", explicacion: "Distribuimos el signo negativo.", expresion: "U(x)=5x-2x-15=3x-15" },
        { orden: 4, titulo: "Condición de ganancia", explicacion: "Hay ganancia cuando la utilidad es positiva.", expresion: "3x-15>0 ⇒ x>5" },
      ],
    },
  ]

  let output = [...base]

  if (kind === "desarrollo") output = extras.filter(q => q.tipo === "desarrollo")
  if (kind === "modelamiento") output = extras.filter(q => q.tipo === "modelamiento")
  if (kind === "mixtas") output = [...base, ...extras]

  if (mode === "intensivo") {
    output = [...extras, ...base, ...base.slice(0, 5)]
  }

  return output
}

export default function PracticeView() {
  const [userName, setUserName] = useState("usuario")
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
  const [written, setWritten] = useState("")
  const [showSteps, setShowSteps] = useState(false)
  const [answers, setAnswers] = useState<any[]>([])
  const [finished, setFinished] = useState(false)
  const [remaining, setRemaining] = useState(minutes * 60)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSubject(normalizeSubject(params.get("subject")))
    setEvaluation(normalizeEvaluation(params.get("evaluation")))
    const user = getLocalUser()
    if (user) setUserName(user.username)
  }, [])

  useEffect(() => {
    setRemaining(minutes * 60)
  }, [minutes])

  useEffect(() => {
    if (!questions.length || finished) return
    const timer = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [questions.length, finished])

  const theme = SUBJECT_THEMES[subject]
  const isMath = subject === "MAT1000"

  const modules = useMemo(() => {
    if (!isMath) return ["Lecturas", "Conceptos", "Evaluaciones"]
    return getMat1000ModulesForEvaluation(evaluation)
  }, [isMath, evaluation])

  const subtemas = useMemo(() => {
    if (!isMath) return ["Todos", "Lecturas", "Conceptos", "Aplicación"]
    return getMat1000SubtemasForModule(moduleLabel, evaluation)
  }, [isMath, moduleLabel, evaluation])

  const current = questions[index]
  const correctCount = answers.filter(a => a.correct).length
  const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0
  const weak = [...new Set(answers.filter(a => !a.correct).map(a => a.subtema))]
  const diagnosticDone = typeof window !== "undefined" && Boolean(localStorage.getItem(`mat1000-diagnostic-${evaluation}`))
  const diagnosticRequired = isMath && !diagnosticDone
  const avgPerQuestion = questions.length ? Math.floor((minutes * 60) / questions.length) : 0
  const elapsedForCurrent = questions.length ? (minutes * 60 - remaining) - index * avgPerQuestion : 0
  const timeWarning = avgPerQuestion > 0 && elapsedForCurrent > avgPerQuestion * 0.8

  function reset() {
    setQuestions([])
    setIndex(0)
    setSelected("")
    setWritten("")
    setShowSteps(false)
    setAnswers([])
    setFinished(false)
    setRemaining(minutes * 60)
  }

  function start() {
    if (diagnosticRequired) return

    if (!isMath) {
      setQuestions([
        {
          tipo: "desarrollo",
          subtema,
          pregunta: `Explica con tus palabras el tema "${subtema}" en ${theme.name}.`,
          respuesta_correcta: "Respuesta abierta",
          explicacion: "Compara tu respuesta con apuntes, lecturas y rúbrica del ramo.",
          pasos: [
            { orden: 1, titulo: "Definir concepto", explicacion: "Parte por definir el concepto central.", expresion: "Concepto → definición clara" },
            { orden: 2, titulo: "Aplicar", explicacion: "Agrega un ejemplo de clase o lectura.", expresion: "Definición + ejemplo" },
            { orden: 3, titulo: "Cerrar", explicacion: "Explica por qué importa para la evaluación.", expresion: "Idea central + relevancia" },
          ],
        },
      ])
      return
    }

    const base = generateMat1000ForceQuestions({
      evaluation,
      mode,
      moduleLabel,
      subtema,
      cantidad: mode === "simulacion" ? 13 : amount,
    })

    const enriched = enrichQuestions(base, kind, mode).slice(0, mode === "simulacion" ? 13 : amount)

    setQuestions(enriched)
    setIndex(0)
    setSelected("")
    setWritten("")
    setShowSteps(false)
    setAnswers([])
    setFinished(false)
    setRemaining(minutes * 60)
  }

  function answer(option: string) {
    if (!current || selected) return
    const correct = option === current.respuesta_correcta
    setSelected(option)
    setAnswers(prev => [...prev, { subtema: current.subtema, correct }])
    if (!correct) saveWeakness(evaluation, current.subtema)
  }

  function submitWritten() {
    if (!current || selected) return
    setSelected("respuesta_abierta")
    setAnswers(prev => [...prev, { subtema: current.subtema, correct: true, written }])
  }

  function markEase(value: "facil" | "medio" | "dificil") {
    if (!current) return
    saveEase(current.subtema, value)
    if (value === "dificil") saveWeakness(evaluation, current.subtema)
  }

  function next() {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }
    setIndex(i => i + 1)
    setSelected("")
    setWritten("")
    setShowSteps(false)
  }

  return (
    <main className="practice-page" style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}>
      <section className="shell">
        <section className="hero-card">
          <div>
            <span className="badge">{theme.icon} {theme.short}</span>
            <h1>Hola, {userName}</h1>
            <p>Práctica inteligente con tiempo, dificultad, modo intensivo, desarrollo y modelamiento.</p>
          </div>
          <div className="timer">
            <strong>{formatTime(remaining)}</strong>
            <span>tiempo restante</span>
          </div>
        </section>

        <section className="mode-card">
          <h3>{diagnosticRequired ? "🔒 Diagnóstico obligatorio" : mode === "intensivo" ? "🔥 Modo intensivo pre-prueba" : "🧠 Modo guiado activo"}</h3>
          <p>
            {diagnosticRequired
              ? `Antes de practicar ${evaluation}, completa el diagnóstico.`
              : mode === "intensivo"
                ? "Mezcla debilidades, preguntas fáciles, trampas típicas y ejercicios de alta repetición."
                : `Foco actual: ${theme.name} · ${subtema}`}
          </p>
          {diagnosticRequired && <a href={`/diagnostico?evaluation=${evaluation}`}>Hacer diagnóstico ahora</a>}
        </section>

        <section className="filters-card">
          <label>
            Asignatura
            <select value={subject} onChange={(e) => { setSubject(e.target.value as SubjectCode); reset() }}>
              {Object.entries(SUBJECT_THEMES).map(([code, t]) => <option key={code} value={code}>{t.icon} {t.name}</option>)}
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
          <div><span>Promedio/pregunta</span><strong>{avgPerQuestion ? formatTime(avgPerQuestion) : "—"}</strong></div>
          <div><span>Débiles</span><strong>{weak.length}</strong></div>
        </section>

        {timeWarning && current && (
          <section className="warning">
            ⚠️ Estás llegando al tiempo promedio de esta pregunta. Si estás en modo prueba, marca una alternativa razonable y sigue.
          </section>
        )}

        {finished && (
          <section className="result-card">
            <h2>Sesión finalizada</h2>
            <p>Precisión: <strong>{accuracy}%</strong></p>
            {weak.length > 0 ? <p>Refuerza: <strong>{weak.join(", ")}</strong>.</p> : <p>No se detectaron debilidades críticas.</p>}
            <button onClick={start}>Repetir sesión</button>
          </section>
        )}

        {!finished && current && (
          <section className="question-card">
            <div className="chips">
              <span>{theme.short}</span>
              <span>{current.tipo || "selección"}</span>
              <span>{current.subtema}</span>
              <span>{index + 1}/{questions.length}</span>
            </div>

            <h2>{current.pregunta}</h2>

            {Array.isArray(current.visualizacion?.parametros?.puntos) && <PrecalculoVisual puntos={current.visualizacion.parametros.puntos} />}

            {current.opciones ? (
              <div className="options">
                {(current.opciones || []).map((op: string) => {
                  const answered = !!selected
                  const correct = op === current.respuesta_correcta
                  const chosen = op === selected
                  return (
                    <button key={op} onClick={() => answer(op)} className={`option ${answered && mode !== "simulacion" && correct ? "correct" : ""} ${answered && mode !== "simulacion" && chosen && !correct ? "wrong" : ""}`}>
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
                {mode === "simulacion" ? (
                  <>
                    <p>Respuesta guardada. En Prueba UC real se corrige al final.</p>
                    <button onClick={next}>Siguiente</button>
                  </>
                ) : (
                  <>
                    <h3>{selected === current.respuesta_correcta || !current.opciones ? "✅ Revisemos" : "❌ Incorrecta"}</h3>
                    <p><strong>Respuesta esperada:</strong> {current.respuesta_correcta}</p>
                    <p>{current.explicacion || current.explanation}</p>

                    <div className="ease">
                      <span>¿Cómo se sintió?</span>
                      <button onClick={() => markEase("facil")}>Fácil</button>
                      <button onClick={() => markEase("medio")}>Medio</button>
                      <button onClick={() => markEase("dificil")}>Me costó</button>
                    </div>

                    {current.error_comun && <div className="note">Trampa típica UC: {current.error_comun}</div>}

                    <div className="feedback-actions">
                      <button onClick={() => setShowSteps(v => !v)}>{showSteps ? "Ocultar explicación" : "Ver explicación paso a paso"}</button>
                      <button onClick={next}>Siguiente</button>
                    </div>

                    {showSteps && <PrecalculoSteps pasos={current.pasos || []} animaciones={current.animaciones || []} />}
                  </>
                )}
              </section>
            )}
          </section>
        )}
      </section>

      <style jsx>{`
        .practice-page {
          min-height:100vh;
          padding:28px;
          color:white;
          background:
            radial-gradient(circle at 18% 10%, var(--a), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }
        .shell { max-width:1180px; margin:0 auto; display:grid; gap:18px; }
        .hero-card,.mode-card,.filters-card,.question-card,.result-card {
          border:1px solid rgba(148,163,184,.20);
          background:linear-gradient(135deg,rgba(30,41,59,.82),rgba(15,23,42,.86));
          border-radius:28px;
          box-shadow:0 28px 80px rgba(0,0,0,.28);
        }
        .hero-card {
          padding:28px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          border-color:var(--c);
          box-shadow:0 0 0 1px var(--c),0 30px 90px rgba(0,0,0,.35);
        }
        .badge,.chips span {
          display:inline-flex;
          padding:7px 11px;
          border-radius:999px;
          background:var(--a);
          font-weight:950;
          font-size:12px;
        }
        h1 { font-size:clamp(34px,5vw,56px); margin:12px 0 8px; letter-spacing:-.05em; }
        .hero-card p,.mode-card p { color:#cbd5e1; }
        .timer {
          width:150px;
          height:110px;
          border-radius:24px;
          background:rgba(2,6,23,.55);
          display:grid;
          place-items:center;
          text-align:center;
        }
        .timer strong { font-size:30px; }
        .timer span { color:#cbd5e1; font-size:13px; }
        .mode-card { padding:20px; border-color:color-mix(in srgb,var(--c) 60%,transparent); }
        .mode-card a { color:white; font-weight:950; }
        .filters-card { padding:22px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; }
        label { display:grid; gap:8px; color:#e2e8f0; font-weight:900; }
        select,input {
          min-height:56px;
          border-radius:18px;
          border:1px solid rgba(148,163,184,.24);
          background:rgba(15,23,42,.88);
          color:white;
          padding:0 16px;
          font-weight:900;
          font-size:15px;
        }
        .actions { display:flex; gap:10px; align-items:end; }
        button {
          min-height:52px;
          border-radius:17px;
          border:1px solid rgba(255,255,255,.14);
          background:linear-gradient(135deg,var(--c),#2563eb);
          color:white;
          padding:0 18px;
          font-weight:950;
          cursor:pointer;
        }
        button.secondary { background:rgba(255,255,255,.08); }
        button:disabled { opacity:.45; cursor:not-allowed; }
        .stats { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; }
        .stats div {
          padding:18px;
          border-radius:20px;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.10);
        }
        .stats span { color:#cbd5e1; display:block; margin-bottom:8px; }
        .stats strong { font-size:22px; }
        .warning {
          padding:16px;
          border-radius:20px;
          background:rgba(245,158,11,.16);
          border:1px solid rgba(245,158,11,.35);
          color:#fde68a;
          font-weight:900;
        }
        .question-card,.result-card {
          padding:24px;
          border-color:var(--c);
          box-shadow:0 0 0 1px var(--c),0 0 34px color-mix(in srgb,var(--c) 45%,transparent),0 30px 90px rgba(0,0,0,.35);
        }
        .chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
        .question-card h2 { font-size:24px; line-height:1.35; }
        .options { display:grid; gap:11px; margin-top:18px; }
        .option {
          text-align:left;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.12);
          transition:.18s ease;
        }
        .option:hover { transform:translateX(4px); background:rgba(255,255,255,.11); }
        .option.correct { background:rgba(34,197,94,.20); border-color:rgba(34,197,94,.65); }
        .option.wrong { background:rgba(239,68,68,.20); border-color:rgba(239,68,68,.65); }
        .written { display:grid; gap:12px; margin-top:18px; }
        textarea {
          min-height:150px;
          border-radius:18px;
          border:1px solid rgba(255,255,255,.14);
          background:rgba(15,23,42,.70);
          color:white;
          padding:14px;
          font-weight:800;
        }
        .feedback {
          margin-top:18px;
          padding:18px;
          border-radius:22px;
          background:rgba(15,23,42,.78);
          border:1px solid rgba(255,255,255,.12);
        }
        .ease { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin:14px 0; }
        .ease span { color:#cbd5e1; font-weight:900; }
        .note {
          margin-top:12px;
          padding:12px;
          border-radius:14px;
          background:rgba(245,158,11,.16);
          border:1px solid rgba(245,158,11,.30);
          color:#fde68a;
        }
        .feedback-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
        @media(max-width:900px){
          .filters-card { grid-template-columns:1fr; }
          .stats { grid-template-columns:repeat(2,1fr); }
          .hero-card { flex-direction:column; align-items:flex-start; }
        }
      `}</style>
    </main>
  )
}
