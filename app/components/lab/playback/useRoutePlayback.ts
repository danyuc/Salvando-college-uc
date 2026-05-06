'use client'

import { useEffect, useState } from 'react'
import { ROUTE_POINTS } from '../data/metroRoute'

export default function useRoutePlayback() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= ROUTE_POINTS.length - 1) {
          return 0
        }

        return prev + 1
      })
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return {
    current: ROUTE_POINTS[index],
    index,
  }
}
