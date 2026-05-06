'use client'

import { motion } from "framer-motion"

export default function LabSmogEffect({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0 bg-zinc-700/15 backdrop-blur-[1px]" />

      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-zinc-300/10 blur-2xl"
          style={{
            width: 120 + (i % 5) * 60,
            height: 120 + (i % 5) * 60,
            left: `${(i * 11) % 100}%`,
            top: `${(i * 17) % 100}%`,
          }}
          animate={{
            x: [0, 35, -20, 0],
            y: [0, -45, 15, 0],
            opacity: [0.05, 0.24, 0.08],
            scale: [1, 1.18, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 5 + i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute left-1/2 top-1/2 w-[min(720px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-red-400/30 bg-black/45 p-8 text-center shadow-[0_0_100px_rgba(239,68,68,.25)]"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <p className="text-6xl">🌫️</p>
        <h2 className="mt-4 text-4xl font-black">Peak de contaminación</h2>
        <p className="mt-2 text-slate-300">Se activa smog visual cuando el PM2.5 alcanza nivel alto.</p>
      </motion.div>
    </div>
  )
}
