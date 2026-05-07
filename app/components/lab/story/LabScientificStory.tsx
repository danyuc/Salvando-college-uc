'use client'

import { LAB_SUMMARY, ROUTE_POINTS, pmColor, pmLabel, typeLabel } from "../data/metroRoute"

export default function LabScientificStory({ current }: { current: any }) {
  const elevated = ROUTE_POINTS.filter((p) => p.type === "elevated")
  const underground = ROUTE_POINTS.filter((p) => p.type === "subterranean" || p.type === "transfer")
  const avg = (rows: any[], key: string) =>
    rows.length ? rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length : 0

  const elevatedAvg = avg(elevated, "pm25")
  const undergroundAvg = avg(underground, "pm25")
  const hypothesisConfirmed = undergroundAvg > elevatedAvg

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
          Hipótesis del estudio
        </p>

        <h2 className="mt-4 text-3xl font-black">
          La hipótesis inicial fue parcialmente rechazada
        </h2>

        <p className="mt-4 leading-7 text-slate-300">
          El grupo esperaba encontrar mayores concentraciones de PM2.5 en tramos elevados por su exposición directa a vías vehiculares. Sin embargo, el recorrido real mostró que los mayores niveles se concentraron en combinaciones, estaciones subterráneas y zonas con mayor densidad de pasajeros.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Mini title="Promedio elevado" value={`${elevatedAvg.toFixed(1)} µg/m³`} />
          <Mini title="Promedio subterráneo/combinación" value={`${undergroundAvg.toFixed(1)} µg/m³`} />
        </div>

        <div className="mt-5 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4">
          <p className="font-black text-fuchsia-200">
            Resultado: {hypothesisConfirmed ? "los datos apoyan mayor concentración en sectores cerrados." : "los datos no apoyan mayor concentración en sectores elevados."}
          </p>
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">
          ¿Por qué pudo ocurrir?
        </p>

        <div className="mt-5 grid gap-3">
          <Reason emoji="🚇" title="Túneles y estaciones cerradas" text="La menor ventilación favorece la acumulación de partículas finas en espacios subterráneos." />
          <Reason emoji="⚙️" title="Frenado, rieles y roce metálico" text="La fricción del sistema ferroviario puede resuspender partículas, especialmente en estaciones y combinaciones." />
          <Reason emoji="👥" title="Densidad de pasajeros" text="Los vagones llenos aumentan calor, humedad, movimiento y resuspensión de polvo." />
          <Reason emoji="🌧️" title="Lluvia durante el regreso" text={`La lluvia comenzó aproximadamente a las ${LAB_SUMMARY.rainStart}, coincidiendo con una baja relativa de PM2.5 en tramos exteriores.`} />
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-6 lg:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
          Estado ambiental actual
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-5">
          <Mini title="Estación/tramo" value={current.name} />
          <Mini title="Infraestructura" value={typeLabel(current.type)} />
          <Mini title="PM2.5" value={`${current.pm25} · ${pmLabel(current.pm25)}`} color={pmColor(current.pm25)} />
          <Mini title="Peak PM2.5" value={`${current.pm25} µg/m³`} color={pmColor(current.pm25)} />
          <Mini title="Personas aprox." value={`${current.crowd}`} />
        </div>

        <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4 leading-7 text-slate-300">
          {current.observation}
        </p>
      </article>

      <article className="rounded-[2rem] border border-red-400/20 bg-red-500/10 p-6 lg:col-span-2">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">
          Salud pública y exposición frecuente
        </p>

        <p className="mt-4 leading-7 text-slate-200">
          Una persona expuesta de forma constante a PM2.5 en transporte público podría experimentar irritación respiratoria, fatiga, dolor de cabeza o agravamiento de enfermedades como asma. En usuarios frecuentes y trabajadores del sistema, la exposición acumulativa puede representar un riesgo mayor porque las partículas finas pueden ingresar profundamente al sistema respiratorio.
        </p>
      </article>
    </section>
  )
}

function Mini({ title, value, color }: { title: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-xl font-black" style={{ color }}>{value}</p>
    </div>
  )
}

function Reason({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <h3 className="text-lg font-black">{emoji} {title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  )
}
