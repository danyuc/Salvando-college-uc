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
  grade?: number | null
}

function normalizeEvaluation(item: any): Evaluation {
  const startDate = item.start_date ?? item.date ?? null
  const endDate = item.end_date ?? startDate

  return {
    ...item,
    start_date: startDate,
    end_date: endDate,
    weight_percent:
      item.weight_percent === null || item.weight_percent === undefined
        ? null
        : Number(item.weight_percent),
    grade:
      item.grade === null || item.grade === undefined
        ? null
        : Number(item.grade),
  } as Evaluation
}

function cleanPayload(input: EvaluationInput) {
  const startDate = input.start_date ?? input.date ?? null
  const endDate = input.end_date ?? startDate

  return {
    user_id: input.user_id,
    subject: input.subject.trim(),
    type: input.type.trim(),
    number: input.number ?? null,
    topic: input.topic?.trim() || null,
    title: input.title?.trim() || null,
    start_date: startDate,
    end_date: endDate,
    difficulty: input.difficulty ?? 'media',
    notes: input.notes?.trim() || null,
    weight_percent:
      input.weight_percent === null || input.weight_percent === undefined
        ? null
        : Number(input.weight_percent),
    grade:
      input.grade === null || input.grade === undefined
        ? null
        : Number(input.grade),
  }
}

export async function getUserEvaluations(userId: string): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('EVALUATIONS SELECT ERROR:', error)
    throw new Error(error.message || 'No se pudieron cargar las evaluaciones')
  }

  return (data ?? [])
    .map(normalizeEvaluation)
    .sort((a: any, b: any) => {
      const da = a.start_date
        ? new Date(`${a.start_date}T00:00:00`).getTime()
        : Infinity

      const db = b.start_date
        ? new Date(`${b.start_date}T00:00:00`).getTime()
        : Infinity

      return da - db
    })
}

export async function createEvaluation(
  input: EvaluationInput
): Promise<Evaluation> {
  const payload = cleanPayload(input)

  const { data, error } = await supabase
    .from('evaluations')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('EVALUATION INSERT ERROR:', error)
    throw new Error(error.message || 'No se pudo crear la evaluación')
  }

  if (!data) {
    throw new Error('No se pudo crear la evaluación')
  }

  return normalizeEvaluation(data)
}

export async function bulkCreateEvaluations(
  items: EvaluationInput[]
): Promise<Evaluation[]> {
  if (!items.length) return []

  const payload = items.map(cleanPayload)

  const { data, error } = await supabase
    .from('evaluations')
    .insert(payload)
    .select()

  if (error) {
    console.error('EVALUATIONS BULK INSERT ERROR:', error)
    throw new Error(error.message || 'No se pudieron importar las evaluaciones')
  }

  return (data ?? []).map(normalizeEvaluation)
}

export async function updateEvaluation(
  id: string,
  updates: Partial<EvaluationInput>
): Promise<Evaluation> {
  const payload: any = { ...updates }

  if (updates.subject !== undefined) payload.subject = updates.subject.trim()
  if (updates.type !== undefined) payload.type = updates.type.trim()
  if (updates.topic !== undefined) payload.topic = updates.topic?.trim() || null
  if (updates.title !== undefined) payload.title = updates.title?.trim() || null
  if (updates.notes !== undefined) payload.notes = updates.notes?.trim() || null

  if (updates.start_date !== undefined || updates.date !== undefined) {
    const startDate = updates.start_date ?? updates.date ?? null
    payload.start_date = startDate
    payload.end_date = updates.end_date ?? startDate
  }

  if (updates.end_date !== undefined) payload.end_date = updates.end_date

  if (updates.weight_percent !== undefined) {
    payload.weight_percent =
      updates.weight_percent === null ? null : Number(updates.weight_percent)
  }

  if (updates.grade !== undefined) {
    payload.grade = updates.grade === null ? null : Number(updates.grade)
  }

  delete payload.date

  const { error } = await supabase
    .from('evaluations')
    .update(payload)
    .eq('id', id)

  if (error) {
    console.error('EVALUATION UPDATE ERROR:', error)
    throw new Error(error.message || 'No se pudo actualizar la evaluación')
  }

  return { id, ...payload } as unknown as Evaluation
}

export async function deleteEvaluation(id: string): Promise<void> {
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('EVALUATION DELETE ERROR:', error)
    throw new Error(error.message || 'No se pudo eliminar la evaluación')
  }
}

export type { Evaluation } from './types'