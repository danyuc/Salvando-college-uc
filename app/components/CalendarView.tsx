'use client'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  ACADEMIC_EVENTS,
  SUBJECT_THEMES,
  type AcademicEvent,
  type SubjectCode,
  daysUntil,
  getRisk,
} from "@/lib/academic-calendar-data"

const subjectCodes = Object.keys(SUBJECT_THEMES) as SubjectCode[]

function storageKey(id: string) {
  return `grade-${id}`
}

function clampGrade(value: number) {
  if (Number.isNaN(value)) return 0
  return Math.max(1, Math.min(7, value))
}

function formatDate(date: string) {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  })
}

function calculateSubject(events: AcademicEvent[], grades: Record<string, number>) {
  const totalWeight = events.reduce((acc, e) => acc + e.weight, 0)
  const completed = events.filter(e => grades[e.id])
  const completedWeight = completed.reduce((acc, e) => acc + e.weight, 0)
  const earned = completed.reduce((acc, e) => acc + clampGrade(grades[e.id]) * e.weight, 0)
  const projected = completedWeight > 0 ? earned / completedWeight : null
  const remainingWeight = Math.max(0, totalWeight - completedWeight)
  const neededFor4 = remainingWeight > 0 ? (4 * totalWeight - earned) / remainingWeight : null

  return {
    totalWeight,
    completedWeight,
    remainingWeight,
    projected,
    neededFor4,
  }
}

function eventInputLabel(event: AcademicEvent) {
  if (event.type === "perusall") return "Puntos 0-5"
  return "Nota 1-7"
}

export default function CalendarView() {
  const [selected, setSelected] = useState<SubjectCode | "FECHAS">("FECHAS")
  const [grades, setGrades] = useState<Record<string, number>>({})

  useEffect(() => {
    const next: Record<string, number> = {}
    for (const event of ACADEMIC_EVENTS) {
      const raw = localStorage.getItem(storageKey(event.id))
      if (raw) next[event.id] = Number(raw)
    }
    setGrades(next)
  }, [])

  function saveGrade(event: AcademicEvent, value: number) {
    const finalValue =
      event.type === "perusall"
        ? Math.max(0, Math.min(5, value))
        : clampGrade(value)

    const next = { ...grades, [event.id]: finalValue }
    setGrades(next)
    localStorage.setItem(storageKey(event.id), String(finalValue))
  }

  function clearGrade(event: AcademicEvent) {
    const next = { ...grades }
    delete next[event.id]
    setGrades(next)
    localStorage.removeItem(storageKey(event.id))
  }

  const visibleEvents = useMemo(() => {
    return ACADEMIC_EVENTS
      .filter(e => selected === "FECHAS" || e.subjectCode === selected)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [selected])

  const selectedEvents = selected === "FECHAS"
    ? ACADEMIC_EVENTS
    : ACADEMIC_EVENTS.filter(e => e.subjectCode === selected)

  const subjectStats = selected === "FECHAS"
    ? null
    : calculateSubject(selectedEvents, grades)

  return (
    <main className="page">
      <section className="shell">
        <section className="hero">
          <div>
            <p className="eyebrow">Calendario / Notas UC</p>
            <h1>Panel académico inteligente</h1>
            <p>
              Filtra por ramo, registra notas, controla ponderaciones reales y entra directo a práctica.
            </p>
          </div>
        </section>

        <section className="tabs">
          <button
            className={selected === "FECHAS" ? "tab active dates" : "tab dates"}
            onClick={() => setSelected("FECHAS")}
          >
            <span>📅</span>
            <strong>Fechas</strong>
            <small>Vista general</small>
          </button>

          {subjectCodes.map(code => {
            const t = SUBJECT_THEMES[code]
            return (
              <button
                key={code}
                className={selected === code ? "tab active" : "tab"}
                style={{ "--c": t.color, "--a": t.accent, "--g": t.gradient } as any}
                onClick={() => setSelected(code)}
              >
                <span>{t.icon}</span>
                <strong>{t.name}</strong>
                <small>{t.short}</small>
              </button>
            )
          })}
        </section>

        {selected !== "FECHAS" && subjectStats && (
          <section
            className="summary"
            style={{
              "--c": SUBJECT_THEMES[selected].color,
              "--a": SUBJECT_THEMES[selected].accent,
              "--g": SUBJECT_THEMES[selected].gradient,
            } as any}
          >
            <div>
              <p className="eyebrow">{SUBJECT_THEMES[selected].short}</p>
              <h2>{SUBJECT_THEMES[selected].icon} {SUBJECT_THEMES[selected].name}</h2>
              <span>
                {subjectStats.completedWeight.toFixed(1)}% rendido · {subjectStats.remainingWeight.toFixed(1)}% restante
              </span>
            </div>

            <div className="summary-grid">
              <div>
                <small>Promedio registrado</small>
                <strong>{subjectStats.projected ? subjectStats.projected.toFixed(2) : "—"}</strong>
              </div>
              <div>
                <small>Necesitas para 4.0</small>
                <strong>
                  {subjectStats.neededFor4 === null
                    ? "—"
                    : Math.max(1, Math.min(7, subjectStats.neededFor4)).toFixed(2)}
                </strong>
              </div>
              <div>
                <small>Peso total</small>
                <strong>{subjectStats.totalWeight.toFixed(0)}%</strong>
              </div>
            </div>
          </section>
        )}

        <section className={selected === "FECHAS" ? "content dates-layout" : "content"}>
          <section className="events">
            {visibleEvents.map(event => {
              const theme = SUBJECT_THEMES[event.subjectCode]
              const risk = getRisk(event)
              const days = daysUntil(event.date)
              const gradeValue = grades[event.id] ?? ""

              return (
                <article
                  className={`event ${risk}`}
                  key={event.id}
                  style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}
                >
                  <div className="event-main">
                    <div className="icon">{theme.icon}</div>
                    <div>
                      <p>{theme.short} · {theme.name}</p>
                      <h3>{event.title}</h3>
                      <span>{event.unit}</span>
                    </div>
                  </div>

                  <div className="event-side">
                    <strong>{formatDate(event.date)}</strong>
                    <span>{event.time || "Sin hora"}</span>
                    <b>{event.weight}%</b>
                  </div>

                  {selected !== "FECHAS" && (
                    <div className="grade-box">
                      <input
                        type="number"
                        min={event.type === "perusall" ? 0 : 1}
                        max={event.type === "perusall" ? 5 : 7}
                        step={event.type === "perusall" ? 0.5 : 0.1}
                        placeholder={eventInputLabel(event)}
                        value={gradeValue}
                        onChange={(e) => saveGrade(event, Number(e.target.value))}
                      />
                      <button onClick={() => clearGrade(event)}>Limpiar</button>
                    </div>
                  )}

                  <div className="actions">
                    <span className="risk">{days < 0 ? "pasada" : days === 0 ? "hoy" : `${days} días`}</span>

                    {event.subjectCode === "MAT1000" && event.practiceEvaluation && (
                      <>
                        {event.requiresDiagnostic && (
                          <Link href={`/diagnostico?evaluation=${event.practiceEvaluation}`}>
                            Diagnóstico
                          </Link>
                        )}
                        <Link href={`/practica?subject=MAT1000&evaluation=${event.practiceEvaluation}&mode=practica`}>
                          Practicar
                        </Link>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </section>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 26px;
          color: white;
          background:
            radial-gradient(circle at 18% 0%, rgba(37,99,235,.32), transparent 34%),
            radial-gradient(circle at 92% 8%, rgba(168,85,247,.24), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .shell {
          max-width: 1220px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .hero,
        .summary,
        .event {
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 24px 70px rgba(0,0,0,.28);
          backdrop-filter: blur(18px);
        }

        .hero {
          padding: 28px;
          border-radius: 32px;
          background: linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.04));
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        h1 {
          font-size: clamp(34px,5vw,56px);
          margin: 8px 0;
          letter-spacing: -.055em;
        }

        .hero p:last-child {
          color: #cbd5e1;
          font-size: 17px;
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(145px,1fr));
          gap: 12px;
        }

        .tab {
          min-height: 82px;
          display: grid;
          gap: 3px;
          justify-items: start;
          padding: 14px;
          border-radius: 23px;
          border: 1px solid rgba(255,255,255,.12);
          color: white;
          background: rgba(255,255,255,.055);
          cursor: pointer;
          transition: .18s ease;
        }

        .tab:hover {
          transform: translateY(-2px);
          border-color: var(--c);
        }

        .tab.active {
          background: var(--g);
          border-color: var(--c);
          box-shadow: 0 0 0 1px var(--c), 0 22px 55px rgba(0,0,0,.25);
        }

        .tab.dates.active {
          background: linear-gradient(135deg,rgba(59,130,246,.32),rgba(99,102,241,.15));
          border-color: #60a5fa;
        }

        .tab span {
          font-size: 22px;
        }

        .tab small {
          color: #cbd5e1;
          font-weight: 800;
        }

        .summary {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          padding: 22px;
          border-radius: 28px;
          background: var(--g);
          border-color: var(--c);
        }

        .summary h2 {
          margin: 6px 0;
          font-size: 30px;
        }

        .summary span {
          color: #e2e8f0;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
        }

        .summary-grid div {
          min-width: 130px;
          padding: 14px;
          border-radius: 20px;
          background: rgba(15,23,42,.56);
          border: 1px solid rgba(255,255,255,.11);
        }

        .summary-grid small {
          color: #cbd5e1;
          display: block;
          margin-bottom: 6px;
        }

        .summary-grid strong {
          font-size: 25px;
        }

        .events {
          display: grid;
          gap: 12px;
        }

        .event {
          display: grid;
          grid-template-columns: 1.45fr .45fr .65fr .65fr;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border-radius: 25px;
          background:
            linear-gradient(135deg, var(--a), rgba(15,23,42,.78));
          border-color: color-mix(in srgb, var(--c) 65%, transparent);
        }

        .event-main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .icon {
          width: 50px;
          height: 50px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: rgba(15,23,42,.55);
          border: 1px solid rgba(255,255,255,.12);
          font-size: 23px;
        }

        .event-main p {
          margin: 0;
          color: #dbeafe;
          font-weight: 900;
        }

        .event-main h3 {
          margin: 4px 0;
          font-size: 21px;
        }

        .event-main span,
        .event-side span {
          color: #cbd5e1;
          font-size: 13px;
        }

        .event-side {
          display: grid;
          gap: 3px;
        }

        .event-side b {
          color: var(--c);
          font-size: 22px;
        }

        .grade-box {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
        }

        input {
          min-height: 44px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.64);
          color: white;
          font-weight: 900;
          padding: 0 12px;
          width: 100%;
        }

        button,
        .actions a,
        .risk {
          min-height: 38px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.58);
          color: white;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 7px;
        }

        .event.alto {
          outline: 2px solid rgba(239,68,68,.48);
        }

        .event.urgente {
          outline: 2px solid rgba(245,158,11,.46);
        }

        @media(max-width: 980px) {
          .summary {
            flex-direction: column;
            align-items: stretch;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .event {
            grid-template-columns: 1fr;
          }

          .actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </main>
  )
}
