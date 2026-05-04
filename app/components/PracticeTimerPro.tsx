'use client'

import { useEffect, useState } from "react"

export default function PracticeTimerPro({ totalSeconds }: { totalSeconds: number }) {
  const [time, setTime] = useState(totalSeconds)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => (t > 0 ? t - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  const progress = (time / totalSeconds) * 100

  return (
    <div style={container}>
      <div style={bar}>
        <div style={{ ...fill, width: `${progress}%` }} />
      </div>

      <div style={text}>
        ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
    </div>
  )
}

const container = {
  marginBottom: 16,
}

const bar = {
  height: 6,
  background: "rgba(255,255,255,.1)",
  borderRadius: 999,
  overflow: "hidden",
}

const fill = {
  height: "100%",
  background: "linear-gradient(90deg,#22c55e,#ef4444)",
  transition: "width 1s linear",
}

const text = {
  marginTop: 6,
  fontWeight: 900,
}
