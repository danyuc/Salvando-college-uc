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

const fullscreenRoutes = ['/login', '/onboarding', '/lab-ambiental']

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const hideSidebar = fullscreenRoutes.some((r) => pathname.startsWith(r))

  if (hideSidebar) return <>{children}</>

  return (
    <div className="shell">
      <aside className={`side ${open ? 'open' : ''}`}>
        <button className="toggle" onClick={() => setOpen(v => !v)}>
          {open ? '←' : '☰'}
        </button>

        <div className="brand">
          <span>Salvando</span>
          <strong>{open ? 'College UC' : 'UC'}</strong>
        </div>

        <nav>
          {items.map((item) => {
            const active = pathname === item.href

            return (
              <Link key={item.href} href={item.href} className={active ? 'item active' : 'item'}>
                <span className="emoji">{item.icon}</span>
                {open && <span className="label">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      <section className="page">
        {children}
      </section>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          display: flex;
          background: #020617;
        }

        .side {
          position: sticky;
          top: 0;
          width: 92px;
          height: 100vh;
          padding: 16px 12px;
          background: linear-gradient(180deg, rgba(2,6,23,.98), rgba(15,23,42,.94));
          border-right: 1px solid rgba(255,255,255,.09);
          backdrop-filter: blur(18px);
          transition: width .22s ease;
          z-index: 50;
        }

        .side.open {
          width: 244px;
        }

        .toggle {
          width: 52px;
          height: 46px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 16px;
          background: rgba(255,255,255,.06);
          color: white;
          font-size: 18px;
          font-weight: 950;
          cursor: pointer;
          margin-bottom: 18px;
        }

        .brand {
          margin-bottom: 20px;
          padding: 0 6px;
        }

        .brand span {
          display: block;
          color: #67e8f9;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .brand strong {
          display: block;
          color: white;
          font-size: ${open ? '30px' : '22px'};
          font-weight: 950;
          line-height: .95;
          margin-top: 4px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .item {
          min-height: 54px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 10px 13px;
          border-radius: 18px;
          color: rgba(226,232,240,.92);
          text-decoration: none;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.075);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
          transition: .18s ease;
        }

        .item:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,.09);
          color: white;
        }

        .item.active {
          background: linear-gradient(135deg,#2563eb,#7c3aed);
          color: white;
          border-color: rgba(255,255,255,.18);
          box-shadow: 0 18px 40px rgba(37,99,235,.22);
        }

        .emoji {
          min-width: 28px;
          text-align: center;
          font-size: 23px;
          filter: drop-shadow(0 6px 12px rgba(0,0,0,.25));
        }

        .label {
          font-size: 16px;
          font-weight: 900;
          white-space: nowrap;
        }

        .page {
          flex: 1;
          min-width: 0;
        }

        @media(max-width: 900px) {
          .side {
            width: 78px;
            padding: 12px 8px;
          }

          .side.open {
            width: 210px;
          }

          .item {
            min-height: 50px;
            padding: 9px 10px;
          }

          .page {
            width: calc(100vw - 78px);
          }
        }
      `}</style>
    </div>
  )
}
