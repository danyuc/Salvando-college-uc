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

export async function getQuestionsFromBank(params: {
  subject?: string | null
  topic?: string | null
  difficulty?: string | null
  limit?: number
}) {
  const { subject, topic, difficulty, limit = 10 } = params

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

  if (error) {
    console.error('QUESTION BANK SELECT ERROR:', error)
    return []
  }

  return (data ?? []) as BankQuestion[]
}

export async function getAllQuestionBankItems() {
  const { data, error } = await supabase
    .from('question_bank')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('QUESTION BANK ALL ERROR:', error)
    throw new Error('No se pudieron cargar las preguntas')
  }

  return (data ?? []) as BankQuestion[]
}

export async function createBankQuestions(
  items: Array<{
    subject: string
    topic: string
    difficulty: string
    type: string
    question: string
    options: string[]
    answer: number | { correctIndex: number }
    explanation?: string
    tags?: string[]
  }>
) {
  if (!items.length) return []

  const payload = items.map((item) => ({
    subject: item.subject,
    topic: item.topic,
    difficulty: item.difficulty,
    type: item.type,
    question: item.question,
    options: item.options,
    answer: item.answer,
    explanation: item.explanation || null,
    tags: item.tags || [],
  }))

  const { data, error } = await supabase
    .from('question_bank')
    .insert(payload)
    .select()

  if (error) {
    console.error('QUESTION BANK INSERT ERROR:', error)
    throw new Error('No se pudieron guardar las preguntas')
  }

  return (data ?? []) as BankQuestion[]
}

export async function deleteQuestionBankItem(id: string) {
  const { error } = await supabase
    .from('question_bank')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('QUESTION BANK DELETE ERROR:', error)
    throw new Error('No se pudo eliminar la pregunta')
  }
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

export function normalizeAiQuestionsToBankShape(
  aiQuestions: Array<{
    question: string
    options: string[]
    answerIndex: number
    explanation?: string
  }>,
  meta?: {
    subject?: string | null
    topic?: string | null
    difficulty?: string | null
    type?: string | null
  }
): BankQuestion[] {
  return aiQuestions.map((q, index) => ({
    id: `ai-${Date.now()}-${index}`,
    subject: meta?.subject || null,
    topic: meta?.topic || null,
    difficulty: meta?.difficulty || null,
    type: meta?.type || 'multiple-choice',
    question: q.question,
    options: q.options,
    answer: q.answerIndex,
    explanation: q.explanation || null,
    tags: null,
    created_at: null,
  }))
}