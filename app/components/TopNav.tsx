'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function TopNav() {
  const router = useRouter()
  const pathname = usePathname()

  function go(path: string) {
    router.push(path)
  }

  function goBack() {
    if (window.history.length > 1) router.back()
    else router.push('/')
  }

  return (
    <div style={nav}>
      {/* LEFT */}
      <div style={left}>
        {pathname !== '/' && (
          <button onClick={goBack} style={backBtn}>
            ←
          </button>
        )}

        <div style={brand}>Salvando UC</div>
      </div>

      {/* CENTER NAV */}
      <div style={menu}>
        <button onClick={() => go('/')} style={btn(pathname === '/')}>🏠</button>
        <button onClick={() => go('/calendario')} style={btn(pathname === '/calendario')}>📅</button>
        <button onClick={() => go('/ensayo')} style={btn(pathname === '/ensayo')}>🧩</button>
        <button onClick={() => go('/banco')} style={btn(pathname === '/banco')}>📚</button>
        <button onClick={() => go('/pizarra')} style={btn(pathname === '/pizarra')}>✍️</button>
        <button onClick={() => go('/notas')} style={btn(pathname === '/notas')}>📊</button>
        <button onClick={() => go('/debilidades')} style={btn(pathname === '/debilidades')}>🎯</button>
        <button onClick={() => go('/coach-semanal')} style={btn(pathname === '/coach-semanal')}>🧠</button>
        <button onClick={() => go('/ranking')} style={btn(pathname === '/ranking')}>🏆</button>
      </div>
    </div>
  )
}

const nav: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 70,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  background: 'rgba(2,6,23,0.85)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  zIndex: 999,
}

const left: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
}

const brand: React.CSSProperties = {
  fontWeight: 900,
  color: '#60a5fa',
}

const backBtn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: 'none',
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  cursor: 'pointer',
}

const menu: React.CSSProperties = {
  display: 'flex',
  gap: 10,
}

const btn = (active: boolean): React.CSSProperties => ({
  padding: '8px 12px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  background: active ? '#2563eb' : 'rgba(255,255,255,0.08)',
  color: 'white',
  fontWeight: 700,
})
