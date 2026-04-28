'use client'

import { useMemo, useState, type CSSProperties } from 'react'

type Point = {
  x: number
  y: number
}

type Props = {
  a?: number
  b?: number
  c?: number
  width?: number
  height?: number
}

function parabolaY(a: number, b: number, c: number, x: number) {
  return a * x * x + b * x + c
}

export default function InteractiveGraphCanvas({
  a = -1,
  b = 0,
  c = 0,
  width = 620,
  height = 420,
}: Props) {
  const [points, setPoints] = useState<Point[]>([])
  const [showCurve, setShowCurve] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null)

  const xMin = -10
  const xMax = 10
  const yMin = -10
  const yMax = 10

  function toSvgX(x: number) {
    return ((x - xMin) / (xMax - xMin)) * width
  }

  function toSvgY(y: number) {
    return height - ((y - yMin) / (yMax - yMin)) * height
  }

  function fromSvgPoint(clientX: number, clientY: number, rect: DOMRect) {
    const px = clientX - rect.left
    const py = clientY - rect.top

    const x = xMin + (px / width) * (xMax - xMin)
    const y = yMax - (py / height) * (yMax - yMin)

    return {
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
    }
  }

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const point = fromSvgPoint(e.clientX, e.clientY, rect)

    setSelectedPoint(point)
    setPoints((prev) => [...prev, point])
  }

  const curvePath = useMemo(() => {
    const samples: string[] = []

    for (let x = xMin; x <= xMax; x += 0.25) {
      const y = parabolaY(a, b, c, x)
      const sx = toSvgX(x)
      const sy = toSvgY(y)

      if (samples.length === 0) {
        samples.push(`M ${sx} ${sy}`)
      } else {
        samples.push(`L ${sx} ${sy}`)
      }
    }

    return samples.join(' ')
  }, [a, b, c])

  const vertex = useMemo(() => {
    if (a === 0) return null

    const vx = -b / (2 * a)
    const vy = parabolaY(a, b, c, vx)

    return {
      x: Number(vx.toFixed(2)),
      y: Number(vy.toFixed(2)),
    }
  }, [a, b, c])

  function clear() {
    setPoints([])
    setSelectedPoint(null)
    setShowCurve(false)
  }

  return (
    <div style={box}>
      <div style={header}>
        <div>
          <h3 style={title}>Gráfico interactivo</h3>
          <p style={muted}>
            Marca puntos en el plano. Luego muestra la parábola para comparar tu intuición.
          </p>
        </div>

        <div style={actions}>
          <button type="button" style={button} onClick={() => setShowCurve(true)}>
            Mostrar parábola
          </button>
          <button type="button" style={ghostButton} onClick={clear}>
            Limpiar
          </button>
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={svg}
        onClick={handleClick}
      >
        <rect x="0" y="0" width={width} height={height} rx="18" fill="#020617" />

        {Array.from({ length: 21 }).map((_, i) => {
          const value = i - 10
          const x = toSvgX(value)
          const y = toSvgY(value)

          return (
            <g key={value}>
              <line x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.06)" />
              <line x1={0} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.06)" />
            </g>
          )
        })}

        <line x1={0} y1={toSvgY(0)} x2={width} y2={toSvgY(0)} stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
        <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={height} stroke="rgba(255,255,255,0.45)" strokeWidth="2" />

        {showCurve && (
          <path
            d={curvePath}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {vertex && showCurve && (
          <g>
            <circle cx={toSvgX(vertex.x)} cy={toSvgY(vertex.y)} r="7" fill="#facc15" />
            <text
              x={toSvgX(vertex.x) + 10}
              y={toSvgY(vertex.y) - 10}
              fill="#fde68a"
              fontSize="14"
              fontWeight="700"
            >
              V({vertex.x}, {vertex.y})
            </text>
          </g>
        )}

        {points.map((point, index) => (
          <g key={`${point.x}-${point.y}-${index}`}>
            <circle cx={toSvgX(point.x)} cy={toSvgY(point.y)} r="6" fill="#22c55e" />
            <text
              x={toSvgX(point.x) + 8}
              y={toSvgY(point.y) - 8}
              fill="#bbf7d0"
              fontSize="13"
              fontWeight="700"
            >
              ({point.x}, {point.y})
            </text>
          </g>
        ))}
      </svg>

      <div style={infoGrid}>
        <div style={infoCard}>
          <span style={label}>Función</span>
          <strong>y = {a}x² + {b}x + {c}</strong>
        </div>

        <div style={infoCard}>
          <span style={label}>Vértice</span>
          <strong>
            {vertex ? `(${vertex.x}, ${vertex.y})` : '—'}
          </strong>
        </div>

        <div style={infoCard}>
          <span style={label}>Último punto marcado</span>
          <strong>
            {selectedPoint ? `(${selectedPoint.x}, ${selectedPoint.y})` : '—'}
          </strong>
        </div>
      </div>
    </div>
  )
}

const box: CSSProperties = {
  display: 'grid',
  gap: 14,
  padding: 16,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const header: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 14,
  alignItems: 'flex-start',
}

const title: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 950,
}

const muted: CSSProperties = {
  margin: '5px 0 0',
  opacity: 0.7,
  lineHeight: 1.4,
}

const actions: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
}

const button: CSSProperties = {
  padding: '10px 13px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const ghostButton: CSSProperties = {
  padding: '10px 13px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const svg: CSSProperties = {
  width: '100%',
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.10)',
  cursor: 'crosshair',
}

const infoGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 10,
}

const infoCard: CSSProperties = {
  display: 'grid',
  gap: 4,
  padding: 12,
  borderRadius: 14,
  background: 'rgba(0,0,0,0.24)',
}

const label: CSSProperties = {
  fontSize: 12,
  opacity: 0.65,
}
