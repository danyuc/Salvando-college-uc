import { supabase } from './supabase'
import { safeDate } from '@/lib/utils/date'

export type DiagnosticStage = 'inicio' | 'medio' | 'final'

export type SubjectDiagnostic = {
  id: string
  user_id: string
  subject: string
  completed: boolean
  score: number | null
  weak_topics: string[]
  strong_topics: string[]
  diagnostic_result: any | null
  created_at: string | null
  updated_at: string | null
}

export async function getUserDiagnostics(userId: string) {
  const { data, error } = await supabase
    .from('subject_diagnostics')
    .select('*')
    .eq('user_id', userId)
    .order('subject', { ascending: true })

  if (error) {
    console.error('DIAGNOSTICS SELECT ERROR:', error)
    throw new Error('No se pudieron cargar los diagnósticos')
  }

  return (data ?? []) as SubjectDiagnostic[]
}

export async function getDiagnosticBySubject(
  userId: string,
  subject: string
) {
  const { data, error } = await supabase
    .from('subject_diagnostics')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .maybeSingle()

  if (error) {
    console.error('DIAGNOSTIC BY SUBJECT ERROR:', error)
    throw new Error('No se pudo cargar el diagnóstico de la asignatura')
  }

  return (data ?? null) as SubjectDiagnostic | null
}

export async function upsertDiagnostic(input: {
  user_id: string
  subject: string
  completed: boolean
  score?: number | null
  weak_topics?: string[]
  strong_topics?: string[]
  diagnostic_result?: any | null
}) {
  const payload = {
    ...input,
    weak_topics: input.weak_topics || [],
    strong_topics: input.strong_topics || [],
    diagnostic_result: input.diagnostic_result || null,
    updated_at: safeDate().toISOString(),
  }

  const { data, error } = await supabase
    .from('subject_diagnostics')
    .upsert(payload, {
      onConflict: 'user_id,subject',
    })
    .select()
    .single()

  if (error) {
    console.error('DIAGNOSTIC UPSERT ERROR:', error)
    throw new Error('No se pudo guardar el diagnóstico')
  }

  return data as SubjectDiagnostic
}
