import { supabase } from './supabase'

export type UserScore = {
  id: string
  user_id: string
  subject: string | null
  source: string | null
  format: string | null
  score: number
  total_questions: number
  correct_answers: number
  xp: number
  created_at: string | null
}

export async function createUserScore(input: {
  user_id: string
  subject?: string | null
  source?: string | null
  format?: string | null
  score: number
  total_questions: number
  correct_answers: number
  xp: number
}) {
  const { data, error } = await supabase
    .from('user_scores')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('USER SCORE INSERT ERROR:', error)
    throw new Error('No se pudo guardar el puntaje')
  }

  return data as UserScore
}

export async function getMyScores(userId: string) {
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('MY SCORES SELECT ERROR:', error)
    throw new Error('No se pudieron cargar tus puntajes')
  }

  return (data ?? []) as UserScore[]
}

export async function getGlobalRanking(limit = 50) {
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .order('xp', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('GLOBAL RANKING SELECT ERROR:', error)
    throw new Error('No se pudo cargar el ranking global')
  }

  return (data ?? []) as UserScore[]
}

export async function getSubjectRanking(subject: string, limit = 50) {
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .eq('subject', subject)
    .order('xp', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('SUBJECT RANKING SELECT ERROR:', error)
    throw new Error('No se pudo cargar el ranking por asignatura')
  }

  return (data ?? []) as UserScore[]
}

export function calculateXp(params: {
  correctAnswers: number
  totalQuestions: number
}) {
  const { correctAnswers, totalQuestions } = params
  if (totalQuestions <= 0) return 0

  const accuracy = correctAnswers / totalQuestions

  let xp = correctAnswers * 10

  if (accuracy >= 0.9) xp += 40
  else if (accuracy >= 0.75) xp += 25
  else if (accuracy >= 0.6) xp += 10

  return xp
}

export function calculatePercent(params: {
  correctAnswers: number
  totalQuestions: number
}) {
  const { correctAnswers, totalQuestions } = params
  if (totalQuestions <= 0) return 0
  return Number(((correctAnswers / totalQuestions) * 100).toFixed(1))
}