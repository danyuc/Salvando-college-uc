import { supabase } from '@/lib/supabase'

export type Evaluation = {
  id: string
  user_id: string

  subject: string
  type: 'control' | 'prueba' | 'examen' | 'tarea' | 'otro'

  title?: string | null
  topic?: string | null

  number?: number | null
  difficulty?: 'facil' | 'media' | 'dificil'
  notes?: string | null

  grade?: number | null
  weight_percent: number

  start_date?: string | null
  end_date?: string | null

  estimated?: boolean
  trend_weight?: number
}

// =========================
// CREATE
// =========================
export async function createEvaluation(input: Evaluation) {
  const { data, error } = await supabase
    .from('evaluations')
    .insert(input)
    .select('*')
    .single()

  if (error) throw error
  return data
}

// =========================
// BULK
// =========================
export async function bulkCreateEvaluations(items: Evaluation[]) {
  const { data, error } = await supabase
    .from('evaluations')
    .insert(items)

  if (error) throw error
  return data
}

// =========================
// GET
// =========================
export async function getUserEvaluations(userId: string) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

// =========================
// UPDATE
// =========================
export async function updateEvaluation(id: string, updates: Partial<Evaluation>) {
  const { data, error } = await supabase
    .from('evaluations')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

// =========================
// DELETE
// =========================
export async function deleteEvaluation(id: string) {
  const { error } = await supabase
    .from('evaluations')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
