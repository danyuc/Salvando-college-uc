import { supabase } from './supabase'

export type EvaluationDifficulty = 'baja' | 'media' | 'alta'

export type Evaluation = {
  id: string
  user_id: string
  subject: string
  type: string
  number: number | null
  topic: string | null
  title?: string | null
  start_date: string
  end_date: string
  difficulty: EvaluationDifficulty
  notes: string | null
  weight_percent?: number | null
  grade?: number | null
  created_at?: string | null
}

export type EvaluationInput = {
  user_id: string
  subject: string
  type: string
  number?: number | null
  topic?: string | null
  title?: string | null
  start_date: string
  end_date: string
  difficulty?: EvaluationDifficulty
  notes?: string | null
  weight_percent?: number | null
  grade?: number | null
}

export async function getUserEvaluations(userId: string): Promise<Evaluation[]> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('EVALUATIONS SELECT ERROR:', error)
    throw new Error('No se pudieron cargar las evaluaciones')
  }

  return (data ?? []) as Evaluation[]
}

export async function createEvaluation(input: EvaluationInput): Promise<Evaluation> {
  const payload = {
    ...input,
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

  const payload = items.map((item) => ({
    ...item,
    difficulty: item.difficulty ?? 'media',
    notes: item.notes ?? null,
    number: item.number ?? null,
    topic: item.topic ?? null,
    title: item.title ?? null,
    weight_percent: item.weight_percent ?? null,
    grade: item.grade ?? null,
  }))

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
  const payload = {
    ...updates,
  }

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
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('EVALUATION DELETE ERROR:', error)
    throw new Error('No se pudo eliminar la evaluación')
  }
}