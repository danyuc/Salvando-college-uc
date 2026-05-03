'use client'

import { useEffect, useState } from "react"
import { getLocalUser } from "@/lib/local-user"
import { supabase } from "@/lib/supabase"

export function useUser() {
  const [name, setName] = useState("usuario")
  const [email, setEmail] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      const local = getLocalUser()

      if (local) {
        setName(local.username)
        setEmail(local.email)
      }

      try {
        const { data } = await supabase.auth.getUser()
        const googleEmail = data.user?.email || null

        if (googleEmail && !local) {
          setName(googleEmail.split("@")[0])
          setEmail(googleEmail)
        }
      } catch {}

      setLoaded(true)
    }

    load()
  }, [])

  return { name, email, loaded }
}
