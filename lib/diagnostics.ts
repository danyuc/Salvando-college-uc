export type DiagnosticStage = 'inicio' | 'medio' | 'final' | 'completed'

export type SubjectDiagnostic = {
  id?: string
  user_id: string
  subject: string
  completed?: boolean
  score?: number
  score_percent?: number
  correct_answers?: number
  total_questions?: number
  weak_topics?: string[]
  strong_topics?: string[]
  diagnostic_result?: any | null
  stage?: DiagnosticStage | string
  completed_at?: string | null
  created_at?: string
  updated_at?: string
}

export async function getDiagnosticBySubject(userId: string, subject: string) {
  const res = await fetch(`/api/diagnostics/get?userId=${userId}&subject=${subject}`)
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

export async function upsertDiagnostic(input: SubjectDiagnostic) {
  const res = await fetch('/api/diagnostics/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const json = await res.json().catch(() => null)

  if (!res.ok || !json?.success) {
    throw new Error(json?.message || 'No se pudo guardar el diagnóstico')
  }

  return json.data as SubjectDiagnostic
}
