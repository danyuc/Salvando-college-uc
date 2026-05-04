'use client'

import { useEffect, useState } from "react"
import { getLocalUser } from "@/lib/local-user"

export function useUser() {
  const [name, setName] = useState("usuario")
  const [email, setEmail] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    function load() {
      const local = getLocalUser()
      setName(local?.username || "usuario")
      setEmail(local?.email || null)
      setLoaded(true)
    }

    load()
    window.addEventListener("storage", load)
    window.addEventListener("focus", load)

    return () => {
      window.removeEventListener("storage", load)
      window.removeEventListener("focus", load)
    }
  }, [])

  return { name, email, loaded }
}
