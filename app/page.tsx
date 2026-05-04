'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import HomeView from "./components/HomeView"
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

      const { data } = await supabase.auth.getUser()

      if (data.user) {
        router.replace("/onboarding")
        return
      }

      router.replace("/login")
    }

    check()
  }, [router])

  if (!ready) {
    return (
      <main style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#020617",
        color: "white",
        fontWeight: 900
      }}>
        Verificando perfil UC...
      </main>
    )
  }

  return <HomeView />
}
