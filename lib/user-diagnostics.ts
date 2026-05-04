import { supabase } from "@/lib/supabase"

export async function saveUserDiagnostic(input: {
  subject_code: string
  evaluation: string
  score?: number
  weaknesses?: any[]
  strengths?: any[]
  answers?: any[]
}) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return { ok: false }

  const { error } = await supabase.from("user_diagnostics").upsert(
    {
      user_id: user.id,
      subject_code: input.subject_code,
      evaluation: input.evaluation,
      score: input.score ?? null,
      weaknesses: input.weaknesses ?? [],
      strengths: input.strengths ?? [],
      answers: input.answers ?? [],
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,subject_code,evaluation" }
  )

  if (error) {
    console.error("saveUserDiagnostic error", error)
    return { ok: false, error }
  }

  localStorage.setItem(
    `diagnostic-${input.subject_code}-${input.evaluation}`,
    JSON.stringify({
      completedAt: new Date().toISOString(),
      score: input.score ?? null,
      weaknesses: input.weaknesses ?? [],
      strengths: input.strengths ?? [],
      answers: input.answers ?? [],
    })
  )

  return { ok: true }
}

export async function hasUserDiagnostic(subject_code: string, evaluation: string) {
  const local = localStorage.getItem(`diagnostic-${subject_code}-${evaluation}`)
  if (local) return true

  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return false

  const { data: diag, error } = await supabase
    .from("user_diagnostics")
    .select("id, score, weaknesses, strengths, answers, completed_at")
    .eq("user_id", user.id)
    .eq("subject_code", subject_code)
    .eq("evaluation", evaluation)
    .maybeSingle()

  if (error) {
    console.error("hasUserDiagnostic error", error)
    return false
  }

  if (diag) {
    localStorage.setItem(
      `diagnostic-${subject_code}-${evaluation}`,
      JSON.stringify(diag)
    )
    return true
  }

  return false
}
