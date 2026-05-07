'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

const actions = [
  { label: 'Inicio', path: '/', icon: '🏠' },
  { label: 'Práctica inteligente', path: '/practica', icon: '🧩' },
  { label: 'Práctica grupal', path: '/practica-grupal', icon: '👥' },
  { label: 'Banco de preguntas', path: '/banco', icon: '📚' },
  { label: 'Notas', path: '/notas', icon: '📊' },
  { label: 'Calendario', path: '/calendario', icon: '📅' },
  { label: 'Coach semanal', path: '/coach-semanal', icon: '🧠' },
  { label: 'Debilidades', path: '/debilidades', icon: '🎯' },
  { label: 'Riesgo académico', path: '/riesgo', icon: '⚠️' },
  { label: 'Pizarra', path: '/pizarra', icon: '✍️' },
]

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }

      if (e.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return actions
    return actions.filter((a) => a.label.toLowerCase().includes(q))
  }, [query])

  if (!open) return null

  return (
    <div style={overlay} onClick={() => setOpen(false)}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <span>⌘K</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar acción, vista o herramienta..."
            style={input}
          />
        </div>

        <div style={list}>
          {filtered.map((action) => (
            <button
              key={action.path}
              style={item}
              onClick={() => {
                router.push(action.path)
                setOpen(false)
                setQuery('')
              }}
            >
              <span style={icon}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: 'rgba(2,6,23,0.45)',
  backdropFilter: 'blur(10px)',
  display: 'grid',
  placeItems: 'start center',
  paddingTop: '12vh',
}

const modal: React.CSSProperties = {
  width: 'min(620px, calc(100vw - 28px))',
  borderRadius: 26,
  background: 'rgba(15,23,42,0.86)',
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 16,
  borderBottom: '1px solid rgba(255,255,255,0.10)',
  color: 'rgba(255,255,255,0.55)',
}

const input: React.CSSProperties = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'white',
  fontSize: 18,
  fontWeight: 700,
}

const list: React.CSSProperties = {
  display: 'grid',
  padding: 10,
  gap: 6,
}

const item: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 18,
  border: 'none',
  background: 'transparent',
  color: 'white',
  textAlign: 'left',
  fontWeight: 800,
  cursor: 'pointer',
}

const icon: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.08)',
}
