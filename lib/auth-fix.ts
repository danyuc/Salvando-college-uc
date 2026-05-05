import { supabase } from "@/lib/supabase"

export async function ensureSession() {
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    return data.session
  }

  const { data: refreshed } = await supabase.auth.refreshSession()
  return refreshed.session
}
