import { supabase } from './supabase'

export type Question = {
  id: string
  asignatura: string | null
  tema: string
  subtema: string
  tipo: 'seleccion_multiple' | 'desarrollo'
  dificultad: 'facil' | 'media' | 'alta'
  pregunta: string
  opciones: string[] | null
  respuesta_correcta: 'A' | 'B' | 'C' | 'D' | null
  explicacion: string | null
  respuesta_esperada?: string | null
  criterios_evaluacion?: string[] | null
  nivel_cognitivo?: string | null
  referencia_autor?: string | null
  error_comun?: string | null
  tags?: string[] | null
  fuente?: string | null
}

export async function getSubjects() {
  const { data, error } = await supabase
    .from('questions')
    .select('asignatura')
    .not('asignatura', 'is', null)

  if (error) throw error

  return Array.from(
    new Set((data ?? []).map((item) => item.asignatura).filter(Boolean))
  )
}

export async function getPracticeQuestions({
  asignatura,
  tema,
  dificultad,
  limit = 20,
}: {
  asignatura?: string
  tema?: string
  dificultad?: string
  limit?: number
}) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('tipo', 'seleccion_multiple')
    .limit(limit)

  if (asignatura) query = query.eq('asignatura', asignatura)
  if (tema) query = query.eq('tema', tema)
  if (dificultad) query = query.eq('dificultad', dificultad)

  const { data, error } = await query

  if (error) throw error

  return (data ?? []) as Question[]
}

export async function getDiagnosticQuestions({
  asignatura,
  limit = 20,
}: {
  asignatura?: string
  limit?: number
}) {
  let query = supabase
    .from('questions')
    .select('*')
    .eq('nivel_cognitivo', 'diagnostico')
    .limit(limit)

  if (asignatura) query = query.eq('asignatura', asignatura)

  const { data, error } = await query

  if (error) throw error

  return (data ?? []) as Question[]
}

export async function getTopics(asignatura?: string) {
  let query = supabase
    .from('questions')
    .select('tema')
    .not('tema', 'is', null)

  if (asignatura) query = query.eq('asignatura', asignatura)

  const { data, error } = await query

  if (error) throw error

  return Array.from(
    new Set((data ?? []).map((item) => item.tema).filter(Boolean))
  )
}