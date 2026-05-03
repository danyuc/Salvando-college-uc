import { generateMat1000SafeSession } from "./mat1000-safe-session"

export function generateMat1000FullMode(input: {
  evaluation?: string
  mode?: string
  moduleLabel?: string
  subtema?: string
  cantidad?: number
}) {
  const mode = input.mode || "practica"

  if (mode === "diagnostico") {
    return generateMat1000SafeSession({
      evaluation: input.evaluation,
      mode: "practica",
      moduleLabel: "Todos",
      subtema: "Todos",
      cantidad: 12,
    })
  }

  if (mode === "simulacion" || mode === "examen" || mode === "interrogacion" || mode === "prueba_uc") {
    return generateMat1000SafeSession({
      evaluation: input.evaluation,
      mode: "simulacion",
      moduleLabel: input.moduleLabel || "Todos",
      subtema: input.subtema || "Todos",
      cantidad: 13,
    })
  }

  return generateMat1000SafeSession({
    evaluation: input.evaluation,
    mode: "practica",
    moduleLabel: input.moduleLabel || "Todos",
    subtema: input.subtema || "Todos",
    cantidad: input.cantidad || 20,
  })
}
