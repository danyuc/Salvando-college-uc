'use client'

import Link from "next/link"
import { useMemo, useState } from "react"

type MetricCard = {
  title: string
  value: string
  desc: string
  icon: string
}

export default function LabAmbientalClient() {
  const [csvLoaded, setCsvLoaded] = useState(false)

  const metrics = useMemo<MetricCard[]>(() => [
    {
      title: "PM2.5",
      value: csvLoaded ? "— µg/m³" : "Sin CSV",
      desc: "Material particulado fino por punto GPS",
      icon: "🌫️",
    },
    {
      title: "Humedad",
      value: csvLoaded ? "— %" : "Sin datos",
      desc: "Condición ambiental dentro del recorrido",
      icon: "💧",
    },
    {
      title: "Temperatura",
      value: csvLoaded ? "— °C" : "Sin datos",
      desc: "Lectura térmica asociada al tramo",
      icon: "🌡️",
    },
    {
      title: "Ruido",
      value: csvLoaded ? "— dB" : "Manual",
      desc: "Decibeles por estación, tramo y peak",
      icon: "🔊",
    },
    {
      title: "Bacterias",
      value: csvLoaded ? "— UFC" : "Manual",
      desc: "Hisopos, exposición y conteo bacteriano",
      icon: "🦠",
    },
    {
      title: "Tramos",
      value: "Elevado / subterráneo",
      desc: "Comparación por tipo de recorrido Metro",
      icon: "🚇",
    },
  ], [csvLoaded])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
              Seminario privado
            </p>
            <h1 className="text-2xl font-black">
              Laboratorio Ambiental Metro
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black hover:bg-white/20"
          >
            ← Salir al inicio
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-200">
            Investigación aplicada
          </p>

          <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            PM2.5, humedad, temperatura, ruido, bacterias y tramos del Metro
          </h2>

          <p className="mt-5 max-w-3xl text-lg font-medium text-slate-300">
            Panel privado para analizar recorridos con sensores, muestras manuales,
            GPS, comparación elevado/subterráneo y preparación del informe científico.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <label className="cursor-pointer rounded-3xl border border-white/10 bg-white/10 p-5 hover:bg-white/15">
              <p className="text-sm font-black text-cyan-200">Cargar CSV del sensor</p>
              <p className="mt-1 text-sm text-slate-300">
                ID, sesión, fecha/hora UNIX, latitud, longitud, PM2.5, humedad y temperatura.
              </p>
              <input
                type="file"
                accept=".csv"
                className="mt-4 block w-full text-sm text-slate-300"
                onChange={() => setCsvLoaded(true)}
              />
            </label>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-black text-emerald-200">Modo paper científico</p>
              <p className="mt-1 text-sm text-slate-300">
                Hipótesis, resultados preliminares, limitaciones e interpretación.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
              <p className="text-sm font-black text-purple-200">Exportación Excel</p>
              <p className="mt-1 text-sm text-slate-300">
                PM25_GPS, Decibeles, Bacterias, Ranking_Tramos y Resumen_Cientifico.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <article
              key={metric.title}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl"
            >
              <div className="text-3xl">{metric.icon}</div>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-slate-400">
                {metric.title}
              </p>
              <h3 className="mt-2 text-3xl font-black">{metric.value}</h3>
              <p className="mt-2 text-sm text-slate-300">{metric.desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">
              Mapa y recorrido
            </p>
            <div className="mt-4 grid h-[420px] place-items-center rounded-3xl border border-white/10 bg-slate-900">
              <div className="text-center">
                <p className="text-5xl">🗺️</p>
                <p className="mt-3 text-xl font-black">Mapa ambiental interactivo</p>
                <p className="mt-2 max-w-md text-sm text-slate-400">
                  Aquí irá el recorrido GPS, puntos PM2.5, línea del trayecto,
                  heatmap visual y animación del marcador.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-200">
              Formularios manuales
            </p>

            <div className="mt-4 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
                <h3 className="text-xl font-black">Registro de decibeles</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Línea, estación origen/destino, tipo de tramo, salida, mitad,
                  llegada y peak dB.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
                <h3 className="text-xl font-black">Registro de bacterias</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Código B1/B2, lugar de muestra, minutos de exposición y UFC.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-900 p-5">
                <h3 className="text-xl font-black">Ranking de tramos</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Comparación elevado, subterráneo y transición según contaminación,
                  ruido y bacterias.
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
