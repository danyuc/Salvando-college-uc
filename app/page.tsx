'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HomeView from "./components/HomeView"
import PrivateSeminarioActivity from "./components/PrivateSeminarioActivity"
import LogoutButton from "./components/LogoutButton"
import { getLocalUser, saveLocalUser } from "@/lib/local-user"
import { supabase } from "@/lib/supabase"

export default function Page() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function check() {
      const local = getLocalUser()

      if (local?.email) {
        setReady(true)
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        router.replace("/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username,institutional_email,college_track,career,year,is_onboarded")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile?.is_onboarded) {
        router.replace("/onboarding")
        return
      }

      saveLocalUser({
        id: user.id,
        email: profile.institutional_email ?? user.email ?? "",
        username: profile.username ?? "",
        college_track: profile.college_track ?? profile.career ?? "",
        year: String(profile.year ?? ""),
      })

      setReady(true)
    }

    check()
  }, [router])

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">
        Cargando perfil guardado...
      </main>
    )
  }

  return (
    <>
      <LogoutButton />
      <HomeView />
      <div className="mx-auto max-w-6xl px-5 pb-10">
        <PrivateSeminarioActivity />
      </div>
    </>
  )
}
