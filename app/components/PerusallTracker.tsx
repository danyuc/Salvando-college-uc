'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Props = {
  onGradeChange?: (grade: number) => void
}

const STORAGE_KEY = 'salvando_uc_perusall_psi1101_scores'

function parseScore(value: string) {
  const n = Number(value.trim().replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function calculatePerusallGrade(points: number) {
  return Math.min(7, Math.max(1, 1 + (Math.min(points, 40) / 40) * 6))
}

export default function PerusallTracker({ onGradeChange }: Props) {
  const [scores, setScores] = useState<number[]>([])
  const [input, setInput] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setScores(
          parsed
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value >= 0 && value <= 5)
        )
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  }, [scores])

  const totalPoints = useMemo(() => {
    const sorted = [...scores].sort((a, b) => b - a)
    return sorted.slice(0, 8).reduce((acc, value) => acc + value, 0)
  }, [scores])

  const finalGrade = useMemo(() => {
    if (scores.length === 0) return null
    return calculatePerusallGrade(totalPoints)
  }, [scores.length, totalPoints])

  useEffect(() => {
    if (finalGrade !== null) {
      onGradeChange?.(Number(finalGrade.toFixed(2)))
    }
  }, [finalGrade, onGradeChange])

  function addScore() {
    const value = parseScore(input)

    if (value === null || value < 0 || value > 5) {
      alert('Cada lectura debe estar entre 0 y 5 puntos. Puedes usar 4.5 o 4,5.')
      return
    }

    setScores((prev) => [...prev, Number(value.toFixed(2))])
    setInput('')
  }

  function removeScore(index: number) {
    setScores((prev) => prev.filter((_, i) => i !== index))
  }

  function clearScores() {
    if (!confirm('¿Borrar todos los puntajes de Perusall?')) return
    setScores([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div style={box}>
      <div style={header}>
        <div>
          <h3 style={title}>Perusall Tracker</h3>
          <p style={muted}>Suma tus mejores 8 lecturas. 40 puntos = 7.0</p>
        </div>

        {scores.length > 0 && (
          <button type="button" onClick={clearScores} style={ghostBtn}>
            Limpiar
          </button>
        )}
      </div>

      <div style={row}>
        <input
          style={inputStyle}
          placeholder="Puntaje 0-5"
          value={input}
          inputMode="decimal"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addScore()
          }}
        />

        <button type="button" style={btn} onClick={addScore}>
          Agregar
        </button>
      </div>

      <div style={scoresBox}>
        {scores.length === 0 && <span style={muted}>Sin lecturas aún</span>}

        {scores.map((score, index) => (
          <div key={`${score}-${index}`} style={scoreItem}>
            <span>{score}</span>
            <button type="button" onClick={() => removeScore(index)} style={removeBtn}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={metrics}>
        <div style={metric}>
          <span style={label}>Puntos válidos</span>
          <strong>{totalPoints.toFixed(1)} / 40</strong>
        </div>

        <div style={metric}>
          <span style={label}>Nota Perusall</span>
          <strong>{finalGrade === null ? '—' : finalGrade.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  )
}

const box: CSSProperties = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  background: 'rgba(0,0,0,0.25)',
}

const header: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  marginBottom: 10,
}

const title: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
}

const row: CSSProperties = {
  display: 'flex',
  gap: 8,
}

const inputStyle: CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#0f172a',
  color: 'white',
}

const btn: CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 800,
}

const ghostBtn: CSSProperties = {
  padding: '7px 10px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 800,
}

const scoresBox: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
}

const scoreItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 8px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.08)',
}

const removeBtn: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#f87171',
  cursor: 'pointer',
}

const metrics: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 12,
  gap: 10,
}

const metric: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
}

const label: CSSProperties = {
  fontSize: 11,
  opacity: 0.7,
}

const muted: CSSProperties = {
  margin: 0,
  opacity: 0.65,
  fontSize: 12,
}
