'use client'

import { useState } from "react"
import { SUBJECT_COLORS } from "@/lib/subject-colors"
import { calculateFinalGrade } from "@/lib/grade-engine"

const initialData = {
  precalculo: [
    { name: "I1", weight: 0.15 },
    { name: "I2", weight: 0.15 },
    { name: "I3", weight: 0.15 },
    { name: "Examen", weight: 0.25 },
    { name: "Controles", weight: 0.07 },
  ],
  psicologia: [
    { name: "Perusall", weight: 0.3 },
    { name: "Pruebas", weight: 0.7 },
  ]
}

export default function CalendarView() {
  const [subject, setSubject] = useState("precalculo")
  const [data, setData] = useState(initialData)

  const evals = data[subject] || []

  const final = calculateFinalGrade(evals)

  function updateGrade(i, value) {
    const copy = {...data}
    copy[subject][i].grade = Number(value)
    setData(copy)
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>Calendario + Notas</h1>

      <select value={subject} onChange={e=>setSubject(e.target.value)}>
        {Object.keys(data).map(s => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <div style={{
        marginTop: 20,
        padding: 20,
        border: `1px solid ${SUBJECT_COLORS[subject]}55`,
        boxShadow: `0 0 30px ${SUBJECT_COLORS[subject]}33`
      }}>
        <h2>Promedio: {final.toFixed(2)}</h2>

        {evals.map((e, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <strong>{e.name}</strong>
            <input
              type="number"
              step="0.1"
              min="1"
              max="7"
              onChange={(ev)=>updateGrade(i, ev.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
