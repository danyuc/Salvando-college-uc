'use client'

type Point = {
  etiqueta: string
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export default function PrecalculoVisual({ puntos = [] }: { puntos?: Point[] }) {
  if (!Array.isArray(puntos) || puntos.length === 0) return null

  const ticks = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]
  const scale = 6

  function toLeft(x: number) {
    return `${clamp(50 + (x / scale) * 42, 4, 96)}%`
  }

  function toTop(y: number) {
    return `${clamp(50 - (y / scale) * 42, 4, 96)}%`
  }

  return (
    <section className="precalculo-visual-card">
      <div className="precalculo-visual-title">Visualización matemática</div>

      <div className="precalculo-plane">
        <div className="axis axis-x" />
        <div className="axis axis-y" />

        <span className="axis-label axis-label-x">x</span>
        <span className="axis-label axis-label-y">y</span>
        <span className="origin-label">0</span>

        {ticks.map((n) => (
          <span
            key={`x-${n}`}
            className="tick-label tick-label-x"
            style={{ left: toLeft(n) }}
          >
            {n}
          </span>
        ))}

        {ticks.map((n) => (
          <span
            key={`y-${n}`}
            className="tick-label tick-label-y"
            style={{ top: toTop(n) }}
          >
            {n}
          </span>
        ))}

        {ticks.map((n) => (
          <span
            key={`tx-${n}`}
            className="tick tick-x"
            style={{ left: toLeft(n) }}
          />
        ))}

        {ticks.map((n) => (
          <span
            key={`ty-${n}`}
            className="tick tick-y"
            style={{ top: toTop(n) }}
          />
        ))}

        {puntos.map((p) => (
          <div
            key={`${p.etiqueta}-${p.x}-${p.y}`}
            className="point"
            title={`${p.etiqueta}(${p.x}, ${p.y})`}
            style={{
              left: toLeft(p.x),
              top: toTop(p.y),
            }}
          >
            <span>{p.etiqueta}({p.x}, {p.y})</span>
          </div>
        ))}
      </div>
    </section>
  )
}
