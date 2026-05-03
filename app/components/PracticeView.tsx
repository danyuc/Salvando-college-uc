'use client'

import { useMemo, useState } from 'react'
import { generateMat1000ForceQuestions } from '@/lib/mat1000-force-questions'
import {
  getMat1000ModulesForEvaluation,
  getMat1000SubtemasForModule,
} from '@/lib/precalculo-ui-options'
import PrecalculoVisual from './PrecalculoVisual'
import PrecalculoSteps from './PrecalculoSteps'

type Mode = 'practica' | 'diagnostico' | 'simulacion'
const evaluations = ['I1', 'I2', 'I3', 'EXAMEN']

export default function PracticeView() {
  const [evaluation, setEvaluation] = useState('I1')
  const [moduleLabel, setModuleLabel] = useState('Todos')
  const [subtema, setSubtema] = useState('Todos')
  const [mode, setMode] = useState<Mode>('practica')
  const [amount, setAmount] = useState(20)

  const [questions, setQuestions] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [showSteps, setShowSteps] = useState(false)
  const [answers, setAnswers] = useState<any[]>([])
  const [finished, setFinished] = useState(false)

  const modules = useMemo(() => getMat1000ModulesForEvaluation(evaluation), [evaluation])
  const subtemas = useMemo(() => getMat1000SubtemasForModule(moduleLabel, evaluation), [moduleLabel, evaluation])
  const diagnosticKey = `mat1000-diagnostic-${evaluation}`
  const diagnosticDone = typeof window !== 'undefined' && Boolean(localStorage.getItem(diagnosticKey))
  const diagnosticRequired = !diagnosticDone

  const current = questions[index]

  const correctCount = answers.filter(a => a.correct).length
  const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0
  const weak = [...new Set(answers.filter(a => !a.correct).map(a => a.subtema))]
  const isExam = mode === 'simulacion'

  function reset() {
    setQuestions([])
    setIndex(0)
    setSelected('')
    setShowSteps(false)
    setAnswers([])
    setFinished(false)
  }

  function start() {
    const generated = generateMat1000ForceQuestions({
      evaluation,
      mode,
      moduleLabel,
      subtema,
      cantidad: mode === 'simulacion' ? 13 : mode === 'diagnostico' ? 12 : amount,
    })

    setQuestions(generated)
    setIndex(0)
    setSelected('')
    setShowSteps(false)
    setAnswers([])
    setFinished(false)
  }

  function answer(option: string) {
    if (!current || selected) return
    const correct = option === current.respuesta_correcta
    setSelected(option)
    setAnswers(prev => [...prev, { subtema: current.subtema, correct }])
  }

  function next() {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }
    setIndex(i => i + 1)
    setSelected('')
    setShowSteps(false)
  }

  return (
    <main className="practice-page">
      <section className="shell">
        <section className="hero-card">
          <div>
            <span className="badge">Motor UC</span>
            <h1>📐 Práctica inteligente</h1>
            <p>Diagnóstico obligatorio, dificultad adaptativa, fatiga cognitiva y foco en debilidades.</p>
          </div>
          <div className="prediction">
            <strong>{answers.length ? (1 + accuracy * 0.06).toFixed(1) : '4.0'}</strong>
            <span>predicción sesión</span>
          </div>
        </section>

        <section className="mode-card">
          <h3>{mode === 'simulacion' ? '🏁 Modo Prueba UC real' : mode === 'diagnostico' ? '🧠 Diagnóstico activo' : '🧠 Modo guiado UC activo'}</h3>
          <p>
            {mode === 'simulacion'
              ? 'Sin pistas ni feedback inmediato. Revisión al terminar.'
              : 'Modo guiado listo: partiré reforzando tus temas débiles.'}
          </p>
          <span>Foco actual: {subtema === 'Todos' ? evaluation : subtema}</span>
        </section>

        {diagnosticRequired && (
          <section className="mode-card" style={{ borderColor: 'rgba(239,68,68,.45)', background: 'rgba(127,29,29,.32)' }}>
            <h3>🔒 Diagnóstico obligatorio</h3>
            <p>Antes de practicar {evaluation}, debes completar el diagnóstico correspondiente.</p>
            <a href={`/diagnostico?evaluation=${evaluation}`} style={{ color: '#fecaca', fontWeight: 900 }}>
              Hacer diagnóstico ahora
            </a>
          </section>
        )}

        <section className="filters-card">
          <label>
            Asignatura
            <select value="MAT1000" disabled>
              <option>📐 Matemática</option>
            </select>
          </label>

          <label>
            Evaluación
            <select value={evaluation} onChange={(e) => { setEvaluation(e.target.value); setModuleLabel('Todos'); setSubtema('Todos'); reset() }}>
              {evaluations.map(ev => <option key={ev}>{ev}</option>)}
            </select>
          </label>

          <label>
            Módulo
            <select value={moduleLabel} onChange={(e) => { setModuleLabel(e.target.value); setSubtema('Todos'); reset() }}>
              {modules.map(m => <option key={m}>{m}</option>)}
            </select>
          </label>

          <label>
            Subtema
            <select value={subtema} onChange={(e) => { setSubtema(e.target.value); reset() }}>
              {subtemas.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Modo
            <select value={mode} onChange={(e) => { setMode(e.target.value as Mode); reset() }}>
              <option value="practica">Práctica guiada</option>
              <option value="diagnostico">Diagnóstico</option>
              <option value="simulacion">Prueba UC real</option>
            </select>
          </label>

          <label>
            Cantidad
            <select value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
              <option value={10}>10 preguntas</option>
              <option value={20}>20 preguntas</option>
              <option value={50}>50 preguntas</option>
            </select>
          </label>

          <div className="actions">
            <button disabled={diagnosticRequired} onClick={start}>Comenzar sesión</button>
            <button className="secondary" onClick={reset}>Reiniciar</button>
          </div>
        </section>

        <section className="stats">
          <div><span>Preguntas</span><strong>{questions.length}</strong></div>
          <div><span>Respondidas</span><strong>{answers.length}</strong></div>
          <div><span>Precisión</span><strong>{accuracy}%</strong></div>
          <div><span>Dificultad</span><strong>MEDIA</strong></div>
          <div><span>Débiles</span><strong>{weak.length}</strong></div>
        </section>

        {finished && (
          <section className="result-card">
            <h2>Sesión finalizada</h2>
            <p>Precisión: <strong>{accuracy}%</strong></p>
            {weak.length > 0 ? <p>Estás débil en: <strong>{weak.join(', ')}</strong>.</p> : <p>No se detectaron debilidades críticas.</p>}
            <button onClick={start}>Repetir sesión</button>
          </section>
        )}

        {!finished && current && (
          <section className="question-card">
            <div className="chips">
              <span>MAT1000</span>
              <span>{evaluation}</span>
              <span>{current.subtema}</span>
              <span>{index + 1}/{questions.length}</span>
              <span>{mode}</span>
            </div>

            <h2>{current.pregunta}</h2>

            {Array.isArray(current.visualizacion?.parametros?.puntos) && (
              <PrecalculoVisual puntos={current.visualizacion.parametros.puntos} />
            )}

            <div className="options">
              {(current.opciones || []).map((op: string) => {
                const answered = !!selected
                const correct = op === current.respuesta_correcta
                const chosen = op === selected
                return (
                  <button
                    key={op}
                    onClick={() => answer(op)}
                    className={`option ${answered && !isExam && correct ? 'correct' : ''} ${answered && !isExam && chosen && !correct ? 'wrong' : ''}`}
                  >
                    {op}
                  </button>
                )
              })}
            </div>

            {selected && (
              <section className={`feedback ${isExam ? 'exam' : ''}`}>
                {isExam ? (
                  <>
                    <p>Respuesta guardada. En Prueba UC real se corrige al final.</p>
                    <button onClick={next}>Siguiente</button>
                  </>
                ) : (
                  <>
                    <h3>{selected === current.respuesta_correcta ? '✅ Correcta' : '❌ Incorrecta'}</h3>
                    <p><strong>Respuesta correcta:</strong> {current.respuesta_correcta}</p>
                    <p>{current.explicacion || current.explanation}</p>
                    {current.error_comun && <div className="note">Error común: {current.error_comun}</div>}
                    <div className="feedback-actions">
                      <button onClick={() => setShowSteps(v => !v)}>{showSteps ? 'Ocultar paso a paso' : 'Ver paso a paso animado'}</button>
                      <button onClick={next}>Siguiente</button>
                    </div>
                    {showSteps && <PrecalculoSteps pasos={current.pasos || []} animaciones={current.animaciones || []} />}
                  </>
                )}
              </section>
            )}
          </section>
        )}
      </section>

      <style jsx>{`
        .practice-page {
          min-height: 100vh;
          padding: 28px;
          color: white;
          background:
            radial-gradient(circle at 18% 10%, rgba(37,99,235,.38), transparent 34%),
            radial-gradient(circle at 88% 0%, rgba(16,185,129,.16), transparent 30%),
            linear-gradient(180deg,#020617,#0f172a);
        }
        .shell { max-width: 1180px; margin: 0 auto; display: grid; gap: 18px; }
        .hero-card, .mode-card, .filters-card, .question-card, .result-card {
          border: 1px solid rgba(148,163,184,.20);
          background: linear-gradient(135deg, rgba(30,41,59,.82), rgba(15,23,42,.86));
          border-radius: 28px;
          box-shadow: 0 28px 80px rgba(0,0,0,.28);
        }
        .hero-card {
          padding: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 170px;
        }
        .badge, .mode-card span, .chips span {
          display: inline-flex;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(59,130,246,.22);
          color: #bfdbfe;
          font-weight: 900;
          font-size: 12px;
        }
        h1 { font-size: clamp(36px,5vw,58px); margin: 14px 0 8px; letter-spacing: -.05em; }
        .hero-card p, .mode-card p { color: #cbd5e1; font-size: 16px; }
        .prediction {
          width: 150px;
          height: 110px;
          border-radius: 24px;
          background: rgba(2,6,23,.55);
          display: grid;
          place-items: center;
          text-align: center;
        }
        .prediction strong { font-size: 28px; }
        .prediction span { color: #cbd5e1; font-size: 13px; }
        .mode-card { padding: 22px; }
        .mode-card h3 { margin: 0 0 8px; font-size: 20px; }

        .filters-card {
          padding: 22px;
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 16px;
        }
        label { display: grid; gap: 8px; color: #e2e8f0; font-weight: 900; }
        select {
          min-height: 58px;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.24);
          background: rgba(15,23,42,.88);
          color: white;
          padding: 0 16px;
          font-weight: 900;
          font-size: 15px;
        }
        .actions { display: flex; gap: 10px; align-items: end; }
        button {
          min-height: 54px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.14);
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          color: white;
          padding: 0 18px;
          font-weight: 950;
          cursor: pointer;
        }
        button.secondary { background: rgba(255,255,255,.08); }

        .stats { display: grid; grid-template-columns: repeat(5,1fr); gap: 14px; }
        .stats div {
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
        }
        .stats span { color: #cbd5e1; display:block; margin-bottom: 8px; }
        .stats strong { font-size: 22px; }

        .question-card, .result-card { padding: 24px; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
        .question-card h2 { font-size: 24px; line-height: 1.35; }
        .options { display:grid; gap: 11px; margin-top:18px; }
        .option {
          text-align:left;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.12);
          transition:.18s ease;
        }
        .option:hover { transform: translateX(4px); background: rgba(255,255,255,.11); }
        .option.correct { background: rgba(34,197,94,.20); border-color: rgba(34,197,94,.65); }
        .option.wrong { background: rgba(239,68,68,.20); border-color: rgba(239,68,68,.65); }

        .feedback {
          margin-top: 18px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(15,23,42,.78);
          border: 1px solid rgba(255,255,255,.12);
        }
        .feedback.exam { background: rgba(99,102,241,.15); }
        .note {
          margin-top: 12px;
          padding: 12px;
          border-radius: 14px;
          background: rgba(245,158,11,.16);
          border: 1px solid rgba(245,158,11,.30);
          color: #fde68a;
        }
        .feedback-actions { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }

        @media (max-width: 900px) {
          .filters-card { grid-template-columns: 1fr; }
          .stats { grid-template-columns: repeat(2,1fr); }
          .hero-card { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </main>
  )
}
