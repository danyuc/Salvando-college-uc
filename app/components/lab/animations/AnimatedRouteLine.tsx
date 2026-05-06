'use client'

import { Polyline, Tooltip } from 'react-leaflet'
import { motion } from 'framer-motion'
import { ROUTE_POINTS } from '../data/metroRoute'

const phaseColors = {
  sala: '#94a3b8',
  idaL5: '#22c55e',
  idaL4: '#f97316',
  regresoL4: '#3b82f6',
  vueltaL5: '#eab308',
}

function getColor(index: number) {
  if (index <= 1) return phaseColors.sala
  if (index <= 5) return phaseColors.idaL5
  if (index <= 8) return phaseColors.idaL4
  if (index <= 20) return phaseColors.regresoL4
  return phaseColors.vueltaL5
}

export default function AnimatedRouteLine() {
  return (
    <>
      {ROUTE_POINTS.slice(0, -1).map((point, index) => {
        const next = ROUTE_POINTS[index + 1]

        return (
          <Polyline
            key={point.id}
            positions={[
              [point.lat, point.lng],
              [next.lat, next.lng],
            ]}
            pathOptions={{
              color: getColor(index),
              weight: 8,
              opacity: 0.85,
              lineCap: 'round',
            }}
          >
            <Tooltip>
              {point.name} → {next.name}
            </Tooltip>
          </Polyline>
        )
      })}
    </>
  )
}
