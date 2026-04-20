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
) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('session_date', sessionDate)
    .order('planned_start', { ascending: true })

  if (error?.message) {
    console.error('STUDY SESSIONS SELECT ERROR FULL:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })

    throw new Error('No se pudieron cargar las sesiones')
  }

  // Degradación suave si Supabase devuelve algo raro sin message
  if (error) {
    console.error('STUDY SESSIONS SELECT WEIRD ERROR:', error)
    return []
  }

  return (data ?? []) as StudySession[]
}

export async function createStudySession(input: StudySessionInput) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(input)
    .select()
    .single()

  if (error?.message) {
    console.error('STUDY SESSION CREATE ERROR FULL:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudo crear la sesión')
  }

  if (error) {
    console.error('STUDY SESSION CREATE WEIRD ERROR:', error)
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

  if (error?.message) {
    console.error('STUDY SESSION UPDATE ERROR FULL:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudo actualizar la sesión')
  }

  if (error) {
    console.error('STUDY SESSION UPDATE WEIRD ERROR:', error)
    throw new Error('No se pudo actualizar la sesión')
  }

  return data as StudySession
}

export async function upsertTodaySessions(
  userId: string,
  sessionDate: string,
  sessions: StudySessionInput[]
) {
  const existing = await getStudySessionsByDate(userId, sessionDate)

  if (existing.length > 0) {
    const pendingOrSkipped = existing.filter(
      (s) => s.status === 'pending' || s.status === 'skipped'
    )

    for (const session of pendingOrSkipped) {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', session.id)

      if (error?.message) {
        console.error('DELETE OLD SESSION ERROR FULL:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        throw new Error('No se pudieron reemplazar las sesiones del día')
      }
    }
  }

  if (sessions.length === 0) return []

  const payload = sessions.map((s) => ({
    ...s,
    user_id: userId,
    session_date: sessionDate,
  }))

  const { data, error } = await supabase
    .from('study_sessions')
    .insert(payload)
    .select()

  if (error?.message) {
    console.error('UPSERT TODAY SESSIONS ERROR FULL:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error('No se pudieron guardar las sesiones del día')
  }

  if (error) {
    console.error('UPSERT TODAY SESSIONS WEIRD ERROR:', error)
    throw new Error('No se pudieron guardar las sesiones del día')
  }

  return (data ?? []) as StudySession[]
}