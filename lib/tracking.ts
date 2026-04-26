import { supabase } from './supabase'
import type { Question } from './questions'

export async function saveAttempt({
  userId,
  question,
  answer,
  correct,
}: {
  userId: string
  question: Question
  answer: string
  correct: boolean
}) {
  await supabase.from('user_question_attempts').insert({
    user_id: userId,
    question_id: question.id,
    selected_answer: answer,
    is_correct: correct,
    tema: question.tema,
    dificultad: question.dificultad,
  })

  await updateStats(userId, question.tema, correct)
}

async function updateStats(userId: string, tema: string, correct: boolean) {
  const { data } = await supabase
    .from('user_topic_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('tema', tema)
    .maybeSingle()

  if (!data) {
    await supabase.from('user_topic_stats').insert({
      user_id: userId,
      tema,
      total_attempts: 1,
      correct_attempts: correct ? 1 : 0,
      mastery_score: correct ? 100 : 0,
    })
    return
  }

  const total = data.total_attempts + 1
  const correctCount = data.correct_attempts + (correct ? 1 : 0)
  const mastery = Math.round((correctCount / total) * 100)

  await supabase
    .from('user_topic_stats')
    .update({
      total_attempts: total,
      correct_attempts: correctCount,
      mastery_score: mastery,
    })
    .eq('id', data.id)
}

export async function getWeakTopics(userId: string) {
  const { data } = await supabase
    .from('user_topic_stats')
    .select('tema')
    .eq('user_id', userId)
    .lt('mastery_score', 70)

  return (data ?? []).map(d => d.tema)
}