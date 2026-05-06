'use client'

export default function LabPaperConclusion() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-7 shadow-[0_0_80px_rgba(6,182,212,.08)]">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
        Conclusión tipo paper
      </p>

      <h2 className="mt-4 text-4xl font-black">
        El recorrido evidencia una interacción ambiental compleja
      </h2>

      <p className="mt-5 leading-8 text-slate-300">
        Los resultados no permiten afirmar de forma simple que los tramos elevados sean siempre más contaminados.
        La evidencia del recorrido sugiere que la concentración de PM2.5 depende de una combinación de factores:
        tipo de infraestructura, ventilación, densidad de pasajeros, fricción ferroviaria, combinaciones, lluvia y
        permanencia dentro del sistema.
      </p>

      <p className="mt-4 leading-8 text-slate-300">
        La hipótesis inicial se rechaza parcialmente, ya que algunos peaks importantes se asociaron a momentos de
        mayor congestión, transición o combinación, y no exclusivamente a la exposición exterior. Esto refuerza la
        necesidad de estudiar el Metro como un microambiente urbano dinámico, donde la exposición cotidiana puede
        variar significativamente incluso dentro de un mismo viaje.
      </p>
    </section>
  )
}
