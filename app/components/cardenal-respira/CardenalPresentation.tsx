"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import {
  CARDENAL_RESPIRA_PROJECT,
  CRSH_SENSORS,
  STATUS_LABELS,
  buildDemoReading,
} from "@/lib/cardenal-respira"
import AnimatedAirParticles from "./AnimatedAirParticles"
import AirQualityTrafficLight from "./AirQualityTrafficLight"
import SensorDashboardCard from "./SensorDashboardCard"

const slides = [
  { eyebrow: "Apertura", title: "Cardenal Respira", text: "Calidad del aire, salud escolar y ciencia ciudadana." },
  { eyebrow: "Laboratorio vivo", title: "¿Qué aire respiramos en el colegio?", text: "El colegio se transforma en un laboratorio vivo de ciencia, datos y ciudadanía." },
  { eyebrow: "Sensor 71", title: "Sensor 71 en vivo", text: "Una referencia College UC para abrir el dashboard, observar datos y conversar con transparencia sobre live, demo y manual." },
  { eyebrow: "Transparencia", title: "Datos reales + datos demostrativos", text: "La pantalla siempre indica si la lectura es LIVE, DEMO, MANUAL, PENDING CONNECTION u OFFLINE." },
  { eyebrow: "Por qué importa", title: "Lo invisible se vuelve observable", text: "PM2.5 y PM10 permiten desarrollar lectura de datos, pensamiento crítico y cuidado escolar sin alarmismo." },
  { eyebrow: "Del dato a la decisión", title: "Sensor → Dashboard → Semáforo → Pregunta → Acción", text: "La tecnología vale cuando se transforma en preguntas educativas y acciones de clase." },
  { eyebrow: "Historia", title: "Tal día pasó esto", text: "Tal día el semáforo estuvo moderado. El curso comparó ventilación, horario y entorno." },
  { eyebrow: "Docente mañana", title: "Qué puede hacer un docente mañana", text: "15 minutos de semáforo, 45 minutos PM2.5 vs PM10 o un desafío TP de alerta/dashboard." },
  { eyebrow: "Reto en vivo", title: "Reto ambiental en vivo", text: "Levanten la mano quienes creen que es A. La clase vota, aprende y suma puntos ambientales." },
  { eyebrow: "Ranking", title: "Ranking de cursos", text: "Curso 7A: 1000 puntos · Curso 8B: 800 puntos · Curso 6A: 650 puntos." },
  { eyebrow: "Dirección", title: "Director dashboard", text: "Estado del sensor, uso educativo, participación docente, proyectos y decisiones informadas." },
  { eyebrow: "El proyecto real", title: "El sensor no es el proyecto", text: "El sensor es el inicio; el proyecto real es lo que estudiantes y docentes construyen con los datos." },
  { eyebrow: "Cierre", title: "Con un primer sí, se abren muchas puertas.", text: "Autorizar un punto seguro de instalación puede activar aprendizaje, prevención e innovación." },
]

export default function CardenalPresentation() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const progress = ((index + 1) / slides.length) * 100
  const sensor = CRSH_SENSORS[0]
  const reading = buildDemoReading(sensor, 1)

  const canPrev = index > 0
  const canNext = index < slides.length - 1

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault()
        setIndex((current) => Math.min(slides.length - 1, current + 1))
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(0, current - 1))
      }
      if (event.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const visual = useMemo(() => {
    if (index === 2) return <SensorLiveCard />
    if (index === 3) return <StatusBadges />
    if (index === 5) return <DecisionFlow />
    if (index === 6) return <AirQualityTrafficLight reading={reading} />
    if (index === 8) return <LiveChallengeMock />
    if (index === 9) return <RankingMock />
    if (index === 10) return <DirectorMock />
    if (index === 12) return <SensorDashboardCard sensor={sensor} preview={false} />
    return <SensorFlow />
  }, [index, reading, sensor])

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <AnimatedAirParticles />
      <div className="absolute left-0 top-0 h-1 bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />

      <section className="relative z-10 grid min-h-screen place-items-center px-6 py-10">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.38em] text-cyan-300">{slide.eyebrow}</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight md:text-7xl">{slide.title}</h1>
            <p className="mt-6 max-w-3xl text-xl font-semibold leading-9 text-slate-300">{slide.text}</p>

            {index === slides.length - 1 && (
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/cardenal-respira/docentes" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
                  Acceso docentes
                </Link>
                <a href={CARDENAL_RESPIRA_PROJECT.dashboardUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white">
                  Abrir monitoreo
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>

          <div>{visual}</div>
        </motion.div>
      </section>

      <footer className="fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <button disabled={!canPrev} onClick={() => setIndex((current) => Math.max(0, current - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 disabled:opacity-40">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-black">{index + 1} / {slides.length}</span>
        <button disabled={!canNext} onClick={() => setIndex((current) => Math.min(slides.length - 1, current + 1))} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 disabled:opacity-40">
          <ChevronRight size={18} />
        </button>
      </footer>
    </main>
  )
}

function GlassCard({ children }: { children: ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">{children}</div>
}

function SensorFlow() {
  const steps = ["Sensor", "Dashboard", "Clase", "Proyectos", "Decisiones"]
  return (
    <GlassCard>
      <div className="grid gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            className="rounded-3xl border border-white/10 bg-slate-950/60 p-5"
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2.4, delay: index * 0.15, repeat: Infinity }}
          >
            <p className="text-sm font-black text-cyan-200">0{index + 1}</p>
            <p className="mt-1 text-2xl font-black">{step}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}

function SensorLiveCard() {
  const reading = buildDemoReading(CRSH_SENSORS[0], 1)
  return (
    <GlassCard>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Sensor 71 · College UC</p>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <Metric label="PM2.5" value={reading.pm25} />
        <Metric label="PM10" value={reading.pm10} />
        <Metric label="Temp." value={reading.temperature} />
        <Metric label="Humedad" value={reading.humidity} />
      </div>
      <p className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm font-bold text-amber-100">
        {reading.sourceLabel}
      </p>
    </GlassCard>
  )
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 p-5">
      <p className="text-sm font-black text-slate-400">{label}</p>
      <p className="mt-2 text-4xl font-black">{value ?? "—"}</p>
    </div>
  )
}

function StatusBadges() {
  return (
    <GlassCard>
      <div className="grid gap-3">
        {Object.values(STATUS_LABELS).map((label) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 text-2xl font-black">
            {label}
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

function DecisionFlow() {
  return (
    <GlassCard>
      {["Sensor", "Dashboard", "Semáforo", "Pregunta educativa", "Acción de clase"].map((item) => (
        <div key={item} className="mb-3 rounded-3xl bg-cyan-300/10 p-4 text-xl font-black text-cyan-50 last:mb-0">
          {item}
        </div>
      ))}
    </GlassCard>
  )
}

function LiveChallengeMock() {
  return (
    <GlassCard>
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Reto en vivo</p>
      <h3 className="mt-3 text-3xl font-black">¿Qué mide PM2.5?</h3>
      {["A · Partículas finas", "B · Temperatura", "C · Internet", "D · Asistencia"].map((item, index) => (
        <div key={item} className="mt-3 rounded-2xl bg-white/10 p-4 font-black">
          {item}
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${[72, 12, 8, 8][index]}%` }} />
          </div>
        </div>
      ))}
    </GlassCard>
  )
}

function RankingMock() {
  return (
    <GlassCard>
      {[
        ["Curso 7A", "1000 puntos"],
        ["Curso 8B", "800 puntos"],
        ["Curso 6A", "650 puntos"],
      ].map(([course, score], index) => (
        <div key={course} className="mb-3 flex items-center justify-between rounded-3xl bg-slate-950/60 p-5 last:mb-0">
          <span className="text-2xl font-black">#{index + 1} {course}</span>
          <span className="text-xl font-black text-cyan-200">{score}</span>
        </div>
      ))}
    </GlassCard>
  )
}

function DirectorMock() {
  return (
    <GlassCard>
      {["Estado sensor", "Uso educativo", "Participación docente", "Ideas de proyectos", "Decisiones informadas"].map((item) => (
        <div key={item} className="mb-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-lg font-black last:mb-0">
          {item}
        </div>
      ))}
    </GlassCard>
  )
}
