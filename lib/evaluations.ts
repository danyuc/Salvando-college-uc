import { supabase } from './supabase'

export type Evaluation = {
  id: string
  user_id: string
  title: string | null
  subject: string
  type: string
  number: number | null
  topic: string | null
  start_date: string
  end_date: string
  difficulty: 'baja' | 'media' | 'alta' | null
  estimated_minutes: number | null
  study_progress: number | null
  notes: string | null
  status: string | null
  grade: number | null
  weight_percent: number | null
  created_at: string | null
  updated_at: string | null
}

export type EvaluationInput = {
  id?: string
  user_id: string
  title?: string | null
  subject: string
  type: string
  number?: number | null
  topic?: string | null
  start_date: string
  end_date: string
  difficulty?: 'baja' | 'media' | 'alta' | null
  estimated_minutes?: number | null
  study_progress?: number | null
  notes?: string | null
  status?: string | null
  grade?: number | null
  weight_percent?: number | null
}

export async function getUserEvaluations(userId: string) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })
    .order('number', { ascending: true })

  if (error?.message) {
    console.error('EVALUATIONS SELECT ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudieron cargar las evaluaciones')
  }

  return (data ?? []) as Evaluation[]
}

export async function createEvaluation(input: EvaluationInput) {
  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('evaluations')
    .insert(payload)
    .select()
    .single()

  if (error?.message) {
    console.error('EVALUATIONS CREATE ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudo crear la evaluación')
  }

  return data as Evaluation
}

export async function updateEvaluation(id: string, input: Partial<EvaluationInput>) {
  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('evaluations')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error?.message) {
    console.error('EVALUATIONS UPDATE ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudo actualizar la evaluación')
  }

  return data as Evaluation
}

export async function upsertEvaluation(input: EvaluationInput) {
  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('evaluations')
    .upsert(payload)
    .select()
    .single()

  if (error?.message) {
    console.error('EVALUATIONS UPSERT ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudo guardar la evaluación')
  }

  return data as Evaluation
}

export async function deleteEvaluation(id: string) {
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', id)

  if (error?.message) {
    console.error('EVALUATIONS DELETE ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudo eliminar la evaluación')
  }
}