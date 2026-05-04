'use client'

import { useState } from 'react'
import type { DiagnosticStage } from '../../lib/diagnostics'


/**
 * CONTEXTO COMPLETO (sin errores TS)
 */
export type AIContext = {
  subject: string
  topic: string

  // NUEVO SISTEMA
  unit?: string
  reading?: string

  // práctica
  type?: string
  mode?: string
  strategy?: string

  // evaluaciones
  evaluationTarget?: string
  number?: number
  end_date?: string

  // diagnóstico IA
  diagnosticStage?: 'inicio' | 'medio' | 'final'
}

/**
 * PROPS
 */
type Props = {
  title?: string
  context: AIContext
}

export default function AIStudyChat({ title = 'Asistente IA', context }: Props) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([])
  const [loading, setLoading] = useState(false)

  /**
   * PROMPT BASE INTELIGENTE
   */
  function buildSystemPrompt() {
    return `
Actúa como un profesor experto nivel universitario (UC).

Asignatura: ${context.subject}
Unidad: ${context.unit || 'No especificada'}
Tema: ${context.topic}

${context.reading ? `Texto base: ${context.reading}` : ''}

Modo de estudio: ${context.mode || 'general'}
Estrategia recomendada: ${context.strategy || 'adaptativa'}

Evaluación:
- Tipo: ${context.evaluationTarget || 'No especificado'}
- Número: ${context.number ?? '—'}
- Fecha: ${context.end_date || '—'}

Etapa diagnóstico: ${context.diagnosticStage || 'no definido'}

REGLAS:
- No inventes información si se usa texto
- Explica claro pero profundo
- Adapta la explicación según la materia
- Si es matemática: usa pasos y lógica
- Si es historia: conecta ideas
- Si es psicología: explica conceptos + ejemplos
- Si es seminario: analiza texto

OBJETIVO:
Ayudar a aprender rápido, entender y rendir bien en pruebas.
`
  }

  /**
   * ENVIAR MENSAJE
   */
  async function sendMessage() {
    if (!input.trim()) return

    const newMessages = [
      ...messages,
      { role: 'user' as const, content: input },
    ]

    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'chat',
          systemPrompt: buildSystemPrompt(),
          messages: newMessages,
        }),
      })

      const data = await res.json()

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data?.response || 'No se pudo generar respuesta.',
        },
      ])
    } catch (error) {
      console.error(error)

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Error al conectar con la IA.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={container}>
      <h3 style={titleStyle}>{title}</h3>

      <div style={chatBox}>
        {messages.length === 0 && (
          <div style={emptyText}>
            Haz una pregunta sobre {context.subject} o el tema actual.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...message,
              ...(msg.role === 'user' ? userMsg : aiMsg),
            }}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div style={inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda..."
          style={inputStyle}
        />

        <button onClick={sendMessage} style={button} disabled={loading}>
          {loading ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}

/**
 * ESTILOS
 */

const container: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const titleStyle: React.CSSProperties = {
  margin: 0,
}

const chatBox: React.CSSProperties = {
  minHeight: '250px',
  maxHeight: '350px',
  overflowY: 'auto',
  padding: '10px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.04)',
  display: 'grid',
  gap: '8px',
}

const message: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  maxWidth: '80%',
}

const userMsg: React.CSSProperties = {
  background: 'rgba(59,130,246,0.25)',
  justifySelf: 'end',
}

const aiMsg: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  justifySelf: 'start',
}

const inputRow: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const button: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
}

const emptyText: React.CSSProperties = {
  opacity: 0.7,
}
