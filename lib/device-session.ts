import { supabase } from "@/lib/supabase"

const DEVICE_KEY = "scuc-device-id"

function getDeviceId() {
  if (typeof window === "undefined") return ""

  let id = localStorage.getItem(DEVICE_KEY)

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }

  return id
}

export async function registerCurrentDevice() {
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user || typeof window === "undefined") {
    return { activeDevices: 0, sessions: [] }
  }

  const device_id = getDeviceId()

  await supabase.from("user_sessions").upsert(
    {
      user_id: user.id,
      device_id,
      user_agent: navigator.userAgent,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "user_id,device_id" }
  )

  const { data: sessions } = await supabase
    .from("user_sessions")
    .select("device_id,last_seen,user_agent")
    .eq("user_id", user.id)

  return {
    device_id,
    activeDevices: sessions?.length || 1,
    sessions: sessions || [],
  }
}
