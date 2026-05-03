import { buildPrecalculoAdaptiveModel } from "./precalculo-adaptive-model"

export type Diagnostico = {
  nivel: "bajo" | "medio" | "alto"
  debilidades: string[]
  fortalezas: string[]
  error_frecuente: string
  recomendacion: string
  siguiente_practica: {
    modulo: string
    subtema: string
    dificultad: "baja" | "media" | "alta"
  }
}

export function generarDiagnostico(attempts: any[]): Diagnostico {
  const model = buildPrecalculoAdaptiveModel(
    attempts.map(a => ({
      subtema: a.subtema || "Distancia entre puntos",
      correct: Boolean(a.correct),
      time: a.time,
      dificultad: a.dificultad,
    }))
  )

  return {
    nivel: model.nivel,
    debilidades: model.debilidades,
    fortalezas: model.fortalezas,
    error_frecuente: model.accuracy < 50 ? "conceptual" : "algebraico",
    recomendacion: model.recomendacion,
    siguiente_practica: {
      modulo: "modulo_1",
      subtema: model.subtemaSiguiente,
      dificultad: model.dificultadSiguiente,
    },
  }
}
