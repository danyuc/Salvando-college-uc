import { supabase } from './supabase'

export type StudySummary = {
  id: string
  user_id: string
  subject: string
  unit: string | null
  topic: string | null
  reading_title: string | null
  reading_authors: string | null
  evaluation_target: string | null
  mode: string | null
  source_text: string | null
  summary: string
  created_at: string | null
}

export async function getStudySummaries(userId: string) {
  const { data, error } = await supabase
    .from('study_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []) as StudySummary[]
}

export async function createStudySummary(input: {
  user_id: string
  subject: string
  unit?: string | null
  topic?: string | null
  reading_title?: string | null
  reading_authors?: string | null
  evaluation_target?: string | null
  mode?: string | null
  source_text?: string | null
  summary: string
}) {
  const { data, error } = await supabase
    .from('study_summaries')
    .insert(input)
    .select()
    .single()

  if (error) throw error

  return data as StudySummary
}

export async function deleteStudySummary(id: string) {
  const { error } = await supabase
    .from('study_summaries')
    .delete()
    .eq('id', id)

  if (error) throw error
}