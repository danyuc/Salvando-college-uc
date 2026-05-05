export type FormulaItem = {
  title: string
  formula: string
  tip: string
}

export function getFormulasForQuestion(question: any): FormulaItem[] {
  const text = `${question?.pregunta || ""} ${question?.subtema || ""}`.toLowerCase()

  if (text.includes("distancia") || text.includes("punto") || text.includes("coordenada")) {
    return [
      {
        title: "Distancia entre dos puntos",
        formula: "d = √((x₂ - x₁)² + (y₂ - y₁)²)",
        tip: "Calcula primero Δx y Δy. Después eleva ambos al cuadrado y recién ahí suma.",
      },
      {
        title: "Cambio horizontal",
        formula: "Δx = x₂ - x₁",
        tip: "Respeta el orden de los puntos. Si te equivocas en signos, al cuadrado se corrige, pero el desarrollo puede confundirte.",
      },
      {
        title: "Cambio vertical",
        formula: "Δy = y₂ - y₁",
        tip: "No mezcles coordenadas x con coordenadas y.",
      },
    ]
  }

  if (text.includes("recta") || text.includes("pendiente") || text.includes("lineal")) {
    return [
      {
        title: "Pendiente",
        formula: "m = (y₂ - y₁) / (x₂ - x₁)",
        tip: "La pendiente mide cuánto cambia y por cada cambio en x.",
      },
      {
        title: "Ecuación de la recta",
        formula: "y = mx + b",
        tip: "m es la pendiente y b es donde la recta corta el eje y.",
      },
      {
        title: "Forma punto-pendiente",
        formula: "y - y₁ = m(x - x₁)",
        tip: "Úsala cuando te dan un punto y la pendiente.",
      },
    ]
  }

  if (text.includes("cuadrática") || text.includes("cuadratica") || text.includes("parábola") || text.includes("parabola")) {
    return [
      {
        title: "Fórmula general cuadrática",
        formula: "x = (-b ± √(b² - 4ac)) / 2a",
        tip: "Primero identifica a, b y c. El error típico es olvidar el signo de b.",
      },
      {
        title: "Discriminante",
        formula: "Δ = b² - 4ac",
        tip: "Si Δ > 0 hay dos soluciones reales; si Δ = 0 hay una; si Δ < 0 no hay reales.",
      },
      {
        title: "Vértice",
        formula: "xᵥ = -b / 2a",
        tip: "Sirve para ubicar el mínimo o máximo de la parábola.",
      },
    ]
  }

  if (text.includes("factor") || text.includes("trinomio") || text.includes("producto notable")) {
    return [
      {
        title: "Cuadrado de binomio",
        formula: "(a + b)² = a² + 2ab + b²",
        tip: "No olvides el término del medio: 2ab.",
      },
      {
        title: "Diferencia de cuadrados",
        formula: "a² - b² = (a - b)(a + b)",
        tip: "Solo funciona si hay resta entre dos cuadrados.",
      },
      {
        title: "Trinomio simple",
        formula: "x² + bx + c = (x + m)(x + n)",
        tip: "Busca m y n tales que m·n = c y m+n = b.",
      },
    ]
  }

  if (text.includes("inecu") || text.includes("intervalo") || text.includes("signo")) {
    return [
      {
        title: "Tabla de signos",
        formula: "puntos críticos → intervalos → signos → solución",
        tip: "No incluyas valores que anulan el denominador.",
      },
      {
        title: "Regla de extremos",
        formula: "corchete [ ] incluye · paréntesis ( ) excluye",
        tip: "Si hay denominador cero, siempre se excluye.",
      },
    ]
  }

  if (text.includes("función") || text.includes("funcion") || text.includes("dominio") || text.includes("recorrido")) {
    return [
      {
        title: "Dominio",
        formula: "valores permitidos de x",
        tip: "Revisa raíces pares, denominadores y logaritmos.",
      },
      {
        title: "Recorrido",
        formula: "valores posibles de y",
        tip: "Mira la gráfica o transforma la función para ver mínimos y máximos.",
      },
      {
        title: "Composición",
        formula: "(f ∘ g)(x) = f(g(x))",
        tip: "Primero resuelve g(x), después mete ese resultado dentro de f.",
      },
    ]
  }

  return [
    {
      title: "Operaciones inversas",
      formula: "sumar ↔ restar · multiplicar ↔ dividir",
      tip: "Para despejar, siempre aplica la operación contraria en ambos lados.",
    },
  ]
}
