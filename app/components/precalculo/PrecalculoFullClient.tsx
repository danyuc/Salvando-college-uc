"use client";

import { useMemo, useState } from "react";
import {
  DIAGNOSTIC_QUESTIONS,
  PRECALCULO_EXAMS,
  TUTOR_SUGGESTIONS,
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
  return Array.from({ length: 130 }, (_, i) => {
    const t = (i / 129) * Math.PI * 2;
    const x = 20 + (i / 129) * 420;
    const y = 125 - amplitude * 42 * Math.sin(frequency * (t - phase));
    return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

function buildTutorAnswer(message: string, topicTitle: string) {
  const text = message.toLowerCase();

  if (text.includes("cuadrante") || text.includes("signo")) {
    return "Mira, esto es más fácil de lo que parece: primero no calcules nada. Solo mira el cuadrante. En QI todo es positivo. En QII seno positivo y coseno negativo. En QIII seno y coseno negativos, por eso tangente positiva. En QIV seno negativo y coseno positivo. Si la pregunta dice tercer cuadrante y sen=-12/13, ya sabes que cos también debe ser negativo.";
  }

  if (text.includes("seno") || text.includes("coseno") || text.includes("tan")) {
    return "Piensa el círculo unitario así: coseno es la coordenada x y seno es la coordenada y. Tangente es seno dividido por coseno. Entonces si te dan sen(t), no memorices: arma el triángulo, decide el signo por cuadrante y luego calcula tan=sen/cos.";
  }

  if (text.includes("periodo") || text.includes("amplitud") || text.includes("onda")) {
    return "En y=A·sen(kx), A es la altura de la onda, o sea la amplitud. El k no es el periodo: el periodo es 2π/k. Por eso en y=3sen(2x), la amplitud es 3 y el periodo es π. Cuando k crece, la onda se aprieta.";
  }

  if (text.includes("distancia") || text.includes("puntos")) {
    return "Para distancia entre puntos, primero etiqueta: x1, y1, x2, y2. Ejemplo: A(2,3), B(6,6). Entonces x1=2, y1=3, x2=6, y2=6. Recién ahí usas d=√((6-2)²+(6-3)²)=5.";
  }

  if (text.includes("log") || text.includes("logaritmo")) {
    return "Un logaritmo es una pregunta de exponentes. log₂(32) significa: ¿2 elevado a qué número da 32? Como 2⁵=32, la respuesta es 5. Antes de resolver ecuaciones con log, recuerda que el argumento debe ser positivo.";
  }

  return `Vamos paso a paso con ${topicTitle}. Primero identifica el tema, después anota datos, luego eliges fórmula. Si te trabas, escribe exactamente qué paso no entiendes, por ejemplo: "no entiendo por qué coseno es negativo" o "no entiendo de dónde sale el 5".`;
}

export default function PrecalculoFullClient() {
  const [activeExam, setActiveExam] = useState<PrecalculoExamId>("i3");
  const [activeTopic, setActiveTopic] = useState("cuadrantes");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [angle, setAngle] = useState(225);
  const [amplitude, setAmplitude] = useState(3);
  const [frequency, setFrequency] = useState(2);
  const [phase, setPhase] = useState(0);
  const [tutorMessage, setTutorMessage] = useState("me cuesta entender por qué la tangente queda positiva");
  const [showTutorAnswer, setShowTutorAnswer] = useState(true);

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

  const selectedQuestion = questions.find((question) => question.topicId === selectedTopic.id) ?? questions[0];

  const answered = questions.filter((question) => answers[question.id] !== undefined);
  const correct = answered.filter((question) => answers[question.id] === question.answerIndex);
  const score = answered.length === 0 ? 0 : Math.round((correct.length / answered.length) * 100);

  const weakTags = questions
    .filter((question) => answers[question.id] !== undefined && answers[question.id] !== question.answerIndex)
    .map((question) => question.mistakeTag);

  const point = polarToPoint(angle, 115);
  const period = frequency === 0 ? "∞" : `${(2 / frequency).toFixed(2)}π`;
  const tutorAnswer = buildTutorAnswer(tutorMessage, selectedTopic.title);

  function changeExam(id: PrecalculoExamId) {
    const nextExam = PRECALCULO_EXAMS.find((item) => item.id === id) ?? PRECALCULO_EXAMS[0];
    setActiveExam(id);
    setActiveTopic(nextExam.topics[0]?.id ?? "");
    setAnswers({});
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_32%),linear-gradient(135deg,#f8fafc,#eef2ff_45%,#ecfeff)] px-4 py-8 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-2xl shadow-slate-200/70 backdrop-blur-xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-blue-600">
            Asignatura exclusiva
          </p>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                Pre Cálculo MAT1000
              </h1>

              <p className="mt-4 max-w-4xl text-base font-semibold leading-8 text-slate-600 md:text-lg">
                Sección separada solo para Pre Cálculo: ruta por I1, I2, I3 y Examen,
                fórmulas con Modo Pro Max UC, ejemplos reales, diagnóstico y tutor de dudas.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                Tutor IA local
              </p>
              <p className="mt-2 text-2xl font-black">{score}% diagnóstico</p>
              <p className="mt-2 text-sm font-semibold text-slate-300">
                {weakTags.length ? `Te cuesta: ${Array.from(new Set(weakTags)).join(", ")}.` : "Responde preguntas para detectar debilidades."}
              </p>
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
                    ? "border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-300/50"
                    : "border-slate-200 bg-gradient-to-br from-white to-blue-50 text-slate-800"
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          <aside className="rounded-[2rem] border border-blue-100 bg-white/95 p-5 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500">
              Temáticas visibles
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
                    Tema {index + 1} · {topic.theme}
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-950">{topic.title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{topic.why}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
              Ver fórmulas y tips necesarios
            </p>

            <h2 className="mt-2 text-3xl font-black">{selectedTopic.title}</h2>
            <p className="mt-3 text-base font-semibold leading-8 text-slate-600">
              {selectedTopic.ucFocus}
            </p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm font-black text-cyan-300">Fórmulas necesarias</p>
                <ul className="mt-3 space-y-2 text-sm font-bold text-slate-100">
                  {selectedTopic.formulas.map((formula) => (
                    <li key={formula} className="rounded-2xl bg-white/10 p-3">
                      {formula}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl bg-blue-50 p-5 lg:col-span-2">
                <p className="text-sm font-black text-blue-900">Modo Pro Max UC</p>
                <ul className="mt-3 grid gap-3 md:grid-cols-2">
                  {selectedTopic.proMaxTips.map((tip) => (
                    <li key={tip} className="rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-blue-950 shadow-sm">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {selectedTopic.solvedExamples.map((example) => (
                <div key={example.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                    Ejemplo con datos reales
                  </p>
                  <h3 className="mt-2 text-xl font-black">{example.title}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-700">{example.statement}</p>

                  <ol className="mt-4 space-y-2">
                    {example.steps.map((step, index) => (
                      <li key={step} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                        <span className="font-black text-blue-600">Paso {index + 1}: </span>
                        {step}
                      </li>
                    ))}
                  </ol>

                  <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-900">
                    {example.final}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-rose-600">
              Pregunta contextualizada
            </p>

            <h2 className="mt-2 text-3xl font-black">{selectedQuestion?.theme ?? "Diagnóstico"}</h2>

            {selectedQuestion && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                <p className="text-xl font-black leading-8 text-slate-950">{selectedQuestion.prompt}</p>

                <div className="mt-5 grid gap-3">
                  {selectedQuestion.options.map((option, index) => {
                    const selected = answers[selectedQuestion.id];
                    const showState = selected !== undefined;
                    const isCorrect = selectedQuestion.answerIndex === index;
                    const isSelected = selected === index;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setAnswers((current) => ({
                            ...current,
                            [selectedQuestion.id]: index,
                          }))
                        }
                        className={cx(
                          "rounded-2xl border p-4 text-left text-sm font-black transition",
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

                {answers[selectedQuestion.id] !== undefined && (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-3xl bg-slate-950 p-5 text-sm font-semibold leading-7 text-white">
                      {selectedQuestion.explanation}
                    </div>

                    <div className="rounded-3xl bg-violet-50 p-5">
                      <p className="text-sm font-black text-violet-900">Tips necesarios para esta pregunta</p>
                      <ul className="mt-3 space-y-2 text-sm font-bold text-violet-950">
                        {selectedQuestion.proMax.map((tip) => (
                          <li key={tip}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-600">
              Tutor IA de Pre Cálculo
            </p>

            <h2 className="mt-2 text-3xl font-black">Pregúntame qué paso no entiendes</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">
              Escribe algo como: “me cuesta entender cuadrantes”, “no entiendo el periodo” o
              “por qué coseno es negativo”.
            </p>

            <textarea
              value={tutorMessage}
              onChange={(event) => {
                setTutorMessage(event.target.value);
                setShowTutorAnswer(false);
              }}
              className="mt-5 min-h-32 w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm font-bold leading-7 text-slate-800 outline-none ring-blue-200 transition focus:ring-4"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {TUTOR_SUGGESTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTutorMessage(item);
                    setShowTutorAnswer(true);
                  }}
                  className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-200"
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTutorAnswer(true)}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5"
            >
              Explicarme como tutor
            </button>

            {showTutorAnswer && (
              <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-sm font-semibold leading-8 text-white">
                {tutorAnswer}
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-[2rem] border border-blue-100 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-violet-600">
            Visualizador trigonométrico
          </p>

          <h2 className="mt-2 text-3xl font-black">Círculo unitario + onda seno</h2>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-4 text-white">
              <svg viewBox="0 0 320 320" className="h-auto w-full">
                <circle cx="160" cy="160" r="115" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <line x1="30" y1="160" x2="290" y2="160" stroke="rgba(255,255,255,0.35)" />
                <line x1="160" y1="30" x2="160" y2="290" stroke="rgba(255,255,255,0.35)" />
                <line x1="160" y1="160" x2={point.x} y2={point.y} stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                <line x1={point.x} y1={point.y} x2={point.x} y2="160" stroke="#22c55e" strokeWidth="3" strokeDasharray="6 6" />
                <line x1="160" y1={point.y} x2={point.x} y2={point.y} stroke="#f97316" strokeWidth="3" strokeDasharray="6 6" />
                <circle cx={point.x} cy={point.y} r="9" fill="#ffffff" />
              </svg>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs font-black text-cyan-300">cos θ</p>
                  <p className="text-xl font-black">{point.cos.toFixed(3)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs font-black text-emerald-300">sen θ</p>
                  <p className="text-xl font-black">{point.sin.toFixed(3)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <p className="text-xs font-black text-orange-300">radianes</p>
                  <p className="text-xl font-black">{point.rad.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-inner">
              <svg viewBox="0 0 460 250" className="h-auto w-full">
                <rect x="0" y="0" width="460" height="250" rx="24" fill="#f8fafc" />
                <line x1="20" y1="125" x2="440" y2="125" stroke="#94a3b8" strokeWidth="1" />
                <line x1="20" y1="40" x2="20" y2="210" stroke="#94a3b8" strokeWidth="1" />
                <path d={wavePath(amplitude, frequency, phase)} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
                <text x="24" y="32" fill="#0f172a" fontSize="14" fontWeight="800">
                  y = {amplitude.toFixed(1)} sen({frequency.toFixed(1)}(x - {phase.toFixed(1)}))
                </text>
              </svg>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="rounded-2xl bg-slate-50 p-4 text-sm font-black">
                  Ángulo: {angle}°
                  <input className="mt-3 w-full" type="range" min="0" max="360" value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
                </label>

                <label className="rounded-2xl bg-slate-50 p-4 text-sm font-black">
                  Amplitud: {amplitude.toFixed(1)}
                  <input className="mt-3 w-full" type="range" min="0.5" max="4" step="0.1" value={amplitude} onChange={(event) => setAmplitude(Number(event.target.value))} />
                </label>

                <label className="rounded-2xl bg-slate-50 p-4 text-sm font-black">
                  k: {frequency.toFixed(1)} · Periodo: {period}
                  <input className="mt-3 w-full" type="range" min="0.5" max="4" step="0.1" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} />
                </label>

                <label className="rounded-2xl bg-slate-50 p-4 text-sm font-black">
                  Desfase: {phase.toFixed(1)}
                  <input className="mt-3 w-full" type="range" min="-3.1" max="3.1" step="0.1" value={phase} onChange={(event) => setPhase(Number(event.target.value))} />
                </label>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

