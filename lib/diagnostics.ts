import { supabase } from './supabase'

export type DiagnosticStage = 'inicio' | 'medio' | 'final' | 'completed'

export type SubjectDiagnostic = {
  id?: string
  user_id: string
  subject: string
  completed?: boolean
  score_percent?: number
  score?: number
  correct_answers?: number
  total_questions?: number
  weak_topics?: string[]
  strong_topics?: string[]
  diagnostic_result?: any | null
  stage?: DiagnosticStage | string
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export async function getDiagnosticBySubject(userId: string, subject: string) {
  const { data, error } = await supabase
    .from('subject_diagnostics')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .maybeSingle()

  if (error) {
    console.error('GET DIAGNOSTIC ERROR:', error)
    return null
  }

  return data as SubjectDiagnostic | null
}

export async function upsertDiagnostic(input: SubjectDiagnostic) {
  const payload = {
    user_id: input.user_id,
    subject: input.subject,
    completed: input.completed ?? true,
    score_percent: Number(input.score_percent ?? input.score ?? 0),
    correct_answers: Number(input.correct_answers ?? 0),
    total_questions: Number(input.total_questions ?? 0),
    weak_topics: input.weak_topics ?? [],
    strong_topics: input.strong_topics ?? [],
    diagnostic_result: input.diagnostic_result ?? null,
    stage: input.stage ?? 'completed',
    completed_at: input.completed_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('subject_diagnostics')
    .upsert(payload, {
      onConflict: 'user_id,subject',
    })
    .select('*')
    .single()

  if (error) {
    console.error('UPSERT DIAGNOSTIC ERROR REAL:', JSON.stringify(error, null, 2))
    throw error
  }

  return data as SubjectDiagnostic
}
