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
  const [isResearchMember, setIsResearchMember] = useState(false)
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

      const allowedByProfile = Boolean(profile?.is_research_member)
      setIsResearchMember(allowedByProfile)

      const { data: activities } = await supabase
        .from("private_activities")
        .select("id,title,subject,type,topic,icon")
        .eq("is_active", true)
        .limit(1)

      const first = activities?.[0] as PrivateActivity | undefined

      if (allowedByProfile && first) {
        setActivity(first)
      }

      if (allowedByProfile && !first) {
        setActivity({
          id: "local-lab-ambiental",
          title: "Laboratorio Ambiental / Seminario",
          subject: "seminario",
          type: "lab_ambiental",
          topic: "PM2.5, bacterias, decibeles, GPS y recorridos Metro",
          icon: "🧪",
        })
      }

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return null
  if (!isResearchMember || !activity) return null

  return (
    <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 shadow-xl">
      <p className="text-sm font-black text-emerald-200">Actividad privada</p>
      <h2 className="mt-1 text-xl font-black text-white">
        {activity.icon ?? "🔒"} {activity.title}
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        {activity.topic ?? "PM2.5, bacterias, decibeles y GPS"}
      </p>

      <Link
        href="/lab-ambiental"
        className="mt-4 inline-flex rounded-2xl bg-white px-5 py-3 font-black text-slate-950 hover:bg-slate-200"
      >
        Abrir laboratorio ambiental
      </Link>
    </section>
  )
}
