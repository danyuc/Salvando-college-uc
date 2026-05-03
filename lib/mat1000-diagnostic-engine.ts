export type DiagnosticAttempt = {
  subtema: string
  correct: boolean
  selected?: string
  correctAnswer?: string
  tiempoMs?: number
  usoPista?: boolean
}

export function analyzeMat1000Diagnostic(attempts: DiagnosticAttempt[], evaluation: string) {
  const bySubtema = new Map<string, { total: number; correct: number; fails: number }>()

  for (const a of attempts) {
    const prev = bySubtema.get(a.subtema) || { total: 0, correct: 0, fails: 0 }
    prev.total += 1
    prev.correct += a.correct ? 1 : 0
    prev.fails += a.correct ? 0 : 1
    bySubtema.set(a.subtema, prev)
  }

  const total = attempts.length
  const correct = attempts.filter(a => a.correct).length
  const accuracy = total ? Math.round((correct / total) * 100) : 0

  const debilidades = [...bySubtema.entries()]
    .filter(([, s]) => s.correct / s.total < 0.65)
    .sort((a, b) => b[1].fails - a[1].fails)
    .map(([subtema]) => subtema)

  const fortalezas = [...bySubtema.entries()]
    .filter(([, s]) => s.correct / s.total >= 0.8)
    .map(([subtema]) => subtema)

  const principal = debilidades[0] || null

  return {
    evaluation,
    nivel: accuracy >= 80 ? "alto" : accuracy >= 55 ? "medio" : "bajo",
    accuracy,
    debilidades,
    fortalezas,
    error_frecuente: inferError(debilidades),
    recomendacion: principal
      ? `Estás débil en ${principal}. Antes de avanzar, practica ejercicios guiados de ese subtema.`
      : "Buen desempeño general. Puedes subir dificultad o hacer modo Prueba UC real.",
    siguiente_practica: {
      evaluacion: evaluation,
      subtema: principal || defaultSubtema(evaluation),
      dificultad: accuracy < 55 ? "baja" : accuracy < 80 ? "media" : "alta",
    },
  }
}

function inferError(debilidades: string[]) {
  const raw = debilidades.join(" ").toLowerCase()
  if (raw.includes("inecuaciones") || raw.includes("valor absoluto")) return "procedimental"
  if (raw.includes("dominio") || raw.includes("recorrido")) return "conceptual"
  if (raw.includes("recta") || raw.includes("distancia")) return "algebraico"
  if (raw.includes("trigonom")) return "grafico"
  return "conceptual"
}

function defaultSubtema(evaluation: string) {
  if (evaluation === "I1") return "Inecuaciones racionales"
  if (evaluation === "I2") return "Dominio"
  if (evaluation === "I3") return "Identidades trigonométricas"
  return "Polinomios"
}
