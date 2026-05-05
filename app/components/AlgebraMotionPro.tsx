'use client'

import { useEffect, useState } from "react"

type MotionStep = {
  equation: string
  highlight?: string
  explanation: string
  operation?: string
}

export default function AlgebraMotionPro({ steps }: { steps: MotionStep[] }) {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(false)

  const step = steps[Math.min(active, steps.length - 1)]

  useEffect(() => {
    if (!auto) return

    const timer = window.setTimeout(() => {
      setActive((prev) => {
        if (prev >= steps.length - 1) {
          setAuto(false)
          return prev
        }
        return prev + 1
      })
    }, 1800)

    return () => window.clearTimeout(timer)
  }, [auto, active, steps.length])

  if (!steps.length) return null

  return (
    <section className="motion">
      <div className="screen">
        <div key={active} className="equation">
          {step.equation}
        </div>

        {step.operation && (
          <div key={`op-${active}`} className="operation">
            {step.operation}
          </div>
        )}
      </div>

      <p>{step.explanation}</p>

      <div className="controls">
        <button onClick={() => setActive((v) => Math.max(0, v - 1))}>Anterior</button>
        <button onClick={() => setAuto((v) => !v)}>
          {auto ? "Pausar" : "Animar"}
        </button>
        <button onClick={() => setActive((v) => Math.min(steps.length - 1, v + 1))}>Siguiente</button>
      </div>

      <style jsx>{`
        .motion {
          margin-top: 18px;
          padding: 18px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 0% 0%, rgba(59,130,246,.25), transparent 35%),
            rgba(15,23,42,.86);
          border: 1px solid rgba(147,197,253,.28);
          box-shadow: 0 28px 80px rgba(0,0,0,.32);
        }

        .screen {
          min-height: 170px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          background: rgba(2,6,23,.65);
          border: 1px solid rgba(255,255,255,.12);
          overflow: hidden;
        }

        .equation {
          font-size: clamp(32px, 7vw, 64px);
          font-weight: 950;
          color: #fef3c7;
          letter-spacing: -.05em;
          animation: equationMove .8s cubic-bezier(.2,1.2,.2,1) both;
        }

        .operation {
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 999px;
          color: #bfdbfe;
          background: rgba(59,130,246,.18);
          border: 1px solid rgba(147,197,253,.25);
          font-weight: 950;
          animation: operationPop .55s ease both;
        }

        p {
          color: #e2e8f0;
          line-height: 1.65;
          font-weight: 850;
        }

        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        button {
          min-height: 44px;
          padding: 0 14px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        button:nth-child(2) {
          background: linear-gradient(135deg,#2563eb,#7c3aed);
        }

        @keyframes equationMove {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(.92);
            filter: blur(8px);
          }
          55% {
            opacity: 1;
            transform: translateY(-4px) scale(1.04);
            filter: blur(0);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes operationPop {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </section>
  )
}
