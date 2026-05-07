'use client'

import { useEffect, useRef } from "react"

export default function LabReactiveAudio({
  current,
}: {
  current: any
}) {
  const ref = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!ref.current) return

    if (current.pm25 >= 24) {
      ref.current.volume = 0.9
    } else if (current.pm25 >= 18) {
      ref.current.volume = 0.5
    } else {
      ref.current.volume = 0.2
    }

    ref.current.play().catch(() => {})
  }, [current])

  return (
    <audio
      ref={ref}
      loop
      src="/lab/audio/metro-ambient.mp3"
    />
  )
}
