'use client'

import { useState } from "react"
import { getFormulasForQuestion } from "@/lib/precalculo-formulas"

export default function FormulaDrawer({ question }: { question: any }) {
  const [open, setOpen] = useState(false)
  const formulas = getFormulasForQuestion(question)

  return (
    <section className="drawer">
      <button className="toggle" onClick={() => setOpen(v => !v)}>
        {open ? "Ocultar fórmulas" : "Ver fórmulas y tips necesarios"}
      </button>

      {open && (
        <div className="content">
          {formulas.map((item, i) => (
            <article key={i} className="formula">
              <strong>{item.title}</strong>
              <code>{item.formula}</code>
              <p>{item.tip}</p>
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
          min-height: 50px;
          border-radius: 17px;
          border: 1px solid rgba(147,197,253,.28);
          background: linear-gradient(135deg,rgba(37,99,235,.24),rgba(124,58,237,.18));
          color: white;
          font-weight: 950;
          cursor: pointer;
        }

        .content {
          margin-top: 12px;
          display: grid;
          gap: 10px;
          animation: open .28s ease both;
        }

        .formula {
          padding: 14px;
          border-radius: 18px;
          background: rgba(15,23,42,.82);
          border: 1px solid rgba(255,255,255,.12);
        }

        .formula strong {
          display: block;
          color: #bfdbfe;
          margin-bottom: 8px;
        }

        code {
          display: block;
          padding: 12px;
          border-radius: 14px;
          background: rgba(2,6,23,.85);
          color: #fef3c7;
          font-weight: 950;
          font-size: 16px;
          overflow-x: auto;
        }

        p {
          margin: 9px 0 0;
          color: #e2e8f0;
          line-height: 1.5;
          font-weight: 800;
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
