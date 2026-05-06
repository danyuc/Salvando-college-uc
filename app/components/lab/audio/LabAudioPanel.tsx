'use client'

export default function LabAudioPanel() {
  return (
    <section className="rounded-3xl border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
        <h2 className="text-xl font-semibold text-white">
          Evidencia de audio ambiental
        </h2>
      </div>

      <p className="mb-6 text-sm text-neutral-300">
        Registro auditivo del recorrido ambiental realizado entre
        San Joaquín → Plaza Egaña → San Joaquín.
      </p>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="mb-2 text-sm text-neutral-400">
            Audio — tramo elevado con lluvia
          </p>

          <audio controls className="w-full">
            <source src="/audio/lluvia-metro.mp3" type="audio/mpeg" />
          </audio>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="mb-2 text-sm text-neutral-400">
            Audio — tramo subterráneo
          </p>

          <audio controls className="w-full">
            <source src="/audio/subterraneo.mp3" type="audio/mpeg" />
          </audio>
        </div>
      </div>
    </section>
  )
}