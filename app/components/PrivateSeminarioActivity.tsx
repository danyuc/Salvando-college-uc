'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type PrivateActivity = {
  id: string
  title: string
  subject: string
  type: string
  topic: string | null
  icon: string | null
}

export default function PrivateSeminarioActivity() {
  const [activity, setActivity] = useState<PrivateActivity | null>(null)
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData.session?.user

      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_research_member")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile?.is_research_member) {
        setLoading(false)
        return
      }

      setAllowed(true)

      const { data: activities } = await supabase
        .from("private_activities")
        .select("id,title,subject,type,topic,icon")
        .eq("is_active", true)
        .limit(1)

      setActivity(
        (activities?.[0] as PrivateActivity | undefined) ?? {
          id: "local-lab-ambiental",
          title: "Investigación ambiental Metro: PM2.5, bacterias y decibeles",
          subject: "seminario",
          type: "lab_ambiental",
          topic: "PM2.5 / bacterias / decibeles",
          icon: "🧪",
        }
      )

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null
  if (!allowed || !activity) return null

  return (
    <section className="mt-6 rounded-3xl border border-cyan-300/30 bg-cyan-400/10 p-5 shadow-xl">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">
        Seminario privado
      </p>

      <Link
        href="/lab-ambiental"
        className="mt-4 block rounded-3xl border border-white/10 bg-cyan-300/20 p-5 transition hover:scale-[1.01] hover:bg-cyan-300/30"
      >
        <p className="text-xl font-black text-white">
          {activity.icon ?? "🧪"} {activity.title}
        </p>
        <p className="mt-2 text-sm font-bold text-cyan-100">
          {activity.topic ?? "PM2.5 / bacterias / decibeles"}
        </p>
      </Link>
    </section>
  )
}
