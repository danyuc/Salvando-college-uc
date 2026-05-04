'use client'

type Props = {
  remaining: number
  total: number
  currentIndex: number
  totalQuestions: number
  mode: string
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export default function PracticeTimerPro({
  remaining,
  total,
  currentIndex,
  totalQuestions,
  mode,
}: Props) {
  const progress = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 100
  const avg = totalQuestions > 0 ? Math.floor(total / totalQuestions) : 0
  const idealRemaining = avg * Math.max(0, totalQuestions - currentIndex)
  const behind = remaining < idealRemaining * 0.88
  const ahead = remaining > idealRemaining * 1.15

  return (
    <section className={`timer ${behind ? "behind" : ahead ? "ahead" : ""}`}>
      <div className="top">
        <div>
          <p>Tiempo restante</p>
          <strong>{formatTime(remaining)}</strong>
        </div>

        <div>
          <p>Promedio sugerido</p>
          <strong>{avg ? formatTime(avg) : "—"}</strong>
        </div>

        <div>
          <p>Pregunta</p>
          <strong>{currentIndex + 1}/{totalQuestions || "—"}</strong>
        </div>
      </div>

      <div className="bar">
        <span style={{ width: `${progress}%` }} />
      </div>

      <p className="hint">
        {mode === "simulacion"
          ? "Modo Prueba UC: administra tiempo, deja margen para revisar hoja y desarrollo."
          : behind
            ? "Vas bajo el ritmo ideal. Resuelve, marca y avanza."
            : ahead
              ? "Vas con buen margen. Puedes revisar un poco más."
              : "Vas dentro del ritmo esperado."}
      </p>

      <style jsx>{`
        .timer {
          padding: 16px;
          border-radius: 24px;
          background: rgba(15,23,42,.72);
          border: 1px solid rgba(255,255,255,.12);
          box-shadow: 0 20px 55px rgba(0,0,0,.22);
        }

        .timer.behind {
          border-color: rgba(245,158,11,.55);
          box-shadow: 0 0 24px rgba(245,158,11,.20);
        }

        .timer.ahead {
          border-color: rgba(34,197,94,.48);
          box-shadow: 0 0 24px rgba(34,197,94,.18);
        }

        .top {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        p {
          margin: 0;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 900;
        }

        strong {
          display: block;
          margin-top: 5px;
          font-size: 24px;
          color: white;
        }

        .bar {
          height: 9px;
          margin-top: 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          overflow: hidden;
        }

        .bar span {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg,#22c55e,#3b82f6,#a855f7);
          transition: width .4s ease;
        }

        .hint {
          margin-top: 10px;
          color: #bfdbfe;
        }

        @media(max-width: 760px) {
          .top {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
