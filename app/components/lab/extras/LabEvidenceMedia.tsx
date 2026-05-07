'use client'

const evidence = [
  {
    title: "Vagón lleno desde Plaza Egaña",
    photo: "/lab/photos/vagon-plaza-egana.jpg",
    audio: "/lab/audio/plaza-egana-vagon-lleno.mp3",
    text: "Evidencia de alta ocupación durante el regreso. Esto ayuda a explicar mayor calor, humedad, ruido y resuspensión de partículas.",
  },
  {
    title: "Tramo con peak relativo",
    photo: "/lab/photos/trinidad.jpg",
    audio: "/lab/audio/trinidad-peak.mp3",
    text: "Trinidad concentró el peak relativo de PM2.5 del recorrido medido por el sensor.",
  },
  {
    title: "Lluvia durante el regreso",
    photo: "/lab/photos/plaza-egana.jpg",
    audio: "/lab/audio/lluvia-regreso.mp3",
    text: "La lluvia aparece durante el regreso y puede relacionarse con una baja relativa del PM2.5 en tramos exteriores.",
  },
]

export default function LabEvidenceMedia() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
        Evidencia del recorrido
      </p>

      <h2 className="mt-3 text-4xl font-black">Fotos, audios y contexto ambiental</h2>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {evidence.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <img src={item.photo} alt={item.title} className="h-56 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              <audio controls className="mt-4 w-full">
                <source src={item.audio} />
              </audio>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
