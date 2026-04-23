'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, signOutCurrentUser } from '../lib/auth'
import HomeView from './components/HomeView'
import CalendarView from './components/CalendarView'
import AssistantView from './components/AssistantView'
import NotesView from './components/NotesView'
import AvailabilityView from './components/AvailabilityView'
import PracticeView from './components/PracticeView'
import QuestionBankView from './components/QuestionBankView'
import PizarraView from './components/PizarraView'
import RankingView from './components/RankingView'
import WeaknessView from './components/WeaknessView'
import StudyCoachView from './components/StudyCoachView'
import TextStudyView from './components/TextStudyView'

type Tab =
  | 'home'
  | 'calendar'
  | 'assistant'
  | 'notes'
  | 'availability'
  | 'practice'
  | 'question-bank'
  | 'whiteboard'
  | 'ranking'
  | 'weaknesses'
  | 'study-coach'
  | 'text-study'

export default function Page() {
  const [tab, setTab] = useState<Tab>('home')
  const [loadingUser, setLoadingUser] = useState(true)
  const [userLabel, setUserLabel] = useState('Usuario UC')
  const [userSubLabel, setUserSubLabel] = useState(
    'College Ciencias Sociales · 1° semestre'
  )

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser()

        if (user) {
          const email = user.email || ''
          const nameFromEmail = email.includes('@')
            ? email.split('@')[0]
            : 'Usuario UC'

          setUserLabel(nameFromEmail || 'Usuario UC')
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingUser(false)
      }
    }

    loadUser()
  }, [])

  async function handleSignOut() {
    try {
      await signOutCurrentUser()
      window.location.href = '/'
    } catch (error) {
      console.error(error)
      alert('No se pudo cerrar sesión')
    }
  }

  if (loadingUser) {
    return (
      <main style={mainStyle}>
        <div style={loadingBox}>Cargando...</div>
      </main>
    )
  }

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={headerCard}>
          <div>
            <div style={helloText}>Hola, {userLabel}</div>
            <div style={subHelloText}>{userSubLabel}</div>
          </div>

          <button onClick={handleSignOut} style={logoutButton}>
            Cerrar sesión
          </button>
        </div>

        <div style={navBar}>
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

            <button
              onClick={() => setTab('question-bank')}
              style={tab === 'question-bank' ? activeTabStyle : tabStyle}
            >
              📚 Banco
            </button>

            <button
              onClick={() => setTab('whiteboard')}
              style={tab === 'whiteboard' ? activeTabStyle : tabStyle}
            >
              ✍️ Pizarra
            </button>

            <button
              onClick={() => setTab('ranking')}
              style={tab === 'ranking' ? activeTabStyle : tabStyle}
            >
              🏆 Ranking
            </button>

            <button
              onClick={() => setTab('weaknesses')}
              style={tab === 'weaknesses' ? activeTabStyle : tabStyle}
            >
              🎯 Debilidades
            </button>

            <button
              onClick={() => setTab('study-coach')}
              style={tab === 'study-coach' ? activeTabStyle : tabStyle}
            >
              🧠 Coach
            </button>

            <button
              onClick={() => setTab('text-study')}
              style={tab === 'text-study' ? activeTabStyle : tabStyle}
            >
              📄 Texto / PDF
            </button>
          </div>
        </div>

        <div style={contentArea}>
          {tab === 'home' && <HomeView />}
          {tab === 'calendar' && <CalendarView />}
          {tab === 'assistant' && <AssistantView />}
          {tab === 'notes' && <NotesView />}
          {tab === 'availability' && <AvailabilityView />}
          {tab === 'practice' && <PracticeView />}
          {tab === 'question-bank' && <QuestionBankView />}
          {tab === 'whiteboard' && <PizarraView />}
          {tab === 'ranking' && <RankingView />}
          {tab === 'weaknesses' && <WeaknessView />}
          {tab === 'study-coach' && <StudyCoachView />}
          {tab === 'text-study' && <TextStudyView />}
        </div>
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
  maxWidth: '1480px',
  margin: '0 auto',
  padding: '20px',
  display: 'grid',
  gap: '16px',
}

const headerCard: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  padding: '18px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  flexWrap: 'wrap',
}

const helloText: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 800,
}

const subHelloText: React.CSSProperties = {
  marginTop: '6px',
  opacity: 0.72,
}

const navBar: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
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

const logoutButton: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: 'none',
  background: 'rgba(239,68,68,0.18)',
  color: 'white',
  cursor: 'pointer',
}

const contentArea: React.CSSProperties = {
  display: 'grid',
}

const loadingBox: React.CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  color: 'white',
}