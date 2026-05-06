'use client'

import { motion } from "framer-motion"

export default function LabAtmosphere({ current }: { current: any }) {
  const weather = current?.weather || "normal"
  const hot = weather === "hot" || current?.temp >= 25.5
  const rain = weather === "rain"
  const humid = weather === "humid"
  const pollution = current?.pmPeak >= 26 || current?.pm25 >= 22
  const crowded = current?.crowd >= 70

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {hot && (
        <>
          <motion.div
            className="absolute inset-0 bg-orange-500/10"
            animate={{ opacity: [0.04, 0.16, 0.04] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={`heat-${i}`}
              className="absolute h-32 w-10 rounded-full bg-orange-300/10 blur-xl"
              style={{ left: `${(i * 11) % 100}%`, bottom: "-40px" }}
              animate={{ y: [0, -120, 0], opacity: [0, 0.22, 0] }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.2 }}
            />
          ))}
        </>
      )}

      {rain && (
        <>
          <motion.div
            className="absolute inset-0 bg-cyan-950/20"
            animate={{ opacity: [0.08, 0.22, 0.08] }}
            transition={{ repeat: Infinity, duration: 4 }}
          />
          {Array.from({ length: 70 }).map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute h-16 w-[2px] rounded-full bg-cyan-200/35"
              style={{ left: `${(i * 7) % 100}%`, top: `-${(i * 13) % 70}px` }}
              animate={{ y: ["0vh", "120vh"], opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 0.9 + (i % 5) * 0.12, delay: i * 0.025 }}
            />
          ))}
        </>
      )}

      {humid && (
        <motion.div
          className="absolute inset-0 bg-blue-300/5 backdrop-blur-[1px]"
          animate={{ opacity: [0.02, 0.1, 0.02] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
      )}

      {pollution && Array.from({ length: 26 }).map((_, i) => (
        <motion.div
          key={`smog-${i}`}
          className="absolute rounded-full bg-zinc-400/10 blur-2xl"
          style={{
            width: 140 + (i % 4) * 55,
            height: 140 + (i % 4) * 55,
            left: `${(i * 11) % 100}%`,
            top: `${(i * 17) % 100}%`,
          }}
          animate={{ x: [0, 34, -24, 0], y: [0, -34, 12, 0], opacity: [0.06, 0.24, 0.07] }}
          transition={{ repeat: Infinity, duration: 6 + i * 0.2 }}
        />
      ))}

      {crowded && (
        <motion.div
          className="absolute inset-0 bg-fuchsia-500/5"
          animate={{ scale: [1, 1.01, 1], opacity: [0.03, 0.12, 0.03] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      )}
    </div>
  )
}
