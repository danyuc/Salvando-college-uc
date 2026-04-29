'use client'

import { useState } from 'react'

export default function ControlTracker({
  subject,
  onSave,
}: {
  subject: string
  onSave: (data: any) => void
}) {
  const [grades, setGrades] = useState<number[]>(Array(7).fill(0))

  function updateGrade(i: number, value: number) {
    const copy = [...grades]
    copy[i] = value
    setGrades(copy)
  }

  function handleSave() {
    const valid = grades.filter((g) => g > 0)

    // 🔥 cada control vale 1%
    const avg =
      valid.reduce((a, b) => a + b, 0) / (valid.length || 1)

    onSave({
      subject,
      type: 'control',
      title: 'Controles acumulados',
      grade: avg,
      weight_percent: valid.length * 1, // 1% cada uno
    })
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Control Tracker (Precálculo)</h3>

      {grades.map((g, i) => (
        <div key={i}>
          Control {i + 1}:
          <input
            type="number"
            step="0.1"
            value={g || ''}
            onChange={(e) =>
              updateGrade(i, Number(e.target.value))
            }
          />
        </div>
      ))}

      <button onClick={handleSave}>
        Guardar controles
      </button>
    </div>
  )
}
