import { supabase } from './supabase'

export type StudySession = {
  id: string
  user_id: string
  evaluation_id: string | null
  session_date: string
  planned_start: string | null
  planned_end: string | null
  planned_minutes: number | null
  actual_minutes: number | null
  status: 'pending' | 'done' | 'skipped'
  notes: string | null
  created_at: string | null
}

export type StudySessionInput = {
  user_id: string
  evaluation_id?: string | null
  session_date: string
  planned_start?: string | null
  planned_end?: string | null
  planned_minutes?: number | null
  actual_minutes?: number | null
  status?: 'pending' | 'done' | 'skipped'
  notes?: string | null
}

export async function getStudySessionsByDate(
  userId: string,
  sessionDate: string
): Promise<StudySession[]> {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', sessionDate)
      .order('planned_start', { ascending: true })

    if (error) {
      return []
    }

    return (data ?? []) as StudySession[]
  } catch {
    return []
  }
}

export async function getAllStudySessions(userId: string): Promise<StudySession[]> {
  try {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: true })
      .order('planned_start', { ascending: true })

    if (error) {
      return []
    }

    return (data ?? []) as StudySession[]
  } catch {
    return []
  }
}

export async function createStudySession(input: StudySessionInput) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(input)
    .select()
    .single()

  if (error) {
    console.error('STUDY SESSION CREATE ERROR:', error)
    throw new Error('No se pudo crear la sesión')
  }

  return data as StudySession
}

export async function updateStudySession(
  id: string,
  input: Partial<StudySessionInput>
) {
  const { data, error } = await supabase
    .from('study_sessions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('STUDY SESSION UPDATE ERROR:', error)
    throw new Error('No se pudo actualizar la sesión')
  }

  return data as StudySession
}

export async function deleteStudySession(id: string) {
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('STUDY SESSION DELETE ERROR:', error)
    throw new Error('No se pudo eliminar la sesión')
  }
}