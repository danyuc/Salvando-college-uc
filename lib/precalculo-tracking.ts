import { supabase } from "./supabase"
import type { PrecalculoQuestion } from "./precalculo-engine"

export async function savePrecalculoAttempt(input: {
  userId: string
  question: PrecalculoQuestion
  respuestaUsuario: string
  esCorrecta: boolean
  tiempoRespuesta: number
  usoPista?: boolean
  errorDetectado?: string | null
}) {
  const { question } = input

  const { data, error } = await supabase
    .from("precalculo_attempts")
    .insert({
      user_id: input.userId,
      question_id: `${question.modulo}-${question.subtema}-${Date.now()}`,
      modulo: question.modulo,
      unidad: question.unidad,
      subtema: question.subtema,
      evaluacion: question.evaluaciones[0] ?? "EXAMEN",
      dificultad: question.dificultad,
      tipo: question.tipo,
      respuesta_usuario: input.respuestaUsuario,
      respuesta_correcta: question.respuesta_correcta,
      es_correcta: input.esCorrecta,
      tiempo_respuesta: input.tiempoRespuesta,
      uso_pista: input.usoPista ?? false,
      error_detectado: input.errorDetectado ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error("SAVE PRECALCULO ATTEMPT ERROR:", error)
    throw new Error("No se pudo guardar el intento de Precálculo")
  }

  return data
}

export async function getPrecalculoAttempts(userId: string) {
  const { data, error } = await supabase
    .from("precalculo_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1000)

  if (error) {
    console.error("GET PRECALCULO ATTEMPTS ERROR:", error)
    throw new Error("No se pudieron cargar los intentos de Precálculo")
  }

  return data ?? []
}
