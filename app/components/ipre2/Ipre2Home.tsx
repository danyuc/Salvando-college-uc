"use client"

import Link from "next/link"
import { type ReactNode, useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Camera, Presentation, Trophy } from "lucide-react"
import { IPRE2_DEMO_COURSES, IPRE2_STORAGE_KEYS } from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

export default function Ipre2Home() {
  const [course, setCourse] = useState(() =>
    typeof window === "undefined"
      ? "College · Curso A"
      : localStorage.getItem(IPRE2_STORAGE_KEYS.selectedCourse) ?? "College · Curso A"
  )

  function updateCourse(value: string) {
    setCourse(value)
    localStorage.setItem(IPRE2_STORAGE_KEYS.selectedCourse, value)
  }

  return (
    <Ipre2Shell>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:py-16">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.36em] text-cyan-300">Explora IPRE2</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
            Cápsulas, sesiones y aprendizaje basado en datos reales.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-300">
            Línea educativa para docentes y estudiantes: cápsulas breves, votación en aula, puntaje por curso, ranking y uso transparente de Sensor 71 como disparador de aprendizaje.
          </p>
        </motion.header>

        <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
          <label className="grid gap-2 text-sm font-black text-slate-200">
            Colegio / institución
            <input value="College" readOnly className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white" />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-200">
            Curso / clase
            <select value={course} onChange={(event) => updateCourse(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950 px-4 text-white">
              {IPRE2_DEMO_COURSES.map((item) => <option key={item.courseName}>{item.courseName}</option>)}
              <option>Curso editable</option>
            </select>
          </label>
        </section>

        <section>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">¿Qué sesión desea iniciar?</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <HeroAction href="/ipre2/material-docente" icon={<BookOpen />} title="Material docente" text="Preparar objetivo, cápsula, guion, preguntas y actividad de cierre antes de proyectar la clase." />
            <HeroAction href="/ipre2/sesion" icon={<Presentation />} title="Sesión con estudiantes" text="Modo aula con preguntas A/B/C/D, conteo manual, puntaje y avance por curso." />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SmallLink href="/ipre2/ranking" icon={<Trophy />} title="Ranking" />
          <SmallLink href="/ipre2/camara" icon={<Camera />} title="Cámara / conteo de manos" />
          <SmallLink href="/ipre2/propuesta-estela" icon={<BookOpen />} title="Propuesta profesora Estela" />
        </section>
      </section>
    </Ipre2Shell>
  )
}

function HeroAction({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="group rounded-[2rem] border border-white/10 bg-white/[0.09] p-7 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/40">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300 text-slate-950">{icon}</div>
      <h2 className="mt-5 text-3xl font-black">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{text}</p>
    </Link>
  )
}

function SmallLink({ href, icon, title }: { href: string; icon: ReactNode; title: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-5 font-black text-slate-100 transition hover:bg-white/10">
      <span className="text-cyan-300">{icon}</span>
      {title}
    </Link>
  )
}
