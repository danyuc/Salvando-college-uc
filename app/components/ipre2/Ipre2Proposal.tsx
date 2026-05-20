"use client"

import { IPRE2_SENSOR_71_DASHBOARD_URL } from "@/lib/ipre2"
import Ipre2Shell from "./Ipre2Shell"

const sections = [
  ["Qué es Explora IPRE2", "Una línea educativa de cápsulas, sesiones proyectables y participación en aula conectada con datos ambientales."],
  ["Cómo entra el docente", "El acceso es institucional y privado. Desde la entrada se elige material docente, sesión con estudiantes, ranking o cámara."],
  ["Material docente", "Cada módulo incluye objetivo, cápsula, guion, preguntas, dificultades esperadas y actividad de cierre."],
  ["Sesión con estudiantes", "El profesor proyecta preguntas A/B/C/D, cuenta manos y guía la discusión con feedback pedagógico."],
  ["Sistema de puntaje", "Cada pregunta suma puntos por mayoría correcta. El sistema refuerza sin castigar y guarda progreso local por curso."],
  ["Ranking por curso/colegio", "La primera versión compara cursos College; la arquitectura permite comparar colegios más adelante."],
  ["Cámara del teléfono como apoyo", "La cámara se activa sólo tras un click, no graba video, no identifica estudiantes y mantiene el conteo oficial en modo manual."],
  ["Sensor 71 y datos reales", "Sensor 71 funciona como disparador de preguntas. El dashboard se abre como fuente; live/demo/manual se etiqueta siempre."],
  ["Qué se puede investigar", "Comprensión de datos, participación, cambio conceptual, preguntas de aula, ciencia ciudadana y alfabetización ambiental."],
  ["Próximos pasos", "Conectar API live validada, migrar progreso a Supabase, sumar módulos reales y evaluar aprendizaje antes/después."],
] as const

export default function Ipre2Proposal() {
  return (
    <Ipre2Shell>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10">
        <header className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-300">Propuesta profesora Estela</p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black md:text-7xl">Explora IPRE2 como línea educativa e investigable</h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-300">
            Esto no es Cardenal Respira en sí: es una línea educativa conectada a escuelas mediante cápsulas, interacción en vivo y datos ambientales como activadores de aprendizaje.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {sections.map(([title, text]) => (
            <article key={title} className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">{text}</p>
            </article>
          ))}
        </section>

        <article className="rounded-[2rem] border border-cyan-300/20 bg-cyan-300/10 p-6 shadow-2xl">
          <h2 className="text-2xl font-black">Dashboard Sensor 71</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-slate-300">
            Si no existe API live validada, se muestra dashboard/fallback y cualquier lectura local se etiqueta como DEMO o MANUAL.
          </p>
          <a href={IPRE2_SENSOR_71_DASHBOARD_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">
            Abrir dashboard en vivo
          </a>
        </article>
      </section>
    </Ipre2Shell>
  )
}
