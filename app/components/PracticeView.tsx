'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { generateMat1000ForceQuestions } from '@/lib/mat1000-force-questions'
import {
  getMat1000ModulesForEvaluation,
  getMat1000SubtemasForModule,
} from '@/lib/precalculo-ui-options'
import PrecalculoVisual from './PrecalculoVisual'
import PrecalculoSteps from './PrecalculoSteps'

type Mode = 'practica' | 'diagnostico' | 'simulacion'
type Answer = {
  subtema: string
  correct: boolean
  selected: string
  correctAnswer: string
}

const evaluations = ['I1', 'I2', 'I3', 'EXAMEN']

function normalizeEvaluation(value?: string | null) {
  if (value === 'I1' || value === 'I2' || value === 'I3' || value === 'EXAMEN') return value
  return 'I1'
}

function normalizeMode(value?: string | null): Mode {
  if (value === 'diagnostico') return 'diagnostico'
  if (value === 'simulacion' || value === 'examen' || value === 'interrogacion') return 'simulacion'
  return 'practica'
}

function buildDiagnosis(answers: Answer[]) {
  const stats = new Map<string, { total: number; correct: number }>()

  for (const a of answers) {
    const prev = stats.get(a.subtema) || { total: 0, correct: 0 }
    prev.total += 1
    prev.correct += a.correct ? 1 : 0
    stats.set(a.subtema, prev)
  }

  const weak = [...stats.entries()]
    .filter(([, s]) => s.correct / s.total < 0.65)
    .map(([subtema]) => subtema)

  const strong = [...stats.entries()]
    .filter(([, s]) => s.correct / s.total >= 0.8)
    .map(([subtema]) => subtema)

  const accuracy = answers.length
    ? Math.round((answers.filter(a => a.correct).length / answers.length) * 100)
    : 0

  return { accuracy, weak, strong }
}

export default function PracticeView() {
  const [subject, setSubject] = useState('MAT1000')
  const [evaluation, setEvaluation] = useState('I1')
  const [moduleLabel, setModuleLabel] = useState('Todos')
  const [subtema, setSubtema] = useState('Todos')
  const [mode, setMode] = useState<Mode>('practica')

  const [questions, setQuestions] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showSteps, setShowSteps] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSubject(params.get('subject') || 'MAT1000')
    setEvaluation(normalizeEvaluation(params.get('evaluation')))
    setMode(normalizeMode(params.get('mode')))
  }, [])

  const modules = useMemo(() => {
    if (subject !== 'MAT1000') return ['Todos']
    return getMat1000ModulesForEvaluation(evaluation)
  }, [subject, evaluation])

  const subtemas = useMemo(() => {
    if (subject !== 'MAT1000') return ['Todos']
    return getMat1000SubtemasForModule(moduleLabel, evaluation)
  }, [subject, moduleLabel, evaluation])

  const current = questions[index]
  const isExamMode = mode === 'simulacion'
  const diagnosis = buildDiagnosis(answers)

  function resetSession() {
    setQuestions([])
    setIndex(0)
    setSelected('')
    setAnswers([])
    setShowSteps(false)
    setFinished(false)
  }

  function changeEvaluation(value: string) {
    setEvaluation(normalizeEvaluation(value))
    setModuleLabel('Todos')
    setSubtema('Todos')
    resetSession()
  }

  function changeModule(value: string) {
    setModuleLabel(value)
    setSubtema('Todos')
    resetSession()
  }

  function startPractice() {
    const generated = generateMat1000ForceQuestions({
      evaluation,
      mode,
      moduleLabel,
      subtema,
      cantidad: mode === 'diagnostico' ? 12 : mode === 'simulacion' ? 13 : 20,
    })

    setQuestions(generated)
    setIndex(0)
    setSelected('')
    setAnswers([])
    setShowSteps(false)
    setFinished(false)
  }

  function answer(option: string) {
    if (!current || selected) return

    const correct = option === current.respuesta_correcta
    setSelected(option)

    setAnswers(prev => [
      ...prev,
      {
        subtema: current.subtema,
        correct,
        selected: option,
        correctAnswer: current.respuesta_correcta,
      },
    ])
  }

  function nextQuestion() {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }

    setIndex(prev => prev + 1)
    setSelected('')
    setShowSteps(false)
  }

  return (
    <main className="practice-page">
      <section className="practice-shell">
        <header className="hero">
          <div>
            <p className="eyebrow">MAT1000 · Precálculo UC</p>
            <h1>Práctica inteligente</h1>
            <p className="subtitle">
              Entrena con preguntas tipo prueba real, visualización matemática, paso a paso docente y diagnóstico por subtema.
            </p>
          </div>

          <div className="hero-actions">
            <Link href="/calendario">Calendario</Link>
            <Link href="/">Inicio</Link>
          </div>
        </header>

        <section className="filters-card">
          <label>
            Asignatura
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="MAT1000">MAT1000 · Precálculo</option>
            </select>
          </label>

          <label>
            Evaluación
            <select value={evaluation} onChange={(e) => changeEvaluation(e.target.value)}>
              {evaluations.map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </label>

          <label>
            Módulo
            <select value={moduleLabel} onChange={(e) => changeModule(e.target.value)}>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label>
            Subtema
            <select value={subtema} onChange={(e) => { setSubtema(e.target.value); resetSession() }}>
              {subtemas.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label>
            Modo
            <select value={mode} onChange={(e) => { setMode(e.target.value as Mode); resetSession() }}>
              <option value="practica">Práctica guiada</option>
              <option value="diagnostico">Diagnóstico</option>
              <option value="simulacion">Prueba UC real</option>
            </select>
          </label>

          <button onClick={startPractice}>Comenzar práctica</button>
        </section>

        {questions.length === 0 && (
          <section className="intro-card">
            <div>
              <p className="eyebrow">Ruta activa</p>
              <h2>{evaluation} · {moduleLabel} · {subtema}</h2>
              <p>
                En práctica guiada verás feedback inmediato. En Prueba UC real no hay pistas ni corrección hasta el final.
                En diagnóstico se detectan debilidades por subtema.
              </p>
            </div>
          </section>
        )}

        {finished && (
          <section className="result-card">
            <p className="eyebrow">Resultado</p>
            <h2>{mode === 'diagnostico' ? 'Diagnóstico finalizado' : 'Sesión finalizada'}</h2>
            <p className="score">{diagnosis.accuracy}% de precisión</p>

            {diagnosis.weak.length > 0 ? (
              <div className="diagnosis-box weak">
                <strong>Debilidades detectadas</strong>
                <p>Estás débil en: {diagnosis.weak.join(', ')}.</p>
              </div>
            ) : (
              <div className="diagnosis-box strong">
                <strong>Buen desempeño</strong>
                <p>No se detectaron debilidades críticas en esta sesión.</p>
              </div>
            )}

            {diagnosis.strong.length > 0 && (
              <div className="diagnosis-box">
                <strong>Fortalezas</strong>
                <p>{diagnosis.strong.join(', ')}</p>
              </div>
            )}

            <button className="primary-button" onClick={startPractice}>Repetir práctica</button>
          </section>
        )}

        {!finished && current && (
          <section className="question-card">
            <div className="question-top">
              <span>{evaluation}</span>
              <span>{moduleLabel}</span>
              <span>{current.subtema}</span>
              <span>{index + 1}/{questions.length}</span>
              {isExamMode && <span className="exam-pill">Modo Prueba UC</span>}
            </div>

            <h2>{current.pregunta}</h2>

            {Array.isArray(current.visualizacion?.parametros?.puntos) && (
              <PrecalculoVisual puntos={current.visualizacion.parametros.puntos} />
            )}

            <div className="options">
              {(current.opciones || []).map((option: string) => {
                const answered = Boolean(selected)
                const correct = option === current.respuesta_correcta
                const chosen = selected === option

                return (
                  <button
                    key={option}
                    onClick={() => answer(option)}
                    className={`option ${answered && !isExamMode && correct ? 'correct' : ''} ${answered && !isExamMode && chosen && !correct ? 'wrong' : ''} ${chosen ? 'chosen' : ''}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {selected && isExamMode && (
              <section className="feedback exam">
                <p>Respuesta guardada. En Prueba UC real el feedback se muestra al final.</p>
                <button className="next-button" onClick={nextQuestion}>Siguiente pregunta</button>
              </section>
            )}

            {selected && !isExamMode && (
              <section className="feedback">
                <h3 className={selected === current.respuesta_correcta ? 'ok' : 'bad'}>
                  {selected === current.respuesta_correcta ? 'Correcto' : 'Incorrecto'}
                </h3>

                <p><strong>Respuesta correcta:</strong> {current.respuesta_correcta}</p>
                <p>{current.explicacion || current.explanation}</p>

                {current.error_comun && (
                  <div className="teacher-note">
                    <strong>Error común:</strong> {current.error_comun}
                  </div>
                )}

                {current.mini_refuerzo && (
                  <div className="teacher-note">
                    <strong>Mini refuerzo:</strong> {current.mini_refuerzo}
                  </div>
                )}

                <div className="feedback-actions">
                  <button onClick={() => setShowSteps(!showSteps)}>
                    {showSteps ? 'Ocultar paso a paso' : 'Ver paso a paso animado'}
                  </button>
                  <button className="next-button" onClick={nextQuestion}>
                    Siguiente pregunta
                  </button>
                </div>

                {showSteps && (
                  <PrecalculoSteps pasos={current.pasos || []} animaciones={current.animaciones || []} />
                )}
              </section>
            )}
          </section>
        )}
      </section>

      <style jsx>{`
        .practice-page {
          min-height: 100vh;
          padding: 24px;
          color: white;
          background:
            radial-gradient(circle at top left, rgba(37,99,235,.36), transparent 32%),
            radial-gradient(circle at top right, rgba(124,58,237,.28), transparent 34%),
            linear-gradient(180deg, #020617, #0f172a);
        }

        .practice-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0;
          color: #93c5fd;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: .06em;
          font-size: 12px;
        }

        h1 {
          font-size: clamp(36px, 6vw, 62px);
          margin: 6px 0;
          letter-spacing: -0.06em;
        }

        .subtitle {
          color: #cbd5e1;
          max-width: 720px;
          font-size: 16px;
        }

        .hero-actions {
          display: flex;
          gap: 10px;
        }

        .hero-actions a {
          color: white;
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 16px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          font-weight: 900;
        }

        .filters-card {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 14px;
          padding: 18px;
          border-radius: 28px;
          background: rgba(255,255,255,.075);
          border: 1px solid rgba(255,255,255,.13);
          box-shadow: 0 24px 70px rgba(0,0,0,.25);
          margin-bottom: 18px;
        }

        label {
          display: grid;
          gap: 7px;
          color: #cbd5e1;
          font-weight: 850;
          font-size: 13px;
        }

        select,
        button {
          min-height: 54px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.94);
          color: white;
          padding: 0 14px;
          font-weight: 900;
        }

        .filters-card button,
        .primary-button {
          cursor: pointer;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          box-shadow: 0 18px 45px rgba(37,99,235,.28);
        }

        .intro-card,
        .question-card,
        .result-card {
          padding: 26px;
          border-radius: 30px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.04));
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 25px 75px rgba(0,0,0,.28);
        }

        .intro-card h2,
        .result-card h2 {
          margin: 8px 0;
          font-size: 28px;
        }

        .question-top {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .question-top span {
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(59,130,246,.18);
          border: 1px solid rgba(59,130,246,.22);
          color: #bfdbfe;
          font-weight: 950;
          font-size: 12px;
        }

        .question-top .exam-pill {
          background: rgba(244,114,182,.18);
          color: #fbcfe8;
          border-color: rgba(244,114,182,.25);
        }

        .question-card h2 {
          font-size: 25px;
          line-height: 1.35;
        }

        .options {
          display: grid;
          gap: 11px;
          margin-top: 18px;
        }

        .option {
          text-align: left;
          cursor: pointer;
          background: rgba(255,255,255,.065);
          border: 1px solid rgba(255,255,255,.12);
          transition: .18s ease;
        }

        .option:hover {
          transform: translateX(4px);
          background: rgba(255,255,255,.12);
        }

        .option.chosen {
          border-color: rgba(147,197,253,.8);
        }

        .option.correct {
          background: rgba(34,197,94,.22);
          border-color: rgba(34,197,94,.75);
        }

        .option.wrong {
          background: rgba(239,68,68,.2);
          border-color: rgba(239,68,68,.75);
        }

        .feedback {
          margin-top: 18px;
          padding: 18px;
          border-radius: 24px;
          background: rgba(15,23,42,.75);
          border: 1px solid rgba(255,255,255,.11);
        }

        .feedback.exam {
          background: rgba(99,102,241,.13);
        }

        .feedback h3 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .feedback h3.ok {
          color: #4ade80;
        }

        .feedback h3.bad {
          color: #f87171;
        }

        .teacher-note,
        .diagnosis-box {
          margin-top: 10px;
          padding: 13px;
          border-radius: 16px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.1);
          color: #e2e8f0;
        }

        .diagnosis-box.weak {
          background: rgba(239,68,68,.14);
          border-color: rgba(239,68,68,.24);
        }

        .diagnosis-box.strong {
          background: rgba(34,197,94,.14);
          border-color: rgba(34,197,94,.24);
        }

        .feedback-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .next-button {
          background: rgba(16,185,129,.22);
          border-color: rgba(16,185,129,.35);
          cursor: pointer;
        }

        .score {
          font-size: 38px;
          font-weight: 950;
          color: #bfdbfe;
        }

        @media (max-width: 760px) {
          .practice-page {
            padding: 18px;
          }

          .hero {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-actions {
            width: 100%;
          }

          .hero-actions a {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </main>
  )
}
