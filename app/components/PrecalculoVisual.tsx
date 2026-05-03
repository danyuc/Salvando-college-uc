'use client'

type Point = {
  etiqueta: string
  x: number
  y: number
}

export default function PrecalculoVisual({ puntos = [] }: { puntos?: Point[] }) {
  if (!Array.isArray(puntos) || puntos.length === 0) return null

  return (
    <section style={{ marginTop: 16, padding: 16, borderRadius: 18, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
      <h3 style={{ margin: 0, marginBottom: 10 }}>Visualización matemática</h3>

      <div style={{
        height: 260,
        borderRadius: 14,
        background:
          'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, background: 'rgba(255,255,255,0.55)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: 'rgba(255,255,255,0.55)' }} />

        <span style={{ position: 'absolute', right: 12, top: 'calc(50% + 6px)', fontWeight: 700 }}>x</span>
        <span style={{ position: 'absolute', left: 'calc(50% + 8px)', top: 8, fontWeight: 700 }}>y</span>
        <span style={{ position: 'absolute', left: 'calc(50% + 6px)', top: 'calc(50% + 6px)', fontSize: 12, opacity: 0.8 }}>0</span>

        {puntos.map((p) => (
          <div
            key={`${p.etiqueta}-${p.x}-${p.y}`}
            title={`${p.etiqueta}(${p.x}, ${p.y})`}
            style={{
              position: 'absolute',
              left: `${Math.max(5, Math.min(95, 50 + p.x * 4))}%`,
              top: `${Math.max(5, Math.min(95, 50 - p.y * 4))}%`,
              transform: 'translate(-50%, -50%)',
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#38bdf8',
              boxShadow: '0 0 18px rgba(56,189,248,.75)',
            }}
          >
            <span style={{ position: 'absolute', left: 18, top: -8, fontSize: 13, fontWeight: 700, color: 'white' }}>
              {p.etiqueta}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
