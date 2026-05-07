'use client'

import { motion } from "framer-motion"

export default function LabRain({
  active,
}: {
  active: boolean
}) {
  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[6] overflow-hidden">
      {Array.from({ length: 120 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-cyan-200/40"
          initial={{
            x: Math.random() * window.innerWidth,
            y: -100,
          }}
          animate={{
            y: window.innerHeight + 200,
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6 + Math.random(),
            ease: "linear",
            delay: Math.random(),
          }}
          style={{
            width: 1,
            height: 18 + Math.random() * 20,
          }}
        />
      ))}
    </div>
  )
}
