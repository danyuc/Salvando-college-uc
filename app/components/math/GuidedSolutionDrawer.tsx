'use client'

import { useState } from "react"
import { getGuidedSolutionSteps } from "@/lib/math/uc-guided-solutions"

export default function GuidedSolutionDrawer({ question }: { question: any }) {
  const [open, setOpen] = useState(false)
  const steps = getGuidedSolutionSteps(question)

  return (
    <section className="drawer">
      <button type="button" className="toggle" onClick={() => setOpen(v => !v)}>
        {open ? "Ocultar desarrollo paso a paso" : "Ver desarrollo paso a paso"}
      </button>

      {open && (
        <div className="panel">
          {steps.map((step, index) => (
            <article key={index} className="step">
              <span>Paso {index + 1}</span>
              <h3>{step.title}</h3>
              <code>{step.expression}</code>
              <p>{step.explanation}</p>
            </article>
          ))}
        </div>
      )}

      <style jsx>{`
        .drawer {
          margin: 14px 0;
        }

        .toggle {
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          border: 1px solid rgba(147,197,253,.3);
          background: linear-gradient(135deg, rgba(37,99,235,.28), rgba(124,58,237,.24));
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        .panel {
          margin-top: 12px;
          display: grid;
          gap: 12px;
          animation: open .25s ease both;
        }

        .step {
          padding: 16px;
          border-radius: 20px;
          background: rgba(15,23,42,.86);
          border: 1px solid rgba(255,255,255,.12);
        }

        .step span {
          color: #67e8f9;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .step h3 {
          margin: 7px 0 10px;
          color: white;
          font-size: 18px;
        }

        code {
          display: block;
          padding: 14px;
          border-radius: 14px;
          background: rgba(2,6,23,.9);
          color: #fef3c7;
          font-size: 19px;
          font-weight: 950;
          overflow-x: auto;
        }

        p {
          margin: 10px 0 0;
          color: #dbeafe;
          line-height: 1.55;
          font-weight: 750;
        }

        @keyframes open {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
