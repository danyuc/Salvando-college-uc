export function improveExplanation(question: any) {
  const text = `${question?.pregunta || ""} ${question?.subtema || ""}`.toLowerCase()

  if (text.includes("distancia") || text.includes("puntos")) {
    return {
      concept: "La distancia entre dos puntos se entiende como la hipotenusa de un triángulo rectángulo.",
      why: "No basta mirar solo una coordenada: hay cambio horizontal y vertical al mismo tiempo.",
      trap: "Error típico: restar solo las x o solo las y, o olvidar elevar al cuadrado.",
      checklist: [
        "Identificar A(x₁,y₁) y B(x₂,y₂)",
        "Calcular Δx = x₂ - x₁",
        "Calcular Δy = y₂ - y₁",
        "Aplicar d = √(Δx² + Δy²)",
      ],
    }
  }

  if (text.includes("ecuación") || text.includes("ecuacion") || text.includes("despej")) {
    return {
      concept: "Resolver una ecuación significa dejar la incógnita sola.",
      why: "Cada paso usa una operación inversa: suma con resta, multiplicación con división.",
      trap: "Error típico: mover un término sin cambiar el signo o dividir solo un lado.",
      checklist: [
        "Identificar qué está sumando/restando",
        "Aplicar la operación inversa en ambos lados",
        "Simplificar con orden",
        "Dividir si la x tiene coeficiente",
      ],
    }
  }

  if (text.includes("inecu") || text.includes("intervalo") || text.includes("signo")) {
    return {
      concept: "Una inecuación busca tramos donde una expresión cumple una condición.",
      why: "Los puntos críticos dividen la recta en zonas donde el signo se mantiene.",
      trap: "Error típico: incluir valores donde el denominador vale cero.",
      checklist: [
        "Encontrar ceros y restricciones",
        "Separar intervalos",
        "Probar signos",
        "Elegir intervalos según >, <, ≥ o ≤",
      ],
    }
  }

  if (text.includes("factor")) {
    return {
      concept: "Factorizar es reescribir una expresión como multiplicación.",
      why: "Sirve para ver raíces, simplificar o resolver ecuaciones más rápido.",
      trap: "Error típico: elegir números que multiplican bien pero no suman el coeficiente correcto.",
      checklist: [
        "Reconocer el tipo de expresión",
        "Buscar factor común o producto notable",
        "Comprobar multiplicando de vuelta",
      ],
    }
  }

  return {
    concept: "Primero hay que reconocer el tipo de problema.",
    why: "El método correcto depende del patrón matemático, no solo de operar rápido.",
    trap: "Error típico: aplicar una fórmula sin revisar condiciones.",
    checklist: [
      "Leer datos",
      "Identificar objetivo",
      "Elegir método",
      "Verificar resultado",
    ],
  }
}
