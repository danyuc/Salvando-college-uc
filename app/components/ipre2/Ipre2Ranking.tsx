"use client"

import { useMemo } from "react"
import { IPRE2_DEMO_COURSES, IPRE2_STORAGE_KEYS, createDefaultProgress, type Ipre2CourseProgress } from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

function loadRanking(): Ipre2CourseProgress[] {
  if (typeof window === "undefined") return []
  try {
    const stored = JSON.parse(localStorage.getItem(IPRE2_STORAGE_KEYS.progress) ?? "[]") as Ipre2CourseProgress[]
    if (stored.length) return stored
  } catch {}
  return IPRE2_DEMO_COURSES.map((course, index) => ({
    ...createDefaultProgress(course.courseName),
    institutionName: course.institutionName,
    schoolName: course.schoolName,
    totalPoints: [1250, 1000, 750][index] ?? 0,
    lastScore: [1250, 1000, 750][index] ?? 0,
    completedModules: index < 2 ? ["module-1-pm25"] : [],
    streak: index === 0 ? 2 : index === 1 ? 1 : 0,
    badges: index === 0 ? ["Clase científica", "Detectives del aire"] : ["Reto completado"],
  }))
}

export default function Ipre2Ranking() {
  const ranking = useMemo(() => loadRanking().sort((a, b) => b.totalPoints - a.totalPoints), [])

  return (
    <Ipre2Shell>
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Ranking local</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Cursos en misión de datos</h1>
          <p className="mt-4 text-sm font-semibold text-slate-300">Modo demo local hasta conectar base de datos. Preparado para comparar cursos y colegios más adelante.</p>
        </header>
        <div className="grid gap-4">
          {ranking.map((entry, index) => (
            <article key={entry.courseName} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-300 text-2xl font-black text-slate-950">#{index + 1}</div>
              <div>
                <h2 className="text-2xl font-black">{entry.courseName}</h2>
                <p className="mt-1 text-sm font-bold text-slate-400">{entry.schoolName} · Unidad actual: {entry.currentModule}</p>
                <p className="mt-2 text-xs font-bold text-amber-100">{entry.badges.join(" · ")}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-black text-cyan-200">{entry.totalPoints} pts</p>
                <p className="text-sm font-bold text-slate-300">Último score: {entry.lastScore} · Racha: {entry.streak}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Ipre2Shell>
  )
}
