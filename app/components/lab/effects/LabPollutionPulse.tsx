'use client'

import { motion } from "framer-motion"

export default function LabPollutionPulse({
  pm25,
}: {
  pm25: number
}) {
  if (pm25 < 18) return null

  const color =
    pm25 >= 26
      ? "#ef4444"
      : pm25 >= 20
      ? "#f97316"
      : "#eab308"

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[5]"
      animate={{
        opacity: [0.15, 0.28, 0.15],
      }}
      transition={{
        repeat: Infinity,
        duration: 2.2,
      }}
      style={{
        background: `radial-gradient(circle at center, ${color}55 0%, transparent 70%)`,
      }}
    />
  )
}
