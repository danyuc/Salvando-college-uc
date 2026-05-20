"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ComponentType, type ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Brain,
  CalendarDays,
  ChevronLeft,
  Home,
  Menu,
  PenTool,
  Pi,
  Puzzle,
  Trophy,
  Users,
} from "lucide-react";
import {
  REVIEW_MODE_LABEL,
  getClientAccessContext,
  shouldShowNavigationItem,
  type AccessContext,
} from "@/lib/access-control";
import { getLocalUser } from "@/lib/local-user";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

const items: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/precalculo-full", label: "Pre Cálculo", icon: Pi },
  { href: "/practica", label: "Práctica", icon: Puzzle },
  { href: "/practica-grupal", label: "Grupal", icon: Users },
  { href: "/banco", label: "Banco", icon: BookOpen },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/coach-semanal", label: "Coach", icon: Brain },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/pizarra", label: "Pizarra", icon: PenTool },
];

const fullscreenRoutes = ["/login", "/onboarding", "/lab-ambiental", "/cardenal-respira", "/ipre2"];
const fallbackContext: AccessContext = {
  role: "default_student",
  isCollegeCiencias: false,
  isDocenciaReview: false,
  isCrshTeacher: false,
  isIpre2Teacher: false,
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [access, setAccess] = useState<AccessContext>(fallbackContext);

  useEffect(() => {
    function loadAccess() {
      setAccess(getClientAccessContext(getLocalUser()));
    }

    loadAccess();
    window.addEventListener("storage", loadAccess);
    window.addEventListener("focus", loadAccess);

    return () => {
      window.removeEventListener("storage", loadAccess);
      window.removeEventListener("focus", loadAccess);
    };
  }, []);

  const visibleItems = useMemo(
    () => items.filter((item) => shouldShowNavigationItem(item.href, access)),
    [access]
  );

  const hideSidebar = fullscreenRoutes.some((route) => pathname.startsWith(route));

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <motion.aside
        data-app-sidebar="true"
        className="fixed left-0 top-0 z-50 h-screen border-r border-white/10 bg-slate-950/90 shadow-2xl shadow-black/30 backdrop-blur-2xl"
        initial={false}
        animate={{ width: open ? 260 : 84 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        <div className="flex h-full flex-col">
          <div className="p-4">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="grid h-12 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-white/15"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
            >
              {open ? <ChevronLeft size={21} strokeWidth={2.7} /> : <Menu size={21} strokeWidth={2.7} />}
            </button>
          </div>

          <div className="px-4 pb-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-300 text-sm font-black text-slate-950 shadow-lg shadow-sky-500/20">
                SC
              </div>
              {open && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
                    Salvando
                  </p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                    College UC
                  </h1>
                </div>
              )}
            </div>

            {open && access.isDocenciaReview && (
              <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
                <Activity className="mr-2 inline" size={14} />
                {REVIEW_MODE_LABEL}
              </div>
            )}
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-3">
            {visibleItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <motion.div key={item.href} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={item.href}
                    title={item.label}
                    className={[
                      "group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-200",
                      active
                        ? "border border-cyan-300/35 bg-gradient-to-br from-sky-500/95 to-cyan-500/75 text-white shadow-lg shadow-cyan-400/15"
                        : "border border-white/0 text-slate-200 hover:border-white/10 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center">
                      <Icon size={21} strokeWidth={2.55} />
                    </span>

                    {open && (
                      <span className="relative z-10 truncate text-base font-black tracking-tight text-current">
                        {item.label}
                      </span>
                    )}

                    {active && (
                      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.32),transparent_36%)]" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      <div
        className={[
          "min-h-screen transition-[padding] duration-300",
          open ? "pl-[260px]" : "pl-[84px]",
        ].join(" ")}
      >
        {children}
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          [data-app-sidebar="true"] {
            inset: auto 10px 10px 10px !important;
            width: auto !important;
            height: 66px !important;
            overflow-x: auto;
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 24px;
          }

          [data-app-sidebar="true"] > div {
            flex-direction: row;
            align-items: center;
          }

          [data-app-sidebar="true"] nav {
            flex-direction: row;
            align-items: center;
            padding: 8px;
          }

          [data-app-sidebar="true"] nav a {
            min-width: 50px;
            justify-content: center;
          }

          [data-app-sidebar="true"] nav a span:nth-child(2),
          [data-app-sidebar="true"] > div > div:first-child,
          [data-app-sidebar="true"] > div > div:nth-child(2) {
            display: none;
          }

          body > div > div[class*="pl-"] {
            padding-left: 0 !important;
            padding-bottom: 76px;
          }
        }
      `}</style>
    </>
  );
}
