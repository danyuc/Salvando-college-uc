'use client'

import { useMemo, useState } from "react"
import { generateDiagnosticSet } from "@/lib/precalculo-engine"
import { generarDiagnostico } from "@/lib/precalculo-diagnostico"
import PrecalculoVisual from "../components/PrecalculoVisual"
import PrecalculoSteps from "../components/PrecalculoSteps"

export default function DiagnosticoPage() {
  const questions = useMemo(() => generateDiagnosticSet(), [])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [selected, setSelected] = useState("")
  const [done, setDone] = useState(false)

  const q = questions[index]
  const result = done ? generarDiagnostico(answers) : null

  function answer(opcion: string) {
    if (selected) return

    const correct = opcion === q.respuesta_correcta
    setSelected(opcion)

    const next = [
      ...answers,
      {
        subtema: q.subtema,
        correct,
        dificultad: q.dificultad,
        time: 25000,
      },
    ]

    setAnswers(next)

    setTimeout(() => {
      if (index >= questions.length - 1) {
        setDone(true)
      } else {
        setIndex(i => i + 1)
        setSelected("")
      }
    }, 500)
  }

  return (
    <main style={{
      minHeight: "100vh",
      padding: 24,
      color: "white",
      background: "linear-gradient(180deg,#020617,#0f172a)"
    }}>
      <section style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: 24,
        borderRadius: 28,
        background: "rgba(255,255,255,.07)",
        border: "1px solid rgba(255,255,255,.14)"
      }}>
        <p style={{ color: "#93c5fd", fontWeight: 900 }}>MAT1000 · Diagnóstico real</p>
        <h1>Diagnóstico práctico de Precálculo</h1>
        <p style={{ color: "#cbd5e1" }}>
          12 ejercicios de cálculo. No son preguntas teóricas. Mide base algebraica, funciones, dominio, composición, inversa, exponenciales y logaritmos.
        </p>

        {!done && q && (
          <>
            <p>Pregunta {index + 1} de {questions.length} · {q.subtema}</p>
            <h2>{q.pregunta}</h2>

            {q.visualizacion?.parametros?.puntos && (
              <PrecalculoVisual puntos={q.visualizacion.parametros.puntos} />
            )}

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              {q.opciones.map(op => (
                <button
                  key={op}
                  onClick={() => answer(op)}
                  style={{
                    padding: 15,
                    borderRadius: 16,
                    border: selected === op
                      ? op === q.respuesta_correcta
                        ? "1px solid #22c55e"
                        : "1px solid #ef4444"
                      : "1px solid rgba(255,255,255,.15)",
                    background: "rgba(255,255,255,.06)",
                    color: "white",
                    textAlign: "left",
                    fontWeight: 800
                  }}
                >
                  {op}
                </button>
              ))}
            </div>

            {selected && (
              <>
                <p style={{ marginTop: 16 }}>
                  {selected === q.respuesta_correcta ? "Correcto" : "Incorrecto"} · Respuesta: {q.respuesta_correcta}
                </p>
                <p>{q.explanation}</p>
                <PrecalculoSteps pasos={q.pasos} animaciones={q.animaciones} />
              </>
            )}
          </>
        )}

        {done && result && (
          <section style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 20,
            background: "rgba(16,185,129,.12)",
            border: "1px solid rgba(16,185,129,.28)"
          }}>
            <h2>Resultado diagnóstico</h2>
            <p>Nivel: <strong>{result.nivel}</strong></p>
            <p>Precisión: <strong>{result.accuracy}%</strong></p>
            <p>Recomendación: {result.recomendacion}</p>
            <p>Siguiente práctica: {result.siguiente_practica.subtema} · {result.siguiente_practica.dificultad}</p>
          </section>
        )}
      </section>
    </main>
  )
}
