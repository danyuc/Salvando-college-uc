'use client'

import { useMemo, useState } from "react"

export default function GuidedSolutionDrawer({
  question,
}: {
  question: any
}) {
  const [open, setOpen] = useState(false)

  const content = useMemo(() => {
    const q = (question?.pregunta || "").toLowerCase()

    // =========================
    // DOMINIO CON RAÍZ
    // =========================
    if (q.includes("dominio") && q.includes("√")) {
      return {
        title: "Dominio de funciones con raíz",
        theory:
          "La expresión dentro de una raíz cuadrada debe ser mayor o igual a 0.",
        steps: [
          "Identificamos el interior de la raíz.",
          "Planteamos la condición ≥ 0.",
          "Resolviendo la inecuación obtenemos el dominio.",
        ],
      }
    }

    // =========================
    // LOGARITMOS
    // =========================
    if (q.includes("ln(") || q.includes("log")) {
      return {
        title: "Logaritmos naturales",
        theory:
          "El argumento de un logaritmo natural debe ser estrictamente positivo.",
        steps: [
          "Identificamos el argumento del logaritmo.",
          "Planteamos argumento > 0.",
          "Resolvemos la inecuación.",
          "Expresamos el dominio en intervalos.",
        ],
      }
    }

    // =========================
    // VALOR ABSOLUTO
    // =========================
    if (q.includes("|")) {
      return {
        title: "Valor absoluto",
        theory:
          "El valor absoluto representa distancia respecto del cero.",
        steps: [
          "Separar en casos positivos y negativos.",
          "Resolver cada ecuación.",
          "Verificar soluciones válidas.",
        ],
      }
    }

    // =========================
    // EXPONENCIALES
    // =========================
    if (q.includes("^")) {
      return {
        title: "Ecuaciones exponenciales",
        theory:
          "Buscamos expresar ambos lados con la misma base.",
        steps: [
          "Identificar potencias equivalentes.",
          "Igualar exponentes.",
          "Resolver la ecuación.",
        ],
      }
    }

    // =========================
    // DEFAULT
    // =========================
    return {
      title: "Resolución estratégica",
      theory:
        "Analiza cuidadosamente qué pide el ejercicio antes de operar.",
      steps: [
        "Identificar datos importantes.",
        "Detectar el tipo de problema.",
        "Aplicar la propiedad correcta.",
      ],
    }
  }, [question])

  return (
    <div className="guided-wrap">
      <button
        className="guided-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? "Ocultar ayuda estratégica" : "Ver fórmulas y tips necesarios"}
      </button>

      {open && (
        <div className="guided-content">
          <div className="guided-head">
            <span>🧠 MODO PRO MAX UC</span>
            <h3>{content.title}</h3>
          </div>

          <div className="theory">
            {content.theory}
          </div>

          <div className="steps">
            {content.steps.map((s, i) => (
              <div key={i} className="step">
                <div className="bubble">{i + 1}</div>
                <p>{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .guided-wrap{
          margin:24px 0;
        }

        .guided-toggle{
          width:100%;
          border:none;
          cursor:pointer;
          border-radius:18px;
          padding:18px;
          font-size:18px;
          font-weight:900;
          color:white;
          background:linear-gradient(135deg,#2563eb,#7c3aed);
        }

        .guided-content{
          margin-top:16px;
          border-radius:24px;
          padding:28px;
          background:rgba(15,23,42,.92);
          border:1px solid rgba(255,255,255,.08);
        }

        .guided-head span{
          color:#67e8f9;
          font-size:12px;
          font-weight:900;
          letter-spacing:.18em;
        }

        .guided-head h3{
          margin-top:10px;
          font-size:32px;
          font-weight:900;
          color:white;
        }

        .theory{
          margin-top:20px;
          padding:18px;
          border-radius:18px;
          background:rgba(255,255,255,.05);
          color:#cbd5e1;
          line-height:1.7;
          font-size:17px;
        }

        .steps{
          margin-top:24px;
          display:flex;
          flex-direction:column;
          gap:14px;
        }

        .step{
          display:flex;
          gap:14px;
          align-items:flex-start;
          padding:16px;
          border-radius:18px;
          background:rgba(255,255,255,.04);
        }

        .bubble{
          min-width:34px;
          height:34px;
          border-radius:999px;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:900;
          background:#2563eb;
          color:white;
        }

        .step p{
          color:#e2e8f0;
          line-height:1.6;
          margin:0;
        }
      `}</style>
    </div>
  )
}
