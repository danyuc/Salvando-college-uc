export type UserSkillState = {
  subtema: string
  correctas: number
  incorrectas: number
  tiempoPromedio: number
  confianza: "baja" | "media" | "alta"
}

export type PracticeDecision = {
  nextMode: "refuerzo" | "normal" | "desafio" | "preprueba"
  explanationDepth: "simple" | "normal" | "detallada"
  shouldShowHint: boolean
  focusSubtema: string
  reason: string
}

export function decideNextPractice(state: UserSkillState[]): PracticeDecision {
  const weak = [...state].sort((a, b) => {
    const ar = a.incorrectas - a.correctas
    const br = b.incorrectas - b.correctas
    return br - ar
  })[0]

  if (!weak) {
    return {
      nextMode: "normal",
      explanationDepth: "normal",
      shouldShowHint: false,
      focusSubtema: "general",
      reason: "Aún no hay suficiente información del usuario.",
    }
  }

  const total = weak.correctas + weak.incorrectas
  const accuracy = total > 0 ? weak.correctas / total : 0

  if (accuracy < 0.45 || weak.confianza === "baja") {
    return {
      nextMode: "refuerzo",
      explanationDepth: "detallada",
      shouldShowHint: true,
      focusSubtema: weak.subtema,
      reason: `Conviene reforzar ${weak.subtema} con explicación paso a paso.`,
    }
  }

  if (accuracy > 0.8 && weak.confianza === "alta") {
    return {
      nextMode: "desafio",
      explanationDepth: "simple",
      shouldShowHint: false,
      focusSubtema: weak.subtema,
      reason: `Ya domina ${weak.subtema}; conviene subir dificultad.`,
    }
  }

  return {
    nextMode: "normal",
    explanationDepth: "normal",
    shouldShowHint: false,
    focusSubtema: weak.subtema,
    reason: `Debe seguir practicando ${weak.subtema} con dificultad media.`,
  }
}
