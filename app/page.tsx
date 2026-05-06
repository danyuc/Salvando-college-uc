'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HomeView from "./components/HomeView"
import PrivateSeminarioActivity from "./components/PrivateSeminarioActivity"
import LogoutButton from "./components/LogoutButton"
import { getLocalUser } from "@/lib/local-user"
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

      if (sessionData.session) {
        router.replace("/onboarding")
        return
      }

      router.replace("/login")
    }

    check()
  }, [router])

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">
        Verificando sesión...
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
