'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getLocalUser } from "@/lib/local-user"
import LabAmbientalClient from "../components/LabAmbientalClient"

export default function LabAmbientalPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      const local = getLocalUser()
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user && !local?.email) {
        router.replace("/login")
        return
      }

      if (!user && local?.email) {
        setAllowed(true)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_research_member")
        .eq("id", user!.id)
        .maybeSingle()

      if (!profile?.is_research_member) {
        router.replace("/")
        return
      }

      setAllowed(true)
      setLoading(false)
    }

    checkAccess()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white grid place-items-center font-black">
        Abriendo laboratorio ambiental...
      </main>
    )
  }

  if (!allowed) return null

  return <LabAmbientalClient />
}
