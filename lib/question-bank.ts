import { supabase } from './supabase'

export type BankQuestion = {
  id: string
  subject: string | null
  topic: string | null
  difficulty: string | null
  type: string | null
  question: string
  options: string[] | null
  answer: number | { correctIndex: number } | null
  explanation: string | null
  tags: string[] | null
  created_at: string | null
}

export async function getQuestionsFromBank({
  subject,
  topic,
  difficulty,
  limit = 10,
}: {
  subject?: string | null
  topic?: string | null
  difficulty?: string | null
  limit?: number
}) {
  let query = supabase.from('question_bank').select('*')

  if (subject?.trim()) {
    query = query.ilike('subject', `%${subject.trim()}%`)
  }

  if (topic?.trim()) {
    query = query.ilike('topic', `%${topic.trim()}%`)
  }

  if (difficulty?.trim()) {
    query = query.eq('difficulty', difficulty.trim())
  }

  const { data, error } = await query.limit(limit)

  if (error?.message) {
    console.error('QUESTION BANK SELECT ERROR:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudieron cargar preguntas del banco')
  }

  return (data ?? []) as BankQuestion[]
}

export function getCorrectIndex(
  answer: BankQuestion['answer']
): number | null {
  if (typeof answer === 'number') return answer

  if (
    answer &&
    typeof answer === 'object' &&
    'correctIndex' in answer &&
    typeof answer.correctIndex === 'number'
  ) {
    return answer.correctIndex
  }

  return null
}