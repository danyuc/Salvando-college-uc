'use client'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { loadUserGrades, saveUserGrade, deleteUserGrade } from "@/lib/user-grades"
import {
  ACADEMIC_EVENTS,
  SUBJECT_THEMES,
  type AcademicEvent,
  type SubjectCode,
  daysUntil,
  getRisk,
} from "@/lib/academic-calendar-data"

const subjects = Object.keys(SUBJECT_THEMES) as SubjectCode[]

type GradeRecord = {
  value: number
  savedAt: string
}

type GradeMap = Record<string, GradeRecord>

function storageKey(id: string) {
  return `calendar-grade-${id}`
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

function eventGradeToSeven(event: AcademicEvent, raw: number) {
  if (event.type === "perusall") return 1 + (clamp(raw, 0, 5) / 5) * 6
  return clamp(raw, 1, 7)
}

function calculate(events: AcademicEvent[], grades: GradeMap) {
  const subject = events[0]?.subjectCode
  const totalWeight = 100

  let earnedWeighted = 0
  let completedWeight = 0

  function addBlock(grade: number | null, weight: number) {
    if (grade === null) return
    earnedWeighted += grade * weight
    completedWeight += weight
  }

  if (subject === "PSI1101") {
    for (const event of events.filter(e => e.type !== "perusall")) {
      const record = grades[event.id]
      if (record) addBlock(eventGradeToSeven(event, record.value), event.weight)
    }

    const perusalls = events.filter(e => e.type === "perusall")
    const points = perusalls.reduce((acc, e) => acc + (grades[e.id]?.value ?? 0), 0)
    const hasAny = perusalls.some(e => grades[e.id])
    if (hasAny) {
      const validPoints = Math.min(points, 40)
      const grade = 1 + (validPoints / 40) * 6
      addBlock(grade, 30)
    }
  } else if (subject === "CLG0000") {
    for (const event of events.filter(e => !e.id.startsWith("clg-act-"))) {
      const record = grades[event.id]
      if (record) addBlock(eventGradeToSeven(event, record.value), event.weight)
    }

    const activities = events
      .filter(e => e.id.startsWith("clg-act-"))
      .map(e => grades[e.id]?.value)
      .filter((v): v is number => typeof v === "number")
      .sort((a, b) => b - a)
      .slice(0, 4)

    if (activities.length > 0) {
      const avg = activities.reduce((a, b) => a + b, 0) / activities.length
      addBlock(avg, 20)
    }
  } else {
    for (const event of events) {
      const record = grades[event.id]
      if (!record || event.weight <= 0) continue
      addBlock(eventGradeToSeven(event, record.value), event.weight)
    }
  }

  const pendingWeight = Math.max(0, totalWeight - completedWeight)
  const currentAverage = completedWeight > 0 ? earnedWeighted / completedWeight : null
  const projectedFinal = totalWeight > 0 ? earnedWeighted / totalWeight : null

  function neededFor(target: number) {
    if (pendingWeight <= 0) return null
    return (target * totalWeight - earnedWeighted) / pendingWeight
  }

  return {
    totalWeight,
    completedWeight,
    pendingWeight,
    earnedWeighted,
    currentAverage,
    projectedFinal,
    neededFor4: neededFor(4),
    neededFor5: neededFor(5),
    neededFor6: neededFor(6),
    neededFor7: neededFor(7),
  }
}

function inputPlaceholder(event: AcademicEvent) {
  if (event.type === "perusall") return "0-5 pts"
  return "1.0-7.0"
}

export default function CalendarView() {
  const [selected, setSelected] = useState<SubjectCode | "FECHAS">("FECHAS")
  const [grades, setGrades] = useState<GradeMap>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [target, setTarget] = useState(4)

  useEffect(() => {
    async function loadGrades() {
      const loaded: GradeMap = {}
      const loadedDrafts: Record<string, string> = {}

      for (const ev of ACADEMIC_EVENTS) {
        const raw = localStorage.getItem(storageKey(ev.id))
        if (!raw) continue

        try {
          const parsed = JSON.parse(raw)
          loaded[ev.id] = parsed
          loadedDrafts[ev.id] = String(parsed.value)
        } catch {
          const value = Number(raw)
          if (!Number.isNaN(value)) {
            loaded[ev.id] = { value, savedAt: new Date().toISOString() }
            loadedDrafts[ev.id] = String(value)
          }
        }
      }

      const remote = await loadUserGrades()

      for (const row of remote as any[]) {
        if (!row.evaluation_id) continue

        const value = Number(row.raw_value ?? row.grade)
        if (Number.isNaN(value)) continue

        loaded[row.evaluation_id] = {
          value,
          savedAt: row.saved_at || new Date().toISOString(),
        }
        loadedDrafts[row.evaluation_id] = String(value)

        localStorage.setItem(
          storageKey(row.evaluation_id),
          JSON.stringify(loaded[row.evaluation_id])
        )
      }

      setGrades(loaded)
      setDrafts(loadedDrafts)
    }

    loadGrades()
  }, [])

  async function saveGrade(event: AcademicEvent) {
    const raw = Number(drafts[event.id])
    const value = event.type === "perusall" ? clamp(raw, 0, 5) : clamp(raw, 1, 7)

    const record: GradeRecord = {
      value,
      savedAt: new Date().toISOString(),
    }

    const next = { ...grades, [event.id]: record }
    setGrades(next)
    setDrafts(prev => ({ ...prev, [event.id]: String(value) }))
    localStorage.setItem(storageKey(event.id), JSON.stringify(record))

    await saveUserGrade({
      subject_code: event.subjectCode,
      evaluation_id: event.id,
      evaluation_name: event.title,
      grade: eventGradeToSeven(event, value),
      weight: event.weight,
      raw_value: value,
      type: event.type,
    })
  }

  async function deleteGrade(event: AcademicEvent) {
    const next = { ...grades }
    delete next[event.id]
    setGrades(next)

    const nextDrafts = { ...drafts }
    delete nextDrafts[event.id]
    setDrafts(nextDrafts)

    localStorage.removeItem(storageKey(event.id))
    await deleteUserGrade(event.id)
  }

  const visibleEvents = useMemo(() => {
    return ACADEMIC_EVENTS
      .filter(e => selected === "FECHAS" || e.subjectCode === selected)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [selected])

  const selectedEvents = selected === "FECHAS"
    ? ACADEMIC_EVENTS
    : ACADEMIC_EVENTS.filter(e => e.subjectCode === selected)

  const stats = selected === "FECHAS" ? null : calculate(selectedEvents, grades)
  const neededTarget = stats?.pendingWeight ? (target * stats.totalWeight - stats.earnedWeighted) / stats.pendingWeight : null

  const nextEvents = ACADEMIC_EVENTS
    .filter(e => daysUntil(e.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, 5)

  return (
    <main className="page">
      <section className="shell">
        <section className="hero">
          <div>
            <p className="eyebrow">Calendario + Notas</p>
            <h1>Panel académico premium</h1>
            <p>
              Registra notas, elimina notas, calcula ponderaciones reales y revisa cuánto necesitas para llegar a tu meta.
            </p>
          </div>

          <div className="heroPanel">
            <span>Próximo</span>
            <strong>{nextEvents[0]?.title ?? "Sin fechas"}</strong>
            <small>
              {nextEvents[0]
                ? `${SUBJECT_THEMES[nextEvents[0].subjectCode].name} · ${daysUntil(nextEvents[0].date)} días`
                : "Carga evaluaciones"}
            </small>
          </div>
        </section>

        <section className="tabs">
          <button
            className={selected === "FECHAS" ? "tab dates active" : "tab dates"}
            onClick={() => setSelected("FECHAS")}
          >
            <span>📅</span>
            <strong>Fechas</strong>
            <small>Vista general</small>
          </button>

          {subjects.map(code => {
            const theme = SUBJECT_THEMES[code]
            return (
              <button
                key={code}
                className={selected === code ? "tab active" : "tab"}
                style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}
                onClick={() => setSelected(code)}
              >
                <span>{theme.icon}</span>
                <strong>{theme.name}</strong>
                <small>{theme.short}</small>
              </button>
            )
          })}
        </section>

        {selected !== "FECHAS" && stats && (
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
                {stats.completedWeight.toFixed(1)}% registrado · {stats.pendingWeight.toFixed(1)}% pendiente · total configurado {stats.totalWeight.toFixed(1)}%
              </span>
            </div>

            <div className="summaryGrid">
              <div>
                <small>Promedio actual</small>
                <strong>{stats.currentAverage ? stats.currentAverage.toFixed(2) : "—"}</strong>
              </div>
              <div>
                <small>Proyección final</small>
                <strong>{stats.projectedFinal ? stats.projectedFinal.toFixed(2) : "—"}</strong>
              </div>
              <div>
                <small>Para pasar 4.0</small>
                <strong>{stats.neededFor4 === null ? "—" : clamp(stats.neededFor4, 1, 7).toFixed(2)}</strong>
              </div>
            </div>

            <div className="targetBox">
              <label>
                Meta final
                <input
                  type="number"
                  min={1}
                  max={7}
                  step={0.1}
                  value={target}
                  onChange={(e) => setTarget(clamp(Number(e.target.value), 1, 7))}
                />
              </label>
              <p>
                Para terminar con <strong>{target.toFixed(1)}</strong>, necesitas promediar{" "}
                <strong>{neededTarget === null ? "—" : clamp(neededTarget, 1, 7).toFixed(2)}</strong>{" "}
                en lo pendiente.
              </p>
            </div>
          </section>
        )}

        <section className="layout">
          <section className="events">
            {visibleEvents.map(event => {
              const theme = SUBJECT_THEMES[event.subjectCode]
              const risk = getRisk(event)
              const d = daysUntil(event.date)
              const record = grades[event.id]
              const draft = drafts[event.id] ?? ""

              return (
                <article
                  key={event.id}
                  className={`event ${risk}`}
                  style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}
                >
                  <div className="main">
                    <div className="icon">{theme.icon}</div>
                    <div>
                      <p>{theme.short} · {theme.name}</p>
                      <h3>{event.title}</h3>
                      <span>{event.unit}</span>
                    </div>
                  </div>

                  <div className="dateBox">
                    <strong>{formatDate(event.date)}</strong>
                    <span>{event.time || "Sin hora"}</span>
                    <b>{event.weight}%</b>
                  </div>

                  {selected !== "FECHAS" && (
                    <div className="gradeBox">
                      <input
                        type="number"
                        min={event.type === "perusall" ? 0 : 1}
                        max={event.type === "perusall" ? 5 : 7}
                        step={event.type === "perusall" ? 0.5 : 0.1}
                        value={draft}
                        placeholder={inputPlaceholder(event)}
                        onChange={(e) => setDrafts(prev => ({ ...prev, [event.id]: e.target.value }))}
                      />

                      {!record ? (
                        <button className="add" onClick={() => saveGrade(event)}>
                          Agregar nota
                        </button>
                      ) : (
                        <button className="delete" onClick={() => deleteGrade(event)}>
                          Eliminar
                        </button>
                      )}

                      {record ? (
                        <small className="savedGrade">
                          Nota guardada: {eventGradeToSeven(event, record.value).toFixed(2)}
                          {event.type === "perusall" ? ` · ${record.value}/5 pts` : ""}
                        </small>
                      ) : (
                        <small className="pendingGrade">Nota no guardada</small>
                      )}
                    </div>
                  )}

                  <div className="actions">
                    <span className="pill">{d < 0 ? "pasada" : d === 0 ? "hoy" : `${d} días`}</span>

                    {event.subjectCode === "MAT1000" && event.practiceEvaluation && (
                      <>
                        {event.requiresDiagnostic && (
                          <Link href={`/diagnostico?subject=MAT1000&evaluation=${event.practiceEvaluation}`}>
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

          <aside className="side">
            <h2>Próximas fechas</h2>
            {nextEvents.map(ev => {
              const t = SUBJECT_THEMES[ev.subjectCode]
              return (
                <div key={ev.id} className="mini" style={{ "--c": t.color, "--a": t.accent } as any}>
                  <strong>{t.icon} {ev.title}</strong>
                  <span>{t.name} · {daysUntil(ev.date)} días · {ev.weight}%</span>
                </div>
              )
            })}

            <div className="tip">
              <strong>Motor de notas</strong>
              <span>Perusall se ingresa 0-5 y se convierte automáticamente a escala 1-7. El resto se ingresa 1.0-7.0.</span>
            </div>
          </aside>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 28px;
          color: white;
          background:
            radial-gradient(circle at 16% 0%, rgba(37,99,235,.34), transparent 34%),
            radial-gradient(circle at 92% 7%, rgba(168,85,247,.24), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .shell {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .hero,
        .summary,
        .event,
        .side {
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 28px 90px rgba(0,0,0,.30);
          backdrop-filter: blur(18px);
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 22px;
          align-items: center;
          padding: 32px;
          border-radius: 34px;
          background: linear-gradient(135deg,rgba(255,255,255,.105),rgba(255,255,255,.045));
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .09em;
          text-transform: uppercase;
        }

        h1 {
          margin: 8px 0;
          font-size: clamp(38px,6vw,66px);
          letter-spacing: -.065em;
        }

        .hero p:last-child {
          color: #cbd5e1;
          font-size: 17px;
          max-width: 720px;
        }

        .heroPanel {
          min-width: 210px;
          padding: 18px;
          border-radius: 24px;
          background: rgba(15,23,42,.64);
          border: 1px solid rgba(255,255,255,.12);
        }

        .heroPanel span,
        .heroPanel small {
          color: #cbd5e1;
          display: block;
        }

        .heroPanel strong {
          display: block;
          margin: 6px 0;
          font-size: 22px;
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(145px,1fr));
          gap: 12px;
        }

        .tab {
          min-height: 86px;
          padding: 14px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.055);
          color: white;
          display: grid;
          gap: 3px;
          justify-items: start;
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
          box-shadow: 0 0 0 1px var(--c), 0 22px 60px rgba(0,0,0,.28);
        }

        .tab.dates.active {
          background: linear-gradient(135deg,rgba(59,130,246,.34),rgba(99,102,241,.16));
          border-color: #60a5fa;
        }

        .tab span {
          font-size: 23px;
        }

        .tab small {
          color: #cbd5e1;
          font-weight: 800;
        }

        .summary {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 24px;
          border-radius: 30px;
          background: var(--g);
          border-color: var(--c);
        }

        .summary h2 {
          margin: 6px 0;
          font-size: 32px;
        }

        .summary span {
          color: #e2e8f0;
        }

        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .summaryGrid div,
        .targetBox {
          min-width: 140px;
          padding: 15px;
          border-radius: 21px;
          background: rgba(15,23,42,.58);
          border: 1px solid rgba(255,255,255,.12);
        }

        .summaryGrid small {
          display: block;
          color: #cbd5e1;
          margin-bottom: 7px;
        }

        .summaryGrid strong {
          font-size: 26px;
        }

        .targetBox {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
        }

        .targetBox label {
          display: grid;
          gap: 6px;
          font-weight: 900;
          color: #cbd5e1;
        }

        .targetBox p {
          margin: 0;
          color: #e2e8f0;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 16px;
          align-items: start;
        }

        .events {
          display: grid;
          gap: 12px;
        }

        .event {
          display: grid;
          grid-template-columns: 1.25fr .52fr .75fr .58fr;
          gap: 14px;
          align-items: center;
          padding: 16px;
          border-radius: 26px;
          background: linear-gradient(135deg,var(--a),rgba(15,23,42,.82));
          border-color: color-mix(in srgb,var(--c) 62%, transparent);
        }

        .main {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .icon {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          background: rgba(15,23,42,.58);
          border: 1px solid rgba(255,255,255,.13);
          font-size: 24px;
        }

        .main p {
          margin: 0;
          color: #dbeafe;
          font-weight: 900;
        }

        .main h3 {
          margin: 4px 0;
          font-size: 21px;
        }

        .main span,
        .dateBox span {
          color: #cbd5e1;
          font-size: 13px;
        }

        .dateBox {
          display: grid;
          gap: 4px;
        }

        .dateBox b {
          color: var(--c);
          font-size: 22px;
        }

        .gradeBox {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: center;
        }

        .savedGrade {
          grid-column: 1 / -1;
          color: #bbf7d0;
          font-weight: 950;
          padding: 8px 10px;
          border-radius: 12px;
          background: rgba(34,197,94,.12);
          border: 1px solid rgba(34,197,94,.25);
        }

        .pendingGrade {
          grid-column: 1 / -1;
          color: #cbd5e1;
          font-weight: 850;
        }

        .gradeBox small {
          grid-column: 1 / -1;
          color: #cbd5e1;
        }

        input {
          min-height: 44px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.66);
          color: white;
          font-weight: 900;
          padding: 0 12px;
          width: 100%;
        }

        button,
        .actions a,
        .pill {
          min-height: 38px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.60);
          color: white;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
        }

        button.add {
          background: linear-gradient(135deg,#22c55e,#2563eb);
        }

        button.delete {
          background: rgba(239,68,68,.18);
          border-color: rgba(239,68,68,.45);
          color: #fecaca;
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

        .side {
          position: sticky;
          top: 86px;
          padding: 18px;
          border-radius: 28px;
          background: rgba(255,255,255,.07);
        }

        .side h2 {
          margin: 0 0 14px;
        }

        .mini,
        .tip {
          padding: 13px;
          border-radius: 18px;
          background: linear-gradient(135deg,var(--a),rgba(15,23,42,.70));
          border: 1px solid color-mix(in srgb,var(--c) 55%, transparent);
          margin-bottom: 10px;
        }

        .mini span,
        .tip span {
          display: block;
          color: #cbd5e1;
          margin-top: 5px;
          font-size: 13px;
        }

        .tip {
          background: rgba(255,255,255,.06);
          border-color: rgba(255,255,255,.12);
        }

        @media(max-width: 1080px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .side {
            position: static;
          }

          .event {
            grid-template-columns: 1fr;
          }

          .actions {
            justify-content: flex-start;
          }
        }

        @media(max-width: 860px) {
          .hero,
          .summary,
          .targetBox {
            grid-template-columns: 1fr;
            flex-direction: column;
            align-items: stretch;
          }

          .summaryGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}
