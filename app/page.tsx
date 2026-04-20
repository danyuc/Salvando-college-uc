'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '../lib/auth'
import HomeView from './components/HomeView'
import CalendarView from './components/CalendarView'
import AssistantView from './components/AssistantView'
import NotesView from './components/NotesView'
import AvailabilityView from './components/AvailabilityView'
import PracticeView from './components/PracticeView'

type Tab =
  | 'home'
  | 'calendar'
  | 'assistant'
  | 'notes'
  | 'availability'
  | 'practice'

export default function Page() {
  const [tab, setTab] = useState<Tab>('home')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }

    loadUser()
  }, [])

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={navStyle}>
          <button
            onClick={() => setTab('home')}
            style={tab === 'home' ? activeTabStyle : tabStyle}
          >
            🏠 Home
          </button>

          <button
            onClick={() => setTab('calendar')}
            style={tab === 'calendar' ? activeTabStyle : tabStyle}
          >
            📅 Calendario
          </button>

          <button
            onClick={() => setTab('assistant')}
            style={tab === 'assistant' ? activeTabStyle : tabStyle}
          >
            🧠 IA
          </button>

          <button
            onClick={() => setTab('notes')}
            style={tab === 'notes' ? activeTabStyle : tabStyle}
          >
            📊 Notas
          </button>

          <button
            onClick={() => setTab('availability')}
            style={tab === 'availability' ? activeTabStyle : tabStyle}
          >
            ⏱️ Disponibilidad
          </button>

          <button
            onClick={() => setTab('practice')}
            style={tab === 'practice' ? activeTabStyle : tabStyle}
          >
            🧩 Práctica
          </button>
        </div>

        {tab === 'home' && <HomeView />}
        {tab === 'calendar' && <CalendarView />}
        {tab === 'assistant' && <AssistantView />}
        {tab === 'notes' && <NotesView />}
        {tab === 'availability' && <AvailabilityView />}
        {tab === 'practice' && <PracticeView />}
      </div>
    </main>
  )
}

const mainStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#020617',
  color: 'white',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '1400px',
  margin: '0 auto',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  padding: '20px 20px 0',
  flexWrap: 'wrap',
}

const tabStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'white',
  cursor: 'pointer',
}

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  background: '#2563eb',
}