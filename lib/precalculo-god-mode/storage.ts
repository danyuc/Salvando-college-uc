import type { UserSkillState } from "./personalization"

const KEY = "mat1000-user-skill-state"

export function getSkillState(): UserSkillState[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function registerPracticeResult(input: {
  subtema: string
  correct: boolean
  seconds: number
  confidence?: "baja" | "media" | "alta"
}) {
  const current = getSkillState()
  const found = current.find(s => s.subtema === input.subtema)

  if (found) {
    found.correctas += input.correct ? 1 : 0
    found.incorrectas += input.correct ? 0 : 1
    found.tiempoPromedio = Math.round((found.tiempoPromedio + input.seconds) / 2)
    found.confianza = input.confidence || found.confianza
  } else {
    current.push({
      subtema: input.subtema,
      correctas: input.correct ? 1 : 0,
      incorrectas: input.correct ? 0 : 1,
      tiempoPromedio: input.seconds,
      confianza: input.confidence || "media",
    })
  }

  localStorage.setItem(KEY, JSON.stringify(current))
}
