'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  onGradeChange?: (grade: number) => void
}

export default function PerusallTracker({ onGradeChange }: Props) {
  const [scores, setScores] = useState<number[]>([])
  const [input, setInput] = useState('')

  // total acumulado (máx 40)
  const totalPoints = useMemo(() => {
    const sorted = [...scores].sort((a, b) => b - a)
    return sorted.slice(0, 8).reduce((acc, v) => acc + v, 0)
  }, [scores])

  // conversión a nota 1-7
  const finalGrade = useMemo(() => {
    return Math.min(7, (totalPoints / 40) * 7)
  }, [totalPoints])

  useEffect(() => {
    if (onGradeChange) {
      onGradeChange(Number(finalGrade.toFixed(2)))
    }
  }, [finalGrade, onGradeChange])

  function addScore() {
    const value = Number(input)

    if (!Number.isFinite(value) || value < 0 || value > 5) {
      alert('Cada lectura debe estar entre 0 y 5 puntos')
      return
    }

    setScores((prev) => [...prev, value])
    setInput('')
  }

  function removeScore(index: number) {
    setScores((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div style={box}>
      <h3 style={title}>Perusall Tracker</h3>

      <div style={row}>
        <input
          style={inputStyle}
          placeholder="Puntaje (0-5)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button style={btn} onClick={addScore}>
          Agregar
        </button>
      </div>

      <div style={scoresBox}>
        {scores.length === 0 && <span style={muted}>Sin lecturas aún</span>}

        {scores.map((s, i) => (
          <div key={i} style={scoreItem}>
            <span>{s}</span>
            <button onClick={() => removeScore(i)} style={removeBtn}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={metrics}>
        <div style={metric}>
          <span style={label}>Top 8 sumados</span>
          <strong>{totalPoints} / 40</strong>
        </div>

        <div style={metric}>
          <span style={label}>Nota final</span>
          <strong>{finalGrade.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  )
}

/* ---------------- STYLES ---------------- */

const box: React.CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  background: 'rgba(0,0,0,0.25)',
}

const title: React.CSSProperties = {
  margin: '0 0 10px',
  fontSize: 16,
  fontWeight: 800,
}

const row: React.CSSProperties = {
  display: 'flex',
  gap: 8,
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#0f172a',
  color: 'white',
}

const btn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const scoresBox: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
}

const scoreItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 8px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.08)',
}

const removeBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#f87171',
  cursor: 'pointer',
}

const metrics: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 12,
}

const metric: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const label: React.CSSProperties = {
  fontSize: 11,
  opacity: 0.7,
}

const muted: React.CSSProperties = {
  opacity: 0.6,
}
