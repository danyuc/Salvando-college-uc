import { supabase } from './supabase'

export type GeneratedTest = {
  id: string
  user_id: string
  subject: string | null
  evaluation_type: string | null
  topic: string | null
  source_content: string | null
  test_json: any
  created_at: string | null
}

export type TestAttempt = {
  id: string
  user_id: string
  generated_test_id: string
  answers_json: any
  score: number | null
  feedback: string | null
  created_at: string | null
}

export async function createGeneratedTest(input: {
  user_id: string
  subject?: string | null
  evaluation_type?: string | null
  topic?: string | null
  source_content?: string | null
  test_json: any
}) {
  const { data, error } = await supabase
    .from('generated_tests')
    .insert(input)
    .select()
    .single()

  if (error?.message) {
    console.error('GENERATED TEST CREATE ERROR:', error)
    throw new Error('No se pudo guardar la prueba')
  }

  return data as GeneratedTest
}

export async function getGeneratedTests(userId: string) {
  const { data, error } = await supabase
    .from('generated_tests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error?.message) {
    console.error('GENERATED TESTS SELECT ERROR:', error)
    throw new Error('No se pudieron cargar las pruebas')
  }

  return (data ?? []) as GeneratedTest[]
}

export async function createTestAttempt(input: {
  user_id: string
  generated_test_id: string
  answers_json: any
  score?: number | null
  feedback?: string | null
}) {
  const { data, error } = await supabase
    .from('test_attempts')
    .insert(input)
    .select()
    .single()

  if (error?.message) {
    console.error('TEST ATTEMPT CREATE ERROR:', error)
    throw new Error('No se pudo guardar el intento')
  }

  return data as TestAttempt
}