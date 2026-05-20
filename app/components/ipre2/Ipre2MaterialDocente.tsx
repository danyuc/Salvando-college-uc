"use client"

import Link from "next/link"
import { type ReactNode } from "react"
import { IPRE2_MODULES, IPRE2_SENSOR_71_DASHBOARD_URL } from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

export default function Ipre2MaterialDocente() {
  const activeModule = IPRE2_MODULES[0]

  return (
    <Ipre2Shell>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Material docente · Módulo 1</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">{activeModule.title}</h1>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-slate-300">{activeModule.objective}</p>
          <Link href="/ipre2/sesion" className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950">
            Preparar sesión con estudiantes
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Cápsula o contenido">
            <p>{activeModule.capsule}</p>
            <div className="mt-5 rounded-3xl border border-dashed border-cyan-300/30 bg-cyan-300/10 p-5">
              <p className="font-black text-cyan-100">PPT/material de apoyo</p>
              <p className="mt-2 text-sm text-slate-300">Placeholder para cargar o enlazar presentación institucional del módulo.</p>
            </div>
          </Panel>

          <Panel title="Sensor 71 / contexto de datos">
            <p>Sensor 71 se usa como disparador de aprendizaje. Si no hay API live validada, se usa dashboard/iframe/fallback con datos demo o manuales etiquetados.</p>
            <a href={IPRE2_SENSOR_71_DASHBOARD_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
              Abrir dashboard en vivo
            </a>
          </Panel>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <ListPanel title="Conceptos clave" items={activeModule.keyConcepts} />
          <ListPanel title="Guion para explicar al curso" items={activeModule.teacherScript} />
          <ListPanel title="Preguntas sugeridas" items={activeModule.suggestedQuestions} />
          <ListPanel title="Dificultades esperadas" items={activeModule.expectedDifficulties} />
        </section>

        <Panel title="Actividad de cierre">
          <p>{activeModule.closingActivity}</p>
          <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
            Referencial/demo. El objetivo es educación, observación y alfabetización de datos; no diagnóstico médico.
          </p>
        </Panel>
      </section>
    </Ipre2Shell>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4 text-sm font-semibold leading-7 text-slate-300">{children}</div>
    </article>
  )
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel title={title}>
      <ul className="grid gap-3">
        {items.map((item) => <li key={item} className="rounded-2xl bg-slate-950/55 p-4">{item}</li>)}
      </ul>
    </Panel>
  )
}
