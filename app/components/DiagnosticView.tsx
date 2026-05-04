'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { generateMat1000ForceQuestions } from "@/lib/mat1000-force-questions"
import { SUBJECT_THEMES, type SubjectCode } from "@/lib/academic-calendar-data"
import PrecalculoVisual from "./PrecalculoVisual"
import PrecalculoSteps from "./PrecalculoSteps"
import { saveUserDiagnostic } from "@/lib/user-diagnostics"

function normalizeSubject(value: string | null): SubjectCode {
  if (value === "PSI1101" || value === "SOL500" || value === "CLG0000" || value === "IHI0204") return value
  return "MAT1000"
}

function normalizeEvaluation(value: string | null) {
  if (value === "I1" || value === "I2" || value === "I3" || value === "EXAMEN") return value
  return "GENERAL"
}

function buildGenericQuestions(subject: SubjectCode) {
  const theme = SUBJECT_THEMES[subject]
  return [
    {
      pregunta: `Diagnóstico ${theme.name}: explica el concepto central más importante que has visto hasta ahora.`,
      subtema: "Conceptos base",
      opciones: ["Lo domino", "Lo entiendo a medias", "Me cuesta", "No lo he estudiado"],
      respuesta_correcta: "Lo domino",
      explicacion: "Este diagnóstico inicial mide seguridad conceptual para organizar tu práctica.",
      pasos: [
        { orden: 1, titulo: "Definir", explicacion: "Debes poder definir el concepto sin copiar.", expresion: "Concepto → definición propia" },
        { orden: 2, titulo: "Aplicar", explicacion: "Debes poder usarlo en un ejemplo.", expresion: "Concepto + ejemplo" },
      ],
    },
    {
      pregunta: `¿Qué tan preparado/a te sientes para la próxima evaluación de ${theme.name}?`,
      subtema: "Preparación general",
      opciones: ["Muy preparado", "Medianamente", "Poco", "Nada"],
      respuesta_correcta: "Muy preparado",
      explicacion: "Si respondes bajo, el sistema priorizará repaso guiado y lectura activa.",
      pasos: [],
    },
  ]
}

export default function DiagnosticView() {
  const [subject, setSubject] = useState<SubjectCode>("MAT1000")
  const [evaluation, setEvaluation] = useState("I1")
  const [questions, setQuestions] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState("")
  const [answers, setAnswers] = useState<any[]>([])
  const [done, setDone] = useState(false)
  const [showSteps, setShowSteps] = useState(false)
  const [visualStep, setVisualStep] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sub = normalizeSubject(params.get("subject"))
    const ev = normalizeEvaluation(params.get("evaluation"))
    setSubject(sub)
    setEvaluation(ev)

    if (sub === "MAT1000") {
      setQuestions(generateMat1000ForceQuestions({
        evaluation: ev === "GENERAL" ? "I1" : ev,
        mode: "diagnostico",
        moduleLabel: "Todos",
        subtema: "Todos",
        cantidad: 12,
      }))
    } else {
      setQuestions(buildGenericQuestions(sub))
    }
  }, [])

  const theme = SUBJECT_THEMES[subject]
  const q = questions[index]

  function answer(op: string) {
    if (!q || selected) return
    const correct = op === q.respuesta_correcta
    setSelected(op)
    setAnswers(prev => [...prev, { subtema: q.subtema, correct }])
  }

  async function next() {
    if (index >= questions.length - 1) {
      const correctCount = answers.filter((a: any) => a.correct).length
      const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
      const weaknesses = Array.from(new Set(answers.filter((a: any) => !a.correct).map((a: any) => a.subtema || "general")))
      const strengths = Array.from(new Set(answers.filter((a: any) => a.correct).map((a: any) => a.subtema || "general")))

      await saveUserDiagnostic({
        subject_code: subject,
        evaluation,
        score,
        weaknesses,
        strengths,
        answers,
      })

      setDone(true)
      return
    }
    setIndex(i => i + 1)
    setSelected("")
    setShowSteps(false)
    setVisualStep(0)
  }

  return (
    <main className="page" style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}>
      <section className="shell">
        <section className="hero">
          <p>Diagnóstico obligatorio</p>
          <h1>{theme.icon} {theme.name}</h1>
          <span>{evaluation}</span>
        </section>

        {done && (
          <section className="card">
            <h2>Diagnóstico finalizado</h2>
            <p>Ya puedes practicar con una ruta personalizada.</p>
            <Link href={`/practica?subject=${subject}&evaluation=${evaluation}&mode=practica`}>
              Ir a práctica
            </Link>
          </section>
        )}

        {!done && q && (
          <section className="card">
            <p className="counter">Pregunta {index + 1} de {questions.length}</p>
            <h2>{q.pregunta}</h2>

            {Array.isArray(q.visualizacion?.parametros?.puntos) && (
              <PrecalculoVisual puntos={q.visualizacion.parametros.puntos} activeStep={visualStep} />
            )}

            <div className="options">
              {q.opciones?.map((op: string) => (
                <button key={op} onClick={() => answer(op)} className={selected === op ? "selected" : ""}>
                  {op}
                </button>
              ))}
            </div>

            {selected && (
              <section className="feedback">
                <p>{q.explicacion}</p>
                <button onClick={() => setShowSteps(v => !v)}>
                  {showSteps ? "Ocultar explicación" : "Ver explicación"}
                </button>
                <button onClick={next}>Siguiente</button>
                {showSteps && <PrecalculoSteps pasos={q.pasos || []} onStepChange={setVisualStep} />}
              </section>
            )}
          </section>
        )}
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 28px;
          color: white;
          background:
            radial-gradient(circle at 18% 0%, var(--a), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }
        .shell { max-width: 1000px; margin: 0 auto; display: grid; gap: 18px; }
        .hero, .card {
          padding: 26px;
          border-radius: 30px;
          background: rgba(255,255,255,.08);
          border: 1px solid var(--c);
          box-shadow: 0 0 0 1px var(--c), 0 30px 90px rgba(0,0,0,.35);
        }
        .hero p { color: #bfdbfe; font-weight: 950; text-transform: uppercase; margin: 0; }
        h1 { font-size: clamp(40px,6vw,64px); margin: 8px 0; letter-spacing: -.06em; }
        h2 { font-size: 26px; }
        .counter { color: #cbd5e1; font-weight: 900; }
        .options { display: grid; gap: 10px; margin-top: 18px; }
        button, a {
          min-height: 52px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          padding: 0 16px;
          font-weight: 950;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        button.selected {
          border-color: var(--c);
          background: var(--a);
        }
        .feedback {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .feedback p { width: 100%; color: #e2e8f0; }
      `}</style>
    </main>
  )
}
