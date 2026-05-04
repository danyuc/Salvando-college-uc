'use client'

import { useState } from "react"

type LessonStep = {
  title: string
  explanation: string
  equation?: string
  action?: string
  visual?: "move-left" | "divide" | "factor" | "sign-chart" | "result"
}

export default function MathLessonEngine({
  title = "Explicación paso a paso",
  steps = [],
}: {
  title?: string
  steps?: LessonStep[]
}) {
  const [i, setI] = useState(0)
  const step = steps[i]

  if (!steps.length) return null

  return (
    <section className="lesson">
      <div className="top">
        <div>
          <p>Modo profe</p>
          <h3>{title}</h3>
        </div>
        <span>{i + 1}/{steps.length}</span>
      </div>

      <div className="stage">
        <h4>{step.title}</h4>
        <p>{step.explanation}</p>

        {step.equation && (
          <div className={`equation ${step.visual || ""}`}>
            {step.equation}
          </div>
        )}

        {step.action && (
          <div className="action">
            ➜ {step.action}
          </div>
        )}
      </div>

      <div className="controls">
        <button onClick={() => setI(Math.max(0, i - 1))}>← Anterior</button>
        <button onClick={() => setI(Math.min(steps.length - 1, i + 1))}>Siguiente →</button>
      </div>

      <style jsx>{`
        .lesson {
          margin-top: 18px;
          padding: 18px;
          border-radius: 26px;
          background: radial-gradient(circle at top left, rgba(59,130,246,.22), transparent 35%), rgba(15,23,42,.86);
          border: 1px solid rgba(147,197,253,.35);
          box-shadow: 0 0 34px rgba(59,130,246,.18);
        }
        .top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .top p {
          margin: 0;
          color: #93c5fd;
          font-weight: 950;
          text-transform: uppercase;
          font-size: 12px;
        }
        .top h3 {
          margin: 4px 0 0;
          font-size: 22px;
        }
        .top span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
        }
        .stage {
          min-height: 210px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(2,6,23,.62);
          border: 1px solid rgba(255,255,255,.11);
        }
        h4 {
          margin: 0 0 8px;
          color: #bfdbfe;
          font-size: 20px;
        }
        .stage p {
          color: #e2e8f0;
          line-height: 1.6;
        }
        .equation {
          margin-top: 16px;
          padding: 18px;
          border-radius: 18px;
          background: rgba(255,255,255,.07);
          color: #fef3c7;
          font-size: clamp(24px, 5vw, 42px);
          font-weight: 950;
          letter-spacing: -.03em;
          text-align: center;
          border: 1px solid rgba(255,255,255,.12);
        }
        .move-left {
          animation: glowBlue .9s ease;
        }
        .divide {
          animation: glowGreen .9s ease;
        }
        .factor {
          animation: glowPurple .9s ease;
        }
        .sign-chart {
          animation: glowOrange .9s ease;
        }
        .result {
          animation: pop .8s ease;
          color: #bbf7d0;
        }
        .action {
          margin-top: 14px;
          padding: 13px;
          border-radius: 16px;
          background: rgba(37,99,235,.18);
          color: #dbeafe;
          font-weight: 950;
          border: 1px solid rgba(59,130,246,.35);
        }
        .controls {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          min-height: 46px;
          padding: 0 16px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.14);
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }
        @keyframes glowBlue {
          0% { box-shadow: 0 0 0 rgba(59,130,246,0); transform: translateY(5px); }
          50% { box-shadow: 0 0 34px rgba(59,130,246,.45); transform: translateY(0); }
          100% { box-shadow: 0 0 0 rgba(59,130,246,0); }
        }
        @keyframes glowGreen {
          0% { box-shadow: 0 0 0 rgba(34,197,94,0); transform: scale(.98); }
          50% { box-shadow: 0 0 34px rgba(34,197,94,.45); transform: scale(1.02); }
          100% { box-shadow: 0 0 0 rgba(34,197,94,0); transform: scale(1); }
        }
        @keyframes glowPurple {
          0% { box-shadow: 0 0 0 rgba(168,85,247,0); }
          50% { box-shadow: 0 0 34px rgba(168,85,247,.45); }
          100% { box-shadow: 0 0 0 rgba(168,85,247,0); }
        }
        @keyframes glowOrange {
          0% { box-shadow: 0 0 0 rgba(245,158,11,0); }
          50% { box-shadow: 0 0 34px rgba(245,158,11,.45); }
          100% { box-shadow: 0 0 0 rgba(245,158,11,0); }
        }
        @keyframes pop {
          0% { transform: scale(.92); opacity: .4; }
          70% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </section>
  )
}
