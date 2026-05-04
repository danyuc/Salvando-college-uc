'use client'

import { useState } from "react"

export default function StepByStepPro({ steps }: { steps: any[] }) {
  const [step, setStep] = useState(0)

  const current = steps[step]

  return (
    <div style={box}>
      <h3>Paso {step + 1}</h3>

      <p>{current.explain}</p>

      {current.visual === "pointA" && (
        <div style={visual}>🔵 Punto A marcado</div>
      )}

      {current.visual === "pointB" && (
        <div style={visual}>🟢 Punto B marcado</div>
      )}

      {current.visual === "line" && (
        <div style={visual}>📏 Línea entre puntos</div>
      )}

      <div style={controls}>
        <button onClick={() => setStep(s => Math.max(0, s - 1))}>
          ←
        </button>

        <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>
          →
        </button>
      </div>
    </div>
  )
}

const box = {
  marginTop: 20,
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,.05)",
}

const visual = {
  marginTop: 10,
  fontSize: 18,
}

const controls = {
  marginTop: 10,
  display: "flex",
  gap: 10,
}
