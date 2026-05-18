'use client'

import Link from "next/link"
import { type CSSProperties, useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, CalendarClock, CheckCircle2, Sparkles } from "lucide-react"
import { useUser } from "@/lib/useUser"
import { ACADEMIC_EVENTS, SUBJECT_THEMES, daysUntil, getRisk } from "@/lib/academic-calendar-data"
import PrivateSeminarioActivity from "./PrivateSeminarioActivity"

type ThemeStyle = CSSProperties & Record<"--c" | "--a" | "--g", string>

function upcomingEvents() {
  return ACADEMIC_EVENTS
    .filter((event) => daysUntil(event.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

export default function HomeView() {
  const { name, email } = useUser()

  const upcoming = useMemo(() => upcomingEvents(), [])
  const next = upcoming[0]
  const urgent = upcoming.filter((event) => ["alto", "urgente"].includes(getRisk(event)))
  const active = upcoming.filter((event) => getRisk(event) === "activo")
  const totalWeight = upcoming.slice(0, 6).reduce((sum, event) => sum + event.weight, 0)
  const todayPlan = upcoming.slice(0, 3)

  return (
    <main className="page">
      <motion.section className="shell" variants={stagger} initial="hidden" animate="show">
        <motion.section className="hero premium-card" variants={rise}>
          <div className="heroContent">
            <div className="eyebrowRow">
              <span className="eyebrow">Salvando College UC</span>
              <span className="liveBadge">
                <Sparkles size={14} />
                Modo estudiante
              </span>
            </div>

            <h1>Hola, {name}</h1>
            <p className="subtitle">
              Tu centro de estudio inteligente para priorizar evaluaciones, practicar con foco y tomar mejores decisiones antes de que llegue la semana pesada.
            </p>

            <div className="actions">
              <Link href="/practica" className="primary">Practicar foco</Link>
              <Link href="/diagnostico" className="secondary">Diagnostico</Link>
              <Link href="/calendario" className="ghost">Calendario + notas</Link>
            </div>

            <div className="identity">
              <span>Usuario UC</span>
              <strong>{name}</strong>
              <small>{email || "Correo institucional registrado"}</small>
            </div>
          </div>

          <aside className="status">
            <span>Estado academico</span>
            <strong>{next ? "Activo" : "Sin fechas"}</strong>
            <p>
              {next
                ? `${SUBJECT_THEMES[next.subjectCode].name}: ${next.title} en ${daysUntil(next.date)} dias`
                : "Agrega evaluaciones para activar prediccion y coach."}
            </p>
            <div className="statusLine">
              <CheckCircle2 size={17} />
              <small>Plan actualizado con tus fechas visibles</small>
            </div>
          </aside>
        </motion.section>

        <motion.section className="metrics" variants={stagger}>
          <Metric title="Proximas" value={String(upcoming.length)} desc="evaluaciones vigentes" />
          <Metric title="Urgentes" value={String(urgent.length)} desc="riesgo alto o cercano" />
          <Metric title="Riesgo medio" value={String(active.length)} desc="requieren seguimiento" />
          <Metric title="Peso proximo" value={`${totalWeight.toFixed(0)}%`} desc="siguientes 6 eventos" />
        </motion.section>

        <motion.section className="mainGrid" variants={stagger}>
          <motion.section className="panel large premium-card" variants={rise}>
            <div className="panelHead">
              <div>
                <p className="eyebrow">Foco del dia</p>
                <h2>Plan recomendado</h2>
                <PrivateSeminarioActivity />
              </div>
              <Link href="/seminario-admin" className="miniBtn">
                Gestionar
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="plan">
              {todayPlan.length > 0 ? todayPlan.map((event, index) => {
                const theme = SUBJECT_THEMES[event.subjectCode]
                return (
                  <motion.div key={event.id} variants={rise} whileHover={{ y: -3 }}>
                    <Link
                      href={event.subjectCode === "MAT1000" && event.practiceEvaluation
                        ? `/practica?subject=MAT1000&evaluation=${event.practiceEvaluation}&mode=practica`
                        : "/calendario"}
                      className="planRow"
                      style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as ThemeStyle}
                    >
                      <div className="number">{index + 1}</div>
                      <div>
                        <strong>{theme.icon} {theme.name} · {event.title}</strong>
                        <span>{event.unit}</span>
                      </div>
                      <b>{daysUntil(event.date)} dias</b>
                    </Link>
                  </motion.div>
                )
              }) : (
                <EmptyState title="Sin foco por ahora" text="Cuando agregues fechas, aparecera un plan automatico por prioridad." />
              )}
            </div>
          </motion.section>

          <motion.section className="panel premium-card" variants={rise}>
            <p className="eyebrow">Proxima evaluacion</p>
            {next ? (
              <div className="next">
                <div className="nextIcon">
                  <CalendarClock size={30} />
                </div>
                <h2>{next.title}</h2>
                <p>{SUBJECT_THEMES[next.subjectCode].name}</p>
                <strong>{formatDate(next.date)}</strong>
                <span>{next.weight}% · {getRisk(next)}</span>
              </div>
            ) : (
              <EmptyState title="Sin evaluaciones" text="Abre calendario para registrar fechas y notas." />
            )}
          </motion.section>
        </motion.section>

        <motion.section className="panel premium-card" variants={rise}>
          <div className="panelHead">
            <div>
              <p className="eyebrow">Mapa por ramo</p>
              <h2>Colores, riesgo y prioridad</h2>
            </div>
          </div>

          <div className="subjects">
            {Object.entries(SUBJECT_THEMES).map(([code, theme]) => {
              const events = upcoming.filter((event) => event.subjectCode === code)
              const nearest = events[0]
              return (
                <motion.div key={code} whileHover={{ y: -3 }}>
                  <Link
                    href="/calendario"
                    className="subject"
                    style={{ "--c": theme.color, "--a": theme.accent, "--g": theme.gradient } as ThemeStyle}
                  >
                    <div>
                      <strong>{theme.icon} {theme.name}</strong>
                      <span>{nearest ? `${nearest.title} · ${daysUntil(nearest.date)} dias` : "Sin fechas proximas"}</span>
                    </div>
                    <b>{events.reduce((sum, event) => sum + event.weight, 0).toFixed(0)}%</b>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      </motion.section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          color: white;
          font-family: var(--font-inter), Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 20% 0%, rgba(59, 130, 246, .28), transparent 30%),
            radial-gradient(circle at 90% 10%, rgba(20, 184, 166, .16), transparent 28%),
            linear-gradient(180deg, rgba(2, 6, 23, .64), rgba(15, 23, 42, .74));
        }

        .shell {
          width: min(1240px, calc(100vw - 32px));
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .hero {
          position: relative;
          overflow: hidden;
          min-height: 340px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
          gap: 22px;
          align-items: stretch;
          padding: clamp(24px, 4vw, 38px);
          border-radius: 34px;
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(120deg, rgba(255, 255, 255, .10), transparent 34%),
            radial-gradient(circle at 78% 20%, rgba(34, 211, 238, .16), transparent 28%);
        }

        .heroContent,
        .status {
          position: relative;
          z-index: 2;
        }

        .eyebrowRow {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .1em;
          text-transform: uppercase;
        }

        .liveBadge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          color: #ccfbf1;
          font-size: 12px;
          font-weight: 900;
          background: rgba(20, 184, 166, .14);
          border: 1px solid rgba(94, 234, 212, .22);
        }

        h1 {
          margin: 12px 0 10px;
          max-width: 820px;
          font-size: clamp(46px, 7.2vw, 86px);
          line-height: .94;
          letter-spacing: -.06em;
          font-weight: 950;
        }

        h2 {
          margin: 6px 0 0;
          font-size: clamp(24px, 3vw, 30px);
          letter-spacing: -.035em;
        }

        .subtitle {
          max-width: 700px;
          color: #cbd5e1;
          font-size: clamp(16px, 1.6vw, 19px);
          line-height: 1.62;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 24px;
        }

        .primary,
        .secondary,
        .ghost,
        .miniBtn {
          min-height: 46px;
          padding: 0 16px;
          border-radius: 16px;
          display: inline-flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: white;
          font-weight: 950;
          border: 1px solid rgba(255, 255, 255, .14);
        }

        .primary {
          background: linear-gradient(135deg, #2563eb, #06b6d4);
          box-shadow: 0 18px 46px rgba(37, 99, 235, .32);
        }

        .secondary {
          background: rgba(255, 255, 255, .09);
        }

        .ghost {
          color: #dbeafe;
          background: rgba(15, 23, 42, .35);
        }

        .primary:hover,
        .secondary:hover,
        .ghost:hover,
        .miniBtn:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, .24);
        }

        .identity {
          margin-top: 26px;
          width: fit-content;
          max-width: 100%;
          padding: 13px 15px;
          border-radius: 20px;
          background: rgba(15, 23, 42, .52);
          border: 1px solid rgba(255, 255, 255, .12);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
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
          background:
            linear-gradient(180deg, rgba(15, 23, 42, .72), rgba(15, 23, 42, .48)),
            rgba(15, 23, 42, .58);
          border: 1px solid rgba(255, 255, 255, .13);
          align-self: center;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
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

        .statusLine {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 16px;
          color: #99f6e4;
        }

        .statusLine small {
          color: #cbd5e1;
          font-weight: 800;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .metric,
        .panel {
          border-radius: 28px;
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
          grid-template-columns: minmax(0, 1.45fr) minmax(280px, .75fr);
          gap: 18px;
        }

        .panel {
          padding: 22px;
        }

        .panelHead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .miniBtn {
          min-height: 38px;
          flex: 0 0 auto;
          font-size: 13px;
          background: rgba(255, 255, 255, .08);
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
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--c) 18%, transparent), rgba(15, 23, 42, .72)),
            var(--a);
          border: 1px solid color-mix(in srgb, var(--c) 52%, transparent);
          color: white;
          text-decoration: none;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .planRow:hover,
        .subject:hover {
          box-shadow: 0 18px 45px rgba(0, 0, 0, .25);
          border-color: color-mix(in srgb, var(--c) 70%, white 12%);
        }

        .number {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, .12);
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
          color: #bae6fd;
          background: rgba(255, 255, 255, .09);
          border: 1px solid rgba(255, 255, 255, .12);
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
          background: rgba(15, 23, 42, .45);
          border: 1px solid rgba(255, 255, 255, .11);
        }

        .empty span {
          display: block;
          color: #cbd5e1;
          margin-top: 6px;
        }

        .subjects {
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        }

        .subject {
          grid-template-columns: 1fr auto;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, .08), transparent),
            var(--g);
        }

        @media (max-width: 1000px) {
          .hero,
          .mainGrid {
            grid-template-columns: 1fr;
          }

          .metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 18px 14px;
          }

          .shell {
            width: 100%;
          }

          .hero,
          .panel {
            border-radius: 24px;
          }

          .metrics,
          .subjects {
            grid-template-columns: 1fr;
          }

          .panelHead {
            display: grid;
          }

          h1 {
            font-size: 48px;
          }
        }
      `}</style>
    </main>
  )
}

function Metric({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <motion.div className="metric premium-card" variants={rise} whileHover={{ y: -3 }}>
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{desc}</small>
    </motion.div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  )
}
