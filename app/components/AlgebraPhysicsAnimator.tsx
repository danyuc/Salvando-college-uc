'use client'

import { useMemo, useState } from "react"

type AlgebraPhysicsAnimatorProps = {
  variant?: "linear" | "generic"
}

export default function AlgebraPhysicsAnimator({ variant = "linear" }: AlgebraPhysicsAnimatorProps) {
  const [step, setStep] = useState(0)

  const steps = useMemo(() => {
    if (variant === "linear") {
      return [
        {
          title: "Ecuación inicial",
          explanation: "Queremos dejar la x sola. Primero observamos qué términos están molestando.",
          left: ["10", "+", "2x"],
          right: ["30"],
          moving: "",
          operation: "",
        },
        {
          title: "El 10 pasa restando",
          explanation: "Como el 10 está sumando, usamos la operación contraria: restar 10 en ambos lados.",
          left: ["10", "+", "2x"],
          right: ["30", "-10"],
          moving: "10",
          operation: "−10",
        },
        {
          title: "Cancelamos el 10",
          explanation: "El +10 y el −10 se anulan en el lado izquierdo. Al otro lado queda 30 − 10.",
          left: ["2x"],
          right: ["30", "-10"],
          moving: "",
          operation: "10 − 10 = 0",
        },
        {
          title: "Simplificamos",
          explanation: "Calculamos 30 − 10 = 20.",
          left: ["2x"],
          right: ["20"],
          moving: "",
          operation: "30 − 10 = 20",
        },
        {
          title: "El 2 pasa dividiendo",
          explanation: "El 2 multiplica a la x, entonces dividimos ambos lados por 2.",
          left: ["2x", "÷2"],
          right: ["20", "÷2"],
          moving: "2",
          operation: "÷2",
        },
        {
          title: "Resultado final",
          explanation: "2x dividido por 2 deja x. 20 dividido por 2 es 10.",
          left: ["x"],
          right: ["10"],
          moving: "",
          operation: "x = 10",
        },
      ]
    }

    return [
      {
        title: "Paso algebraico",
        explanation: "Transformamos la expresión usando operaciones inversas.",
        left: ["expresión"],
        right: ["resultado"],
        moving: "",
        operation: "",
      },
    ]
  }, [variant])

  const current = steps[Math.min(step, steps.length - 1)]

  return (
    <section className="physics">
      <div className="head">
        <div>
          <p>Animación algebra real</p>
          <h3>{current.title}</h3>
        </div>
        <span>{step + 1}/{steps.length}</span>
      </div>

      <div className="board">
        <div className="side leftSide">
          {current.left.map((term, i) => (
            <span
              key={`${term}-${i}-${step}`}
              className={[
                "term",
                term === "10" && step >= 2 ? "cancel" : "",
                term.includes("÷") ? "divide" : "",
              ].join(" ")}
            >
              {term}
            </span>
          ))}
        </div>

        <div className="equal">=</div>

        <div className="side rightSide">
          {current.right.map((term, i) => (
            <span
              key={`${term}-${i}-${step}`}
              className={[
                "term",
                term === "-10" ? "arrive" : "",
                term.includes("÷") ? "divide" : "",
              ].join(" ")}
            >
              {term}
            </span>
          ))}
        </div>

        {current.moving && (
          <div key={`moving-${step}`} className="flying">
            {current.operation || current.moving}
          </div>
        )}
      </div>

      <div className="explain">
        <strong>{current.operation || "Observa el cambio"}</strong>
        <p>{current.explanation}</p>
      </div>

      <div className="controls">
        <button onClick={() => setStep(v => Math.max(0, v - 1))}>Anterior</button>
        <button onClick={() => setStep(v => Math.min(steps.length - 1, v + 1))}>Siguiente paso</button>
      </div>

      <style jsx>{`
        .physics {
          margin-top: 18px;
          padding: 18px;
          border-radius: 30px;
          background:
            radial-gradient(circle at top left, rgba(59,130,246,.24), transparent 34%),
            radial-gradient(circle at top right, rgba(168,85,247,.20), transparent 34%),
            rgba(15,23,42,.88);
          border: 1px solid rgba(147,197,253,.28);
          box-shadow: 0 30px 90px rgba(0,0,0,.34);
          contain: layout paint;
        }

        .head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .head p {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .head h3 {
          margin: 4px 0 0;
          font-size: 22px;
          letter-spacing: -.04em;
        }

        .head span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
        }

        .board {
          position: relative;
          min-height: 230px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 18px;
          padding: 22px;
          border-radius: 26px;
          background:
            linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px),
            rgba(2,6,23,.62);
          background-size: 26px 26px;
          border: 1px solid rgba(255,255,255,.12);
          overflow: hidden;
        }

        .side {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          min-height: 88px;
        }

        .equal {
          font-size: clamp(34px, 6vw, 60px);
          font-weight: 950;
          color: #f8fafc;
          opacity: .9;
        }

        .term {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 64px;
          min-height: 58px;
          padding: 0 14px;
          border-radius: 18px;
          font-size: clamp(25px, 5vw, 46px);
          font-weight: 950;
          color: #fef3c7;
          background: rgba(255,255,255,.075);
          border: 1px solid rgba(255,255,255,.13);
          box-shadow: 0 18px 38px rgba(0,0,0,.22);
          animation: termIn .55s cubic-bezier(.2,1.25,.2,1) both;
          will-change: transform, opacity;
        }

        .term.arrive {
          color: #fecaca;
          border-color: rgba(248,113,113,.55);
          background: rgba(239,68,68,.14);
          animation: arrive .75s cubic-bezier(.2,1.25,.2,1) both;
        }

        .term.cancel {
          opacity: .45;
        }

        .term.cancel::after {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          top: 50%;
          height: 5px;
          border-radius: 999px;
          background: #ef4444;
          transform: rotate(-12deg) scaleX(0);
          transform-origin: left;
          animation: strike .45s ease forwards;
        }

        .term.divide {
          color: #bbf7d0;
          border-color: rgba(34,197,94,.45);
          background: rgba(34,197,94,.13);
          animation: dividePop .65s ease both;
        }

        .flying {
          position: absolute;
          left: 31%;
          top: 22%;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(239,68,68,.18);
          border: 1px solid rgba(248,113,113,.45);
          color: #fecaca;
          font-weight: 950;
          font-size: 22px;
          box-shadow: 0 0 30px rgba(248,113,113,.35);
          animation: flyAcross 1.05s cubic-bezier(.2,.9,.2,1) both;
          pointer-events: none;
          z-index: 10;
        }

        .explain {
          margin-top: 14px;
          padding: 15px;
          border-radius: 22px;
          background: rgba(2,6,23,.52);
          border: 1px solid rgba(255,255,255,.10);
        }

        .explain strong {
          display: block;
          color: #bfdbfe;
          margin-bottom: 6px;
          font-weight: 950;
        }

        .explain p {
          margin: 0;
          color: #e2e8f0;
          line-height: 1.65;
          font-weight: 780;
        }

        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        button {
          min-height: 46px;
          padding: 0 15px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(255,255,255,.08);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        button:last-child {
          background: linear-gradient(135deg,#2563eb,#7c3aed);
        }

        @keyframes termIn {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(.88);
            filter: blur(7px);
          }
          70% {
            opacity: 1;
            transform: translateY(-3px) scale(1.04);
            filter: blur(0);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes arrive {
          0% {
            opacity: 0;
            transform: translateX(-120px) translateY(-35px) scale(.82);
            filter: blur(6px);
          }
          70% {
            opacity: 1;
            transform: translateX(8px) translateY(0) scale(1.08);
            filter: blur(0);
          }
          100% {
            transform: translateX(0) translateY(0) scale(1);
          }
        }

        @keyframes strike {
          to {
            transform: rotate(-12deg) scaleX(1);
          }
        }

        @keyframes dividePop {
          0% {
            transform: translateY(-14px) scale(.92);
            opacity: 0;
          }
          70% {
            transform: translateY(3px) scale(1.08);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }

        @keyframes flyAcross {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) scale(.8);
          }
          20% {
            opacity: 1;
          }
          70% {
            opacity: 1;
            transform: translateX(210px) translateY(40px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateX(250px) translateY(52px) scale(.92);
          }
        }

        @media(max-width: 700px) {
          .board {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .equal {
            text-align: center;
          }

          .flying {
            left: 18%;
          }
        }
      `}</style>
    </section>
  )
}
