"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const items: NavItem[] = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/practica", label: "Práctica", icon: "🧩" },
  { href: "/precalculo-full", label: "Pre Cálculo", icon: "🧮" },
  { href: "/practica-grupal", label: "Grupal", icon: "🎥" },
  { href: "/banco", label: "Banco", icon: "📚" },
  { href: "/calendario", label: "Calendario", icon: "🗓️" },
  { href: "/coach-semanal", label: "Coach", icon: "🧠" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/pizarra", label: "Pizarra", icon: "✍️" },
];

const fullscreenRoutes = ["/login", "/onboarding", "/lab-ambiental"];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const hideSidebar = fullscreenRoutes.some((route) => pathname.startsWith(route));

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <aside data-app-sidebar="true"
        className={[
          "fixed left-0 top-0 z-50 h-screen border-r border-white/10 bg-[#071025]/95 shadow-2xl backdrop-blur-xl transition-all duration-300",
          open ? "w-64" : "w-20",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-14 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-2xl font-black text-white shadow-lg transition hover:bg-white/10"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              {open ? "←" : "☰"}
            </button>
          </div>

          <div className="px-4 pb-5">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
              Salvando
            </p>

            {open ? (
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
                College UC
              </h1>
            ) : (
              <div className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-sm font-black text-slate-950">
                SC
              </div>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-3">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200",
                    active
                      ? "bg-white text-slate-950 shadow-lg shadow-cyan-400/10"
                      : "text-slate-100 hover:bg-white/10 hover:text-white",
                  ].join(" ")}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center text-2xl leading-none">
                    {item.icon}
                  </span>

                  {open && (
                    <span
                      className={[
                        "truncate text-lg font-black tracking-tight",
                        active ? "text-slate-950" : "text-slate-100 group-hover:text-white",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div
        className={[
          "min-h-screen transition-all duration-300",
          open ? "pl-64" : "pl-20",
        ].join(" ")}
      >
        {children}
      </div>
    </>
  );
}

