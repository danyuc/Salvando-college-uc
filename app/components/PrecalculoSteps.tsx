'use client'

import { useEffect, useState } from "react"

export default function PrecalculoSteps({
  pasos = [],
  onStepChange,
}: {
  pasos?: any[]
  animaciones?: any[]
  onStepChange?: (step: number) => void
}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    onStepChange?.(active)
  }, [active, onStepChange])

  if (!Array.isArray(pasos) || pasos.length === 0) return null

  const paso = pasos[active]

  return (
    <section className="steps-card">
      <div className="head">
        <div>
          <strong>Paso a paso tipo profe</strong>
          <p>Avanza y mira cómo cambia el gráfico.</p>
        </div>
        <span>{active + 1}/{pasos.length}</span>
      </div>

      <article className="box">
        <p className="title">Paso {paso.orden}: {paso.titulo}</p>
        <p>{paso.explicacion}</p>
        <code>{paso.expresion}</code>
      </article>

      <div className="actions">
        <button onClick={() => setActive(a => Math.max(0, a - 1))}>Anterior</button>
        <button onClick={() => setActive(a => Math.min(pasos.length - 1, a + 1))}>Siguiente paso</button>
      </div>

      <style jsx>{`
        .steps-card {
          margin-top: 16px;
          padding: 16px;
          border-radius: 22px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }
        .head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }
        .head p { margin: 4px 0 0; color: #cbd5e1; font-size: 13px; }
        .head span {
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
        }
        .box {
          padding: 15px;
          border-radius: 18px;
          background: rgba(15,23,42,.72);
          border: 1px solid rgba(255,255,255,.1);
        }
        .title { margin: 0 0 8px; font-weight: 950; color: #bfdbfe; }
        code {
          display: block;
          padding: 12px;
          border-radius: 14px;
          background: rgba(0,0,0,.26);
          color: #fef3c7;
          overflow-x: auto;
        }
        .actions { display: flex; gap: 10px; margin-top: 12px; }
        button {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 900;
        }
      `}</style>
    </section>
  )
}
