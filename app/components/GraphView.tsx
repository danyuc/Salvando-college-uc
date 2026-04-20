'use client'

import { useMemo, useState } from 'react'
import { buildGraphPoints } from '../../lib/graph-engine'

export default function GraphView() {
  const [expressionA, setExpressionA] = useState('x^2 - 4*x + 3')
  const [expressionB, setExpressionB] = useState('x + 1')
  const [showB, setShowB] = useState(true)
  const [scale, setScale] = useState(24)

  const pointsA = useMemo(() => buildGraphPoints(expressionA), [expressionA])
  const pointsB = useMemo(() => buildGraphPoints(expressionB), [expressionB])

  const width = 820
  const height = 420
  const centerX = width / 2
  const centerY = height / 2

  const pathA = pointsA
    .map((p, index) => {
      const x = centerX + p.x * scale
      const y = centerY - p.y * scale
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const pathB = pointsB
    .map((p, index) => {
      const x = centerX + p.x * scale
      const y = centerY - p.y * scale
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Gráficos interactivos</h2>
        <p style={subtitle}>
          Ideal para Precálculo: compara funciones, cambia escala y visualiza relaciones.
        </p>

        <div style={inputsGrid}>
          <input
            value={expressionA}
            onChange={(e) => setExpressionA(e.target.value)}
            style={input}
            placeholder="Función A"
          />

          <input
            value={expressionB}
            onChange={(e) => setExpressionB(e.target.value)}
            style={input}
            placeholder="Función B"
          />
        </div>

        <div style={controls}>
          <label style={label}>
            Escala: {scale}
            <input
              type="range"
              min="10"
              max="50"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              style={range}
            />
          </label>

          <label style={checkboxLabel}>
            <input
              type="checkbox"
              checked={showB}
              onChange={(e) => setShowB(e.target.checked)}
            />
            Mostrar función B
          </label>
        </div>

        <div style={legend}>
          <div style={legendItem}>
            <span style={{ ...legendDot, background: '#22c55e' }} />
            Función A
          </div>
          <div style={legendItem}>
            <span style={{ ...legendDot, background: '#f59e0b' }} />
            Función B
          </div>
        </div>

        <div style={graphWrapper}>
          <svg viewBox={`0 0 ${width} ${height}`} style={svgStyle}>
            <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#64748b" />
            <line x1={centerX} y1="0" x2={centerX} y2={height} stroke="#64748b" />

            <path d={pathA} fill="none" stroke="#22c55e" strokeWidth="2.5" />
            {showB && (
              <path d={pathB} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            )}
          </svg>
        </div>

        <div style={tipsBox}>
          <strong>Ideas de uso</strong>
          <div style={tipsText}>
            Compara crecimiento, cortes, traslaciones y comportamiento general de funciones.
          </div>
        </div>
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const title: React.CSSProperties = {
  marginTop: 0,
}

const subtitle: React.CSSProperties = {
  opacity: 0.75,
}

const inputsGrid: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
  gridTemplateColumns: '1fr 1fr',
  marginTop: '12px',
}

const input: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const controls: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: '14px',
}

const label: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
  fontSize: '0.92rem',
}

const range: React.CSSProperties = {
  width: '260px',
}

const checkboxLabel: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
}

const legend: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
  marginTop: '14px',
  flexWrap: 'wrap',
}

const legendItem: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
}

const legendDot: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '999px',
  display: 'inline-block',
}

const graphWrapper: React.CSSProperties = {
  marginTop: '16px',
  borderRadius: '14px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#0f172a',
}

const svgStyle: React.CSSProperties = {
  width: '100%',
  height: '420px',
  display: 'block',
}

const tipsBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(59,130,246,0.12)',
}

const tipsText: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.9,
}