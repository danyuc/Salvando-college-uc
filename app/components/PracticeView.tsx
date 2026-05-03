'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { generateMat1000ForceQuestions } from '@/lib/mat1000-force-questions'
import {
  getMat1000ModulesForEvaluation,
  getMat1000SubtemasForModule,
} from '@/lib/precalculo-ui-options'
import PrecalculoVisual from './PrecalculoVisual'
import PrecalculoSteps from './PrecalculoSteps'

type Mode = 'practica' | 'diagnostico' | 'simulacion'

const evaluations = ['I1', 'I2', 'I3', 'EXAMEN']

function normalizeEvaluation(value: string | null) {
  if (value === 'I1' || value === 'I2' || value === 'I3' || value === 'EXAMEN') return value
  return 'I1'
}

function normalizeMode(value: string | null): Mode {
  if (value === 'diagnostico') return 'diagnostico'
  if (value === 'simulacion' || value === 'examen' || value === 'interrogacion') return 'simulacion'
  return 'practica'
}

export default function PracticeView() {
  const params = useSearchParams()

  const [subject, setSubject] = useState(params.get('subject') || 'MAT1000')
  const [evaluation, setEvaluation] = useState(normalizeEvaluation(params.get('evaluation')))
  const [moduleLabel, setModuleLabel] = useState('Todos')
  const [subtema, setSubtema] = useState('Todos')
  const [mode, setMode] = useState<Mode>(normalizeMode(params.get('mode')))
  const [questions, setQuestions] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState('')
  const [showSteps, setShowSteps] = useState(false)
  const [finished, setFinished] = useState(false)

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
    setShowSteps(false)
    setFinished(false)
  }

  function answer(option: string) {
    if (!current || selected) return
    setSelected(option)
  }

  function nextQuestion() {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }

    setIndex(index + 1)
    setSelected('')
    setShowSteps(false)
  }

  function resetByEvaluation(nextEvaluation: string) {
    const ev = normalizeEvaluation(nextEvaluation)
    setEvaluation(ev)
    setModuleLabel('Todos')
    setSubtema('Todos')
    setQuestions([])
    setIndex(0)
    setSelected('')
    setFinished(false)
  }

  function resetByModule(nextModule: string) {
    setModuleLabel(nextModule)
    setSubtema('Todos')
    setQuestions([])
    setIndex(0)
    setSelected('')
    setFinished(false)
  }

  return (
    <main className="practice-page">
      <section className="practice-shell">
        <div className="hero">
          <div>
            <p className="eyebrow">MAT1000 · Precálculo UC</p>
            <h1>Práctica inteligente</h1>
            <p className="subtitle">
              Practica por evaluación, módulo y subtema con preguntas tipo prueba real.
            </p>
          </div>

          <Link href="/calendario" className="ghost-link">
            Ver calendario
          </Link>
        </div>

        <section className="filters-card">
          <label>
            Asignatura
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="MAT1000">MAT1000 · Precálculo</option>
            </select>
          </label>

          <label>
            Evaluación
            <select value={evaluation} onChange={(e) => resetByEvaluation(e.target.value)}>
              {evaluations.map((ev) => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </label>

          <label>
            Módulo
            <select value={moduleLabel} onChange={(e) => resetByModule(e.target.value)}>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label>
            Subtema
            <select value={subtema} onChange={(e) => setSubtema(e.target.value)}>
              {subtemas.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            Modo
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
              <option value="practica">Práctica guiada</option>
              <option value="diagnostico">Diagnóstico</option>
              <option value="simulacion">Prueba UC real</option>
            </select>
          </label>

          <button onClick={startPractice}>
            Comenzar práctica
          </button>
        </section>

        {questions.length === 0 && (
          <section className="empty-card">
            <h2>Selecciona filtros y comienza</h2>
            <p>
              Para I1 verás rectas, parábolas e inecuaciones. Para I2 funciones,
              dominio, composición, inversa, exponenciales y logaritmos. Para I3,
              trigonometría.
            </p>
          </section>
        )}

        {finished && (
          <section className="result-card">
            <h2>Práctica finalizada</h2>
            <p>Terminaste {questions.length} preguntas.</p>
            <button onClick={startPractice}>Repetir práctica</button>
          </section>
        )}

        {!finished && current && (
          <section className="question-card">
            <div className="question-top">
              <span>{evaluation}</span>
              <span>{current.subtema}</span>
              <span>Pregunta {index + 1} de {questions.length}</span>
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
                    className={
                      answered && correct
                        ? 'option correct'
                        : answered && chosen && !correct
                          ? 'option wrong'
                          : 'option'
                    }
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {selected && !isExamMode && (
              <section className="feedback">
                <h3>{selected === current.respuesta_correcta ? 'Correcto' : 'Incorrecto'}</h3>
                <p><strong>Respuesta:</strong> {current.respuesta_correcta}</p>
                <p>{current.explicacion || current.explanation}</p>

                <button className="steps-button" onClick={() => setShowSteps(!showSteps)}>
                  {showSteps ? 'Ocultar paso a paso' : 'Ver paso a paso'}
                </button>

                {showSteps && (
                  <PrecalculoSteps pasos={current.pasos || []} animaciones={current.animaciones || []} />
                )}

                <button className="next-button" onClick={nextQuestion}>
                  Siguiente pregunta
                </button>
              </section>
            )}

            {selected && isExamMode && (
              <section className="feedback">
                <p>Respuesta guardada. En modo Prueba UC real el feedback se revisa al final.</p>
                <button className="next-button" onClick={nextQuestion}>
                  Siguiente pregunta
                </button>
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
            radial-gradient(circle at top left, rgba(37,99,235,.32), transparent 32%),
            linear-gradient(180deg, #020617, #0f172a);
        }

        .practice-shell {
          max-width: 1120px;
          margin: 0 auto;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 20px;
        }

        .eyebrow {
          color: #93c5fd;
          font-weight: 900;
          margin: 0;
        }

        h1 {
          font-size: clamp(34px, 5vw, 56px);
          margin: 6px 0;
          letter-spacing: -0.05em;
        }

        .subtitle {
          color: #cbd5e1;
          max-width: 640px;
        }

        .ghost-link {
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
          border-radius: 24px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          margin-bottom: 18px;
        }

        label {
          display: grid;
          gap: 7px;
          color: #cbd5e1;
          font-weight: 800;
          font-size: 13px;
        }

        select, button {
          min-height: 52px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,.14);
          background: rgba(15,23,42,.92);
          color: white;
          padding: 0 14px;
          font-weight: 900;
        }

        .filters-card button {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          cursor: pointer;
          align-self: end;
        }

        .empty-card,
        .result-card,
        .question-card {
          padding: 22px;
          border-radius: 26px;
          background: rgba(255,255,255,.075);
          border: 1px solid rgba(255,255,255,.13);
        }

        .question-top {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .question-top span {
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(59,130,246,.16);
          color: #bfdbfe;
          font-weight: 900;
          font-size: 12px;
        }

        .question-card h2 {
          font-size: 24px;
          line-height: 1.35;
        }

        .options {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .option {
          text-align: left;
          cursor: pointer;
          background: rgba(255,255,255,.07);
        }

        .option.correct {
          border-color: rgba(34,197,94,.7);
          background: rgba(34,197,94,.18);
        }

        .option.wrong {
          border-color: rgba(239,68,68,.75);
          background: rgba(239,68,68,.16);
        }

        .feedback {
          margin-top: 18px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(15,23,42,.7);
          border: 1px solid rgba(255,255,255,.1);
        }

        .steps-button,
        .next-button {
          margin-top: 12px;
          margin-right: 10px;
          cursor: pointer;
        }

        .next-button {
          background: rgba(16,185,129,.22);
          border-color: rgba(16,185,129,.35);
        }

        @media (max-width: 720px) {
          .hero {
            flex-direction: column;
            align-items: stretch;
          }

          .ghost-link {
            text-align: center;
          }
        }
      `}</style>
    </main>
  )
}
