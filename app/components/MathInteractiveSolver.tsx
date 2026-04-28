'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { solveExpression } from '../../lib/math-step-engine'
import InteractiveGraphCanvas from './InteractiveGraphCanvas'

type DifficultyPoint =
  | 'simplificar'
  | 'terminos-semejantes'
  | 'coeficientes'
  | 'vertice'
  | 'grafico'
  | 'interpretacion'

const difficultyLabels: Record<DifficultyPoint, string> = {
  simplificar: 'Simplificar expresiones',
  'terminos-semejantes': 'Términos semejantes',
  coeficientes: 'Identificar a, b y c',
  vertice: 'Calcular vértice',
  grafico: 'Graficar la función',
  interpretacion: 'Interpretar resultado',
}

export default function MathInteractiveSolver() {
  const [expression, setExpression] = useState('-2 - x^2 + 2')
  const [activeStep, setActiveStep] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyPoint | null>(null)

  const solution = useMemo(() => solveExpression(expression), [expression])
  const step = solution.steps[activeStep]

  function nextStep() {
    setActiveStep((prev) => Math.min(prev + 1, solution.steps.length - 1))
  }

  function prevStep() {
    setActiveStep((prev) => Math.max(prev - 1, 0))
  }

  function reset() {
    setActiveStep(0)
    setDifficulty(null)
  }

  return (
    <section style={container}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Precálculo inteligente</div>
          <h2 style={title}>Resolver paso a paso</h2>
          <p style={subtitle}>
            La app explica, grafica y detecta dónde te cuesta el ejercicio.
          </p>
        </div>
      </div>

      <div style={panel}>
        <label style={label}>Ejercicio</label>

        <div style={inputRow}>
          <input
            style={input}
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value)
              setActiveStep(0)
            }}
            placeholder="Ej: -2 - x^2 + 2"
          />

          <button type="button" style={button} onClick={reset}>
            Analizar
          </button>
        </div>
      </div>

      <div style={grid}>
        <article style={panel}>
          <div style={stepHeader}>
            <span style={pill}>Paso {activeStep + 1} de {solution.steps.length}</span>
            <span style={pill}>{solution.type}</span>
          </div>

          {step ? (
            <>
              <h3 style={stepTitle}>{step.description}</h3>
              <div style={expressionBox}>{step.expression}</div>

              {step.highlight?.length ? (
                <div style={hintBox}>
                  Se están trabajando estos términos: {step.highlight.join(', ')}
                </div>
              ) : null}
            </>
          ) : (
            <p style={subtitle}>No hay pasos disponibles.</p>
          )}

          <div style={actions}>
            <button type="button" style={ghostButton} onClick={prevStep}>
              Anterior
            </button>
            <button type="button" style={button} onClick={nextStep}>
              Siguiente
            </button>
          </div>

          <div style={difficultyBox}>
            <strong>¿Dónde te está costando?</strong>
            <div style={chips}>
              {(Object.keys(difficultyLabels) as DifficultyPoint[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  style={difficulty === key ? activeChip : chip}
                  onClick={() => setDifficulty(key)}
                >
                  {difficultyLabels[key]}
                </button>
              ))}
            </div>

            {difficulty && (
              <div style={microLesson}>
                <strong>Repaso express IA</strong>
                <p style={subtitle}>
                  Detecté dificultad en: {difficultyLabels[difficulty]}. La siguiente pregunta debería reforzar esto con explicación más lenta y guiada.
                </p>
              </div>
            )}
          </div>
        </article>

        <article style={panel}>
          <h3 style={stepTitle}>Resultado</h3>
          <div style={resultBox}>{solution.result}</div>

          {solution.graph?.type === 'parabola' && (
            <InteractiveGraphCanvas
              a={solution.graph.a}
              b={solution.graph.b}
              c={solution.graph.c}
            />
          )}
        </article>
      </div>
    </section>
  )
}

const container: CSSProperties = {
  display: 'grid',
  gap: 18,
  color: 'white',
}

const hero: CSSProperties = {
  padding: 22,
  borderRadius: 26,
  background: 'linear-gradient(135deg, rgba(37,99,235,0.35), rgba(15,23,42,0.95))',
  border: '1px solid rgba(255,255,255,0.12)',
}

const eyebrow: CSSProperties = {
  fontSize: 12,
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  opacity: 0.7,
}

const title: CSSProperties = {
  margin: '4px 0',
  fontSize: 30,
  fontWeight: 950,
}

const subtitle: CSSProperties = {
  margin: 0,
  opacity: 0.75,
  lineHeight: 1.45,
}

const panel: CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const label: CSSProperties = {
  display: 'block',
  fontSize: 13,
  opacity: 0.75,
  marginBottom: 8,
}

const inputRow: CSSProperties = {
  display: 'flex',
  gap: 10,
}

const input: CSSProperties = {
  flex: 1,
  padding: '13px 14px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: '#020617',
  color: 'white',
  outline: 'none',
}

const button: CSSProperties = {
  padding: '11px 14px',
  borderRadius: 13,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const ghostButton: CSSProperties = {
  padding: '11px 14px',
  borderRadius: 13,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
  gap: 16,
}

const stepHeader: CSSProperties = {
  display: 'flex',
  gap: 8,
  marginBottom: 12,
}

const pill: CSSProperties = {
  padding: '5px 9px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.25)',
  color: '#bfdbfe',
  fontSize: 12,
  fontWeight: 900,
}

const stepTitle: CSSProperties = {
  margin: '0 0 10px',
  fontSize: 20,
  fontWeight: 900,
}

const expressionBox: CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: '#020617',
  border: '1px solid rgba(255,255,255,0.10)',
  fontSize: 24,
  fontWeight: 900,
}

const hintBox: CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  background: 'rgba(34,197,94,0.12)',
  color: '#bbf7d0',
}

const actions: CSSProperties = {
  display: 'flex',
  gap: 10,
  marginTop: 14,
}

const difficultyBox: CSSProperties = {
  marginTop: 18,
  display: 'grid',
  gap: 10,
}

const chips: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
}

const chip: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  cursor: 'pointer',
}

const activeChip: CSSProperties = {
  ...chip,
  background: 'rgba(37,99,235,0.35)',
  border: '1px solid rgba(96,165,250,0.7)',
}

const microLesson: CSSProperties = {
  padding: 13,
  borderRadius: 16,
  background: 'rgba(245,158,11,0.12)',
  color: '#fde68a',
}

const resultBox: CSSProperties = {
  marginBottom: 14,
  padding: 16,
  borderRadius: 16,
  background: '#020617',
  border: '1px solid rgba(255,255,255,0.10)',
  fontSize: 24,
  fontWeight: 950,
}
