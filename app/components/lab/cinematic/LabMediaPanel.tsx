'use client'

export default function LabMediaPanel({
  current,
}: {
  current: any
}) {
  return (
    <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
          Evidencia fotográfica
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <img
            src={`/lab/images/${current.id}.jpg`}
            alt={current.name}
            className="h-[320px] w-full object-cover"
          />
        </div>
      </article>

      <article className="rounded-[2rem] border border-white/10 bg-white/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">
          Evidencia sonora
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
          <audio
            controls
            className="w-full"
            src={`/lab/audio/${current.id}.mp3`}
          />

          <p className="mt-4 text-sm leading-6 text-slate-300">
            Registro acústico correspondiente al tramo:
            {" "}
            <span className="font-black">
              {current.name}
            </span>
          </p>
        </div>
      </article>
    </section>
  )
}
