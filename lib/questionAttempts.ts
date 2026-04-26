import { supabase } from './supabase'

export async function saveAttempt({
  userId,
  question,
  selected,
  isCorrect,
}: {
  userId: string
  question: any
  selected: string
  isCorrect: boolean
}) {
  const { error } = await supabase.from('user_question_attempts').insert({
    user_id: userId,
    question_id: question.id,
    selected_answer: selected,
    is_correct: isCorrect,
    tema: question.tema,
    subtema: question.subtema,
    dificultad: question.dificultad,
    nivel_cognitivo: question.nivel_cognitivo,
  })

  if (error) console.error('SAVE ATTEMPT ERROR:', error)

  await updateTopicStats(userId, question.tema, isCorrect)
}

async function updateTopicStats(
  userId: string,
  tema: string,
  isCorrect: boolean
) {
  const { data } = await supabase
    .from('user_topic_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('tema', tema)
    .single()

  if (!data) {
    await supabase.from('user_topic_stats').insert({
      user_id: userId,
      tema,
      total_attempts: 1,
      correct_attempts: isCorrect ? 1 : 0,
      wrong_attempts: isCorrect ? 0 : 1,
      mastery_score: isCorrect ? 100 : 0,
    })
    return
  }

  const total = data.total_attempts + 1
  const correct = data.correct_attempts + (isCorrect ? 1 : 0)

  const mastery = Math.round((correct / total) * 100)

  await supabase
    .from('user_topic_stats')
    .update({
      total_attempts: total,
      correct_attempts: correct,
      wrong_attempts: total - correct,
      mastery_score: mastery,
      last_attempt_at: new Date().toISOString(),
    })
    .eq('id', data.id)
}