'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'

const items = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/practica', label: 'Práctica', icon: '🧩' },
  { href: '/practica-grupal', label: 'Grupal', icon: '👥' },
  { href: '/banco', label: 'Banco', icon: '📚' },
  { href: '/calendario', label: 'Calendario', icon: '📅' },
  { href: '/coach-semanal', label: 'Coach', icon: '🧠' },
  { href: '/ranking', label: 'Ranking', icon: '🏆' },
  { href: '/pizarra', label: 'Pizarra', icon: '✍️' },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  const fullscreenRoutes = [
    '/login',
    '/lab-ambiental',
    '/practica-grupal/sala',
  ]

  const hideSidebar = fullscreenRoutes.some(r =>
    pathname.startsWith(r)
  )

  if (hideSidebar) return <>{children}</>

  return (
    <div className="appShell">
      <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
        <button
          className="toggle"
          onClick={() => setOpen(v => !v)}
        >
          {open ? '←' : '☰'}
        </button>

        <div className="brand">
          <span>Salvando</span>
          {open && <h1>College UC</h1>}
        </div>

        <nav>
          {items.map(item => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`navItem ${active ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                {open && <p>{item.label}</p>}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="content">
        {children}
      </main>

      <style jsx>{`
        .appShell{
          display:flex;
          min-height:100vh;
          background:#020617;
        }

        .sidebar{
          position:sticky;
          top:0;
          height:100vh;
          background:rgba(2,6,23,.92);
          backdrop-filter:blur(18px);
          border-right:1px solid rgba(255,255,255,.08);
          transition:.25s;
          z-index:50;
          overflow:hidden;
        }

        .open{width:220px}
        .closed{width:82px}

        .toggle{
          margin:16px;
          width:48px;
          height:48px;
          border-radius:16px;
          border:0;
          background:rgba(255,255,255,.08);
          color:white;
          cursor:pointer;
          font-size:18px;
          font-weight:900;
        }

        .brand{
          padding:0 18px 24px;
        }

        .brand span{
          color:#67e8f9;
          font-size:11px;
          font-weight:900;
          letter-spacing:.22em;
          text-transform:uppercase;
        }

        .brand h1{
          color:white;
          margin:6px 0 0;
          line-height:.9;
          font-size:38px;
          font-weight:950;
        }

        nav{
          display:flex;
          flex-direction:column;
          gap:10px;
          padding:0 12px;
        }

        .navItem{
          display:flex;
          align-items:center;
          gap:14px;
          padding:14px 16px;
          border-radius:18px;
          color:white;
          text-decoration:none;
          background:rgba(255,255,255,.04);
          transition:.18s;
          border:1px solid transparent;
        }

        .navItem:hover{
          transform:translateY(-1px);
          background:rgba(255,255,255,.08);
        }

        .active{
          background:linear-gradient(135deg,#2563eb,#7c3aed);
          border-color:rgba(255,255,255,.14);
        }

        .navItem span{
          font-size:24px;
          min-width:24px;
          text-align:center;
        }

        .navItem p{
          margin:0;
          font-weight:850;
        }

        .content{
          flex:1;
          min-width:0;
        }

        @media(max-width:900px){
          .open{width:88px}
          .navItem p,
          .brand h1{
            display:none;
          }
        }
      `}</style>
    </div>
  )
}
