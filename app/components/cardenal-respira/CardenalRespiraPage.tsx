"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowRight, Leaf, Wind } from "lucide-react"
import {
  AIR_QUALITY_DEMO_DATA,
  CARDENAL_RESPIRA_PROJECT,
  CRSH_SENSORS,
  CURRICULAR_LINKS,
  buildDemoReading,
} from "@/lib/cardenal-respira"
import AnimatedAirParticles from "./AnimatedAirParticles"
import AirQualityTrafficLight from "./AirQualityTrafficLight"
import SensorDashboardCard from "./SensorDashboardCard"

export default function CardenalRespiraPage() {
  const heroSensor = CRSH_SENSORS[0]
  const heroReading = buildDemoReading(heroSensor, 2)

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative px-6 py-16 md:px-10">
        <AnimatedAirParticles />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
              {CARDENAL_RESPIRA_PROJECT.schoolName}
            </p>
            <h1 className="mt-5 text-5xl font-black tracking-tight md:text-7xl">
              Cardenal Respira
            </h1>
            <p className="mt-5 max-w-3xl text-xl font-semibold leading-8 text-slate-300">
              Calidad del aire, salud escolar y ciencia ciudadana.
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Cardenal Respira propone transformar un sensor de calidad del aire en una experiencia educativa viva: datos reales, aprendizaje interdisciplinario, proyectos TP, formación ciudadana y decisiones escolares mejor informadas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cardenal-respira/docentes" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
                Acceso docentes
              </Link>
              <Link href="/cardenal-respira/presentacion" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">
                Ver presentación
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          <AirQualityTrafficLight reading={heroReading} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Pregunta central</p>
          <h2 className="mt-3 text-3xl font-black">¿Qué aire están respirando nuestros estudiantes cada día?</h2>
          <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-slate-300">
            Muchas veces hablamos de contaminación solo cuando hay alerta o emergencia ambiental. Sin embargo, la calidad del aire es un tema permanente de salud, educación y bienestar.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <InfoCard title="PM10" icon={<Wind />} text="Partículas más grandes que ayudan a comprender polvo, ambiente y condiciones del entorno." />
          <InfoCard title="PM2.5" icon={<Leaf />} text="Partículas muy pequeñas que pueden permanecer suspendidas en el aire y que no siempre son visibles." />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">Más que un sensor</p>
            <h2 className="mt-3 text-3xl font-black">El sensor es solo el inicio.</h2>
            <div className="mt-5 grid gap-3">
              {["aprendizaje", "proyectos TP", "ciencia ciudadana", "prevención", "análisis de datos", "innovación educativa"].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-950/55 px-4 py-3 text-sm font-black text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-300">Datos demostrativos para presentación</p>
            <h2 className="mt-3 text-3xl font-black">Historia semanal del aire</h2>
            <div className="mt-5 min-w-0 overflow-x-auto">
              <LineChart width={760} height={320} data={AIR_QUALITY_DEMO_DATA} className="max-w-full">
                <CartesianGrid stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16 }} />
                <Line type="monotone" dataKey="pm25" stroke="#22d3ee" strokeWidth={3} dot />
                <Line type="monotone" dataKey="pm10" stroke="#a78bfa" strokeWidth={3} dot />
              </LineChart>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Vinculación curricular</p>
          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {CURRICULAR_LINKS.map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/55 p-5 text-sm font-black text-white">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-rose-300">Educación, ciencia ciudadana e investigación</p>
            <h2 className="mt-3 text-3xl font-black">Profesora Estela Blanco</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">
              La línea puede conectar contaminación atmosférica, salud, ciencia ciudadana, seminario, investigación ANID/FONDECYT y una eventual oportunidad Explora en revisión. No se afirma aprobación: se presenta como posibilidad institucional y pedagógica.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">Proyecto UC / CEDEUS</p>
            <h2 className="mt-3 text-3xl font-black">Monitoreo ambiental educativo</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">
              Proyecto de monitoreo ambiental relacionado con la Pontificia Universidad Católica de Chile y CEDEUS: monitoreo de MP2,5, instalación exterior, bajo riesgo, bajo consumo e información ambiental anonimizada.
            </p>
          </div>
        </section>

        <SensorDashboardCard sensor={heroSensor} preview={false} />

        <section className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-8 text-center shadow-2xl">
          <h2 className="text-4xl font-black">Con un primer sí, se abren muchas puertas.</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/cardenal-respira/docentes" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
              Acceso docentes
            </Link>
            <a href={CARDENAL_RESPIRA_PROJECT.dashboardUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">
              Ver monitoreo
            </a>
          </div>
        </section>
      </section>
    </main>
  )
}

function InfoCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-7 shadow-2xl backdrop-blur-xl">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/15 text-cyan-200">
        {icon}
      </div>
      <h3 className="mt-5 text-3xl font-black">{title}</h3>
      <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{text}</p>
    </article>
  )
}
