"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import {
  AIR_QUALITY_DEMO_DATA,
  CARDENAL_RESPIRA_PROJECT,
  CRSH_SENSORS,
  CURRICULAR_LINKS,
} from "@/lib/cardenal-respira"
import AnimatedAirParticles from "./AnimatedAirParticles"
import AirQualityTrafficLight from "./AirQualityTrafficLight"
import SensorDashboardCard from "./SensorDashboardCard"

const slides = [
  { eyebrow: "Apertura", title: "Cardenal Respira", text: "Calidad del aire, salud escolar y ciencia ciudadana." },
  { eyebrow: "Pregunta", title: "¿Qué aire respiramos en el colegio?", text: "La calidad del aire deja de ser un tema lejano cuando observamos datos del propio entorno escolar." },
  { eyebrow: "Sensor", title: "Qué mide", text: "PM2.5, PM10, temperatura y humedad: señales simples para abrir conversaciones científicas." },
  { eyebrow: "PM2.5", title: "Lo invisible también importa", text: "PM2.5 son partículas pequeñas que no siempre se ven, pero ayudan a comprender ambiente, salud y aprendizaje." },
  { eyebrow: "Ecosistema", title: "El sensor es solo el inicio", text: "El valor aparece cuando los datos llegan a clases, proyectos TP, ciudadanía e innovación." },
  { eyebrow: "Live", title: "Monitoreo conectado", text: "El dashboard de sensor.aireciudadano.com permite abrir una ventana viva al entorno escolar." },
  { eyebrow: "Semáforo", title: "Interpretar sin alarmar", text: "Un semáforo educativo ayuda a conversar, comparar y decidir actividades pedagógicas." },
  { eyebrow: "Día demo", title: "Tal día, tal condición, tal acción", text: "Datos demostrativos: una condición moderada puede gatillar una clase sobre ventilación y entorno urbano." },
  { eyebrow: "Currículum", title: "Vinculación curricular", text: CURRICULAR_LINKS.join(" · ") },
  { eyebrow: "Docentes", title: "Panel docente", text: "Sensores, materiales, ideas de clase, dashboard, resumen exportable y modo demo claro." },
  { eyebrow: "Estudiantes", title: "Proyectos con propósito", text: "Paneles, alertas, campañas, ferias científicas y comparaciones interior/exterior." },
  { eyebrow: "TP", title: "Innovación TP", text: "Programación, electrónica, diseño, salud y datos pueden construir soluciones escolares reales." },
  { eyebrow: "Investigación", title: "Escuela + UC + Belén Educa", text: "Una línea rigurosa y cuidadosa de ciencia ciudadana. Explora: oportunidad en revisión." },
  { eyebrow: "Seguridad", title: "Bajo riesgo, alto valor", text: "Instalación exterior, bajo consumo, equipo silencioso y datos ambientales anonimados." },
  { eyebrow: "Cierre", title: "Con un primer sí, se abren muchas puertas.", text: "Autorizar un punto seguro de instalación puede activar aprendizaje, prevención e innovación." },
]

export default function CardenalPresentation() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const progress = ((index + 1) / slides.length) * 100
  const demoPoint = AIR_QUALITY_DEMO_DATA[Math.min(2, AIR_QUALITY_DEMO_DATA.length - 1)]

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
    if (index === 5) return <SensorDashboardCard sensor={CRSH_SENSORS[0]} preview={false} />
    if (index === 6 || index === 7) return <AirQualityTrafficLight point={demoPoint} />
    return <SensorFlow />
  }, [index, demoPoint])

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

            {index === 14 && (
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

function SensorFlow() {
  const steps = ["Sensor", "Dashboard", "Clase", "Proyectos", "Decisiones"]
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
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
    </div>
  )
}
