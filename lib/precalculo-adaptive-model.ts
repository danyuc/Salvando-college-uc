export type Nivel = "bajo" | "medio" | "alto"
export type Difficulty = "baja" | "media" | "alta"

export type AttemptLike = {
  subtema: string
  correct: boolean
  time?: number
  dificultad?: string
}

export type AdaptiveModelResult = {
  nivel: Nivel
  accuracy: number
  debilidades: string[]
  fortalezas: string[]
  dificultadSiguiente: Difficulty
  subtemaSiguiente: string
  recomendacion: string
}

export function buildPrecalculoAdaptiveModel(
  attempts: AttemptLike[]
): AdaptiveModelResult {
  if (!attempts.length) {
    return {
      nivel: "bajo",
      accuracy: 0,
      debilidades: ["Distancia entre puntos"],
      fortalezas: [],
      dificultadSiguiente: "baja",
      subtemaSiguiente: "Distancia entre puntos",
      recomendacion: "Comienza con ejercicios guiados de distancia entre puntos.",
    }
  }

  const correctas = attempts.filter(a => a.correct).length
  const accuracy = correctas / attempts.length

  const stats = new Map<string, { total: number; correct: number }>()

  for (const a of attempts) {
    const current = stats.get(a.subtema) ?? { total: 0, correct: 0 }
    current.total += 1
    if (a.correct) current.correct += 1
    stats.set(a.subtema, current)
  }

  const debilidades: string[] = []
  const fortalezas: string[] = []

  for (const [subtema, data] of stats.entries()) {
    const ratio = data.correct / data.total
    if (ratio < 0.6) debilidades.push(subtema)
    if (ratio >= 0.85 && data.total >= 2) fortalezas.push(subtema)
  }

  const lastThreeFails = attempts.slice(-3).filter(a => !a.correct).length

  const nivel: Nivel =
    accuracy < 0.5 ? "bajo" :
    accuracy < 0.8 ? "medio" :
    "alto"

  const dificultadSiguiente: Difficulty =
    lastThreeFails >= 2 ? "baja" :
    nivel === "alto" ? "alta" :
    nivel === "medio" ? "media" :
    "baja"

  const subtemaSiguiente = debilidades[0] || attempts.at(-1)?.subtema || "Distancia entre puntos"

  return {
    nivel,
    accuracy: Number((accuracy * 100).toFixed(1)),
    debilidades,
    fortalezas,
    dificultadSiguiente,
    subtemaSiguiente,
    recomendacion:
      debilidades.length > 0
        ? `Refuerza ${debilidades[0]} antes de subir dificultad.`
        : "Puedes avanzar a ejercicios más desafiantes.",
  }
}
