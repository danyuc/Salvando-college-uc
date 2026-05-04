'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getUserEvaluations, type Evaluation } from '../../lib/evaluations'
import AIStudyChat from './AIStudyChat'

type QuestionMode =
  | 'general'
  | 'exam'
  | 'explain'
  | 'summary'
  | 'practice'
  | 'strategy'

type Difficulty = 'baja' | 'media' | 'alta'

type EngineResult = {
  difficulty: Difficulty
  mode: QuestionMode
  strategy: string
}

function buildEngine(evaluation: Evaluation | null): EngineResult {
  if (!evaluation) {
    return {
      difficulty: 'media',
      mode: 'general',
      strategy:
        'Ayuda académica general: resolver dudas, explicar conceptos y orientar el estudio.',
    }
  }

  const type = String(evaluation.type || '').toLowerCase()
  const topic = String(evaluation.topic || '').toLowerCase()
  const notes = String(evaluation.notes || '').toLowerCase()

  if (
    type.includes('examen') ||
    type.includes('prueba') ||
    type.includes('interrogacion')
  ) {
    return {
      difficulty: 'alta',
      mode: 'exam',
      strategy:
        'Entrenar con preguntas exigentes, detectar errores probables y priorizar lo evaluable.',
    }
  }

  if (
    type.includes('lectura') ||
    topic.includes('texto') ||
    notes.includes('texto')
  ) {
    return {
      difficulty: 'media',
      mode: 'summary',
      strategy:
        'Comprender el texto, extraer tesis, conceptos clave, argumentos y posibles preguntas.',
    }
  }

  if (
    type.includes('ensayo') ||
    type.includes('columna') ||
    type.includes('desarrollo')
  ) {
    return {
      difficulty: 'alta',
      mode: 'strategy',
      strategy:
        'Construir argumento, conectar ideas, evitar respuestas superficiales y mejorar redacción académica.',
    }
  }

  return {
    difficulty: 'media',
    mode: 'practice',
    strategy:
      'Practicar de forma guiada, reforzar conceptos débiles y preparar respuestas tipo evaluación.',
  }
}

export default function AssistantView() {
  const [userId, setUserId] = useState('')
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [selectedEvaluationId, setSelectedEvaluationId] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      setLoading(true)

      const user = await getCurrentUser()

      if (!user) {
        setUserId('')
        setEvaluations([])
        return
      }

      setUserId(user.id)

      const data = await getUserEvaluations(user.id)
      setEvaluations(data || [])

      if (data?.length && !selectedEvaluationId) {
        setSelectedEvaluationId(data[0].id)
      }
    } catch (error) {
      console.error('ASSISTANT LOAD ERROR:', error)
      alert('No se pudo cargar el asistente')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedEvaluation = useMemo(() => {
    return evaluations.find((item) => item.id === selectedEvaluationId) || null
  }, [evaluations, selectedEvaluationId])

  const engine = useMemo(() => {
    return buildEngine(selectedEvaluation)
  }, [selectedEvaluation])

  const context = useMemo(() => {
    if (!selectedEvaluation) {
      return {
        subject: 'General',
        type: 'chat',
        topic: 'General',
        difficulty: 'media',
        mode: 'general',
        strategy:
          'Ayuda académica general: resolver dudas, explicar conceptos y orientar el estudio.',
      }
    }

    return {
      subject: selectedEvaluation.subject || 'General',
      type: selectedEvaluation.type || 'evaluacion',
      topic: selectedEvaluation.topic || 'General',
      difficulty: engine.difficulty,
      start_date: selectedEvaluation.start_date || '',
      end_date: selectedEvaluation.end_date || '',
      number:
        typeof selectedEvaluation.number === 'number'
          ? selectedEvaluation.number
          : undefined,
      notes: selectedEvaluation.notes || undefined,
      mode: engine.mode,
      strategy: engine.strategy,
    }
  }, [selectedEvaluation, engine])

  if (loading) {
    return (
      <div style={container}>
        <div style={card}>Cargando asistente...</div>
      </div>
    )
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>🧠 Asistente IA UC</h2>
        <p style={subtitle}>
          Usa este asistente para estudiar según tus evaluaciones, temas y tipo
          de prueba.
        </p>

        {evaluations.length > 0 ? (
          <div style={field}>
            <label style={label}>Evaluación vinculada</label>
            <select
              value={selectedEvaluationId}
              onChange={(e) => setSelectedEvaluationId(e.target.value)}
              style={select}
            >
              {evaluations.map((evaluation) => (
                <option key={evaluation.id} value={evaluation.id}>
                  {evaluation.subject} · {evaluation.type} ·{' '}
                  {evaluation.topic || 'General'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={emptyBox}>
            Aún no tienes evaluaciones guardadas. Puedes usar la IA en modo
            general o agregar evaluaciones en Calendario/Notas.
          </div>
        )}

        <div style={engineBox}>
          <div style={engineItem}>
            <strong>Modo:</strong> {engine.mode}
          </div>
          <div style={engineItem}>
            <strong>Dificultad:</strong> {engine.difficulty}
          </div>
          <div style={engineItem}>
            <strong>Estrategia:</strong> {engine.strategy}
          </div>
        </div>
      </div>

      <div style={card}>
        <AIStudyChat context={context} title="Chat académico" />
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  color: 'white',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  opacity: 0.78,
  lineHeight: 1.5,
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
  marginTop: '14px',
}

const label: React.CSSProperties = {
  fontWeight: 800,
}

const select: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.14)',
}

const emptyBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(245,158,11,0.12)',
  border: '1px solid rgba(245,158,11,0.25)',
  lineHeight: 1.45,
}

const engineBox: React.CSSProperties = {
  marginTop: '14px',
  display: 'grid',
  gap: '8px',
}

const engineItem: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
}
