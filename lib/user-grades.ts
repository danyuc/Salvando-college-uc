import { supabase } from "@/lib/supabase"

export async function loadUserGrades() {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return []

  const { data: rows, error } = await supabase
    .from("user_grades")
    .select("*")
    .eq("user_id", user.id)

  if (error) {
    console.error("loadUserGrades error", error)
    return []
  }

  return rows || []
}

export async function saveUserGrade(input: {
  subject_code: string
  evaluation_id: string
  evaluation_name?: string
  grade?: number
  weight?: number
  raw_value?: number
  type?: string
}) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return { ok: false }

  const { error } = await supabase.from("user_grades").upsert(
    {
      user_id: user.id,
      subject_code: input.subject_code,
      evaluation_id: input.evaluation_id,
      evaluation_name: input.evaluation_name ?? "",
      grade: input.grade ?? null,
      weight: input.weight ?? null,
      raw_value: input.raw_value ?? null,
      type: input.type ?? "",
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,evaluation_id" }
  )

  if (error) {
    console.error("saveUserGrade error", error)
    return { ok: false, error }
  }

  return { ok: true }
}

export async function deleteUserGrade(evaluation_id: string) {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) return { ok: false }

  const { error } = await supabase
    .from("user_grades")
    .delete()
    .eq("user_id", user.id)
    .eq("evaluation_id", evaluation_id)

  if (error) {
    console.error("deleteUserGrade error", error)
    return { ok: false, error }
  }

  return { ok: true }
}
