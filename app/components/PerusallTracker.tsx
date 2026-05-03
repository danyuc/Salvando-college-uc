'use client'

import { useEffect, useMemo, useState } from "react"
import { ACADEMIC_EVENTS, SUBJECT_THEMES } from "@/lib/academic-calendar-data"

const perusalls = ACADEMIC_EVENTS.filter(e => e.type === "perusall")

export default function PerusallTracker({ onGradeChange }: { onGradeChange?: (grade: number) => void | Promise<void> }) {
  const [scores, setScores] = useState<Record<string, number>>({})

  useEffect(() => {
    const raw = localStorage.getItem("perusall-scores")
    if (raw) setScores(JSON.parse(raw))
  }, [])

  function save(id: string, value: number) {
    const next = { ...scores, [id]: Math.max(0, Math.min(5, value)) }
    setScores(next)
    localStorage.setItem("perusall-scores", JSON.stringify(next))
  }

  const total = useMemo(() => Object.values(scores).reduce((a, b) => a + Number(b || 0), 0), [scores])
  const valid = Math.min(total, 40)
  const grade = Math.min(7, 1 + (valid / 40) * 6)

  useEffect(() => {
    onGradeChange?.(Number(grade.toFixed(2)))
  }, [grade, onGradeChange])

  return (
    <section className="tracker">
      <div className="head">
        <div>
          <p>PSI1101 · Perusall Tracker</p>
          <h2>{grade.toFixed(2)}</h2>
          <span>{valid.toFixed(1)}/40 puntos válidos · 30% del ramo</span>
        </div>
      </div>

      <div className="list">
        {perusalls.map(e => (
          <div className="row" key={e.id}>
            <div>
              <strong>{e.title}</strong>
              <span>{e.date} · {e.unit}</span>
            </div>
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={scores[e.id] ?? ""}
              placeholder="0-5"
              onChange={(ev) => save(e.id, Number(ev.target.value))}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .tracker {
          border-radius: 26px;
          padding: 20px;
          background: ${SUBJECT_THEMES.PSI1101.gradient};
          border: 1px solid rgba(255,255,255,.16);
          color: white;
        }
        .head p { margin:0; color:#e9d5ff; font-weight:900; }
        h2 { margin:6px 0; font-size:42px; }
        .head span { color:#ddd6fe; }
        .list { display:grid; gap:10px; margin-top:16px; }
        .row {
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:center;
          padding:12px;
          border-radius:18px;
          background:rgba(15,23,42,.55);
          border:1px solid rgba(255,255,255,.11);
        }
        .row span { display:block; color:#cbd5e1; font-size:12px; margin-top:4px; }
        input {
          width:82px;
          min-height:42px;
          border-radius:14px;
          border:1px solid rgba(255,255,255,.16);
          background:rgba(255,255,255,.08);
          color:white;
          font-weight:900;
          text-align:center;
        }
      `}</style>
    </section>
  )
}
