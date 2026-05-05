export function getAdaptiveRecommendation(input: {
  errorType?: string
  feeling?: "facil" | "medio" | "dificil" | null
  subtema?: string
  correct?: boolean
}) {
  if (!input.correct && input.errorType === "signo") {
    return {
      mode: "refuerzo",
      focus: input.subtema || "signos",
      message: "Vamos a reforzar cambios de signo antes de subir dificultad.",
      explanationDepth: "detallada",
    }
  }

  if (!input.correct && input.errorType === "division") {
    return {
      mode: "refuerzo",
      focus: input.subtema || "despeje",
      message: "Necesitas practicar despeje cuando la x tiene coeficiente.",
      explanationDepth: "detallada",
    }
  }

  if (!input.correct && input.errorType === "distancia") {
    return {
      mode: "visual",
      focus: "distancia entre puntos",
      message: "Conviene practicar con gráfico y Δx/Δy visual.",
      explanationDepth: "visual",
    }
  }

  if (input.correct && input.feeling === "facil") {
    return {
      mode: "desafio",
      focus: input.subtema || "general",
      message: "Lo hiciste bien y fácil. Subimos dificultad.",
      explanationDepth: "simple",
    }
  }

  if (input.feeling === "dificil") {
    return {
      mode: "guiado",
      focus: input.subtema || "general",
      message: "Aunque avances, bajamos el ritmo y explicamos más.",
      explanationDepth: "detallada",
    }
  }

  return {
    mode: "normal",
    focus: input.subtema || "general",
    message: "Seguimos con práctica equilibrada.",
    explanationDepth: "normal",
  }
}
