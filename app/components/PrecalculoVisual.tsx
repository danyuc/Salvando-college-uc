'use client'

import { useEffect, useState } from "react"

type Point = {
  etiqueta: string
  x: number
  y: number
}

export default function PrecalculoVisual({
  puntos = [],
  activeStep = 0,
}: {
  puntos?: Point[]
  activeStep?: number
}) {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    setPulse((p) => p + 1)
  }, [activeStep])

  if (!Array.isArray(puntos) || puntos.length < 2) return null

  const [a, b] = puntos
  const corner = { x: b.x, y: a.y }
  const axis = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]

  function left(x: number) {
    return `${50 + (x / 6) * 42}%`
  }

  function top(y: number) {
    return `${50 - (y / 6) * 42}%`
  }

  const dx = b.x - a.x
  const dy = b.y - a.y

  const showPoints = activeStep >= 0
  const showDx = activeStep >= 1
  const showDy = activeStep >= 2
  const showTriangle = activeStep >= 3

  return (
    <section className="visual-card">
      <div className="visual-head">
        <div>
          <strong>Plano animado</strong>
          <p>
            {activeStep === 0 && "Primero ubicamos los puntos A y B."}
            {activeStep === 1 && "Ahora medimos el cambio horizontal Δx."}
            {activeStep === 2 && "Ahora medimos el cambio vertical Δy."}
            {activeStep >= 3 && "Finalmente formamos el triángulo rectángulo."}
          </p>
        </div>
        <span>Paso visual {Math.min(activeStep + 1, 4)}/4</span>
      </div>

      <div className="plane">
        <div className="axis x-axis" />
        <div className="axis y-axis" />

        <span className="axis-name x-name">x</span>
        <span className="axis-name y-name">y</span>
        <span className="origin">0</span>

        {axis.map((n) => (
          <span key={`x-${n}`} className="tick x" style={{ left: left(n) }}>
            {n}
          </span>
        ))}

        {axis.map((n) => (
          <span key={`y-${n}`} className="tick y" style={{ top: top(n) }}>
            {n}
          </span>
        ))}

        {showTriangle && (
          <svg className="svg">
            <line
              x1={left(a.x)}
              y1={top(a.y)}
              x2={left(b.x)}
              y2={top(b.y)}
              className="hypotenuse"
            />
          </svg>
        )}

        {showDx && (
          <div
            key={`dx-${pulse}`}
            className="dx-line"
            style={{
              left: left(Math.min(a.x, b.x)),
              top: top(a.y),
              width: `${Math.abs(dx) / 6 * 42}%`,
            }}
          >
            <span>Δx = {dx}</span>
          </div>
        )}

        {showDy && (
          <div
            key={`dy-${pulse}`}
            className="dy-line"
            style={{
              left: left(b.x),
              top: top(Math.max(a.y, b.y)),
              height: `${Math.abs(dy) / 6 * 42}%`,
            }}
          >
            <span>Δy = {dy}</span>
          </div>
        )}

        {showTriangle && (
          <div
            key={`corner-${pulse}`}
            className="right-angle"
            style={{
              left: left(corner.x),
              top: top(corner.y),
            }}
          />
        )}

        {showPoints &&
          puntos.map((p) => (
            <div
              key={`${p.etiqueta}-${pulse}`}
              className="point"
              style={{ left: left(p.x), top: top(p.y) }}
            >
              <span>
                {p.etiqueta}({p.x}, {p.y})
              </span>
            </div>
          ))}
      </div>

      <style jsx>{`
        .visual-card {
          margin-top: 16px;
          padding: 16px;
          border-radius: 26px;
          background:
            radial-gradient(circle at top left, rgba(56,189,248,.18), transparent 38%),
            rgba(15,23,42,.76);
          border: 1px solid rgba(255,255,255,.13);
          box-shadow: 0 20px 55px rgba(0,0,0,.25);
        }

        .visual-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 12px;
        }

        .visual-head strong {
          font-size: 17px;
        }

        .visual-head p {
          margin: 4px 0 0;
          color: #cbd5e1;
          font-size: 13px;
        }

        .visual-head span {
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
          font-size: 12px;
        }

        .plane {
          position: relative;
          height: 340px;
          overflow: hidden;
          border-radius: 22px;
          background:
            linear-gradient(rgba(148,163,184,.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.14) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(59,130,246,.15), transparent 58%);
          background-size: 28px 28px, 28px 28px, 100% 100%;
          border: 1px solid rgba(255,255,255,.12);
        }

        .axis {
          position: absolute;
          background: rgba(248,250,252,.78);
          z-index: 2;
        }

        .x-axis {
          left: 4%;
          right: 4%;
          top: 50%;
          height: 2px;
        }

        .y-axis {
          top: 4%;
          bottom: 4%;
          left: 50%;
          width: 2px;
        }

        .axis-name,
        .origin,
        .tick {
          position: absolute;
          z-index: 3;
          color: #f8fafc;
          font-size: 12px;
          font-weight: 950;
          text-shadow: 0 2px 8px rgba(0,0,0,.9);
        }

        .x-name {
          right: 14px;
          top: calc(50% + 9px);
        }

        .y-name {
          left: calc(50% + 10px);
          top: 10px;
        }

        .origin {
          left: calc(50% + 7px);
          top: calc(50% + 7px);
        }

        .tick.x {
          top: calc(50% + 10px);
          transform: translateX(-50%);
        }

        .tick.y {
          left: calc(50% + 10px);
          transform: translateY(-50%);
        }

        .point {
          position: absolute;
          z-index: 10;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: #38bdf8;
          border: 2px solid #e0f2fe;
          box-shadow: 0 0 26px rgba(56,189,248,.9);
          animation: pointPop .45s ease both;
        }

        .point span {
          position: absolute;
          left: 21px;
          top: -12px;
          white-space: nowrap;
          color: white;
          font-size: 12px;
          font-weight: 950;
          text-shadow: 0 2px 10px rgba(0,0,0,.9);
        }

        .dx-line {
          position: absolute;
          z-index: 7;
          height: 5px;
          transform: translateY(-50%);
          background: #22c55e;
          border-radius: 999px;
          box-shadow: 0 0 24px rgba(34,197,94,.8);
          animation: drawHorizontal .7s ease both;
        }

        .dx-line span {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          color: #bbf7d0;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
          text-shadow: 0 2px 8px rgba(0,0,0,.9);
        }

        .dy-line {
          position: absolute;
          z-index: 7;
          width: 5px;
          transform: translateX(-50%);
          background: #f59e0b;
          border-radius: 999px;
          box-shadow: 0 0 24px rgba(245,158,11,.8);
          animation: drawVertical .7s ease both;
        }

        .dy-line span {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #fde68a;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
          text-shadow: 0 2px 8px rgba(0,0,0,.9);
        }

        .svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 6;
          pointer-events: none;
        }

        .hypotenuse {
          stroke: #818cf8;
          stroke-width: 5;
          stroke-linecap: round;
          filter: drop-shadow(0 0 12px rgba(129,140,248,.95));
          stroke-dasharray: 500;
          stroke-dashoffset: 500;
          animation: drawHyp .85s ease forwards;
        }

        .right-angle {
          position: absolute;
          z-index: 8;
          width: 18px;
          height: 18px;
          border-left: 3px solid white;
          border-bottom: 3px solid white;
          transform: translate(-2px, -16px);
          opacity: 0;
          animation: fadeIn .45s ease .35s forwards;
          filter: drop-shadow(0 0 10px rgba(255,255,255,.8));
        }

        @keyframes pointPop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(.45); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.28); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes drawHorizontal {
          from { width: 0; opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes drawVertical {
          from { height: 0; opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes drawHyp {
          to { stroke-dashoffset: 0; }
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </section>
  )
}
