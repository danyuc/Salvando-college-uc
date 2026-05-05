export function nextStep(profile: any) {
  // fatiga → bajar dificultad
  if (profile.fatigue > 0.6) {
    return {
      difficulty: "easy",
      explanation: "detailed",
      mode: "guiado"
    }
  }

  // nivel bajo
  if (profile.level === "bajo") {
    return {
      difficulty: "easy",
      explanation: "step-by-step",
      focus: profile.weakTopics[0]
    }
  }

  // nivel medio
  if (profile.level === "medio") {
    return {
      difficulty: "medium",
      mix: true
    }
  }

  // nivel alto
  return {
    difficulty: "hard",
    traps: true,
    examMode: true
  }
}
