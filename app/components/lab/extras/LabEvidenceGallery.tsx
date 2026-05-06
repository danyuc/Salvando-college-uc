'use client'

const photos = [
  {
    title: "Vagón con alta ocupación",
    text: "Evidencia visual del regreso desde Plaza Egaña con alta densidad de pasajeros.",
    src: "/lab/photos/vagon-lleno.jpg",
  },
  {
    title: "Combinación / andén",
    text: "Espacio de circulación con posible acumulación de ruido y partículas.",
    src: "/lab/photos/anden.jpg",
  },
]

export default function LabEvidenceGallery() {
  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
        Evidencia fotográfica
      </p>
      <h2 className="mt-3 text-4xl font-black">Contexto visual del recorrido</h2>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {photos.map((photo) => (
          <article key={photo.title} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60">
            <div className="aspect-video bg-slate-900">
              <img
                src={photo.src}
                alt={photo.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            </div>
            <div className="p-5">
              <h3 className="text-2xl font-black">{photo.title}</h3>
              <p className="mt-2 leading-6 text-slate-300">{photo.text}</p>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 text-sm text-slate-400">
        Puedes agregar imágenes en public/lab/photos con los nombres vagon-lleno.jpg y anden.jpg.
      </p>
    </section>
  )
}
