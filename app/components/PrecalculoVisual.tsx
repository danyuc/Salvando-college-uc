'use client'

import { useState } from 'react'

type Point = {
  etiqueta: string
  x: number
  y: number
}

export default function PrecalculoVisual({ puntos = [] }: { puntos?: Point[] }) {
  const [zoom, setZoom] = useState(1)

  if (!Array.isArray(puntos) || puntos.length === 0) return null

  const axis = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]
  const scale = 6 / zoom

  function left(x: number) {
    return `${50 + (x / scale) * 42}%`
  }

  function top(y: number) {
    return `${50 - (y / scale) * 42}%`
  }

  return (
    <section className="visual-card">
      <div className="visual-head">
        <div>
          <strong>Plano cartesiano</strong>
          <p>Visualización estilo Desmos con ejes y puntos reales.</p>
        </div>

        <div className="zoom">
          <button onClick={() => setZoom(z => Math.max(0.7, Number((z - 0.2).toFixed(1))))}>−</button>
          <span>{zoom.toFixed(1)}x</span>
          <button onClick={() => setZoom(z => Math.min(1.8, Number((z + 0.2).toFixed(1))))}>+</button>
        </div>
      </div>

      <div className="plane">
        <div className="axis x-axis" />
        <div className="axis y-axis" />
        <span className="axis-name x-name">x</span>
        <span className="axis-name y-name">y</span>
        <span className="origin">0</span>

        {axis.map(n => (
          <span key={`x-${n}`} className="tick-label x-label" style={{ left: left(n) }}>{n}</span>
        ))}

        {axis.map(n => (
          <span key={`y-${n}`} className="tick-label y-label" style={{ top: top(n) }}>{n}</span>
        ))}

        {puntos.map(p => (
          <div key={`${p.etiqueta}-${p.x}-${p.y}`} className="point" style={{ left: left(p.x), top: top(p.y) }}>
            <span>{p.etiqueta}({p.x}, {p.y})</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .visual-card {
          margin-top: 16px;
          padding: 16px;
          border-radius: 24px;
          background:
            radial-gradient(circle at top left, rgba(14,165,233,.22), transparent 38%),
            rgba(15,23,42,.72);
          border: 1px solid rgba(255,255,255,.12);
        }

        .visual-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          margin-bottom: 12px;
        }

        .visual-head p {
          margin: 4px 0 0;
          color: #cbd5e1;
          font-size: 13px;
        }

        .zoom {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .zoom button {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 900;
        }

        .zoom span {
          color: #bfdbfe;
          font-weight: 900;
        }

        .plane {
          position: relative;
          height: 310px;
          overflow: hidden;
          border-radius: 20px;
          background:
            linear-gradient(rgba(148,163,184,.13) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.13) 1px, transparent 1px),
            radial-gradient(circle at center, rgba(59,130,246,.14), transparent 58%);
          background-size: 28px 28px, 28px 28px, 100% 100%;
          border: 1px solid rgba(255,255,255,.12);
        }

        .axis {
          position: absolute;
          background: rgba(248,250,252,.75);
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
        .tick-label {
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

        .x-label {
          top: calc(50% + 10px);
          transform: translateX(-50%);
        }

        .y-label {
          left: calc(50% + 10px);
          transform: translateY(-50%);
        }

        .point {
          position: absolute;
          z-index: 5;
          width: 15px;
          height: 15px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
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
          text-shadow: 0 2px 10px rgba(0,0,0,.9);
        }
      `}</style>
    </section>
  )
}
