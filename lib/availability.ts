import { supabase } from './supabase'

export type AvailabilityBlock = {
  id: string
  user_id: string
  day_of_week: string
  start_time: string
  end_time: string
  created_at: string | null
}

export async function getAvailabilityBlocks(userId: string) {
  const { data, error } = await supabase
    .from('user_availability')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('AVAILABILITY SELECT ERROR:', error)
    throw new Error('No se pudo cargar la disponibilidad')
  }

  return (data ?? []) as AvailabilityBlock[]
}

export async function createAvailabilityBlock(input: {
  user_id: string
  day_of_week: string
  start_time: string
  end_time: string
}) {
  const { data, error } = await supabase
    .from('user_availability')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('AVAILABILITY INSERT ERROR:', error)
    throw new Error('No se pudo guardar el bloque')
  }

  return data as AvailabilityBlock
}

export async function deleteAvailabilityBlock(id: string) {
  const { error } = await supabase
    .from('user_availability')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('AVAILABILITY DELETE ERROR:', error)
    throw new Error('No se pudo eliminar el bloque')
  }
}

export async function getAvailability(userId: string) {
  return getAvailabilityBlocks(userId)
}