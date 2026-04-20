'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import { getAvailability, saveAvailability } from '../../lib/availability'

const days = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

export default function AvailabilityView() {
  const [userId, setUserId] = useState('')
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser()
      if (!user) return

      setUserId(user.id)

      const data = await getAvailability(user.id)
      setBlocks(data || [])
      setLoading(false)
    }

    load()
  }, [])

  function updateBlock(day: number, field: string, value: string) {
    setBlocks((prev) => {
      const existing = prev.find((b) => b.day_of_week === day)

      if (existing) {
        return prev.map((b) =>
          b.day_of_week === day ? { ...b, [field]: value } : b
        )
      }

      return [
        ...prev,
        {
          day_of_week: day,
          start_time: '',
          end_time: '',
          [field]: value,
        },
      ]
    })
  }

  async function handleSave() {
    await saveAvailability(userId, blocks)
    alert('Disponibilidad guardada 🚀')
  }

  return (
    <div style={container}>
      <h2>Disponibilidad de estudio</h2>
      <p style={subtitle}>
        Define tus horarios reales para que la IA planifique tu estudio automáticamente.
      </p>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={grid}>
          {days.map((day, i) => {
            const block = blocks.find((b) => b.day_of_week === i)

            return (
              <div key={i} style={card}>
                <strong>{day}</strong>

                <input
                  type="time"
                  value={block?.start_time || ''}
                  onChange={(e) =>
                    updateBlock(i, 'start_time', e.target.value)
                  }
                  style={input}
                />

                <input
                  type="time"
                  value={block?.end_time || ''}
                  onChange={(e) =>
                    updateBlock(i, 'end_time', e.target.value)
                  }
                  style={input}
                />
              </div>
            )
          })}
        </div>
      )}

      <button onClick={handleSave} style={button}>
        Guardar disponibilidad
      </button>
    </div>
  )
}

const container = {
  padding: '20px',
  color: 'white',
}

const subtitle = {
  opacity: 0.7,
  marginBottom: '20px',
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2,1fr)',
  gap: '10px',
}

const card = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.05)',
  display: 'grid',
  gap: '6px',
}

const input = {
  padding: '8px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
}

const button = {
  marginTop: '20px',
  padding: '12px',
  borderRadius: '12px',
  background: '#10b981',
  border: 'none',
  cursor: 'pointer',
}