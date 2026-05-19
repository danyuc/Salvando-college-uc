"use client";

import { useMemo, useState } from "react";

type Props = {
  question: any;
  answered?: boolean;
  correct?: boolean;
};

function detectTopic(q: any) {
  const t = `${q?.pregunta || ""} ${q?.subtema || ""} ${q?.tema || ""}`.toLowerCase();

  if (
    t.includes("sen") ||
    t.includes("seno") ||
    t.includes("cos") ||
    t.includes("tangente") ||
    t.includes("tan") ||
    t.includes("cuadrante") ||
    t.includes("trig")
  ) {
    return "trigonometria";
  }

  if (t.includes("inecu") || t.includes("signo")) return "signos";
  if (t.includes("distancia") || t.includes("punto")) return "plano";
  if (t.includes("factor")) return "factorizacion";
  if (t.includes("función") || t.includes("funcion")) return "funciones";

  return "algebra";
}

function stepsFromQuestion(question: any) {
  if (Array.isArray(question?.pasos) && question.pasos.length > 0) {
    return question.pasos.map((paso: any, index: number) => ({
      title: paso.titulo || `Paso ${index + 1}`,
      text: paso.explicacion || "Revisa este paso con calma.",
      expression: paso.expresion || "",
    }));
  }

  return null;
}

export default function ProMaxUCPanel({ question, answered, correct }: Props) {
  const [step, setStep] = useState(0);

  const topic = detectTopic(question);

  const lesson = useMemo(() => {
    const exactSteps = stepsFromQuestion(question);

    if (exactSteps) return exactSteps;

    if (topic === "trigonometria") {
      return [
        {
          title: "Leer el dato importante",
          text: "Antes de calcular, identifica el cuadrante y la razón trigonométrica que te entregan.",
          expression: question?.pregunta || "",
        },
        {
          title: "Signos por cuadrante",
          text: "QI: todo positivo. QII: seno positivo, coseno negativo, tangente negativa. QIII: seno negativo, coseno negativo, tangente positiva. QIV: seno negativo, coseno positivo, tangente negativa.",
          expression: "QIII → sen < 0, cos < 0, tan > 0",
        },
        {
          title: "Triángulo de referencia",
          text: "Si aparece 12/13, piensa en el triángulo 5-12-13. Si el seno es -12/13, el coseno tiene magnitud 5/13.",
          expression: "sen(t) = -12/13 → cos(t) = -5/13 en QIII",
        },
        {
          title: "Calcular tangente",
          text: "La tangente es seno dividido por coseno. Si ambos son negativos, el resultado queda positivo.",
          expression: "tan(t)=sen(t)/cos(t)=(-12/13)/(-5/13)=12/5",
        },
      ];
    }

    if (topic === "plano") {
      return [
        {
          title: "Ubicar datos",
          text: "Primero etiqueta x1, y1, x2, y2. No reemplaces hasta tener eso claro.",
          expression: "A(x1,y1), B(x2,y2)",
        },
        {
          title: "Cambio horizontal",
          text: "Calcula cuánto cambia x.",
          expression: "Δx = x2 - x1",
        },
        {
          title: "Cambio vertical",
          text: "Calcula cuánto cambia y.",
          expression: "Δy = y2 - y1",
        },
        {
          title: "Pitágoras",
          text: "La distancia es la hipotenusa.",
          expression: "d = √(Δx² + Δy²)",
        },
      ];
    }

    if (topic === "signos") {
      return [
        {
          title: "Puntos críticos",
          text: "Busca dónde la expresión vale 0 o no existe.",
          expression: "raíces y restricciones",
        },
        {
          title: "Intervalos",
          text: "Divide la recta real usando esos puntos.",
          expression: "(-∞,a), (a,b), (b,∞)",
        },
        {
          title: "Tabla de signos",
          text: "Prueba un valor dentro de cada intervalo.",
          expression: "+ / - / +",
        },
        {
          title: "Solución",
          text: "Elige los tramos que cumplen la desigualdad.",
          expression: "usa [ ] si incluye, usa ( ) si excluye",
        },
      ];
    }

    return [
      {
        title: "Objetivo",
        text: "Queremos dejar la incógnita sola o transformar la expresión.",
        expression: question?.pregunta || "",
      },
      {
        title: "Operación inversa",
        text: "Si algo suma, pasa restando. Si multiplica, pasa dividiendo.",
        expression: "mantén la igualdad",
      },
      {
        title: "Simplificar",
        text: "Calcula con orden y cuida signos.",
        expression: "paso a paso",
      },
      {
        title: "Resultado",
        text: "Verifica reemplazando o revisando si tiene sentido.",
        expression: "respuesta final",
      },
    ];
  }, [question, topic]);

  const current = lesson[Math.min(step, lesson.length - 1)];

  return (
    <section className="rounded-[2rem] border border-blue-400/30 bg-slate-950/70 p-6 text-white shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
            Modo Pro Max UC
          </p>

          <h3 className="mt-2 text-2xl font-black">{current.title}</h3>
        </div>

        <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-black text-blue-100">
          {step + 1}/{lesson.length}
        </span>
      </div>

      <div className="mt-5 rounded-3xl bg-slate-900 p-6 text-center">
        <p className="text-3xl font-black text-amber-100 md:text-5xl">
          {current.expression || "Paso guiado"}
        </p>
      </div>

      <p className="mt-5 text-base font-semibold leading-8 text-slate-100">
        {current.text}
      </p>

      {topic === "trigonometria" && (
        <div className="mt-5 grid gap-3 text-sm font-bold md:grid-cols-4">
          <div className="rounded-2xl bg-emerald-500/15 p-3">
            QI: sen +, cos +, tan +
          </div>
          <div className="rounded-2xl bg-yellow-500/15 p-3">
            QII: sen +, cos -, tan -
          </div>
          <div className="rounded-2xl bg-rose-500/15 p-3">
            QIII: sen -, cos -, tan +
          </div>
          <div className="rounded-2xl bg-violet-500/15 p-3">
            QIV: sen -, cos +, tan -
          </div>
        </div>
      )}

      {answered && (
        <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-semibold text-slate-100">
          {correct
            ? "Bien. Este tipo de ejercicio ya lo estás dominando."
            : "No pasa nada. El error más probable aquí es de signo o de identificar el cuadrante."}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/20"
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={() => setStep((value) => Math.min(lesson.length - 1, value + 1))}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-500"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
