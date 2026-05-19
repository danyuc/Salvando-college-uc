"use client";

import { useMemo, useState } from "react";
import {
  DIAGNOSTIC_QUESTIONS,
  PAST_EXAMS,
  PRECALCULO_EXAMS,
  type PrecalculoExamId,
} from "@/lib/precalculo-full-data";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function polarToPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: 160 + Math.cos(rad) * radius,
    y: 160 - Math.sin(rad) * radius,
    sin: Math.sin(rad),
    cos: Math.cos(rad),
    rad,
  };
}

function wavePath(amplitude: number, frequency: number, phase: number) {
  return Array.from({ length: 120 }, (_, i) => {
    const t = (i / 119) * Math.PI * 2;
    const x = 20 + (i / 119) * 420;
    const y = 125 - amplitude * 42 * Math.sin(frequency * (t - phase));
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

export default function PrecalculoFullClient() {
  const [activeExam, setActiveExam] = useState<PrecalculoExamId>("i1");
  const [activeTopic, setActiveTopic] = useState<string>("algebra-base");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [angle, setAngle] = useState(45);
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);

  const exam = useMemo(
    () => PRECALCULO_EXAMS.find((item) => item.id === activeExam) ?? PRECALCULO_EXAMS[0],
    [activeExam]
  );

  const selectedTopic = useMemo(
    () => exam.topics.find((topic) => topic.id === activeTopic) ?? exam.topics[0],
    [exam, activeTopic]
  );

  const questions = useMemo(
    () => DIAGNOSTIC_QUESTIONS.filter((question) => question.examId === activeExam),
    [activeExam]
  );

  const answered = questions.filter((question) => answers[question.id] !== undefined);
  const correct = answered.filter((question) => answers[question.id] === question.answerIndex);
  const score = answered.length === 0 ? 0 : Math.round((correct.length / answered.length) * 100);

  const weakTags = questions
    .filter((question) => answers[question.id] !== undefined && answers[question.id] !== question.answerIndex)
    .map((question) => question.mistakeTag);

  const point = polarToPoint(angle, 115);
  const period = frequency === 0 ? "∞" : `${(2 / frequency).toFixed(2)}π`;

  function changeExam(id: PrecalculoExamId) {
    const nextExam = PRECALCULO_EXAMS.find((item) => item.id === id) ?? PRECALCULO_EXAMS[0];
    setActiveExam(id);
    setActiveTopic(nextExam.topics[0]?.id ?? "");
    setAnswers({});
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#ecfeff)] px-4 py-8 text-slate-950 dark:from-slate-950 dark:to-slate-900">
      <section className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-blue-600">
                Salvando College · MAT1000
              </p>

              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Pre Cálculo Full
              </h1>

              <p className="mt-4 max-w-3xl text-base font-medium leading-8 text-slate-600 md:text-lg">
                Ruta premium para estudiar I1, I2, I3 y Examen con mapa temático, fórmulas,
                diagnóstico express, errores típicos y trigonometría visual.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-3xl bg-slate-950 p-4 text-white shadow-xl">
              <div>
                <p className="text-xs font-bold text-slate-400">Avance</p>
                <p className="text-2xl font-black">{score}%</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Bloques</p>
                <p className="text-2xl font-black">{exam.topics.length}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Min.</p>
                <p className="text-2xl font-black">{exam.estimatedMinutes}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {PRECALCULO_EXAMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeExam(item.id)}
                className={cx(
                  "rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-xl",
                  activeExam === item.id
                    ? "border-blue-500 bg-blue-600 text-white shadow-xl shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-800"
                )}
              >
                <p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">
                  {item.difficulty}
                </p>
                <p className="mt-2 text-lg font-black">{item.title}</p>
                <p className="mt-2 text-sm font-semibold opacity-80">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
          <aside className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
              Ruta de estudio
            </p>

            <h2 className="mt-2 text-2xl font-black">{exam.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{exam.goal}</p>

            <div className="mt-6 space-y-3">
              {exam.topics.map((topic, index) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setActiveTopic(topic.id)}
                  className={cx(
                    "w-full rounded-3xl border p-4 text-left transition hover:bg-slate-50",
                    selectedTopic.id === topic.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                    Bloque {index + 1}
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-950">{topic.title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{topic.why}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
              Bloque activo
            </p>

            <h2 className="mt-2 text-3xl font-black">{selectedTopic.title}</h2>
            <p className="mt-3 text-base font-semibold leading-8 text-slate-600">
              {selectedTopic.why}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm font-black">Habilidades</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-200">
                  {selectedTopic.skills.map((skill) => (
                    <li key={skill}>• {skill}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-black text-blue-900">Fórmulas</p>
                <ul className="mt-3 space-y-2 text-sm font-bold text-blue-950">
                  {selectedTopic.formulas.map((formula) => (
                    <li key={formula} className="rounded-2xl bg-white p-3 shadow-sm">
                      {formula}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-rose-50 p-5">
                <p className="text-sm font-black text-rose-900">Errores típicos</p>
                <ul className="mt-3 space-y-2 text-sm font-semibold text-rose-950">
                  {selectedTopic.commonMistakes.map((mistake) => (
                    <li key={mistake}>• {mistake}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-black text-slate-950">Práctica recomendada</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {selectedTopic.practice.map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-600">
              Diagnóstico express
            </p>

            <h2 className="mt-2 text-3xl font-black">Detecta tus errores antes de estudiar</h2>

            <div className="mt-6 space-y-5">
              {questions.map((question) => {
                const selected = answers[question.id];

                return (
                  <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="font-black text-slate-950">{question.prompt}</p>

                    <div className="mt-4 grid gap-3">
                      {question.options.map((option, index) => {
                        const isSelected = selected === index;
                        const isCorrect = question.answerIndex === index;
                        const showState = selected !== undefined;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: index,
                              }))
                            }
                            className={cx(
                              "rounded-2xl border p-3 text-left text-sm font-bold transition",
                              !showState && "border-slate-200 bg-slate-50 hover:bg-slate-100",
                              showState && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-900",
                              showState && isSelected && !isCorrect && "border-rose-400 bg-rose-50 text-rose-900",
                              showState && !isSelected && !isCorrect && "border-slate-200 bg-slate-50 text-slate-500"
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {selected !== undefined && (
                      <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm font-semibold leading-7 text-white">
                        {question.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-bold text-slate-400">Resultado</p>
              <p className="mt-1 text-4xl font-black">{score}%</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                {weakTags.length > 0
                  ? `Refuerza: ${Array.from(new Set(weakTags)).join(", ")}.`
                  : "Responde el diagnóstico para detectar debilidades."}
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-600">
              Trigonometría visual
            </p>

            <h2 className="mt-2 text-3xl font-black">Círculo unitario + onda seno</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
              Mueve los controles para ver cómo cambian seno, coseno, amplitud, periodo y desfase.
            </p>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-4 text-white">
                <svg viewBox="0 0 320 320" className="h-auto w-full">
                  <circle cx="160" cy="160" r="115" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                  <line x1="30" y1="160" x2="290" y2="160" stroke="rgba(255,255,255,0.35)" />
                  <line x1="160" y1="30" x2="160" y2="290" stroke="rgba(255,255,255,0.35)" />
                  <line x1="160" y1="160" x2={point.x} y2={point.y} stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                  <line x1={point.x} y1={point.y} x2={point.x} y2="160" stroke="#22c55e" strokeWidth="3" strokeDasharray="6 6" />
                  <line x1="160" y1={point.y} x2={point.x} y2={point.y} stroke="#f97316" strokeWidth="3" strokeDasharray="6 6" />
                  <circle cx={point.x} cy={point.y} r="9" fill="#ffffff" />
                  <text x="170" y="38" fill="white" fontSize="13" fontWeight="700">sin θ</text>
                  <text x="255" y="154" fill="white" fontSize="13" fontWeight="700">cos θ</text>
                </svg>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-inner">
                <svg viewBox="0 0 460 250" className="h-auto w-full">
                  <rect x="0" y="0" width="460" height="250" rx="24" fill="#f8fafc" />
                  <line x1="20" y1="125" x2="440" y2="125" stroke="#94a3b8" strokeWidth="1" />
                  <line x1="20" y1="40" x2="20" y2="210" stroke="#94a3b8" strokeWidth="1" />
                  <path d={wavePath(amplitude, frequency, phase)} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
                  <text x="24" y="32" fill="#0f172a" fontSize="14" fontWeight="800">
                    y = {amplitude.toFixed(1)} sin({frequency.toFixed(1)}(x - {phase.toFixed(1)}))
                  </text>
                </svg>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="rounded-3xl bg-slate-50 p-4 text-sm font-black">
                Ángulo: {angle}°
                <input className="mt-3 w-full" type="range" min="0" max="360" value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
              </label>

              <label className="rounded-3xl bg-slate-50 p-4 text-sm font-black">
                Amplitud: {amplitude.toFixed(1)}
                <input className="mt-3 w-full" type="range" min="0.5" max="2.5" step="0.1" value={amplitude} onChange={(event) => setAmplitude(Number(event.target.value))} />
              </label>

              <label className="rounded-3xl bg-slate-50 p-4 text-sm font-black">
                k: {frequency.toFixed(1)} · Periodo: {period}
                <input className="mt-3 w-full" type="range" min="0.5" max="4" step="0.1" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} />
              </label>

              <label className="rounded-3xl bg-slate-50 p-4 text-sm font-black">
                Desfase: {phase.toFixed(1)}
                <input className="mt-3 w-full" type="range" min="-3.1" max="3.1" step="0.1" value={phase} onChange={(event) => setPhase(Number(event.target.value))} />
              </label>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl bg-blue-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">cos θ</p>
                <p className="mt-1 text-2xl font-black">{point.cos.toFixed(3)}</p>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">sin θ</p>
                <p className="mt-1 text-2xl font-black">{point.sin.toFixed(3)}</p>
              </div>
              <div className="rounded-3xl bg-orange-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">radianes</p>
                <p className="mt-1 text-2xl font-black">{point.rad.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
            Pruebas pasadas y simulacros
          </p>

          <h2 className="mt-2 text-3xl font-black">Centro MAT1000</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {PAST_EXAMS.map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">{item.kind}</p>
                <p className="mt-2 text-lg font-black">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{item.status}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
