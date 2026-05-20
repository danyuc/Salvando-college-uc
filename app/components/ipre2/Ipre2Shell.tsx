"use client"

import Link from "next/link"
import { ReactNode } from "react"

const nav = [
  ["/ipre2", "Inicio"],
  ["/ipre2/material-docente", "Material docente"],
  ["/ipre2/sesion", "Sesión"],
  ["/ipre2/ranking", "Ranking"],
  ["/ipre2/camara", "Cámara"],
  ["/ipre2/propuesta-estela", "Propuesta Estela"],
] as const

export default function Ipre2Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,.18),transparent_28%),linear-gradient(135deg,#020617,#0f172a_46%,#052e2b)] text-white">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Link href="/ipre2" className="font-black tracking-tight text-white">Explora IPRE2</Link>
          <div className="flex flex-wrap gap-2">
            {nav.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-slate-200 transition hover:bg-cyan-300 hover:text-slate-950">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      {children}
    </main>
  )
}
