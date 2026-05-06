'use client'

import dynamic from "next/dynamic"

const LeafletEnvironmentalMap = dynamic(
  () => import("./LeafletEnvironmentalMap"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[420px] place-items-center rounded-3xl border border-white/10 bg-slate-900 text-sm font-black text-slate-300">
        Cargando mapa ambiental...
      </div>
    ),
  }
)

export default LeafletEnvironmentalMap
