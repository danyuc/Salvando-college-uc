'use client'


import { useEffect, useMemo, useState } from "react"
import { ACADEMIC_EVENTS, SUBJECT_THEMES } from "@/lib/academic-calendar-data"

const controls = ACADEMIC_EVENTS.filter(e => e.subjectCode === "MAT1000" && e.type === "control")

export default function ControlTracker() {
  const [grades, setGrades] = useState<Record<string, number>>({})

  useEffect(() => {
    const raw = localStorage.getItem("mat1000-control-grades")
    if (raw) setGrades(JSON.parse(raw))
  }, [])

  function save(id: string, value: number) {
    const next = { ...grades, [id]: Math.max(1, Math.min(7, value)) }
    setGrades(next)
    localStorage.setItem("mat1000-control-grades", JSON.stringify(next))
  }

  const earned = useMemo(() => {
    return controls.reduce((acc, c) => acc + (grades[c.id] ? c.weight : 0), 0)
  }, [grades])

  return (
    <section className="tracker">
      <div>
        <p>MAT1000 · Controles online</p>
        <h2>{earned.toFixed(0)}% / 7%</h2>
        <span>Cada control vale 1% individual. No es promedio.</span>
      </div>

      <div className="grid">
        {controls.map(c => (
          <div className="control" key={c.id}>
            <strong>{c.title}</strong>
            <span>{c.unit} · {c.date}</span>
            <input
              type="number"
              min={1}
              max={7}
              step={0.1}
              value={grades[c.id] ?? ""}
              placeholder="Nota"
              onChange={(e) => save(c.id, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .tracker {
          border-radius:26px;
          padding:20px;
          color:white;
          background:${SUBJECT_THEMES.MAT1000.gradient};
          border:1px solid rgba(255,255,255,.16);
        }
        p { margin:0; color:#bbf7d0; font-weight:900; }
        h2 { margin:6px 0; font-size:38px; }
        span { color:#dcfce7; font-size:13px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px; margin-top:16px; }
        .control { padding:12px; border-radius:18px; background:rgba(15,23,42,.55); border:1px solid rgba(255,255,255,.11); }
        .control span { display:block; color:#cbd5e1; margin:6px 0; }
        input { width:100%; min-height:40px; border-radius:13px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.08); color:white; font-weight:900; padding:0 10px; }
      `}</style>
    </section>
  )
}
