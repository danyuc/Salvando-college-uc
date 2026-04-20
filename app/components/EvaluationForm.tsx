'use client'

import { useEffect, useState } from 'react'
import {
  createEvaluation,
  updateEvaluation,
  type Evaluation,
} from '../../lib/evaluations'

type Props = {
  userId: string
  initialData?: Evaluation | null
  onSaved?: () => void
}

export default function EvaluationForm({
  userId,
  initialData,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false)

  const [subject, setSubject] = useState('')
  const [type, setType] = useState('Control')
  const [number, setNumber] = useState('')
  const [topic, setTopic] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [difficulty, setDifficulty] = useState('media')
  const [notes, setNotes] = useState('')
  const [grade, setGrade] = useState('')
  const [weight, setWeight] = useState('')

  useEffect(() => {
    if (initialData) {
      setSubject(initialData.subject || '')
      setType(initialData.type || 'Control')
      setNumber(initialData.number ? String(initialData.number) : '')
      setTopic(initialData.topic || '')
      setStartDate(initialData.start_date || '')
      setEndDate(initialData.end_date || '')
      setDifficulty(initialData.difficulty || 'media')
      setNotes(initialData.notes || '')
      setGrade(
        initialData.grade !== null && initialData.grade !== undefined
          ? String(initialData.grade)
          : ''
      )
      setWeight(
        initialData.weight_percent !== null &&
          initialData.weight_percent !== undefined
          ? String(initialData.weight_percent)
          : ''
      )
    }
  }, [initialData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!subject || !startDate || !endDate) {
      alert('Completa los campos obligatorios')
      return
    }

    try {
      setLoading(true)

      const payload: any = {
        user_id: userId,
        subject,
        type,
        number: number ? Number(number) : null,
        topic,
        start_date: startDate,
        end_date: endDate,
        difficulty,
        notes,
        grade: grade ? Number(grade) : null,
        weight_percent: weight ? Number(weight) : null,
      }

      if (initialData?.id) {
        await updateEvaluation(initialData.id, payload)
      } else {
        await createEvaluation(payload)
      }

      resetForm()
      onSaved?.()
    } catch (error) {
      console.error(error)
      alert('Error guardando evaluación')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setSubject('')
    setType('Control')
    setNumber('')
    setTopic('')
    setStartDate('')
    setEndDate('')
    setDifficulty('media')
    setNotes('')
    setGrade('')
    setWeight('')
  }

  return (
    <form onSubmit={handleSubmit} style={form}>
      <h3>{initialData ? 'Editar evaluación' : 'Nueva evaluación'}</h3>

      <div style={grid}>
        <input
          placeholder="Ramo (ej: Precálculo, Historia, Seminario)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={input}
        />

        <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
          <option>Control</option>
          <option>Prueba</option>
          <option>Ensayo</option>
          <option>Trabajo</option>
          <option>Entrega</option>
        </select>

        <input
          placeholder="Número (opcional)"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          style={input}
        />

        <input
          placeholder="Tema / contenido"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={input}
        />

        <div style={dateRow}>
          <div style={dateCol}>
            <label style={label}>Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={input}
            />
          </div>

          <div style={dateCol}>
            <label style={label}>Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={input}
            />
          </div>
        </div>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          style={input}
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>

        <textarea
          placeholder="Notas (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={textarea}
        />

        <div style={notesBlock}>
          <strong>Notas en tiempo real</strong>

          <input
            placeholder="Nota (ej: 5.5)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            style={input}
          />

          <input
            placeholder="Peso % (ej: 20)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            style={input}
          />
        </div>
      </div>

      <div style={actions}>
        <button type="submit" style={button}>
          {loading
            ? 'Guardando...'
            : initialData
            ? 'Actualizar'
            : 'Crear evaluación'}
        </button>

        {initialData && (
          <button type="button" onClick={resetForm} style={secondary}>
            Limpiar
          </button>
        )}
      </div>
    </form>
  )
}

const form: React.CSSProperties = {
  display: 'grid',
  gap: '12px',
  padding: '18px',
  borderRadius: '16px',
  background: 'rgba(255,255,255,0.05)',
}

const grid: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
}

const input: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const textarea: React.CSSProperties = {
  ...input,
  minHeight: '70px',
}

const dateRow: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
}

const dateCol: React.CSSProperties = {
  flex: 1,
  display: 'grid',
  gap: '6px',
}

const label: React.CSSProperties = {
  fontSize: '0.8rem',
  opacity: 0.7,
}

const notesBlock: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(59,130,246,0.1)',
  display: 'grid',
  gap: '8px',
}

const actions: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
}

const button: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '10px',
  border: 'none',
  background: '#10b981',
  color: 'white',
  cursor: 'pointer',
}

const secondary: React.CSSProperties = {
  ...button,
  background: '#64748b',
}