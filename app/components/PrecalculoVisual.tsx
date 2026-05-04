'use client'

import { useEffect, useState } from "react"

type Point = { etiqueta: string; x: number; y: number }

export default function PrecalculoVisual({
  puntos = [],
  activeStep = 0,
}: {
  puntos?: Point[]
  activeStep?: number
}) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 900)
    return () => clearTimeout(t)
  }, [activeStep])

  if (!Array.isArray(puntos) || puntos.length < 2) return null

  const [a, b] = puntos
  const mid = { x: b.x, y: a.y }

  const axis = [-6,-5,-4,-3,-2,-1,1,2,3,4,5,6]

  function left(x: number) {
    return `${50 + (x / 6) * 42}%`
  }

  function top(y: number) {
    return `${50 - (y / 6) * 42}%`
  }

  const showPoints = activeStep >= 0
  const showDx = activeStep >= 1
  const showDy = activeStep >= 2
  const showTriangle = activeStep >= 3

  return (
    <section className="visual-card">
      <div className="head">
        <strong>Visualización paso a paso</strong>
        <span>
          {activeStep === 0 && "Ubicando puntos"}
          {activeStep === 1 && "Dibujando Δx"}
          {activeStep === 2 && "Dibujando Δy"}
          {activeStep >= 3 && "Formando triángulo"}
        </span>
      </div>

      <div className="plane">
        <div className="axis x-axis" />
        <div className="axis y-axis" />
        <span className="axis-name x-name">x</span>
        <span className="axis-name y-name">y</span>
        <span className="origin">0</span>

        {axis.map(n => <span key={`x-${n}`} className="tick x" style={{ left: left(n) }}>{n}</span>)}
        {axis.map(n => <span key={`y-${n}`} className="tick y" style={{ top: top(n) }}>{n}</span>)}

        {showTriangle && (
          <svg className="svg">
            <line x1={left(a.x)} y1={top(a.y)} x2={left(b.x)} y2={top(b.y)} className="hyp" />
          </svg>
        )}

        {showDx && (
          <div
            className={`dx ${pulse ? "pulse" : ""}`}
            style={{
              left: left(Math.min(a.x, b.x)),
              top: top(a.y),
              width: `calc(${Math.abs(b.x - a.x) / 6 * 42}% )`,
            }}
          >
            Δx = {b.x - a.x}
          </div>
        )}

        {showDy && (
          <div
            className={`dy ${pulse ? "pulse" : ""}`}
            style={{
              left: left(b.x),
              top: top(Math.max(a.y, b.y)),
              height: `calc(${Math.abs(b.y - a.y) / 6 * 42}% )`,
            }}
          >
            Δy = {b.y - a.y}
          </div>
        )}

        {showPoints && puntos.map(p => (
          <div key={p.etiqueta} className={`point ${pulse ? "pulse" : ""}`} style={{ left: left(p.x), top: top(p.y) }}>
            <span>{p.etiqueta}({p.x}, {p.y})</span>
          </div>
        ))}

        {showTriangle && (
          <div className="corner" style={{ left: left(mid.x), top: top(mid.y) }} />
        )}
      </div>

      <style jsx>{`
        .visual-card {
          margin-top: 16px;
          padding: 16px;
          border-radius: 24px;
          background: rgba(15,23,42,.72);
          border: 1px solid rgba(255,255,255,.13);
        }
        .head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .head span { color: #93c5fd; font-weight: 900; }
        .plane {
          position: relative;
          height: 330px;
          overflow: hidden;
          border-radius: 20px;
          background:
            linear-gradient(rgba(148,163,184,.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.14) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(59,130,246,.14), transparent 58%);
          background-size: 28px 28px;
          border: 1px solid rgba(255,255,255,.12);
        }
        .axis { position: absolute; background: rgba(248,250,252,.75); z-index: 2; }
        .x-axis { left: 4%; right: 4%; top: 50%; height: 2px; }
        .y-axis { top: 4%; bottom: 4%; left: 50%; width: 2px; }
        .axis-name, .origin, .tick {
          position: absolute;
          z-index: 3;
          color: white;
          font-size: 12px;
          font-weight: 950;
          text-shadow: 0 2px 8px rgba(0,0,0,.9);
        }
        .x-name { right: 14px; top: calc(50% + 9px); }
        .y-name { left: calc(50% + 10px); top: 10px; }
        .origin { left: calc(50% + 7px); top: calc(50% + 7px); }
        .tick.x { top: calc(50% + 10px); transform: translateX(-50%); }
        .tick.y { left: calc(50% + 10px); transform: translateY(-50%); }
        .point {
          position: absolute;
          z-index: 8;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          transform: translate(-50%,-50%);
          background: #38bdf8;
          border: 2px solid #e0f2fe;
          box-shadow: 0 0 24px rgba(56,189,248,.85);
        }
        .point span {
          position: absolute;
          left: 20px;
          top: -11px;
          white-space: nowrap;
          color: white;
          font-size: 12px;
          font-weight: 950;
        }
        .dx {
          position: absolute;
          z-index: 6;
          height: 4px;
          background: #22c55e;
          transform: translateY(-50%);
          box-shadow: 0 0 22px rgba(34,197,94,.8);
          animation: drawX .7s ease both;
          color: #bbf7d0;
          font-size: 12px;
          font-weight: 950;
          padding-top: 6px;
        }
        .dy {
          position: absolute;
          z-index: 6;
          width: 4px;
          background: #f59e0b;
          transform: translateX(-50%);
          box-shadow: 0 0 22px rgba(245,158,11,.8);
          animation: drawY .7s ease both;
          color: #fde68a;
          font-size: 12px;
          font-weight: 950;
          padding-left: 8px;
        }
        .svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 5;
          pointer-events: none;
        }
        .hyp {
          stroke: #818cf8;
          stroke-width: 4;
          stroke-linecap: round;
          filter: drop-shadow(0 0 12px rgba(129,140,248,.9));
          animation: drawLine .8s ease both;
        }
        .corner {
          position: absolute;
          z-index: 7;
          width: 18px;
          height: 18px;
          border-left: 3px solid white;
          border-bottom: 3px solid white;
          transform: translate(-2px,-16px);
        }
        .pulse { animation: pulse .8s ease; }
        @keyframes pulse {
          0% { filter: brightness(1); transform: translate(-50%,-50%) scale(1); }
          50% { filter: brightness(1.6); transform: translate(-50%,-50%) scale(1.25); }
          100% { filter: brightness(1); transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes drawX { from { width: 0; opacity: 0; } to { opacity: 1; } }
        @keyframes drawY { from { height: 0; opacity: 0; } to { opacity: 1; } }
        @keyframes drawLine { from { stroke-dasharray: 500; stroke-dashoffset: 500; } to { stroke-dasharray: 500; stroke-dashoffset: 0; } }
      `}</style>
    </section>
  )
}
