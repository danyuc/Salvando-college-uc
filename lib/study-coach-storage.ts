import { supabase } from './supabase'
import type { CoachBlock } from './study-coach'

export type StoredCoachPlan = {
  id: string
  user_id: string
  week_key: string
  total_weekly_minutes: number
  blocks: CoachBlock[]
  coach_summary: string
  created_at: string | null
  updated_at: string | null
}

export async function saveStudyCoachPlan(input: {
  user_id: string
  week_key: string
  total_weekly_minutes: number
  blocks: CoachBlock[]
  coach_summary: string
}) {
  const { data, error } = await supabase
    .from('study_coach_plans')
    .upsert(input, {
      onConflict: 'user_id,week_key',
    })
    .select()
    .single()

  if (error) {
    console.error('SAVE STUDY COACH PLAN ERROR:', error)
    throw new Error('No se pudo guardar el plan semanal')
  }

  return data as StoredCoachPlan
}

export async function getStudyCoachPlan(userId: string, weekKey: string) {
  const { data, error } = await supabase
    .from('study_coach_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('week_key', weekKey)
    .maybeSingle()

  if (error) {
    console.error('GET STUDY COACH PLAN ERROR:', error)
    throw new Error('No se pudo cargar el plan semanal')
  }

  return (data as StoredCoachPlan | null) || null
}