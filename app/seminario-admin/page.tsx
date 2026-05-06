'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Profile = {
  id: string
  username: string | null
  institutional_email: string | null
  college_track: string | null
  is_research_member: boolean | null
}

export default function SeminarioAdminPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoading(true)

    const { data } = await supabase
      .from("profiles")
      .select("id,username,institutional_email,college_track,is_research_member")
      .order("updated_at", { ascending: false })
      .limit(80)

    setProfiles((data ?? []) as Profile[])
    setLoading(false)
  }

  async function toggleAccess(profile: Profile) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_research_member: !profile.is_research_member })
      .eq("id", profile.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadProfiles()
  }

  const filtered = profiles.filter((profile) => {
    const text = `${profile.username ?? ""} ${profile.institutional_email ?? ""} ${profile.college_track ?? ""}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-300">
              Gestión privada
            </p>
            <h1 className="mt-2 text-4xl font-black">
              Accesos Seminario Ambiental
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black hover:bg-white/20"
          >
            ← Volver
          </Link>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por usuario, correo o college..."
          className="mt-8 w-full rounded-2xl border border-white/10 bg-white/10 px-5 py-4 font-bold outline-none"
        />

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/10">
          {loading ? (
            <p className="p-6 font-black">Cargando perfiles...</p>
          ) : (
            filtered.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-black">
                    {profile.username ?? "Sin usuario"}
                  </p>
                  <p className="text-sm text-slate-300">
                    {profile.institutional_email ?? "Sin correo institucional"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {profile.college_track ?? "Sin college"}
                  </p>
                </div>

                <button
                  onClick={() => toggleAccess(profile)}
                  className={`rounded-2xl px-5 py-3 font-black ${
                    profile.is_research_member
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {profile.is_research_member ? "Con acceso" : "Dar acceso"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
