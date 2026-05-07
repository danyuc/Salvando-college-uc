'use client'

import { CircleMarker, Tooltip, Polyline } from "react-leaflet"
import { motion } from "framer-motion"
import { ROUTE_POINTS } from "../data/metroRoute"

const TRAFFIC_ZONES = [
  {
    id: "mirador",
    name: "Mirador",
    center: [-33.5138, -70.6057],
    level: "alta",
    radius: 180,
    color: "#ef4444",
    intensity: 0.9,
    text: "Zona comercial + flujo vial constante",
  },

  {
    id: "vicente",
    name: "Vicente Valdés",
    center: [-33.5264, -70.5968],
    level: "muy alta",
    radius: 260,
    color: "#dc2626",
    intensity: 1,
    text: "Nodo ferroviario + buses + combinación",
  },

  {
    id: "plaza-egana",
    name: "Plaza Egaña",
    center: [-33.4548, -70.5752],
    level: "muy alta",
    radius: 300,
    color: "#b91c1c",
    intensity: 1,
    text: "Mall + combinación + congestión urbana",
  },

  {
    id: "san-joaquin",
    name: "San Joaquín",
    center: [-33.4994, -70.6158],
    level: "media",
    radius: 140,
    color: "#f59e0b",
    intensity: 0.6,
    text: "Flujo universitario y buses",
  },
]

export default function LabTrafficVisualLayer() {
  return (
    <>
      {TRAFFIC_ZONES.map((zone) => (
        <CircleMarker
          key={zone.id}
          center={zone.center as [number, number]}
          radius={Math.max(25, zone.radius / 8)}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.22,
            weight: 2,
          }}
        >
          <Tooltip direction="top">
            <div className="min-w-[220px]">
              <h3 className="font-black">
                🚗 Congestión {zone.level}
              </h3>

              <p className="mt-1 text-xs">
                {zone.text}
              </p>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {ROUTE_POINTS.map((p, i) => {
        const next = ROUTE_POINTS[i + 1]

        if (!next) return null

        return (
          <Polyline
            key={`${p.id}-${next.id}`}
            positions={[
              [p.lat, p.lng],
              [next.lat, next.lng],
            ]}
            pathOptions={{
              color:
                p.pm25 >= 22
                  ? "#ef4444"
                  : p.pm25 >= 16
                  ? "#f59e0b"
                  : "#22c55e",

              opacity: 0.45,
              weight: p.crowd >= 80 ? 8 : 5,
            }}
          />
        )
      })}
    </>
  )
}
