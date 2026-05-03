'use client'

import Link from "next/link"
import { useMemo, useState } from "react"
import { ACADEMIC_EVENTS, SUBJECT_THEMES, type SubjectCode, daysUntil, getRisk } from "@/lib/academic-calendar-data"
import PerusallTracker from "./PerusallTracker"
import ControlTracker from "./ControlTracker"

const subjectCodes = Object.keys(SUBJECT_THEMES) as SubjectCode[]

export default function CalendarView() {
  const [selected, setSelected] = useState<SubjectCode | "TODOS">("TODOS")

  const events = useMemo(() => {
    return ACADEMIC_EVENTS
      .filter(e => selected === "TODOS" || e.subjectCode === selected)
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [selected])

  return (
    <main className="page">
      <section className="shell">
        <section className="hero">
          <div>
            <p className="eyebrow">Calendario inteligente UC</p>
            <h1>Fechas, riesgo y práctica conectada</h1>
            <p>Colores por ramo, ponderaciones reales, Perusall, controles y práctica MAT1000.</p>
          </div>
        </section>

        <section className="subjects">
          <button className={selected === "TODOS" ? "active all" : "all"} onClick={() => setSelected("TODOS")}>Todos</button>
          {subjectCodes.map(code => {
            const t = SUBJECT_THEMES[code]
            return (
              <button
                key={code}
                className={selected === code ? "active" : ""}
                style={{ "--c": t.color, "--a": t.accent } as any}
                onClick={() => setSelected(code)}
              >
                <span>{t.icon}</span>
                <strong>{t.name}</strong>
                <small>{t.short}</small>
              </button>
            )
          })}
        </section>

        <section className="trackers">
          <ControlTracker />
          <PerusallTracker />
        </section>

        <section className="events">
          {events.map(e => {
            const t = SUBJECT_THEMES[e.subjectCode]
            const days = daysUntil(e.date)
            const risk = getRisk(e)

            return (
              <article className={`event ${risk}`} key={e.id} style={{ "--c": t.color, "--a": t.accent, "--g": t.gradient } as any}>
                <div className="left">
                  <div className="icon">{t.icon}</div>
                  <div>
                    <p>{t.short} · {t.name}</p>
                    <h2>{e.title}</h2>
                    <span>{e.unit}</span>
                  </div>
                </div>

                <div className="meta">
                  <strong>{e.date}</strong>
                  <span>{e.time || "Sin hora"}</span>
                  <b>{e.weight}%</b>
                </div>

                <div className="actions">
                  <span className="risk">{risk}</span>
                  {e.subjectCode === "MAT1000" && e.practiceEvaluation && (
                    <>
                      {e.requiresDiagnostic && (
                        <Link href={`/diagnostico?evaluation=${e.practiceEvaluation}`}>Diagnóstico</Link>
                      )}
                      <Link href={`/practica?subject=MAT1000&evaluation=${e.practiceEvaluation}&mode=practica`}>
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

      <style jsx>{`
        .page {
          min-height:100vh;
          padding:28px;
          color:white;
          background:
            radial-gradient(circle at 20% 0%, rgba(37,99,235,.35), transparent 32%),
            radial-gradient(circle at 90% 10%, rgba(168,85,247,.22), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }
        .shell { max-width:1220px; margin:0 auto; display:grid; gap:20px; }
        .hero {
          padding:30px;
          border-radius:32px;
          background:linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.04));
          border:1px solid rgba(255,255,255,.14);
          box-shadow:0 28px 80px rgba(0,0,0,.30);
        }
        .eyebrow { color:#93c5fd; font-weight:950; text-transform:uppercase; margin:0; }
        h1 { font-size:clamp(34px,5vw,58px); margin:8px 0; letter-spacing:-.05em; }
        .hero p:last-child { color:#cbd5e1; font-size:17px; }
        .subjects { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; }
        .subjects button {
          min-height:82px;
          border-radius:22px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.06);
          color:white;
          display:grid;
          gap:3px;
          justify-items:start;
          padding:14px;
          cursor:pointer;
        }
        .subjects button.active {
          background:var(--a);
          border-color:var(--c);
          box-shadow:0 0 0 1px var(--c), 0 22px 50px rgba(0,0,0,.22);
        }
        .subjects .all.active { background:rgba(59,130,246,.20); border-color:#60a5fa; }
        .subjects span { font-size:22px; }
        .subjects small { color:#cbd5e1; font-weight:800; }
        .trackers { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .events { display:grid; gap:13px; }
        .event {
          display:grid;
          grid-template-columns:1.5fr .7fr .7fr;
          gap:18px;
          align-items:center;
          padding:18px;
          border-radius:26px;
          background:var(--g);
          border:1px solid rgba(255,255,255,.15);
          box-shadow:0 20px 60px rgba(0,0,0,.24);
        }
        .left { display:flex; gap:14px; align-items:center; }
        .icon {
          width:52px; height:52px; border-radius:18px;
          display:grid; place-items:center;
          background:rgba(15,23,42,.55);
          border:1px solid rgba(255,255,255,.12);
          font-size:24px;
        }
        .left p { margin:0; color:#e0f2fe; font-weight:900; }
        .left h2 { margin:4px 0; font-size:22px; }
        .left span, .meta span { color:#cbd5e1; }
        .meta { display:grid; gap:5px; }
        .meta b { color:var(--c); font-size:24px; }
        .actions { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:8px; }
        .actions a, .risk {
          padding:9px 11px;
          border-radius:999px;
          background:rgba(15,23,42,.55);
          border:1px solid rgba(255,255,255,.14);
          color:white;
          text-decoration:none;
          font-weight:900;
          font-size:12px;
        }
        .event.alto { outline:2px solid rgba(239,68,68,.55); }
        .event.urgente { outline:2px solid rgba(245,158,11,.50); }
        @media(max-width:900px){
          .trackers { grid-template-columns:1fr; }
          .event { grid-template-columns:1fr; }
          .actions { justify-content:flex-start; }
        }
      `}</style>
    </main>
  )
}
