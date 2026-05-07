export type RouteType =
  | "walking"
  | "surface"
  | "elevated"
  | "subterranean"
  | "transition"
  | "transfer"

export type RoutePoint = {
  id: string
  name: string
  segment: string
  line: string
  lat: number
  lng: number
  type: RouteType

  pm25: number
  humidity: number
  temp: number

  db: number
  crowd: number

  transitionLabel?: string

  rain?: boolean
  peak?: boolean
}

export function pmColor(pm: number) {
  if (pm <= 8) return "#22c55e"
  if (pm <= 12) return "#84cc16"
  if (pm <= 18) return "#eab308"
  if (pm <= 26) return "#f97316"
  return "#ef4444"
}

export function pmLabel(pm: number) {
  if (pm <= 8) return "Muy bajo"
  if (pm <= 12) return "Bajo"
  if (pm <= 18) return "Moderado"
  if (pm <= 26) return "Elevado"
  return "Muy elevado"
}

export function typeLabel(type: RouteType) {
  if (type === "walking") return "Exterior"
  if (type === "surface") return "Superficie"
  if (type === "elevated") return "Elevado"
  if (type === "subterranean") return "Subterráneo"
  if (type === "transition") return "Transición"
  if (type === "transfer") return "Combinación"

  return type
}

export const SEGMENT_COLORS: Record<string, string> = {
  "Sala → San Joaquín": "#38bdf8",
  "San Joaquín → Vicente": "#22c55e",
  "Vicente → Trinidad": "#f97316",
  "Trinidad → Plaza Egaña": "#a855f7",
  "Plaza Egaña → Vicente": "#ef4444",
  "Vicente → San Joaquín": "#14b8a6",
  "San Joaquín → Sala": "#94a3b8",
}

export const LAB_SUMMARY = {
  averagePm: 11.4,
  peakPm: 26,
  hypothesis:
    "Los tramos subterráneos y con mayor congestión presentarían aumentos relativos de PM2.5 respecto a los segmentos exteriores.",
  result:
    "La hipótesis fue parcialmente comprobada. El material particulado aumentó en segmentos congestionados y subterráneos, aunque sin alcanzar niveles críticos.",
  rain:
    "Durante el regreso comenzó lluvia ligera, generando una disminución relativa del PM2.5 en sectores exteriores.",
  health:
    "Aunque los niveles registrados no fueron extremos, una exposición constante en ambientes ferroviarios cerrados puede generar irritación respiratoria y aumentar molestias en personas sensibles.",
  conclusion:
    "La ventilación, la lluvia, la densidad de pasajeros y la transición superficie/subterráneo influyeron directamente en las variaciones ambientales observadas.",
  rainStart: "tramo posterior a Plaza Egaña",
}

export const ROUTE_POINTS: RoutePoint[] = [
  {
    id: "salida-sala",
    name: "Salida sala",
    segment: "Sala → San Joaquín",
    line: "Exterior",
    lat: -33.4988,
    lng: -70.6128,
    type: "walking",
    pm25: 11,
    humidity: 39,
    temp: 21.1,
    db: 56,
    crowd: 5,
  },

  {
    id: "san-joaquin",
    name: "San Joaquín",
    segment: "San Joaquín → Vicente",
    line: "L5",
    lat: -33.4994,
    lng: -70.6158,
    type: "surface",
    pm25: 14,
    humidity: 38,
    temp: 21.3,
    db: 68,
    crowd: 45,
  },

  {
    id: "pedrero",
    name: "Pedrero",
    segment: "San Joaquín → Vicente",
    line: "L5",
    lat: -33.5072,
    lng: -70.6099,
    type: "surface",
    pm25: 15,
    humidity: 38,
    temp: 21.4,
    db: 69,
    crowd: 50,
  },

  {
    id: "mirador",
    name: "Mirador",
    segment: "San Joaquín → Vicente",
    line: "L5",
    lat: -33.5138,
    lng: -70.6057,
    type: "transition",
    transitionLabel: "Transición a subterráneo",
    pm25: 17,
    humidity: 37,
    temp: 21.7,
    db: 74,
    crowd: 55,
  },

  {
    id: "bellavista",
    name: "Bellavista de La Florida",
    segment: "San Joaquín → Vicente",
    line: "L5",
    lat: -33.5229,
    lng: -70.5991,
    type: "subterranean",
    pm25: 18,
    humidity: 36,
    temp: 22,
    db: 76,
    crowd: 60,
  },

  {
    id: "vicente-valdes-1",
    name: "Vicente Valdés",
    segment: "San Joaquín → Vicente",
    line: "L5",
    lat: -33.5264,
    lng: -70.5968,
    type: "subterranean",
    pm25: 19,
    humidity: 35,
    temp: 22.1,
    db: 79,
    crowd: 65,
  },

  {
    id: "rojas-magallanes",
    name: "Rojas Magallanes",
    segment: "Vicente → Trinidad",
    line: "L4",
    lat: -33.5328,
    lng: -70.5913,
    type: "transition",
    transitionLabel: "Transición a superficie",
    pm25: 22,
    humidity: 34,
    temp: 22.8,
    db: 82,
    crowd: 85,
  },

  {
    id: "trinidad",
    name: "Trinidad",
    segment: "Vicente → Trinidad",
    line: "L4",
    lat: -33.5384,
    lng: -70.584,
    type: "elevated",
    pm25: 26,
    humidity: 33,
    temp: 24,
    db: 95,
    crowd: 95,
    peak: true,
  },

  {
    id: "plaza-egana",
    name: "Plaza Egaña",
    segment: "Trinidad → Plaza Egaña",
    line: "L4",
    lat: -33.4548,
    lng: -70.5752,
    type: "subterranean",
    pm25: 20,
    humidity: 36,
    temp: 22.2,
    db: 84,
    crowd: 40,
  },

  {
    id: "vicente-valdes-2",
    name: "Vicente Valdés",
    segment: "Plaza Egaña → Vicente",
    line: "L4/L5",
    lat: -33.5264,
    lng: -70.5968,
    type: "subterranean",
    pm25: 21,
    humidity: 36,
    temp: 22.3,
    db: 87,
    crowd: 100,
    rain: true,
  },

  {
    id: "bellavista-regreso",
    name: "Bellavista de La Florida",
    segment: "Vicente → San Joaquín",
    line: "L5",
    lat: -33.5229,
    lng: -70.5991,
    type: "subterranean",
    pm25: 17,
    humidity: 37,
    temp: 21.9,
    db: 77,
    crowd: 70,
    rain: true,
  },

  {
    id: "mirador-regreso",
    name: "Mirador",
    segment: "Vicente → San Joaquín",
    line: "L5",
    lat: -33.5138,
    lng: -70.6057,
    type: "transition",
    transitionLabel: "Transición a superficie",
    pm25: 15,
    humidity: 38,
    temp: 21.6,
    db: 72,
    crowd: 50,
    rain: true,
  },

  {
    id: "pedrero-regreso",
    name: "Pedrero",
    segment: "Vicente → San Joaquín",
    line: "L5",
    lat: -33.5072,
    lng: -70.6099,
    type: "surface",
    pm25: 13,
    humidity: 39,
    temp: 21.4,
    db: 68,
    crowd: 35,
    rain: true,
  },

  {
    id: "san-joaquin-regreso",
    name: "San Joaquín",
    segment: "Vicente → San Joaquín",
    line: "L5",
    lat: -33.4994,
    lng: -70.6158,
    type: "surface",
    pm25: 12,
    humidity: 39,
    temp: 21.3,
    db: 65,
    crowd: 25,
    rain: true,
  },

  {
    id: "vuelta-sala",
    name: "Camino sala",
    segment: "San Joaquín → Sala",
    line: "Exterior",
    lat: -33.4988,
    lng: -70.6128,
    type: "walking",
    pm25: 10,
    humidity: 40,
    temp: 21,
    db: 54,
    crowd: 5,
    rain: true,
  },
]
