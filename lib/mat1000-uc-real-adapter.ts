import { generateMat1000Practice, generateMat1000UCExam, type Mat1000Evaluation } from "./mat1000-uc-real-engine"
import { generatePracticeSet, generateQuestion } from "./precalculo-engine"

export function generateMat1000Session(input: {
  evaluation?: string
  mode?: string
  moduleLabel?: string
  subtema?: string
  cantidad?: number
}) {
  const evaluation = normalizeEvaluation(input.evaluation)
  const cantidad = Number(input.cantidad || 20)
  const subtema = normalizeAll(input.subtema) ? undefined : input.subtema
  const moduleLabel = normalizeAll(input.moduleLabel) ? undefined : input.moduleLabel

  try {
    const isExam =
      input.mode === "simulacion" ||
      input.mode === "examen" ||
      input.mode === "interrogacion" ||
      input.mode === "prueba_uc"

    const generated = isExam
      ? generateMat1000UCExam({
          evaluation,
          selectedModuleLabel: moduleLabel,
          selectedSubtema: subtema,
          includeAllExamModules: evaluation === "EXAMEN",
        })
      : generateMat1000Practice({
          evaluation,
          moduleLabel,
          subtema,
          cantidad,
        })

    if (Array.isArray(generated) && generated.length > 0) return generated
  } catch (error) {
    console.warn("MAT1000 UC engine fallback:", error)
  }

  try {
    const fallback = generatePracticeSet({
      cantidad,
      subtema: subtema || defaultSubtema(evaluation),
      dificultad: "media",
      origen: "prueba_real",
    } as any)

    if (Array.isArray(fallback) && fallback.length > 0) return fallback
  } catch {}

  return Array.from({ length: cantidad }).map(() =>
    generateQuestion({
      subtema: subtema || defaultSubtema(evaluation),
      dificultad: "media",
      origen: "prueba_real",
    })
  )
}

function normalizeEvaluation(value?: string): Mat1000Evaluation {
  if (value === "I1" || value === "I2" || value === "I3" || value === "EXAMEN") return value
  return "I1"
}

function normalizeAll(value?: string) {
  if (!value) return true
  const v = value.toLowerCase().trim()
  return v === "todos" || v === "todas" || v === "todo" || v === "all"
}

function defaultSubtema(evaluation: Mat1000Evaluation) {
  if (evaluation === "I1") return "Distancia entre puntos"
  if (evaluation === "I2") return "Dominio"
  if (evaluation === "I3") return "Razones trigonométricas"
  return "Polinomios"
}
