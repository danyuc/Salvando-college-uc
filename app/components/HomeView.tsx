"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useUser } from "@/lib/useUser";
import {
  ACADEMIC_EVENTS,
  SUBJECT_THEMES,
  daysUntil,
  getRisk,
} from "@/lib/academic-calendar-data";

function upcomingEvents() {
  return ACADEMIC_EVENTS
    .filter((event) => daysUntil(event.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function MetricCard({
  title,
  value,
  desc,
}: {
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
      <p className="text-sm font-black text-slate-300">{title}</p>

      <div className="mt-3 flex items-end gap-2">
        <p className="text-4xl font-black leading-none text-white">{value}</p>
        <p className="pb-1 text-sm font-bold text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

export default function HomeView() {
  const { name, email } = useUser();

  const upcoming = useMemo(() => upcomingEvents(), []);
  const next = upcoming[0];
  const urgent = upcoming.filter((event) =>
    ["alto", "urgente"].includes(getRisk(event))
  );
  const follow = upcoming.filter((event) => { const risk = getRisk(event); return risk === "activo" || risk === "estable"; });
  const totalWeight = upcoming.slice(0, 6).reduce((acc, event) => acc + event.weight, 0);
  const todayPlan = upcoming.slice(0, 3);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_top_right,rgba(124,58,237,0.22),transparent_34%),linear-gradient(135deg,#071025,#0b1020_48%,#07111f)] px-6 py-8 text-white md:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(124,58,237,0.28),transparent_32%)]" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr_0.7fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-sky-300">
                Salvando College UC
              </p>

              <h1 className="mt-5 text-5xl font-black tracking-tight text-white md:text-7xl">
                Hola, {name}
              </h1>

              <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-slate-300 md:text-xl">
                Tu cockpit académico: fechas, riesgo, práctica y notas en un solo panel inteligente.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/precalculo-full"
                  className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5"
                >
                  Pre Cálculo MAT1000
                </Link>

                <Link
                  href="/practica"
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Practicar foco
                </Link>

                <Link
                  href="/diagnostico"
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Diagnóstico
                </Link>

                <Link
                  href="/calendario"
                  className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/15"
                >
                  Calendario + notas
                </Link>
              </div>

              <div className="mt-8 w-fit rounded-3xl border border-white/10 bg-slate-950/45 p-5">
                <p className="text-sm font-semibold text-slate-400">Usuario UC</p>
                <p className="mt-1 text-xl font-black text-white">{name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {email || "Correo institucional registrado"}
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-7 shadow-xl">
              <p className="text-sm font-black text-sky-300">Estado académico</p>
              <p className="mt-4 text-4xl font-black text-white">
                {next ? "Activo" : "Sin fechas"}
              </p>

              <p className="mt-4 text-base font-semibold leading-7 text-slate-300">
                {next
                  ? `${SUBJECT_THEMES[next.subjectCode]?.name ?? next.subjectCode}: ${next.title} en ${daysUntil(next.date)} días`
                  : "Agrega evaluaciones para activar predicción y coach."}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Próximas"
            value={String(upcoming.length)}
            desc="evaluaciones vigentes"
          />

          <MetricCard
            title="Urgentes"
            value={String(urgent.length)}
            desc="riesgo alto o cercano"
          />

          <MetricCard
            title="Seguimiento"
            value={String(follow.length)}
            desc="sin riesgo alto"
          />

          <MetricCard
            title="Peso próximo"
            value={`${totalWeight}%`}
            desc="siguientes 6 eventos"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
                  Foco del día
                </p>

                <h2 className="mt-3 text-3xl font-black text-white">
                  Plan recomendado
                </h2>
              </div>

              <Link
                href="/calendario"
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950"
              >
                Gestionar
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {todayPlan.length > 0 ? (
                todayPlan.map((event, index) => {
                  const theme = SUBJECT_THEMES[event.subjectCode];

                  return (
                    <div
                      key={`${event.subjectCode}-${event.title}-${event.date}`}
                      className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-slate-950">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-black text-white">
                          {theme?.icon} {theme?.name ?? event.subjectCode} · {event.title}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-400">
                          {event.unit || "Unidad pendiente"} · {daysUntil(event.date)} días
                        </p>
                      </div>

                      <span className="rounded-full bg-sky-400/15 px-4 py-2 text-xs font-black text-sky-200">
                        {getRisk(event)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl bg-slate-950/35 p-6">
                  <p className="text-lg font-black text-white">Sin foco por ahora</p>
                  <p className="mt-2 text-sm font-semibold text-slate-400">
                    Cuando agregues fechas, aparecerá un plan automático por prioridad.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-7 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
              Próxima evaluación
            </p>

            {next ? (
              <div className="mt-6">
                <div className="grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-4xl">
                  {SUBJECT_THEMES[next.subjectCode]?.icon ?? "📌"}
                </div>

                <h2 className="mt-5 text-3xl font-black text-white">{next.title}</h2>

                <p className="mt-3 text-base font-semibold text-slate-300">
                  {SUBJECT_THEMES[next.subjectCode]?.name ?? next.subjectCode}
                </p>

                <div className="mt-5 rounded-3xl bg-slate-950/35 p-5">
                  <p className="text-sm font-bold text-slate-400">Fecha</p>
                  <p className="mt-1 text-xl font-black text-white">{formatDate(next.date)}</p>

                  <p className="mt-4 text-sm font-bold text-slate-400">Peso y riesgo</p>
                  <p className="mt-1 text-xl font-black text-white">
                    {next.weight}% · {getRisk(next)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl bg-slate-950/35 p-6">
                <p className="text-xl font-black text-white">Sin evaluaciones</p>
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  Abre calendario para registrar fechas y notas.
                </p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

