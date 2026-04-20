import { supabase } from './supabase'

export type AvailabilityBlock = {
  id?: string
  user_id: string
  day_of_week: number // 0 lunes - 6 domingo
  start_time: string // "18:00"
  end_time: string // "22:00"
}

export async function getAvailability(userId: string) {
  const { data, error } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data as AvailabilityBlock[]
}

export async function saveAvailability(
  userId: string,
  blocks: AvailabilityBlock[]
) {
  await supabase
    .from('availability')
    .delete()
    .eq('user_id', userId)

  const payload = blocks.map((b) => ({
    ...b,
    user_id: userId,
  }))

  const { error } = await supabase
    .from('availability')
    .insert(payload)

  if (error) throw error
}