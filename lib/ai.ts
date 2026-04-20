import { supabase } from './supabase'

export async function getFullAIRecommendation(userId: string) {
  const { data, error } = await supabase.rpc('get_full_ai_recommendation', {
    p_user_id: userId,
  })

  console.log('DATA DESDE SUPABASE:', data)
  console.log('ERROR:', error)

  if (error) {
    throw error
  }

  return data?.[0] ?? null
}