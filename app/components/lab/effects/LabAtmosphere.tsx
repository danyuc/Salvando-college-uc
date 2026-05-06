'use client'

import { motion } from "framer-motion"

export default function LabAtmosphere({ current }: { current: any }) {
  const weather = current?.weather || "normal"
  const hot = weather === "hot" || current?.temp >= 25.5
  const rain = weather === "rain"
  const pollution = current?.pmPeak >= 26 || current?.pm25 >= 22

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {hot && (
        <motion.div
          className="absolute inset-0 bg-orange-500/10"
          animate={{ opacity: [0.04, 0.14, 0.04] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      )}

      {rain && Array.from({ length: 44 }).map((_, i) => (
        <motion.div
          key={`rain-${i}`}
          className="absolute h-14 w-[2px] rounded-full bg-cyan-200/30"
          style={{ left: `${(i * 7) % 100}%`, top: `-${(i * 13) % 50}px` }}
          animate={{ y: ["0vh", "115vh"], opacity: [0, 0.7, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 + (i % 5) * 0.15, delay: i * 0.04 }}
        />
      ))}

      {pollution && Array.from({ length: 22 }).map((_, i) => (
        <motion.div
          key={`smog-${i}`}
          className="absolute rounded-full bg-zinc-400/10 blur-2xl"
          style={{
            width: 140 + (i % 4) * 55,
            height: 140 + (i % 4) * 55,
            left: `${(i * 11) % 100}%`,
            top: `${(i * 17) % 100}%`,
          }}
          animate={{ x: [0, 30, -20, 0], y: [0, -30, 10, 0], opacity: [0.06, 0.22, 0.07] }}
          transition={{ repeat: Infinity, duration: 6 + i * 0.2 }}
        />
      ))}
    </div>
  )
}
