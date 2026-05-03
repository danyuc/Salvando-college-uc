import { generateMat1000Practice, generateMat1000UCExam, type Mat1000Evaluation } from "./mat1000-uc-real-engine"

export function generateMat1000Session(input: {
  evaluation?: string
  mode?: string
  moduleLabel?: string
  subtema?: string
  cantidad?: number
}) {
  const evaluation = normalizeEvaluation(input.evaluation)

  if (input.mode === "simulacion" || input.mode === "examen" || input.mode === "interrogacion") {
    return generateMat1000UCExam({
      evaluation,
      selectedModuleLabel: input.moduleLabel,
      selectedSubtema: input.subtema,
      includeAllExamModules: evaluation === "EXAMEN",
    })
  }

  return generateMat1000Practice({
    evaluation,
    moduleLabel: input.moduleLabel,
    subtema: input.subtema,
    cantidad: input.cantidad || 20,
  })
}

function normalizeEvaluation(value?: string): Mat1000Evaluation {
  if (value === "I1" || value === "I2" || value === "I3" || value === "EXAMEN") return value
  return "I1"
}
