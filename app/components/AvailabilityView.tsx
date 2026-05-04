'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
  getAvailabilityBlocks,
  type AvailabilityBlock,
} from '../../lib/availability'

const DAYS = [
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
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([])
  const [loading, setLoading] = useState(true)

  const [day, setDay] = useState('Lunes')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')

  async function loadAll(currentUserId?: string) {
    try {
      setLoading(true)

      const user = currentUserId
        ? { id: currentUserId }
        : await getCurrentUser()

      if (!user) return

      setUserId(user.id)

      const data = await getAvailabilityBlocks(user.id)
      setBlocks(data || [])
    } catch (error) {
      console.error(error)
      alert('No se pudo cargar la disponibilidad')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const groupedBlocks = useMemo(() => {
    const map = new Map<string, AvailabilityBlock[]>()

    for (const dayName of DAYS) {
      map.set(dayName, [])
    }

    for (const block of blocks) {
      if (!map.has(block.day_of_week)) {
        map.set(block.day_of_week, [])
      }
      map.get(block.day_of_week)!.push(block)
    }

    return [...map.entries()]
  }, [blocks])

  async function handleAddBlock() {
    if (!userId) return

    if (!start || !end) {
      alert('Debes seleccionar una hora de inicio y una de término')
      return
    }

    if (start >= end) {
      alert('La hora de inicio debe ser menor que la de término')
      return
    }

    try {
      await createAvailabilityBlock({
        user_id: userId,
        day_of_week: day,
        start_time: start,
        end_time: end,
      })

      await loadAll(userId)
    } catch (error) {
      console.error(error)
      alert('No se pudo agregar el bloque')
    }
  }

  async function handleDeleteBlock(id: string) {
    try {
      await deleteAvailabilityBlock(id)
      await loadAll(userId)
    } catch (error) {
      console.error(error)
      alert('No se pudo eliminar el bloque')
    }
  }

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>Disponibilidad</h2>
        <p style={subtitle}>
          Crea distintos bloques por día. Por ejemplo, el lunes puedes tener un
          horario en la mañana y otro distinto en la tarde.
        </p>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Agregar bloque</h3>

        <div style={formGrid}>
          <div style={field}>
            <label style={label}>Día</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              style={input}
            >
              {DAYS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>Desde</label>
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={input}
            />
          </div>

          <div style={field}>
            <label style={label}>Hasta</label>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={input}
            />
          </div>
        </div>

        <div style={actions}>
          <button onClick={handleAddBlock} style={button}>
            Agregar bloque
          </button>
        </div>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}>Bloques semanales</h3>

        {loading ? (
          <div style={emptyText}>Cargando...</div>
        ) : (
          <div style={daysGrid}>
            {groupedBlocks.map(([dayName, dayBlocks]) => (
              <div key={dayName} style={dayCard}>
                <div style={dayTitle}>{dayName}</div>

                {dayBlocks.length === 0 ? (
                  <div style={emptyText}>Sin bloques</div>
                ) : (
                  <div style={blockList}>
                    {dayBlocks.map((block) => (
                      <div key={block.id} style={blockCard}>
                        <div style={blockTime}>
                          {block.start_time} - {block.end_time}
                        </div>

                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          style={deleteButton}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const container: React.CSSProperties = {
  display: 'grid',
  gap: '18px',
  padding: '20px',
  color: 'white',
}

const heroCard: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const title: React.CSSProperties = {
  margin: 0,
}

const subtitle: React.CSSProperties = {
  marginTop: '8px',
  opacity: 0.75,
  lineHeight: 1.45,
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
}

const formGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
  gap: '12px',
}

const field: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const label: React.CSSProperties = {
  fontWeight: 700,
}

const input: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const actions: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '14px',
}

const button: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#2563eb',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 700,
}

const daysGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
  gap: '12px',
}

const dayCard: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
}

const dayTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '12px',
}

const blockList: React.CSSProperties = {
  display: 'grid',
  gap: '8px',
}

const blockCard: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
}

const blockTime: React.CSSProperties = {
  fontWeight: 700,
}

const deleteButton: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '10px',
  border: 'none',
  background: 'rgba(239,68,68,0.18)',
  color: 'white',
  cursor: 'pointer',
}

const emptyText: React.CSSProperties = {
  opacity: 0.75,
}
