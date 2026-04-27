import { supabase } from './supabase'

export type PerusallScore = {
  id?: string
  user_id: string
  subject: string
  reading_number: number
  score: number
  due_date?: string | null
}

export async function getPerusallScores(userId: string, subject = 'PSI1101') {
  const { data, error } = await supabase
    .from('perusall_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', subject)
    .order('reading_number', { ascending: true })

  if (error) throw error
  return data as PerusallScore[]
}

export async function upsertPerusallScore(input: PerusallScore) {
  const { data, error } = await supabase
    .from('perusall_scores')
    .upsert(
      {
        ...input,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,subject,reading_number',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data as PerusallScore
}