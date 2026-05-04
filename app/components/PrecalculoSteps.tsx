'use client'

import { useEffect, useState } from "react"

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

  useEffect(() => {
    onStepChange?.(active)
  }, [active, onStepChange])

  useEffect(() => {
    if (!auto || !pasos.length) return

    const timer = window.setTimeout(() => {
      setActive(prev => {
        if (prev >= Math.max(5, pasos.length - 1)) {
          setAuto(false)
          return prev
        }
        return prev + 1
      })
    }, 1350)

    return () => window.clearTimeout(timer)
  }, [auto, active, pasos.length])

  const maxStep = Math.max(5, pasos.length - 1)
  const paso = pasos[Math.min(active, pasos.length - 1)]

  return (
    <section className="steps">
      <div className="head">
        <div>
          <p>Guía visual</p>
          <h3>{paso?.titulo || "Construcción paso a paso"}</h3>
        </div>
        <span>{active + 1}/{maxStep + 1}</span>
      </div>

      <div className="progress">
        <i style={{ width: `${((active + 1) / (maxStep + 1)) * 100}%` }} />
      </div>

      <article className="box">
        <p>{paso?.explicacion || "Observa cómo el gráfico se construye por partes."}</p>
        {paso?.expresion && <code>{paso.expresion}</code>}
      </article>

      <div className="actions">
        <button onClick={() => setActive(s => Math.max(0, s - 1))}>Anterior</button>
        <button onClick={() => setAuto(v => !v)}>{auto ? "Pausar" : "Reproducir animación"}</button>
        <button onClick={() => setActive(s => Math.min(maxStep, s + 1))}>Siguiente</button>
      </div>

      <style jsx>{`
        .steps {
          margin-top: 16px;
          padding: 16px;
          border-radius: 24px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }

        .head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
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
          font-size: 19px;
        }

        .head span {
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
        }

        .progress {
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,.09);
          margin: 14px 0;
        }

        .progress i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg,#38bdf8,#22c55e,#facc15,#818cf8);
          transition: width .35s ease;
        }

        .box {
          padding: 14px;
          border-radius: 18px;
          background: rgba(15,23,42,.70);
          border: 1px solid rgba(255,255,255,.10);
        }

        .box p {
          color: #e2e8f0;
          line-height: 1.6;
          margin: 0;
        }

        code {
          display: block;
          margin-top: 10px;
          padding: 11px;
          border-radius: 14px;
          background: rgba(0,0,0,.28);
          color: #fef3c7;
          font-weight: 900;
          overflow-x: auto;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 13px;
        }

        button {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }
      `}</style>
    </section>
  )
}
