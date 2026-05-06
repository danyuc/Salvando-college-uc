'use client'

import { useEffect, useRef } from 'react'

export default function RainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const drops = Array.from({ length: 300 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      l: Math.random() * 25,
      speed: 4 + Math.random() * 6,
    }))

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = 'rgba(180,220,255,0.25)'
      ctx.lineWidth = 1

      for (const d of drops) {
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x, d.y + d.l)
        ctx.stroke()

        d.y += d.speed

        if (d.y > canvas.height) {
          d.y = -20
        }
      }

      requestAnimationFrame(draw)
    }

    draw()
  }, [])

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[2]"
    />
  )
}
