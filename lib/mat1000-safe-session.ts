import { generateQuestion } from "./precalculo-engine"
import { resolveModuloIdFromLabel } from "./precalculo-ui-options"

const fallbackByEvaluation: Record<string, string[]> = {
  I1: [
    "Distancia entre puntos",
    "Ecuación de la recta",
    "Rectas paralelas y perpendiculares",
    "Sistemas lineales 2x2",
    "Parábola y modelos cuadráticos",
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
    "Composición de funciones",
    "Función inversa",
    "Ecuaciones exponenciales",
    "Ecuaciones logarítmicas",
    "Modelamiento exponencial y logarítmico",
  ],
  I3: [
    "Razones trigonométricas",
    "Circunferencia unitaria",
    "Ángulos notables",
    "Identidades trigonométricas",
    "Modelamiento trigonométrico",
  ],
  EXAMEN: [
    "Distancia entre puntos",
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

export function generateMat1000SafeSession(input: {
  evaluation?: string
  mode?: string
  moduleLabel?: string
  subtema?: string
  cantidad?: number
}) {
  const evaluation = normalizeEvaluation(input.evaluation)
  const cantidad = Number(input.cantidad || 20)

  const selectedSubtema =
    input.subtema && input.subtema !== "Todos"
      ? input.subtema
      : undefined

  const subtemas = selectedSubtema
    ? [selectedSubtema]
    : fallbackByEvaluation[evaluation]

  const isExam =
    input.mode === "simulacion" ||
    input.mode === "examen" ||
    input.mode === "interrogacion" ||
    input.mode === "prueba_uc"

  const target = isExam ? 13 : cantidad

  return Array.from({ length: target }).map((_, index) => {
    const subtema = subtemas[index % subtemas.length]

    return generateQuestion({
      modulo: resolveModuloIdFromLabel(input.moduleLabel || "Todos") as any,
      subtema,
      dificultad: index < 4 ? "media" : "alta",
      origen: "prueba_real",
    } as any)
  })
}

function normalizeEvaluation(value?: string) {
  if (value === "I1" || value === "I2" || value === "I3" || value === "EXAMEN") return value
  return "I1"
}
