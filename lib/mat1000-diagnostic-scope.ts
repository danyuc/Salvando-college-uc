export type Mat1000Evaluation = "I1" | "I2" | "I3" | "EXAMEN"

export const MAT1000_DIAGNOSTIC_SCOPE: Record<Mat1000Evaluation, string[]> = {
  I1: [
    "Distancia entre puntos",
    "Ecuación de la recta",
    "Rectas paralelas y perpendiculares",
    "Sistemas lineales 2x2",
    "Parábola y modelos cuadráticos",
    "Intervalos",
    "Inecuaciones lineales",
    "Inecuaciones cuadráticas",
    "Inecuaciones racionales",
    "Valor absoluto",
    "Modelamiento cuadrático",
  ],
  I2: [
    "Funciones por tramos",
    "Dominio",
    "Recorrido",
    "Transformaciones de funciones",
    "Composición de funciones",
    "Función inversa",
    "Función exponencial",
    "Función logarítmica",
    "Ecuaciones exponenciales",
    "Ecuaciones logarítmicas",
    "Modelamiento exponencial y logarítmico",
  ],
  I3: [
    "Razones trigonométricas",
    "Circunferencia unitaria",
    "Radianes",
    "Ángulos notables",
    "Identidades trigonométricas",
    "Funciones trigonométricas inversas",
    "Modelamiento trigonométrico",
  ],
  EXAMEN: [
    "Distancia entre puntos",
    "Ecuación de la recta",
    "Inecuaciones racionales",
    "Dominio",
    "Composición de funciones",
    "Función inversa",
    "Ecuaciones logarítmicas",
    "Identidades trigonométricas",
    "Polinomios",
    "Sucesiones geométricas",
    "Sumas finitas",
  ],
}

export function normalizeMat1000Evaluation(value?: string | null): Mat1000Evaluation {
  if (value === "I1" || value === "I2" || value === "I3" || value === "EXAMEN") return value
  return "I1"
}

export function getMat1000DiagnosticSubtemas(evaluation?: string | null) {
  return MAT1000_DIAGNOSTIC_SCOPE[normalizeMat1000Evaluation(evaluation)]
}
