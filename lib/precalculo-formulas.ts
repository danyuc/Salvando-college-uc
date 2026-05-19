export type FormulaItem = {
  title: string;
  formula: string;
  tip: string;
};

export function getFormulasForQuestion(question: any): FormulaItem[] {
  const text = `${question?.pregunta || ""} ${question?.tema || ""} ${question?.subtema || ""}`.toLowerCase();

  if (
    text.includes("sen") ||
    text.includes("seno") ||
    text.includes("cos") ||
    text.includes("tan") ||
    text.includes("tangente") ||
    text.includes("cuadrante") ||
    text.includes("trig")
  ) {
    return [
      {
        title: "Signos por cuadrante",
        formula: "QI: + + + · QII: sen + · QIII: tan + · QIV: cos +",
        tip: "Ejemplo: si t está en QIII, entonces sen(t)<0, cos(t)<0 y tan(t)>0.",
      },
      {
        title: "Identidad pitagórica",
        formula: "sen²(t) + cos²(t) = 1",
        tip: "Si sen(t)=-12/13, entonces cos²(t)=1-144/169=25/169, por eso |cos(t)|=5/13.",
      },
      {
        title: "Tangente",
        formula: "tan(t) = sen(t) / cos(t)",
        tip: "En QIII: tan(t)=(-12/13)/(-5/13)=12/5.",
      },
      {
        title: "Triángulos típicos",
        formula: "3-4-5 · 5-12-13 · 8-15-17",
        tip: "Si ves 12/13, casi siempre aparece el 5. Si ves 8/17, aparece el 15.",
      },
    ];
  }

  if (text.includes("distancia") || text.includes("punto") || text.includes("coordenada")) {
    return [
      {
        title: "Distancia entre dos puntos",
        formula: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
        tip: "Ejemplo: A(2,3), B(6,6). x1=2, y1=3, x2=6, y2=6. d=√(4²+3²)=5.",
      },
      {
        title: "Cambio horizontal",
        formula: "Δx = x₂ - x₁",
        tip: "No mezcles x con y. Primero resta las x.",
      },
      {
        title: "Cambio vertical",
        formula: "Δy = y₂ - y₁",
        tip: "Después resta las y. Luego recién elevas al cuadrado.",
      },
    ];
  }

  if (text.includes("recta") || text.includes("pendiente") || text.includes("lineal")) {
    return [
      {
        title: "Pendiente",
        formula: "m = (y₂ - y₁) / (x₂ - x₁)",
        tip: "Ejemplo: A(1,4), B(5,12). m=(12-4)/(5-1)=8/4=2.",
      },
      {
        title: "Ecuación de la recta",
        formula: "y = mx + b",
        tip: "m es la pendiente y b es el corte con el eje y.",
      },
      {
        title: "Forma punto-pendiente",
        formula: "y - y₁ = m(x - x₁)",
        tip: "Úsala cuando te dan un punto y la pendiente.",
      },
    ];
  }

  if (text.includes("log")) {
    return [
      {
        title: "Definición de logaritmo",
        formula: "log_b(a)=c ⇔ b^c=a",
        tip: "Ejemplo: log₂(32)=5 porque 2⁵=32.",
      },
      {
        title: "Producto",
        formula: "log(ab)=log(a)+log(b)",
        tip: "Ojo: log(a+b) NO se separa.",
      },
      {
        title: "Potencia",
        formula: "log(aⁿ)=nlog(a)",
        tip: "Sirve para bajar exponentes.",
      },
    ];
  }

  if (text.includes("función") || text.includes("funcion") || text.includes("dominio") || text.includes("recorrido")) {
    return [
      {
        title: "Dominio",
        formula: "valores permitidos de x",
        tip: "Revisa raíces pares, denominadores y logaritmos.",
      },
      {
        title: "Composición",
        formula: "(f ∘ g)(x) = f(g(x))",
        tip: "Primero resuelve g(x), después metes ese resultado en f.",
      },
    ];
  }

  return [
    {
      title: "Operaciones inversas",
      formula: "sumar ↔ restar · multiplicar ↔ dividir",
      tip: "Para despejar, aplica la operación contraria en ambos lados.",
    },
  ];
}
