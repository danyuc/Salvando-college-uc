'use client'

import { useEffect, useMemo, useState } from 'react'
import { getCurrentUser } from '../../lib/auth'
import {
  getGlobalRanking,
  getMyScores,
  getSubjectRanking,
  type UserScore,
} from '../../lib/scores'
import {SUBJECT_PRESETS_ARRAY} from '../../lib/subjects'

type RankingMode = 'global' | 'subject' | 'mine'

export default function RankingView() {
  const [userId, setUserId] = useState('')
  const [mode, setMode] = useState<RankingMode>('global')
  const [subject, setSubject] = useState('Precálculo')
  const [rows, setRows] = useState<UserScore[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData(currentMode: RankingMode, currentSubject: string, currentUserId: string) {
    try {
      setLoading(true)

      if (currentMode === 'global') {
        const data = await getGlobalRanking()
        setRows(data)
        return
      }

      if (currentMode === 'subject') {
        const data = await getSubjectRanking(currentSubject)
        setRows(data)
        return
      }

      if (currentMode === 'mine' && currentUserId) {
        const data = await getMyScores(currentUserId)
        setRows(data)
        return
      }

      setRows([])
    } catch (error) {
      console.error(error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser()
      if (!user) return
      setUserId(user.id)
      await loadData(mode, subject, user.id)
    }

    init()
  }, [])

  useEffect(() => {
    if (!userId) return
    loadData(mode, subject, userId)
  }, [mode, subject, userId])

  const groupedMine = useMemo(() => {
    if (mode !== 'mine') return []

    const map = new Map<string, UserScore[]>()

    rows.forEach((row) => {
      const key = row.subject || 'Sin asignatura'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    })

    return [...map.entries()]
  }, [mode, rows])

  return (
    <div style={container}>
      <div style={heroCard}>
        <h2 style={title}>Ranking y puntaje</h2>
        <p style={subtitle}>
          Aquí ves tu progreso, XP acumulado y cómo te comparas.
        </p>
      </div>

      <div style={toolbar}>
        <button
          onClick={() => setMode('global')}
          style={mode === 'global' ? activeChip : chip}
        >
          Global
        </button>
        <button
          onClick={() => setMode('subject')}
          style={mode === 'subject' ? activeChip : chip}
        >
          Por asignatura
        </button>
        <button
          onClick={() => setMode('mine')}
          style={mode === 'mine' ? activeChip : chip}
        >
          Mis puntajes
        </button>

        {mode === 'subject' && (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={select}
          >
            {SUBJECT_PRESETS_ARRAY.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div style={card}>
        {loading ? (
          <div style={emptyText}>Cargando ranking...</div>
        ) : mode === 'mine' ? (
          groupedMine.length === 0 ? (
            <div style={emptyText}>Aún no tienes puntajes guardados.</div>
          ) : (
            groupedMine.map(([group, items]) => (
              <div key={group} style={mineGroup}>
                <div style={groupTitle}>{group}</div>

                <div style={tableWrapper}>
                  <table style={table}>
                    <thead>
                      <tr>
                        <th style={th}>Fecha</th>
                        <th style={th}>Formato</th>
                        <th style={th}>Fuente</th>
                        <th style={th}>Correctas</th>
                        <th style={th}>Puntaje</th>
                        <th style={th}>XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((row) => (
                        <tr key={row.id}>
                          <td style={td}>{row.created_at?.slice(0, 10) || '—'}</td>
                          <td style={td}>{row.format || '—'}</td>
                          <td style={td}>{row.source || '—'}</td>
                          <td style={td}>
                            {row.correct_answers}/{row.total_questions}
                          </td>
                          <td style={td}>{row.score}%</td>
                          <td style={td}>{row.xp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )
        ) : rows.length === 0 ? (
          <div style={emptyText}>No hay puntajes aún.</div>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={th}>Usuario</th>
                  <th style={th}>Asignatura</th>
                  <th style={th}>Formato</th>
                  <th style={th}>Correctas</th>
                  <th style={th}>Puntaje</th>
                  <th style={th}>XP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td style={td}>{index + 1}</td>
                    <td style={td}>{shortUser(row.user_id)}</td>
                    <td style={td}>{row.subject || '—'}</td>
                    <td style={td}>{row.format || '—'}</td>
                    <td style={td}>
                      {row.correct_answers}/{row.total_questions}
                    </td>
                    <td style={td}>{row.score}%</td>
                    <td style={td}>{row.xp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function shortUser(userId: string) {
  if (!userId) return 'Usuario'
  return `Usuario ${userId.slice(0, 6)}`
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
}

const toolbar: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const chip: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: '999px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeChip: React.CSSProperties = {
  ...chip,
  background: '#2563eb',
}

const select: React.CSSProperties = {
  padding: '10px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
}

const card: React.CSSProperties = {
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
}

const emptyText: React.CSSProperties = {
  opacity: 0.75,
}

const mineGroup: React.CSSProperties = {
  marginBottom: '18px',
}

const groupTitle: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: '10px',
}

const tableWrapper: React.CSSProperties = {
  overflowX: 'auto',
}

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  opacity: 0.85,
}

const td: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
}