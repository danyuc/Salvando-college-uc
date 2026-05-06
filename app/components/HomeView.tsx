'use client'

import Link from "next/link"
import { useMemo } from "react"
import { useUser } from "@/lib/useUser"
import { ACADEMIC_EVENTS, SUBJECT_THEMES, daysUntil, getRisk } from "@/lib/academic-calendar-data"
import PrivateSeminarioActivity from "./PrivateSeminarioActivity";

function upcomingEvents() {
  return ACADEMIC_EVENTS
    .filter(e => daysUntil(e.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

export default function HomeView() {
  const { name, email } = useUser()

  const upcoming = useMemo(() => upcomingEvents(), [])
  const next = upcoming[0]
  const urgent = upcoming.filter(e => ["alto", "urgente"].includes(getRisk(e)))
  const active = upcoming.filter(e => getRisk(e) === "activo")
  const totalWeight = upcoming.slice(0, 6).reduce((a, e) => a + e.weight, 0)

  const todayPlan = upcoming.slice(0, 3)

  return (
    <main className="page">
      <section className="shell">
        <section className="hero">
          <div className="orb orb1" />
          <div className="orb orb2" />

          <div className="heroContent">
            <p className="eyebrow">Salvando College UC</p>
            <h1>Hola, {name}</h1>
            <p className="subtitle">
              Tu cockpit académico: fechas, riesgo, práctica y notas en un solo panel inteligente.
            </p>

            <div className="actions">
              <Link href="/practica" className="primary">Practicar foco</Link>
              <Link href="/diagnostico" className="secondary">Diagnóstico</Link>
              <Link href="/calendario" className="ghost">Calendario + notas</Link>
            </div>

            <div className="identity">
              <span>Usuario UC</span>
              <strong>{name}</strong>
              <small>{email || "Correo institucional registrado"}</small>
            </div>
          </div>

          <aside className="status">
            <span>Estado académico</span>
            <strong>{next ? "Activo" : "Sin fechas"}</strong>
            <p>
              {next
                ? `${SUBJECT_THEMES[next.subjectCode].name}: ${next.title} en ${daysUntil(next.date)} días`
                : "Agrega evaluaciones para activar predicción y coach."}
            </p>
          </aside>
        </section>

        <section className="metrics">
          <Metric title="Próximas" value={String(upcoming.length)} desc="evaluaciones vigentes" />
          <Metric title="Urgentes" value={String(urgent.length)} desc="riesgo alto o cercano" />
          <Metric title="Riesgo medio" value={String(active.length)} desc="requieren seguimiento" />
          <Metric title="Peso próximo" value={`${totalWeight.toFixed(0)}%`} desc="siguientes 6 eventos" />
        </section>

        <section className="mainGrid">
          <section className="panel large">
            <div className="panelHead">
              <div>
                <p className="eyebrow">Foco del día</p>
                <h2>Plan recomendado</h2>

      <PrivateSeminarioActivity />

              </div>
              <Link href="/calendario" className="miniBtn">Gestionar</Link>
            </div>

            <div className="plan">
              {todayPlan.length > 0 ? todayPlan.map((event, i) => {
                const theme = SUBJECT_THEMES[event.subjectCode]
                return (
                  <Link
                    key={event.id}
                    href={event.subjectCode === "MAT1000" && event.practiceEvaluation
                      ? `/practica?subject=MAT1000&evaluation=${event.practiceEvaluation}&mode=practica`
                      : "/calendario"}
                    className="planRow"
                    style={{ "--c": theme.color, "--a": theme.accent } as any}
                  >
                    <div className="number">{i + 1}</div>
                    <div>
                      <strong>{theme.icon} {theme.name} · {event.title}</strong>
                      <span>{event.unit}</span>
                    </div>
                    <b>{daysUntil(event.date)} días</b>
                  </Link>
                )
              }) : (
                <div className="empty">
                  <strong>Sin foco por ahora</strong>
                  <span>Cuando agregues fechas, aparecerá un plan automático por prioridad.</span>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Próxima evaluación</p>
            {next ? (
              <div className="next">
                <div className="nextIcon">{SUBJECT_THEMES[next.subjectCode].icon}</div>
                <h2>{next.title}</h2>
                <p>{SUBJECT_THEMES[next.subjectCode].name}</p>
                <strong>{formatDate(next.date)}</strong>
                <span>{next.weight}% · {getRisk(next)}</span>
              </div>
            ) : (
              <div className="empty">
                <strong>Sin evaluaciones</strong>
                <span>Abre calendario para registrar fechas y notas.</span>
              </div>
            )}
          </section>
        </section>

        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Mapa por ramo</p>
              <h2>Colores, riesgo y prioridad</h2>
            </div>
          </div>

          <div className="subjects">
            {Object.entries(SUBJECT_THEMES).map(([code, theme]) => {
              const events = upcoming.filter(e => e.subjectCode === code)
              const nearest = events[0]
              return (
                <Link
                  key={code}
                  href="/calendario"
                  className="subject"
                  style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as any}
                >
                  <div>
                    <strong>{theme.icon} {theme.name}</strong>
                    <span>{nearest ? `${nearest.title} · ${daysUntil(nearest.date)} días` : "Sin fechas próximas"}</span>
                  </div>
                  <b>{events.reduce((a, e) => a + e.weight, 0).toFixed(0)}%</b>
                </Link>
              )
            })}
          </div>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          color: white;
          font-family: var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 12% 0%, rgba(37,99,235,.38), transparent 34%),
            radial-gradient(circle at 92% 5%, rgba(168,85,247,.26), transparent 32%),
            radial-gradient(circle at 40% 100%, rgba(34,197,94,.10), transparent 28%),
            linear-gradient(180deg,#020617,#0f172a);
        }

        .shell {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 330px;
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 22px;
          align-items: stretch;
          padding: 32px;
          border-radius: 38px;
          border: 1px solid rgba(255,255,255,.15);
          background:
            linear-gradient(135deg,rgba(255,255,255,.13),rgba(255,255,255,.045)),
            rgba(15,23,42,.72);
          box-shadow: 0 34px 100px rgba(0,0,0,.36);
          backdrop-filter: blur(22px);
        }

        .orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(6px);
          opacity: .52;
          pointer-events: none;
        }

        .orb1 {
          width: 420px;
          height: 420px;
          left: -140px;
          top: -150px;
          background: radial-gradient(circle, rgba(37,99,235,.62), transparent 65%);
        }

        .orb2 {
          width: 360px;
          height: 360px;
          right: -90px;
          bottom: -150px;
          background: radial-gradient(circle, rgba(168,85,247,.42), transparent 65%);
        }

        .heroContent,
        .status {
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        h1 {
          margin: 10px 0 8px;
          font-size: clamp(48px,8vw,84px);
          line-height: .94;
          letter-spacing: -.075em;
          font-weight: 950;
        }

        h2 {
          margin: 6px 0 0;
          font-size: 27px;
          letter-spacing: -.035em;
        }

        .subtitle {
          max-width: 650px;
          color: #cbd5e1;
          font-size: 18px;
          line-height: 1.55;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 22px;
        }

        .primary,
        .secondary,
        .ghost,
        .miniBtn {
          min-height: 46px;
          padding: 0 16px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: white;
          font-weight: 950;
          border: 1px solid rgba(255,255,255,.14);
        }

        .primary {
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          box-shadow: 0 18px 46px rgba(37,99,235,.32);
        }

        .secondary {
          background: rgba(255,255,255,.09);
        }

        .ghost {
          color: #cbd5e1;
          background: rgba(15,23,42,.35);
        }

        .identity {
          margin-top: 24px;
          width: fit-content;
          padding: 13px 15px;
          border-radius: 20px;
          background: rgba(15,23,42,.52);
          border: 1px solid rgba(255,255,255,.12);
        }

        .identity span,
        .identity small {
          display: block;
          color: #94a3b8;
          font-size: 12px;
        }

        .identity strong {
          display: block;
          margin: 4px 0;
          font-size: 18px;
        }

        .status {
          padding: 22px;
          border-radius: 28px;
          background: rgba(15,23,42,.58);
          border: 1px solid rgba(255,255,255,.13);
          align-self: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
        }

        .status span {
          color: #93c5fd;
          font-weight: 900;
          font-size: 13px;
        }

        .status strong {
          display: block;
          margin: 8px 0;
          font-size: 34px;
          letter-spacing: -.04em;
        }

        .status p {
          color: #cbd5e1;
          line-height: 1.5;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .metric,
        .panel {
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.13);
          background: rgba(255,255,255,.07);
          box-shadow: 0 24px 70px rgba(0,0,0,.25);
          backdrop-filter: blur(18px);
        }

        .metric {
          padding: 20px;
        }

        .metric span,
        .metric small {
          display: block;
          color: #94a3b8;
        }

        .metric strong {
          display: block;
          margin: 7px 0;
          font-size: 31px;
          letter-spacing: -.04em;
        }

        .mainGrid {
          display: grid;
          grid-template-columns: 1.45fr .75fr;
          gap: 18px;
        }

        .panel {
          padding: 22px;
        }

        .panelHead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .miniBtn {
          min-height: 38px;
          font-size: 13px;
          background: rgba(255,255,255,.08);
        }

        .plan,
        .subjects {
          display: grid;
          gap: 11px;
        }

        .planRow,
        .subject {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 13px;
          align-items: center;
          padding: 15px;
          border-radius: 22px;
          background: linear-gradient(135deg,var(--a),rgba(15,23,42,.72));
          border: 1px solid color-mix(in srgb,var(--c) 58%, transparent);
          color: white;
          text-decoration: none;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .planRow:hover,
        .subject:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 45px rgba(0,0,0,.25);
        }

        .number {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          font-weight: 950;
        }

        .planRow span,
        .subject span {
          display: block;
          margin-top: 4px;
          color: #cbd5e1;
          font-size: 13px;
        }

        .planRow b,
        .subject b {
          color: var(--c);
          font-size: 20px;
        }

        .next {
          min-height: 260px;
          display: grid;
          place-items: center;
          text-align: center;
          align-content: center;
        }

        .nextIcon {
          width: 70px;
          height: 70px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.12);
          font-size: 32px;
          margin-bottom: 10px;
        }

        .next p,
        .next span {
          color: #cbd5e1;
        }

        .next strong {
          font-size: 21px;
        }

        .empty {
          padding: 18px;
          border-radius: 22px;
          background: rgba(15,23,42,.45);
          border: 1px solid rgba(255,255,255,.11);
        }

        .empty span {
          display: block;
          color: #cbd5e1;
          margin-top: 6px;
        }

        .subjects {
          grid-template-columns: repeat(auto-fit,minmax(210px,1fr));
        }

        .subject {
          grid-template-columns: 1fr auto;
          background: var(--g);
        }

        @media(max-width: 1000px) {
          .hero,
          .mainGrid {
            grid-template-columns: 1fr;
          }

          .metrics {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media(max-width: 640px) {
          .page {
            padding: 18px;
          }

          .metrics {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 52px;
          }
        }
      `}</style>
    </main>
  )
}

function Metric({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
        {title}
      </p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-4xl font-black text-white">
          {value}
        </span>
        <span className="pb-1 text-sm font-bold text-slate-300">
          {desc}
        </span>
      </div>
    </div>
  )
}