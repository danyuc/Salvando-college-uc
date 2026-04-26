'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [username, setUsername] = useState('Usuario UC')
  const [email, setEmail] = useState('')

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
        return
      }

      const userEmail = data.user.email || ''
      setEmail(userEmail)
      setUsername(userEmail.split('@')[0] || 'Usuario UC')
    }

    loadUser()
  }, [router])

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  const go = (path: string) => {
    router.push(path)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: 24 }}>
      <section style={card}>
        <div>
          <h1>Hola, {username}</h1>
          <p style={{ color: '#cbd5e1' }}>
            {email || 'College Ciencias Sociales · 1° semestre'}
          </p>
        </div>

        <button onClick={logout} style={logoutBtn}>
          Cerrar sesión
        </button>
      </section>

      <nav style={nav}>
        <button onClick={() => go('/')} style={activeBtn}>🏠 Home</button>
        <button onClick={() => go('/calendario')} style={btn}>📅 Calendario</button>
        <button onClick={() => go('/ia')} style={btn}>🧠 IA</button>
        <button onClick={() => go('/notas')} style={btn}>📊 Notas</button>
        <button onClick={() => go('/disponibilidad')} style={btn}>⏱️ Disponibilidad</button>
        <button onClick={() => go('/ensayo')} style={btn}>🧩 Práctica</button>
        <button onClick={() => go('/banco')} style={btn}>📚 Banco</button>
        <button onClick={() => go('/pizarra')} style={btn}>✍️ Pizarra</button>
        <button onClick={() => go('/ranking')} style={btn}>🏆 Ranking</button>
      </nav>

      <section style={panel}>
        <h2>Hola, {username}</h2>
        <p>Panel central de estudio UC</p>
      </section>
    </main>
  )
}

const card = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 24,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
  marginBottom: 20,
}

const nav = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap' as const,
  marginBottom: 28,
}

const btn = {
  padding: '14px 18px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.14)',
  background: '#111827',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const activeBtn = {
  ...btn,
  background: '#2563eb',
}

const logoutBtn = {
  padding: '14px 18px',
  borderRadius: 14,
  border: 'none',
  background: '#4c1d2f',
  color: 'white',
  fontWeight: 800,
  cursor: 'pointer',
}

const panel = {
  padding: 24,
  borderRadius: 22,
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,.12)',
}