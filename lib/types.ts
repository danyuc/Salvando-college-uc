export type Evaluation = {
  id: string
  user_id?: string | null
  subject?: string | null
  type?: string | null
  topic?: string | null
  number?: number | null

  start_date?: string | null
  end_date?: string | null

  weight_percent?: number | null
  current_grade?: number | null
  target_grade?: number | null

  study_progress?: number | null
  estimated_minutes?: number | null
  difficulty?: 'baja' | 'media' | 'alta' | null

  notes?: string | null
  created_at?: string | null
  updated_at?: string | null

  [key: string]: any
}
