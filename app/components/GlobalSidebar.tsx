'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { icon: "🏠", label: "Inicio", href: "/" },
  { icon: "🧩", label: "Práctica", href: "/practica" },
  { icon: "👥", label: "Práctica grupal", href: "/practica-grupal" },
  { icon: "📚", label: "Banco", href: "/banco" },
  { icon: "📅", label: "Calendario", href: "/calendario" },
  { icon: "🧠", label: "Coach", href: "/coach-semanal" },
  { icon: "📊", label: "Ranking", href: "/ranking" },
  { icon: "✍️", label: "Pizarra", href: "/pizarra" },
]

export default function GlobalSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="brand">
        <span>Salvando</span>
        <strong>College UC</strong>
      </div>

      <nav>
        {items.map(item => {
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
            >
              <span>{item.icon}</span>
              <p>{item.label}</p>
            </Link>
          )
        })}
      </nav>

      <style jsx>{`
        .sidebar{
          position:fixed;
          top:0;
          left:0;
          width:260px;
          height:100vh;
          padding:24px 18px;
          background:rgba(2,6,23,.96);
          border-right:1px solid rgba(255,255,255,.08);
          backdrop-filter:blur(18px);
          z-index:999;
        }

        .brand{
          margin-bottom:26px;
        }

        .brand span{
          display:block;
          color:#93c5fd;
          font-size:13px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:.08em;
        }

        .brand strong{
          color:white;
          font-size:28px;
          font-weight:950;
          line-height:.95;
        }

        nav{
          display:flex;
          flex-direction:column;
          gap:8px;
        }

        nav a{
          display:flex;
          align-items:center;
          gap:14px;
          padding:14px;
          border-radius:18px;
          color:#cbd5e1;
          text-decoration:none;
          font-weight:850;
          transition:.2s ease;
        }

        nav a:hover{
          background:rgba(255,255,255,.06);
        }

        nav a.active{
          background:linear-gradient(135deg,#2563eb,#7c3aed);
          color:white;
        }

        nav span{
          font-size:22px;
        }

        nav p{
          margin:0;
        }

        @media(max-width:1100px){
          .sidebar{
            display:none;
          }
        }
      `}</style>
    </aside>
  )
}
