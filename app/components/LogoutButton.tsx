'use client'

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { clearLocalUser } from "@/lib/local-user"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    clearLocalUser()
    await supabase.auth.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="fixed right-5 top-5 z-50 rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-2 text-sm font-black text-white shadow-xl backdrop-blur hover:bg-red-500/20"
    >
      Cerrar sesión
    </button>
  )
}
