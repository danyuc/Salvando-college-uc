'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AIContext = {
  subject?: string | null
  type?: string | null
  topic?: string | null
  difficulty?: string | null
  start_date?: string | null
  end_date?: string | null
  number?: number | null
  notes?: string | null
  mode?: string | null
  strategy?: string | null
}

type Props = {
  context?: AIContext | null
  title?: string
  compact?: boolean
}

type AiAccessMode = 'active' | 'limited' | 'disabled'

function getDaysLeft(endDate?: string | null) {
  if (!endDate) return null
  const today = new Date()
  const end = new Date(endDate)
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - today.getTime()) / 86400000)
}

export default function AIStudyChat({
  context,
  title = 'IA académica',
  compact = false,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessMode, setAccessMode] = useState<AiAccessMode>('active')
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const daysLeft = getDaysLeft(context?.end_date)

  const quickPrompts = useMemo(() => {
    const topic = context?.topic || 'este tema'
    const type = context?.type || 'prueba'

    return [
      `Explícame ${topic} fácil`,
      `Hazme un resumen de ${topic}`,
      `Hazme ejercicios tipo ${type}`,
      `¿Qué debería estudiar hoy primero?`,
      `Pregúntame como si fuera una ${type}`,
      `Dime los errores típicos de ${topic}`,
    ]
  }, [context])

  useEffect(() => {
    const subject = context?.subject || 'tu ramo'
    const topic = context?.topic || 'tu materia'
    const type = context?.type || 'evaluación'

    let intro = `Estoy listo para ayudarte con ${subject}`
    if (topic) intro += ` · ${topic}`
    intro += `. Puedes pedirme explicación, resumen, ejercicios o estrategia para esta ${type}.`

    if (context?.mode) {
      intro += ` Modo recomendado: ${context.mode}.`
    }

    if (context?.strategy) {
      intro += ` Estrategia sugerida: ${context.strategy}`
    }

    if (typeof daysLeft === 'number') {
      if (daysLeft < 0) {
        intro += ' Esta evaluación ya venció, pero aún podemos repasar el tema.'
      } else if (daysLeft === 0) {
        intro += ' Ojo: esta evaluación cierra hoy.'
      } else {
        intro += ` Te quedan ${daysLeft} día(s) para prepararte.`
      }
    }

    setMessages([
      {
        role: 'assistant',
        content: intro,
      },
    ])
  }, [
    context?.subject,
    context?.topic,
    context?.type,
    context?.end_date,
    context?.mode,
    context?.strategy,
    daysLeft,
  ])

  useEffect(() => {
    if (!viewportRef.current) return
    viewportRef.current.scrollTop = viewportRef.current.scrollHeight
  }, [messages, loading])

  async function sendMessage(prefilled?: string) {
    const content = (prefilled ?? input).trim()
    if (!content || loading) return

    if (accessMode === 'disabled') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'La IA está deshabilitada en este modo. Actívala si quieres ayuda directa.',
        },
      ])
      setInput('')
      return
    }

    if (accessMode === 'limited') {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'La IA está en modo limitado. En este modo puedes usar organización y enfoque, pero no recibir ayuda directa sobre contenido.',
        },
      ])
      setInput('')
      return
    }

    const nextMessages = [...messages, { role: 'user' as const, content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context,
          history: nextMessages,
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.reply ||
            'No pude responder ahora mismo. Intenta reformular la pregunta.',
        },
      ])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'No pude conectarme ahora mismo. Intenta otra vez.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ ...containerStyle, ...(compact ? compactStyle : {}) }}>
      <div style={headerStyle}>
        <div>
          <div style={titleStyle}>{title}</div>
          {context?.subject && (
            <div style={subtitleStyle}>
              {context.subject}
              {context.number ? ` · ${context.type} ${context.number}` : context?.type ? ` · ${context.type}` : ''}
              {context.topic ? ` · ${context.topic}` : ''}
            </div>
          )}
        </div>

        {typeof daysLeft === 'number' && (
          <div style={statusBadge(daysLeft)}>
            {daysLeft < 0
              ? 'Vencida'
              : daysLeft === 0
              ? 'Cierra hoy'
              : `${daysLeft} día(s)`}
          </div>
        )}
      </div>

      <div style={modePanel}>
        <div style={modePanelTitle}>Modo IA</div>
        <div style={modeButtons}>
          <button
            onClick={() => setAccessMode('active')}
            style={accessMode === 'active' ? activeModeButton : modeButton}
          >
            Activa
          </button>
          <button
            onClick={() => setAccessMode('limited')}
            style={accessMode === 'limited' ? activeModeButton : modeButton}
          >
            Limitada
          </button>
          <button
            onClick={() => setAccessMode('disabled')}
            style={accessMode === 'disabled' ? activeModeButton : modeButton}
          >
            Deshabilitada
          </button>
        </div>

        <div style={modeHelp}>
          Activa: ayuda completa. Limitada: solo apoyo de organización. Deshabilitada: sin ayuda.
        </div>
      </div>

      <div ref={viewportRef} style={messagesBoxStyle}>
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            style={
              message.role === 'user' ? userBubbleStyle : assistantBubbleStyle
            }
          >
            {message.content}
          </div>
        ))}

        {loading && <div style={assistantBubbleStyle}>Pensando…</div>}
      </div>

      <div style={quickRowStyle}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            style={quickButtonStyle}
            onClick={() => sendMessage(prompt)}
            disabled={loading || accessMode !== 'active'}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div style={inputRowStyle}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntale algo a la IA…"
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              void sendMessage()
            }
          }}
        />

        <button
          style={sendButtonStyle}
          onClick={() => sendMessage()}
          disabled={loading}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

function statusBadge(daysLeft: number): React.CSSProperties {
  const background =
    daysLeft < 0
      ? 'rgba(100,116,139,0.25)'
      : daysLeft === 0
      ? 'rgba(239,68,68,0.25)'
      : daysLeft <= 2
      ? 'rgba(245,158,11,0.25)'
      : 'rgba(59,130,246,0.25)'

  return {
    padding: '8px 10px',
    borderRadius: '999px',
    background,
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  }
}

const containerStyle: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'grid',
  gap: '12px',
}

const compactStyle: React.CSSProperties = {
  padding: '14px',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
}

const titleStyle: React.CSSProperties = {
  color: 'white',
  fontWeight: 900,
  fontSize: '1rem',
}

const subtitleStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '0.9rem',
  marginTop: '4px',
}

const modePanel: React.CSSProperties = {
  padding: '12px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
}

const modePanelTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '8px',
}

const modeButtons: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}

const modeButton: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeModeButton: React.CSSProperties = {
  ...modeButton,
  background: '#2563eb',
}

const modeHelp: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.72,
  fontSize: '0.84rem',
}

const messagesBoxStyle: React.CSSProperties = {
  maxHeight: '360px',
  minHeight: '240px',
  overflowY: 'auto',
  display: 'grid',
  gap: '10px',
  paddingRight: '4px',
}

const userBubbleStyle: React.CSSProperties = {
  justifySelf: 'end',
  maxWidth: '84%',
  padding: '10px 12px',
  borderRadius: '14px 14px 4px 14px',
  background: '#2563eb',
  color: 'white',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.45,
}

const assistantBubbleStyle: React.CSSProperties = {
  justifySelf: 'start',
  maxWidth: '84%',
  padding: '10px 12px',
  borderRadius: '14px 14px 14px 4px',
  background: 'rgba(16,185,129,0.16)',
  border: '1px solid rgba(16,185,129,0.25)',
  color: 'white',
  whiteSpace: 'pre-wrap',
  lineHeight: 1.5,
}

const quickRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
}

const quickButtonStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
  fontSize: '0.82rem',
}

const inputRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
}

const inputStyle: React.CSSProperties = {
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  outline: 'none',
}

const sendButtonStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg,#2563eb,#10b981)',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
}