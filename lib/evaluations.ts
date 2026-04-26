import type { Evaluation } from './types'
import { supabase } from './supabase'

export type EvaluationDifficulty = 'baja' | 'media' | 'alta'

export type EvaluationInput = {
  user_id: string
  subject: string
  type: string
  number?: number | null
  topic?: string | null
  title?: string | null
  start_date?: string | null
  end_date?: string | null
  date?: string | null
  difficulty?: EvaluationDifficulty
  notes?: string | null
  weight_percent?: number | null
  weight?: number | null
  grade?: number | null
}

export async function getUserEvaluations(userId: string): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('EVALUATIONS SELECT ERROR:', error)
    throw new Error('No se pudieron cargar las evaluaciones')
  }

  const normalized = (data ?? []).map((item: any) => ({
    ...item,
    start_date: item.start_date ?? item.date ?? null,
    end_date: item.end_date ?? item.start_date ?? item.date ?? null,
    weight_percent:
      item.weight_percent ??
      (typeof item.weight === 'number' ? item.weight * 100 : null),
  }))

  return normalized.sort((a: any, b: any) => {
    const da = a.start_date ? new Date(`${a.start_date}T00:00:00`).getTime() : Infinity
    const db = b.start_date ? new Date(`${b.start_date}T00:00:00`).getTime() : Infinity
    return da - db
  }) as Evaluation[]
}

export async function createEvaluation(input: EvaluationInput): Promise<Evaluation> {
  const start = input.start_date ?? input.date ?? null
  const end = input.end_date ?? start

  const payload = {
    ...input,
    start_date: start,
    end_date: end,
    difficulty: input.difficulty ?? 'media',
    notes: input.notes ?? null,
    number: input.number ?? null,
    topic: input.topic ?? null,
    title: input.title ?? null,
    weight_percent: input.weight_percent ?? null,
    grade: input.grade ?? null,
  }

  const { data, error } = await supabase
    .from('evaluations')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('EVALUATION INSERT ERROR:', error)
    throw new Error('No se pudo crear la evaluación')
  }

  return data as Evaluation
}

export async function bulkCreateEvaluations(
  items: EvaluationInput[]
): Promise<Evaluation[]> {
  if (!items.length) return []

  const payload = items.map((item) => {
    const start = item.start_date ?? item.date ?? null
    const end = item.end_date ?? start

    return {
      ...item,
      start_date: start,
      end_date: end,
      difficulty: item.difficulty ?? 'media',
      notes: item.notes ?? null,
      number: item.number ?? null,
      topic: item.topic ?? null,
      title: item.title ?? null,
      weight_percent: item.weight_percent ?? null,
      grade: item.grade ?? null,
    }
  })

  const { data, error } = await supabase
    .from('evaluations')
    .insert(payload)
    .select()

  if (error) {
    console.error('EVALUATIONS BULK INSERT ERROR:', error)
    throw new Error('No se pudieron importar las evaluaciones')
  }

  return (data ?? []) as Evaluation[]
}

export async function updateEvaluation(
  id: string,
  updates: Partial<EvaluationInput>
): Promise<Evaluation> {
  const start = updates.start_date ?? updates.date
  const payload: any = { ...updates }

  if (start) payload.start_date = start
  if (updates.end_date || start) payload.end_date = updates.end_date ?? start

  const { data, error } = await supabase
    .from('evaluations')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('EVALUATION UPDATE ERROR:', error)
    throw new Error('No se pudo actualizar la evaluación')
  }

  return data as Evaluation
}

export async function deleteEvaluation(id: string): Promise<void> {
  const { error } = await supabase.from('evaluations').delete().eq('id', id)

  if (error) {
    console.error('EVALUATION DELETE ERROR:', error)
    throw new Error('No se pudo eliminar la evaluación')
  }
}

export type { Evaluation } from './types'