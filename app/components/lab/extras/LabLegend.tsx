'use client'

export default function LabLegend() {
  const pm = [
    ["Buena", "0–12", "#22c55e"],
    ["Moderada", "13–35", "#eab308"],
    ["Dañina sensibles", "36–55", "#f97316"],
    ["Dañina", "56+", "#ef4444"],
  ]

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
        Leyenda ambiental
      </p>

      <h2 className="mt-3 text-3xl font-black">Semáforo PM2.5 del recorrido</h2>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {pm.map(([label, range, color]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-3 h-3 rounded-full" style={{ background: color }} />
            <p className="text-lg font-black">{label}</p>
            <p className="text-sm text-slate-400">{range} µg/m³</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-300">
        Escala visual usada para interpretar el material particulado fino durante el trayecto. Los colores del mapa, tarjetas y gráficos cambian según el nivel de PM2.5 registrado por estación o tramo.
      </p>
    </section>
  )
}
