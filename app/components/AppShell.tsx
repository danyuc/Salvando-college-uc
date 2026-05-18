'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Brain,
  CalendarDays,
  ChevronLeft,
  Home,
  Menu,
  PenTool,
  Puzzle,
  Trophy,
  Users,
} from 'lucide-react'

const items = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/practica', label: 'Practica', icon: Puzzle },
  { href: '/practica-grupal', label: 'Grupal', icon: Users },
  { href: '/banco', label: 'Banco', icon: BookOpen },
  { href: '/calendario', label: 'Calendario', icon: CalendarDays },
  { href: '/coach-semanal', label: 'Coach', icon: Brain },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/pizarra', label: 'Pizarra', icon: PenTool },
]

const fullscreenRoutes = ['/login', '/onboarding', '/lab-ambiental']

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const hideSidebar = fullscreenRoutes.some((route) => pathname.startsWith(route))

  if (hideSidebar) return <>{children}</>

  return (
    <div className="shell">
      <motion.aside
        className={`side ${open ? 'open' : ''}`}
        initial={false}
        animate={{ width: open ? 252 : 92 }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
      >
        <button className="toggle" onClick={() => setOpen((value) => !value)} aria-label="Alternar navegacion">
          {open ? <ChevronLeft size={20} strokeWidth={2.6} /> : <Menu size={20} strokeWidth={2.6} />}
        </button>

        <div className="brand">
          <div className="mark">SC</div>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
            >
              <span>Salvando</span>
              <strong>College UC</strong>
            </motion.div>
          )}
        </div>

        <nav>
          {items.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href={item.href} className={active ? 'item active' : 'item'} title={item.label}>
                  <span className="icon">
                    <Icon size={20} strokeWidth={2.4} />
                  </span>
                  {open && <span className="label">{item.label}</span>}
                  {active && <motion.span layoutId="active-pill" className="activeGlow" />}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </motion.aside>

      <motion.section
        className="page"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {children}
      </motion.section>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          display: flex;
          background:
            radial-gradient(circle at 18% 0%, rgba(59, 130, 246, .20), transparent 30%),
            radial-gradient(circle at 100% 18%, rgba(20, 184, 166, .12), transparent 28%),
            linear-gradient(180deg, #020617 0%, #08111f 48%, #020617 100%);
        }

        .side {
          position: sticky;
          top: 0;
          width: 92px;
          height: 100vh;
          padding: 16px 12px 18px;
          background:
            linear-gradient(180deg, rgba(2, 6, 23, .86), rgba(15, 23, 42, .72)),
            rgba(2, 6, 23, .72);
          border-right: 1px solid rgba(255, 255, 255, .10);
          backdrop-filter: blur(24px) saturate(140%);
          box-shadow: 22px 0 70px rgba(0, 0, 0, .20);
          z-index: 50;
        }

        .side.open {
          width: 252px;
        }

        .toggle {
          width: 52px;
          height: 46px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, .12);
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(255, 255, 255, .10), rgba(255, 255, 255, .055));
          color: white;
          cursor: pointer;
          margin-bottom: 18px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .10), 0 14px 30px rgba(0, 0, 0, .18);
        }

        .brand {
          min-height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          padding: 0 4px;
        }

        .mark {
          width: 52px;
          height: 52px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 18px;
          color: white;
          font-size: 15px;
          font-weight: 950;
          letter-spacing: -.03em;
          background:
            linear-gradient(135deg, rgba(59, 130, 246, .96), rgba(20, 184, 166, .88)),
            #2563eb;
          box-shadow: 0 20px 42px rgba(37, 99, 235, .24);
        }

        .brand span {
          display: block;
          color: #8bd3ff;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .brand strong {
          display: block;
          color: white;
          font-size: 24px;
          font-weight: 950;
          line-height: 1;
          margin-top: 4px;
          letter-spacing: -.04em;
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
          position: relative;
          overflow: hidden;
          padding: 10px 13px;
          border-radius: 18px;
          color: rgba(226, 232, 240, .92);
          text-decoration: none;
          background: rgba(255, 255, 255, .045);
          border: 1px solid rgba(255, 255, 255, .075);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .04);
          transition: background .18s ease, border-color .18s ease, color .18s ease;
        }

        .item:hover {
          background: rgba(255, 255, 255, .085);
          border-color: rgba(255, 255, 255, .14);
          color: white;
        }

        .item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, .96), rgba(14, 165, 233, .78));
          color: white;
          border-color: rgba(255, 255, 255, .18);
          box-shadow: 0 18px 42px rgba(37, 99, 235, .24);
        }

        .icon {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, .20));
        }

        .label {
          font-size: 16px;
          font-weight: 900;
          white-space: nowrap;
          position: relative;
          z-index: 2;
        }

        .activeGlow {
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: inherit;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .18);
          pointer-events: none;
        }

        .page {
          flex: 1;
          min-width: 0;
        }

        @media(max-width: 900px) {
          .shell {
            display: block;
            padding-bottom: 74px;
          }

          .side {
            position: fixed;
            inset: auto 10px 10px;
            width: auto !important;
            height: 64px;
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 24px;
            overflow-x: auto;
            box-shadow: 0 18px 70px rgba(0, 0, 0, .34);
          }

          .side.open {
            width: auto;
          }

          .toggle,
          .brand {
            display: none;
          }

          nav {
            height: 100%;
            flex-direction: row;
            align-items: center;
            gap: 8px;
          }

          .item {
            min-width: 48px;
            min-height: 48px;
            justify-content: center;
            padding: 9px 12px;
            border-radius: 17px;
          }

          .label {
            display: none;
          }

          .page {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
