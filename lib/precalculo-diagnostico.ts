export type DiagnosticoNivel = "bajo" | "medio" | "alto"
export type DiagnosticoDificultad = "baja" | "media" | "alta"

export type DiagnosticoAttempt = {
  subtema?: string
  correct?: boolean
  time?: number
  dificultad?: string
  error_detectado?: string | null
  uso_pista?: boolean
}

export type DiagnosticoProMax = {
  nivel: DiagnosticoNivel
  accuracy: number
  total_preguntas: number
  debilidades: string[]
  fortalezas: string[]
  error_frecuente: string
  recomendacion: string
  siguiente_practica: {
    modulo: string
    subtema: string
    dificultad: DiagnosticoDificultad
  }
  ruta_estudio: Array<{
    orden: number
    subtema: string
    objetivo: string
    dificultad: DiagnosticoDificultad
    duracion_minutos: number
  }>
}

const DEFAULT_SUBTEMA = "Distancia entre puntos"

function normalizeSubtema(value: unknown) {
  return String(value || DEFAULT_SUBTEMA).trim() || DEFAULT_SUBTEMA
}

function inferError(attempt: DiagnosticoAttempt) {
  if (attempt.error_detectado) return attempt.error_detectado
  if (attempt.uso_pista && attempt.correct) return "procedimental"
  if (!attempt.correct && Number(attempt.time || 0) < 8000) return "interpretacion"
  if (!attempt.correct && Number(attempt.time || 0) > 45000) return "conceptual"
  if (!attempt.correct) return "algebraico"
  return "ninguno"
}

export function generarDiagnostico(attempts: DiagnosticoAttempt[]): DiagnosticoProMax {
  const clean = attempts.map(a => ({
    ...a,
    subtema: normalizeSubtema(a.subtema),
    correct: Boolean(a.correct),
    time: Number(a.time || 0),
  }))

  const total = clean.length
  const correctas = clean.filter(a => a.correct).length
  const accuracy = total ? correctas / total : 0

  const nivel: DiagnosticoNivel =
    accuracy >= 0.8 ? "alto" :
    accuracy >= 0.55 ? "medio" :
    "bajo"

  const stats = new Map<string, { total: number; correct: number; tiempo: number }>()
  const errores = new Map<string, number>()

  for (const a of clean) {
    const subtema = normalizeSubtema(a.subtema)
    const prev = stats.get(subtema) || { total: 0, correct: 0, tiempo: 0 }

    prev.total += 1
    prev.correct += a.correct ? 1 : 0
    prev.tiempo += Number(a.time || 0)

    stats.set(subtema, prev)

    const error = inferError(a)
    if (error !== "ninguno") errores.set(error, (errores.get(error) || 0) + 1)
  }

  const debilidades: string[] = []
  const fortalezas: string[] = []

  for (const [subtema, data] of stats.entries()) {
    const ratio = data.correct / data.total
    const avgTime = data.tiempo / data.total

    if (ratio < 0.65 || avgTime > 50000) debilidades.push(subtema)
    if (ratio >= 0.85 && data.total >= 2) fortalezas.push(subtema)
  }

  const error_frecuente =
    [...errores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
    (accuracy < 0.55 ? "conceptual" : "algebraico")

  const principal = debilidades[0] || DEFAULT_SUBTEMA

  const dificultad: DiagnosticoDificultad =
    nivel === "alto" && debilidades.length === 0 ? "alta" :
    nivel === "medio" ? "media" :
    "baja"

  return {
    nivel,
    accuracy: Number((accuracy * 100).toFixed(1)),
    total_preguntas: total,
    debilidades,
    fortalezas,
    error_frecuente,
    recomendacion:
      total < 10
        ? "El diagnóstico tiene pocas preguntas. Repite un diagnóstico completo de mínimo 10 preguntas para una medición confiable."
        : debilidades.length > 0
          ? `Refuerza ${principal} antes de avanzar a ejercicios más difíciles.`
          : "Buen desempeño general. Puedes subir dificultad y practicar preguntas tipo prueba real.",
    siguiente_practica: {
      modulo: "modulo_1",
      subtema: principal,
      dificultad,
    },
    ruta_estudio: [
      {
        orden: 1,
        subtema: principal,
        objetivo: "Reforzar el procedimiento base y corregir errores frecuentes.",
        dificultad: "baja",
        duracion_minutos: 12,
      },
      {
        orden: 2,
        subtema: principal,
        objetivo: "Resolver ejercicios guiados con explicación paso a paso.",
        dificultad: "media",
        duracion_minutos: 18,
      },
      {
        orden: 3,
        subtema: fortalezas[0] || principal,
        objetivo: "Aplicar el contenido en formato tipo interrogación UC.",
        dificultad: nivel === "alto" ? "alta" : "media",
        duracion_minutos: 20,
      },
    ],
  }
}
