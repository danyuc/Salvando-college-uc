'use client'

import { useMemo, useState } from "react"

type Props = {
  question: any
  answered?: boolean
  correct?: boolean
}

function detectTopic(q: any) {
  const t = `${q?.pregunta || ""} ${q?.subtema || ""}`.toLowerCase()
  if (t.includes("inecu") || t.includes("signo")) return "signos"
  if (t.includes("distancia") || t.includes("punto")) return "plano"
  if (t.includes("factor")) return "factorizacion"
  if (t.includes("función") || t.includes("funcion")) return "funciones"
  return "algebra"
}

export default function ProMaxUCPanel({ question, answered, correct }: Props) {
  const [step, setStep] = useState(0)
  const topic = detectTopic(question)

  const lesson = useMemo(() => {
    if (topic === "signos") {
      return [
        ["Puntos críticos", "Primero buscamos dónde la expresión vale 0 o no existe. Esos valores cortan la recta."],
        ["Intervalos", "Dividimos la recta en tramos y probamos un número dentro de cada tramo."],
        ["Signos", "Marcamos + o - según el resultado de cada tramo."],
        ["Solución", "Elegimos los intervalos que cumplen la desigualdad y usamos paréntesis/corchetes según corresponda."],
      ]
    }

    if (topic === "plano") {
      return [
        ["Ubicar puntos", "Marcamos A y B en el plano cartesiano."],
        ["Cambio horizontal", "Calculamos Δx = x₂ - x₁. Esto mide cuánto nos movemos a la derecha o izquierda."],
        ["Cambio vertical", "Calculamos Δy = y₂ - y₁. Esto mide cuánto subimos o bajamos."],
        ["Pitágoras", "La distancia es la hipotenusa: d = √(Δx² + Δy²)."],
      ]
    }

    if (topic === "factorizacion") {
      return [
        ["Reconocer estructura", "Buscamos si el ejercicio parece producto notable, trinomio o factor común."],
        ["Buscar números", "En trinomios buscamos dos números que multiplicados den el término final y sumados den el término del medio."],
        ["Armar paréntesis", "Reescribimos la expresión como multiplicación."],
        ["Verificar", "Multiplicamos de vuelta para comprobar que no inventamos factores."],
      ]
    }

    return [
      ["Objetivo", "Queremos dejar la incógnita sola o transformar la expresión a una forma más simple."],
      ["Operación inversa", "Si algo suma, pasa restando. Si multiplica, pasa dividiendo. Siempre manteniendo la igualdad."],
      ["Simplificar", "Calculamos con orden y cuidamos signos."],
      ["Resultado", "Verificamos reemplazando o revisando si tiene sentido."],
    ]
  }, [topic])

  const current = lesson[Math.min(step, lesson.length - 1)]

  return (
    <section className="panel">
      <div className="header">
        <div>
          <p>Modo Pro Max UC</p>
          <h3>{current[0]}</h3>
        </div>
        <span>{step + 1}/{lesson.length}</span>
      </div>

      <div className={`stage ${topic}`}>
        {topic === "signos" && <SignChart step={step} />}
        {topic === "plano" && <Plane step={step} />}
        {topic === "factorizacion" && <Factor step={step} />}
        {topic === "algebra" && <Algebra step={step} />}
      </div>

      <p className="explain">{current[1]}</p>

      {answered && (
        <div className={correct ? "result ok" : "result bad"}>
          {correct
            ? "Bien. El sistema subirá dificultad si mantienes este ritmo."
            : "No pasa nada. El sistema bajará un poco la dificultad y reforzará este tipo de error."}
        </div>
      )}

      <div className="controls">
        <button onClick={() => setStep(s => Math.max(0, s - 1))}>Anterior</button>
        <button onClick={() => setStep(s => Math.min(lesson.length - 1, s + 1))}>Siguiente</button>
      </div>

      <style jsx>{`
        .panel {
          margin-top: 18px;
          padding: 20px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 0% 0%, rgba(59,130,246,.28), transparent 34%),
            radial-gradient(circle at 100% 0%, rgba(168,85,247,.20), transparent 34%),
            rgba(15,23,42,.86);
          border: 1px solid rgba(147,197,253,.28);
          box-shadow: 0 0 0 1px rgba(96,165,250,.12), 0 30px 80px rgba(0,0,0,.35);
        }
        .header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .header p {
          margin: 0;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: .09em;
          text-transform: uppercase;
        }
        .header h3 {
          margin: 5px 0 0;
          font-size: 24px;
          letter-spacing: -.035em;
        }
        .header span {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          color: #bfdbfe;
          font-weight: 950;
        }
        .stage {
          margin-top: 16px;
          min-height: 230px;
          padding: 18px;
          border-radius: 24px;
          background: rgba(2,6,23,.55);
          border: 1px solid rgba(255,255,255,.11);
          display: grid;
          place-items: center;
          overflow: hidden;
        }
        .explain {
          color: #e2e8f0;
          line-height: 1.65;
          font-size: 16px;
        }
        .result {
          padding: 13px;
          border-radius: 17px;
          font-weight: 900;
          margin: 12px 0;
        }
        .ok { background: rgba(34,197,94,.16); color: #bbf7d0; }
        .bad { background: rgba(245,158,11,.16); color: #fde68a; }
        .controls {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          min-height: 46px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.14);
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          color: white;
          font-weight: 950;
          cursor: pointer;
        }
      `}</style>
    </section>
  )
}

function Algebra({ step }: { step: number }) {
  const rows = [
    ["10 + 2x", "30", "El 10 está sumando."],
    ["2x", "30 - 10", "El 10 pasa restando."],
    ["2x", "20", "Simplificamos 30 - 10."],
    ["x", "10", "Dividimos por 2."],
  ]
  const r = rows[Math.min(step, rows.length - 1)]

  return (
    <div className="algebra">
      <div className="eq">
        <span className={step === 1 ? "move" : ""}>{r[0]}</span>
        <b>=</b>
        <span>{r[1]}</span>
      </div>
      <p>{r[2]}</p>
      <style jsx>{`
        .algebra { text-align:center; }
        .eq {
          display:flex;
          align-items:center;
          justify-content:center;
          gap:18px;
          font-size:clamp(30px,7vw,58px);
          font-weight:950;
          color:#fef3c7;
        }
        .move { animation: moveTerm .9s ease; }
        p { color:#bfdbfe; font-weight:900; }
        @keyframes moveTerm {
          0% { transform:translateX(0); color:#fef3c7; }
          45% { transform:translateX(80px); color:#f87171; }
          100% { transform:translateX(0); color:#fef3c7; }
        }
      `}</style>
    </div>
  )
}

function SignChart({ step }: { step: number }) {
  return (
    <div className="chart">
      <div className="line">
        <span>-∞</span><b className={step >= 0 ? "hot" : ""}>8</b><b className={step >= 0 ? "hot" : ""}>17</b><span>∞</span>
      </div>
      <div className="signs">
        <span className={step >= 1 ? "pos active" : "pos"}>+</span>
        <span className={step >= 2 ? "neg active" : "neg"}>-</span>
        <span className={step >= 3 ? "pos active" : "pos"}>+</span>
      </div>
      <p>{step >= 3 ? "Solución: intervalos positivos" : "Construyendo tabla de signos..."}</p>
      <style jsx>{`
        .chart { width:min(520px,100%); text-align:center; }
        .line,.signs { display:flex; justify-content:space-between; align-items:center; }
        .line { border-bottom:3px solid #e2e8f0; padding-bottom:12px; font-weight:950; }
        .hot { color:#facc15; animation:pulse .8s ease; }
        .signs span { font-size:42px; font-weight:950; opacity:.35; }
        .active { opacity:1!important; transform:scale(1.22); transition:.35s; }
        .pos { color:#22c55e; }
        .neg { color:#ef4444; }
        p { color:#bfdbfe; font-weight:900; }
        @keyframes pulse { 50% { transform:scale(1.25); } }
      `}</style>
    </div>
  )
}

function Plane({ step }: { step: number }) {
  return (
    <div className="plane">
      <div className="axis x" /><div className="axis y" />
      <div className="point a">A</div>
      {step >= 1 && <div className="point b">B</div>}
      {step >= 2 && <div className="dx">Δx</div>}
      {step >= 3 && <div className="dy">Δy</div>}
      <style jsx>{`
        .plane {
          position:relative;
          width:min(520px,100%);
          height:260px;
          border-radius:22px;
          background:
            linear-gradient(rgba(148,163,184,.13) 1px,transparent 1px),
            linear-gradient(90deg,rgba(148,163,184,.13) 1px,transparent 1px);
          background-size:28px 28px;
        }
        .axis { position:absolute; background:#e2e8f0; opacity:.8; }
        .x { left:5%; right:5%; top:50%; height:2px; }
        .y { top:5%; bottom:5%; left:50%; width:2px; }
        .point {
          position:absolute;
          width:24px; height:24px;
          border-radius:999px;
          display:grid; place-items:center;
          font-weight:950;
          background:#38bdf8;
          box-shadow:0 0 24px rgba(56,189,248,.9);
          animation:pop .45s ease;
        }
        .a { left:30%; top:35%; }
        .b { left:68%; top:66%; background:#22c55e; box-shadow:0 0 24px rgba(34,197,94,.9); }
        .dx { position:absolute; left:31%; top:38%; width:37%; border-top:5px solid #facc15; color:#fef3c7; font-weight:950; animation:draw .8s ease; }
        .dy { position:absolute; left:68%; top:39%; height:28%; border-left:5px solid #f97316; color:#fed7aa; font-weight:950; animation:drawY .8s ease; }
        @keyframes pop { from{transform:scale(.4);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes draw { from{width:0} }
        @keyframes drawY { from{height:0} }
      `}</style>
    </div>
  )
}

function Factor({ step }: { step: number }) {
  const rows = [
    "x² + 6x + 9",
    "buscamos dos números: 3 y 3",
    "3 · 3 = 9 y 3 + 3 = 6",
    "(x + 3)(x + 3)",
  ]
  return (
    <div className="factor">
      <strong>{rows[Math.min(step, rows.length - 1)]}</strong>
      <style jsx>{`
        .factor strong {
          display:block;
          font-size:clamp(28px,7vw,54px);
          color:#e9d5ff;
          text-align:center;
          animation:glow .8s ease;
        }
        @keyframes glow {
          50% { text-shadow:0 0 34px rgba(168,85,247,.9); transform:scale(1.04); }
        }
      `}</style>
    </div>
  )
}
