'use client'

import { motion } from "framer-motion"

export default function LabParticles({
  pm25,
}: {
  pm25: number
}) {
  const amount =
    pm25 >= 24
      ? 45
      : pm25 >= 18
      ? 28
      : 12

  return (
    <div className="pointer-events-none fixed inset-0 z-[4] overflow-hidden">
      {Array.from({ length: amount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20 blur-sm"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            opacity: Math.random() * 0.5,
          }}
          animate={{
            y: -200,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            repeat: Infinity,
            duration: 12 + Math.random() * 10,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          style={{
            width: 4 + Math.random() * 10,
            height: 4 + Math.random() * 10,
          }}
        />
      ))}
    </div>
  )
}
