'use client'

import Link from "next/link"
import { useUser } from "@/lib/useUser"
import { getMostUrgentEvent, getRiskSummary, getSubjectRisk, getUpcomingEvents, generateTodayPlan } from "@/lib/home-intelligence"
import { SUBJECT_THEMES, daysUntil, getRisk } from "@/lib/academic-calendar-data"

export default function HomeView() {
  const { name } = useUser()
  const upcoming = getUpcomingEvents(6)
  const urgent = getMostUrgentEvent()
  const riskSummary = getRiskSummary()
  const subjectRisk = getSubjectRisk()
  const plan = generateTodayPlan()

  return (
    <main className="page">
      <section className="shell">
        <section className="hero">
          <div>
            <p className="eyebrow">Salvando College UC</p>
            <h1>Hola, {name}</h1>
            <p>
              Este es tu panel inteligente: fechas próximas, riesgo por ramo y plan recomendado según la hora actual.
            </p>
          </div>

          <Link href="/calendario" className="primary">
            Ver calendario + notas
          </Link>
        </section>

        <section className="metrics">
          <div>
            <span>Próximo</span>
            <strong>{urgent ? urgent.title : "Sin eventos"}</strong>
            <small>{urgent ? `${SUBJECT_THEMES[urgent.subjectCode].name} · ${daysUntil(urgent.date)} días` : "Carga tus evaluaciones"}</small>
          </div>
          <div>
            <span>Urgentes</span>
            <strong>{riskSummary.alto || riskSummary.urgente || 0}</strong>
            <small>Evaluaciones críticas</small>
          </div>
          <div>
            <span>Riesgo medio</span>
            <strong>{riskSummary.activo || 0}</strong>
            <small>Preparación activa</small>
          </div>
          <div>
            <span>Peso próximo</span>
            <strong>{upcoming.reduce((a, e) => a + e.weight, 0).toFixed(0)}%</strong>
            <small>Total próximo</small>
          </div>
        </section>

        <section className="grid">
          <section className="card">
            <div className="card-head">
              <div>
                <p className="eyebrow">Qué hacer hoy</p>
                <h2>Plan recomendado por bloques</h2>
              </div>
            </div>

            <div className="plan">
              {plan.map((b, i) => {
                const t = SUBJECT_THEMES[b.subjectCode as keyof typeof SUBJECT_THEMES]
                return (
                  <Link key={i} href={b.href} className="plan-row" style={{ "--c": t.color, "--a": t.accent } as any}>
                    <div>
                      <strong>{b.time}</strong>
                      <span>{b.label}</span>
                    </div>
                    <div>
                      <b>{t.icon} {b.title}</b>
                      <small>{b.detail}</small>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="card">
            <p className="eyebrow">Riesgo por ramo</p>
            <h2>Mapa académico</h2>

            <div className="subjects">
              {subjectRisk.map(s => {
                const t = SUBJECT_THEMES[s.code as keyof typeof SUBJECT_THEMES]
                return (
                  <Link key={s.code} href={`/calendario`} className="subject" style={{ "--c": t.color, "--a": t.accent } as any}>
                    <div>
                      <strong>{t.icon} {t.name}</strong>
                      <span>{s.next ? s.next.title : "Sin fechas próximas"}</span>
                    </div>
                    <b>{s.totalWeight.toFixed(0)}%</b>
                  </Link>
                )
              })}
            </div>
          </section>
        </section>

        <section className="card">
          <p className="eyebrow">Evaluaciones próximas</p>
          <div className="events">
            {upcoming.map(e => {
              const t = SUBJECT_THEMES[e.subjectCode]
              return (
                <article key={e.id} className="event" style={{ "--c": t.color, "--a": t.accent } as any}>
                  <div>
                    <strong>{t.icon} {t.name} · {e.title}</strong>
                    <span>{e.unit}</span>
                  </div>
                  <div>
                    <b>{daysUntil(e.date)} días</b>
                    <small>{e.weight}% · {getRisk(e)}</small>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 28px;
          color: white;
          background:
            radial-gradient(circle at 18% 0%, rgba(37,99,235,.34), transparent 34%),
            radial-gradient(circle at 90% 10%, rgba(168,85,247,.20), transparent 34%),
            linear-gradient(180deg,#020617,#0f172a);
        }
        .shell { max-width: 1220px; margin: 0 auto; display: grid; gap: 18px; }
        .hero, .card, .metrics div {
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.075);
          border-radius: 30px;
          box-shadow: 0 28px 80px rgba(0,0,0,.28);
          backdrop-filter: blur(18px);
        }
        .hero {
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
          font-size: 12px;
        }
        h1 { font-size: clamp(42px,7vw,72px); margin: 8px 0; letter-spacing: -.07em; }
        h2 { margin: 8px 0 16px; font-size: 25px; }
        .hero p:last-child { color: #cbd5e1; max-width: 660px; }
        .primary {
          color: white;
          text-decoration: none;
          padding: 14px 18px;
          border-radius: 18px;
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          font-weight: 950;
        }
        .metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
        .metrics div { padding: 18px; }
        .metrics span, small { color: #cbd5e1; display: block; }
        .metrics strong { display: block; font-size: 24px; margin: 8px 0; }
        .grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 18px; }
        .card { padding: 22px; }
        .plan, .subjects, .events { display: grid; gap: 11px; }
        .plan-row, .subject, .event {
          display: grid;
          grid-template-columns: .7fr 1.3fr;
          gap: 14px;
          padding: 14px;
          border-radius: 20px;
          background: linear-gradient(135deg,var(--a),rgba(15,23,42,.72));
          border: 1px solid color-mix(in srgb,var(--c) 55%,transparent);
          color: white;
          text-decoration: none;
        }
        .plan-row span, .subject span, .event span { color: #cbd5e1; display: block; margin-top: 4px; }
        .subject, .event { grid-template-columns: 1fr auto; align-items: center; }
        .subject b, .event b { color: var(--c); font-size: 20px; }
        @media(max-width: 900px) {
          .hero, .grid { grid-template-columns: 1fr; flex-direction: column; align-items: stretch; }
          .metrics { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>
    </main>
  )
}
