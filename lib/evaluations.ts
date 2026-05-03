import { supabase } from "./supabase"

export type Evaluation = {
  id?: string
  user_id: string
  subject: string
  title: string
  type?: string | null
  topic?: string | null
  number?: number | null
  grade?: number | null
  weight_percent?: number | null
  notes?: string | null
  date?: string | null
  start_date?: string | null
  end_date?: string | null
  difficulty?: "baja" | "media" | "alta" | string | null
  created_at?: string | null
}

function normalizeEvaluation(input: Partial<Evaluation>) {
  const startDate = input.start_date ?? input.date ?? null
  const endDate = input.end_date ?? startDate

  return {
    user_id: input.user_id,
    subject: input.subject ?? "Sin ramo",
    title: input.title ?? input.topic ?? "Evaluación",
    type: input.type ?? "evaluacion",
    topic: input.topic ?? null,
    number:
      typeof input.number === "number" && Number.isFinite(input.number)
        ? input.number
        : null,
    grade:
      typeof input.grade === "number" && Number.isFinite(input.grade)
        ? input.grade
        : null,
    weight_percent:
      typeof input.weight_percent === "number" &&
      Number.isFinite(input.weight_percent)
        ? input.weight_percent
        : 0,
    notes: input.notes ?? null,
    date: startDate,
    start_date: startDate,
    end_date: endDate,
    difficulty: input.difficulty ?? "media",
  }
}

export async function getUserEvaluations(userId: string) {
  const { data, error } = await supabase
    .from("evaluations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("GET USER EVALUATIONS ERROR:", error)
    throw new Error(error.message)
  }

  return (data ?? []) as Evaluation[]
}

export async function createEvaluation(
  input: Omit<Evaluation, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("evaluations")
    .insert(normalizeEvaluation(input))
    .select()
    .single()

  if (error) {
    console.error("CREATE EVALUATION ERROR:", error)
    throw new Error(error.message)
  }

  return data as Evaluation
}

export async function bulkCreateEvaluations(
  evaluations: Array<Omit<Evaluation, "id" | "created_at">>
) {
  if (!evaluations.length) return []

  const payload = evaluations.map(normalizeEvaluation)

  const { data, error } = await supabase
    .from("evaluations")
    .insert(payload)
    .select()

  if (error) {
    console.error("BULK CREATE EVALUATIONS ERROR:", error)
    throw new Error(error.message)
  }

  return (data ?? []) as Evaluation[]
}

export async function updateEvaluation(
  id: string,
  updates: Partial<Evaluation>
) {
  const payload = normalizeEvaluation(updates)

  delete (payload as any).user_id

  const { data, error } = await supabase
    .from("evaluations")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("UPDATE EVALUATION ERROR:", error)
    throw new Error(error.message)
  }

  return data as Evaluation
}

export async function deleteEvaluation(id: string) {
  const { error } = await supabase.from("evaluations").delete().eq("id", id)

  if (error) {
    console.error("DELETE EVALUATION ERROR:", error)
    throw new Error(error.message)
  }

  return true
}
