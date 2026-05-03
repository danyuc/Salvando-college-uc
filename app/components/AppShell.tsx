'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type CSSProperties } from 'react'
import { getLocalUser } from '@/lib/local-user'

const links = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/calendario', label: 'Calendario', icon: '📅' },
  { path: '/practica', label: 'Práctica', icon: '🧩' },
  { path: '/banco', label: 'Banco', icon: '📚' },
  { path: '/notas', label: 'Notas', icon: '📊' },
  { path: '/disponibilidad', label: 'Disponibilidad', icon: '⏱️' },
  { path: '/pizarra', label: 'Pizarra', icon: '✍️' },
  { path: '/riesgo', label: 'Riesgo', icon: '⚠️' },
  { path: '/coach-semanal', label: 'Coach', icon: '🧠' },
  { path: '/ranking', label: 'Ranking', icon: '🏆' },
  { path: '/debilidades', label: 'Debilidades', icon: '🎯' },
  { path: '/texto-pdf', label: 'Texto / PDF', icon: '📄' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [localUser, setLocalUser] = useState<{ username: string; email: string } | null>(null)

  useEffect(() => {
    setLocalUser(getLocalUser())
  }, [pathname])

  const isLogin = pathname === '/login' || pathname.startsWith('/auth')

  function go(path: string) {
    setOpen(false)
    router.push(path)
  }

  function back() {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  if (isLogin) return <>{children}</>

  return (
    <div style={shell}>
      <aside style={{ ...sidebar, transform: open ? 'translateX(0)' : undefined }}>
        <div style={brandBox}>
          <div style={logo}>UC</div>
          <div>
            <strong>Salvando College</strong>
            <div style={small}>{localUser ? `Hola, ${localUser.username}` : 'Panel académico'}</div>
          </div>
        </div>

        <nav style={nav}>
          {links.map((link) => {
            const active = pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => go(link.path)}
                style={active ? activeLink : navLink}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {open && <button aria-label="Cerrar menú" onClick={() => setOpen(false)} style={overlay} />}

      <section style={content}>
        <header style={topbar}>
          <div style={topLeft}>
            <button onClick={() => setOpen((v) => !v)} style={iconButton}>
              ☰
            </button>

            {pathname !== '/' && (
              <button onClick={back} style={backButton}>
                ← Volver
              </button>
            )}
          </div>

          <button onClick={() => go('/')} style={homeButton}>
            🏠 Inicio
          </button>
        </header>

        <div style={page}>{children}</div>
      </section>
    </div>
  )
}

const shell: CSSProperties = {
  minHeight: '100vh',
  background: '#020617',
  color: 'white',
  display: 'flex',
}

const sidebar: CSSProperties = {
  width: 260,
  minHeight: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  zIndex: 50,
  padding: 18,
  background: 'rgba(15,23,42,.96)',
  borderRight: '1px solid rgba(255,255,255,.12)',
  backdropFilter: 'blur(14px)',
  transition: 'transform .2s ease',
}

const brandBox: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 12,
  marginBottom: 16,
}

const logo: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  background: '#2563eb',
  fontWeight: 900,
}

const small: CSSProperties = {
  color: '#94a3b8',
  fontSize: 13,
  marginTop: 3,
}

const nav: CSSProperties = {
  display: 'grid',
  gap: 8,
}

const navLink: CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '12px 13px',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,.08)',
  background: 'rgba(255,255,255,.04)',
  color: '#e2e8f0',
  fontWeight: 800,
  cursor: 'pointer',
  textAlign: 'left',
}

const activeLink: CSSProperties = {
  ...navLink,
  background: '#2563eb',
  color: 'white',
}

const content: CSSProperties = {
  width: '100%',
  marginLeft: 296,
  minHeight: '100vh',
}

const topbar: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 40,
  height: 70,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 22px',
  background: 'rgba(2,6,23,.82)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255,255,255,.1)',
}

const topLeft: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const iconButton: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.08)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const backButton: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.08)',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const homeButton: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: 'none',
  background: '#2563eb',
  color: 'white',
  fontWeight: 900,
  cursor: 'pointer',
}

const page: CSSProperties = {
  minHeight: 'calc(100vh - 70px)',
}

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 45,
  background: 'rgba(0,0,0,.55)',
  border: 'none',
  cursor: 'pointer',
}
