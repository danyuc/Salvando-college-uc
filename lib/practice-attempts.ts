import { supabase } from './supabase'

export type PracticeAttempt = {
  id: string
  user_id: string
  subject: string
  topic: string | null
  question_id: string | null
  question_text: string
  question_type: string | null
  source: string | null
  is_correct: boolean
  created_at: string | null
}

export async function createPracticeAttempts(
  attempts: Array<{
    user_id: string
    subject: string
    topic?: string | null
    question_id?: string | null
    question_text: string
    question_type?: string | null
    source?: string | null
    is_correct: boolean
  }>
) {
  if (!attempts.length) return []

  const { data, error } = await supabase
    .from('practice_attempts')
    .insert(
      attempts.map((item) => ({
        user_id: item.user_id,
        subject: item.subject,
        topic: item.topic || null,
        question_id: item.question_id || null,
        question_text: item.question_text,
        question_type: item.question_type || null,
        source: item.source || null,
        is_correct: item.is_correct,
      }))
    )
    .select()

  if (error) {
    console.error('PRACTICE ATTEMPTS INSERT ERROR:', error)
    throw new Error('No se pudieron guardar los intentos')
  }

  return (data ?? []) as PracticeAttempt[]
}

export async function getMyPracticeAttempts(userId: string) {
  const { data, error } = await supabase
    .from('practice_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('PRACTICE ATTEMPTS SELECT ERROR:', error)
    throw new Error('No se pudieron cargar los intentos')
  }

  return (data ?? []) as PracticeAttempt[]
}