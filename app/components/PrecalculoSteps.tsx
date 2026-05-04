'use client'

import { useEffect, useMemo, useState } from "react"

export default function PrecalculoSteps({
  pasos = [],
  animaciones = [],
  onStepChange,
}: {
  pasos?: any[]
  animaciones?: any[]
  onStepChange?: (step: number) => void
}) {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(false)

  const visualSteps = useMemo(() => {
    const base = Array.isArray(pasos) ? pasos : []

    return [
      base[0] || {
        titulo: "Ubicar punto A",
        explicacion: "Primero marcamos el punto A en el plano.",
        expresion: "A(x₁, y₁)",
      },
      base[1] || {
        titulo: "Ubicar punto B",
        explicacion: "Luego marcamos el punto B para comparar ambas posiciones.",
        expresion: "B(x₂, y₂)",
      },
      base[2] || {
        titulo: "Dibujar Δx",
        explicacion: "Ahora se dibuja el cambio horizontal entre las coordenadas x.",
        expresion: "Δx = x₂ - x₁",
      },
      base[3] || {
        titulo: "Dibujar Δy",
        explicacion: "Después se dibuja el cambio vertical entre las coordenadas y.",
        expresion: "Δy = y₂ - y₁",
      },
      base[4] || {
        titulo: "Formar el triángulo",
        explicacion: "Con Δx y Δy se forma un triángulo rectángulo.",
        expresion: "catetos: Δx y Δy",
      },
      base[5] || {
        titulo: "Aplicar Pitágoras",
        explicacion: "La distancia corresponde a la hipotenusa del triángulo.",
        expresion: "d = √(Δx² + Δy²)",
      },
    ]
  }, [pasos])

  const maxStep = visualSteps.length - 1
  const step = visualSteps[Math.min(active, maxStep)]

  useEffect(() => {
    onStepChange?.(active)
  }, [active, onStepChange])

  useEffect(() => {
    if (!auto) return

    const timer = window.setTimeout(() => {
      setActive(prev => {
        if (prev >= maxStep) {
          setAuto(false)
          return prev
        }
        return prev + 1
      })
    }, 1550)

    return () => window.clearTimeout(timer)
  }, [auto, active, maxStep])

  return (
    <section className="steps">
      <div className="head">
        <div>
          <p>Animación guiada</p>
          <h3>{step.titulo}</h3>
        </div>
        <span>{active + 1}/{visualSteps.length}</span>
      </div>

      <div className="progress">
        <i style={{ width: `${((active + 1) / visualSteps.length) * 100}%` }} />
      </div>

      <article className="box">
        <p>{step.explicacion}</p>
        {step.expresion && <code>{step.expresion}</code>}
      </article>

      <div className="actions">
        <button onClick={() => setActive(s => Math.max(0, s - 1))}>Anterior</button>
        <button className="play" onClick={() => setAuto(v => !v)}>
          {auto ? "Pausar animación" : "Reproducir animación"}
        </button>
        <button onClick={() => setActive(s => Math.min(maxStep, s + 1))}>Siguiente paso</button>
      </div>

      <style jsx>{`
        .steps {
          margin-top: 16px;
          padding: 18px;
          border-radius: 26px;
          background:
            radial-gradient(circle at 0% 0%, rgba(59,130,246,.18), transparent 35%),
            rgba(15,23,42,.86);
          border: 1px solid rgba(147,197,253,.25);
          box-shadow: 0 20px 60px rgba(0,0,0,.28);
        }

        .head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .head p {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .head h3 {
          margin: 4px 0 0;
          font-size: 20px;
          letter-spacing: -.025em;
        }

        .head span {
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(59,130,246,.20);
          color: #bfdbfe;
          font-weight: 950;
        }

        .progress {
          height: 9px;
          margin: 14px 0;
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          overflow: hidden;
        }

        .progress i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg,#38bdf8,#22c55e,#facc15,#818cf8);
          transition: width .45s cubic-bezier(.2,.9,.2,1);
        }

        .box {
          padding: 15px;
          border-radius: 19px;
          background: rgba(2,6,23,.55);
          border: 1px solid rgba(255,255,255,.10);
        }

        .box p {
          margin: 0;
          color: #e2e8f0;
          line-height: 1.65;
        }

        code {
          display: block;
          margin-top: 10px;
          padding: 12px;
          border-radius: 15px;
          background: rgba(0,0,0,.28);
          color: #fef3c7;
          font-weight: 950;
          overflow-x: auto;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        button {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        button.play {
          background: linear-gradient(135deg,#2563eb,#7c3aed);
        }
      `}</style>
    </section>
  )
}
