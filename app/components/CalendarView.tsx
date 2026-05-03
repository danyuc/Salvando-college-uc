'use client'

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Evaluation = {
  id: string
  subject: string
  type: string
  topic?: string | null
  title?: string | null
  start_date?: string | null
  date?: string | null
  end_date?: string | null
  weight_percent?: number | null
}

function getDate(e: Evaluation) {
  return e.start_date || e.date || ""
}

function inferEvaluationType(e: Evaluation) {
  const raw = `${e.type || ""} ${e.topic || ""} ${e.title || ""}`.toUpperCase()
  if (raw.includes("I1") || raw.includes("INTERROGACIÓN 1")) return "I1"
  if (raw.includes("I2") || raw.includes("INTERROGACIÓN 2")) return "I2"
  if (raw.includes("I3") || raw.includes("INTERROGACIÓN 3")) return "I3"
  if (raw.includes("EXAMEN")) return "EXAMEN"
  return e.type || "Evaluación"
}

function formatDate(date: string) {
  if (!date) return "Sin fecha"
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
}

function daysLeft(date: string) {
  if (!date) return null
  const today = new Date()
  const d = new Date(date)
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - today.getTime()) / 86400000)
}

function riskLabel(days: number | null, weight?: number | null) {
  if (days === null) return "Sin fecha"
  if (days < 0) return "Pasada"
  if (days <= 3 && Number(weight || 0) >= 15) return "Riesgo alto"
  if (days <= 7) return "Preparación urgente"
  if (days <= 14) return "Preparación activa"
  return "Estable"
}

export default function CalendarView() {
  const [events, setEvents] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    setLoading(true)

    const { data, error } = await supabase
      .from("evaluations")
      .select("*")
      .order("start_date", { ascending: true })

    if (error) {
      console.warn(error.message)
      setEvents([])
    } else {
      setEvents(data || [])
    }

    setLoading(false)
  }

  const upcoming = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return events
      .filter((e) => {
        const d = new Date(getDate(e))
        return !Number.isNaN(d.getTime()) && d >= today
      })
      .sort((a, b) => new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime())
  }, [events])

  const next = upcoming[0]

  return (
    <main className="calendar-page">
      <section className="calendar-shell">
        <div className="calendar-hero">
          <div>
            <p className="eyebrow">Calendario académico</p>
            <h1>Tu ruta de evaluaciones</h1>
            <p className="subtitle">
              Revisa fechas, ponderaciones y entra directo a practicar para cada evaluación.
            </p>
          </div>

          <Link href="/practica" className="primary-link">
            Practicar ahora
          </Link>
        </div>

        {next && (
          <section className="next-card">
            <div>
              <p className="eyebrow">Próxima evaluación</p>
              <h2>{next.subject} · {inferEvaluationType(next)}</h2>
              <p>{next.topic || next.title || "Evaluación programada"}</p>
            </div>

            <div className="next-meta">
              <strong>{formatDate(getDate(next))}</strong>
              <span>{riskLabel(daysLeft(getDate(next)), next.weight_percent)}</span>
            </div>
          </section>
        )}

        {loading && <p className="empty">Cargando calendario...</p>}

        {!loading && upcoming.length === 0 && (
          <section className="empty-card">
            <h2>No hay evaluaciones próximas</h2>
            <p>Agrega evaluaciones en Notas o vuelve cuando tengas fechas registradas.</p>
          </section>
        )}

        <div className="calendar-grid">
          {upcoming.map((e) => {
            const evaluation = inferEvaluationType(e)
            const date = getDate(e)
            const days = daysLeft(date)

            const practiceHref =
              e.subject === "MAT1000" ||
              e.subject === "Precálculo" ||
              e.subject === "Matemática"
                ? `/practica?subject=MAT1000&evaluation=${evaluation}&mode=practica`
                : `/practica?subject=${encodeURIComponent(e.subject)}&mode=practica`

            return (
              <article className="event-card" key={e.id}>
                <div className="event-top">
                  <div>
                    <span className="pill">{evaluation}</span>
                    <h3>{e.subject}</h3>
                  </div>

                  <div className="days-badge">
                    {days === 0 ? "Hoy" : days === 1 ? "Mañana" : `Faltan ${days} días`}
                  </div>
                </div>

                <p className="event-topic">{e.topic || e.title || "Sin tema definido"}</p>

                <div className="event-info">
                  <span>📅 {formatDate(date)}</span>
                  <span>⚖️ {Number(e.weight_percent || 0)}%</span>
                  <span>⚡ {riskLabel(days, e.weight_percent)}</span>
                </div>

                <div className="event-actions">
                  <Link href={practiceHref}>Practicar esta evaluación</Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <style jsx>{`
        .calendar-page {
          min-height: 100vh;
          padding: 28px;
          color: white;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, .35), transparent 34%),
            radial-gradient(circle at top right, rgba(124, 58, 237, .28), transparent 32%),
            linear-gradient(180deg, #020617, #0f172a);
        }

        .calendar-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .calendar-hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 22px;
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
          font-size: 12px;
        }

        h1 {
          font-size: clamp(32px, 5vw, 54px);
          margin: 8px 0;
          letter-spacing: -0.05em;
        }

        .subtitle {
          color: #cbd5e1;
          max-width: 620px;
          font-size: 16px;
        }

        .primary-link {
          padding: 14px 18px;
          border-radius: 18px;
          color: white;
          text-decoration: none;
          font-weight: 950;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          box-shadow: 0 22px 50px rgba(37, 99, 235, .28);
        }

        .next-card {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 24px;
          border-radius: 28px;
          margin-bottom: 20px;
          background:
            linear-gradient(135deg, rgba(16, 185, 129, .18), rgba(59, 130, 246, .14)),
            rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 24px 70px rgba(0,0,0,.25);
        }

        .next-card h2 {
          margin: 8px 0;
          font-size: 26px;
        }

        .next-card p {
          color: #dbeafe;
          margin: 0;
        }

        .next-meta {
          text-align: right;
          display: grid;
          gap: 8px;
          align-content: center;
        }

        .next-meta strong {
          font-size: 18px;
        }

        .next-meta span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
          font-weight: 900;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 16px;
        }

        .event-card {
          padding: 18px;
          border-radius: 24px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.045));
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 20px 55px rgba(0,0,0,.22);
        }

        .event-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .pill {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(59, 130, 246, .18);
          border: 1px solid rgba(59, 130, 246, .28);
          font-size: 12px;
          font-weight: 950;
          color: #bfdbfe;
        }

        .event-card h3 {
          margin: 10px 0 0;
          font-size: 22px;
        }

        .days-badge {
          white-space: nowrap;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(16,185,129,.16);
          color: #bbf7d0;
          font-weight: 900;
          font-size: 12px;
        }

        .event-topic {
          color: #cbd5e1;
          min-height: 42px;
        }

        .event-info {
          display: grid;
          gap: 8px;
          color: #e2e8f0;
          font-weight: 750;
          margin: 16px 0;
        }

        .event-actions a {
          display: inline-flex;
          width: 100%;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 16px;
          color: #ecfeff;
          text-decoration: none;
          font-weight: 950;
          background: rgba(14,165,233,.18);
          border: 1px solid rgba(14,165,233,.28);
        }

        .empty,
        .empty-card {
          padding: 22px;
          border-radius: 22px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
        }

        @media (max-width: 760px) {
          .calendar-page {
            padding: 18px;
          }

          .calendar-hero,
          .next-card {
            flex-direction: column;
          }

          .next-meta {
            text-align: left;
          }

          .primary-link {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </main>
  )
}
